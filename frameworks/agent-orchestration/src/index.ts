/**
 * Agent Orchestration Framework
 * Production-ready multi-agent coordination system
 */

import { CronJob } from 'cron';

export interface AgentConfig {
  name: string;
  schedule: string;
  task: (context: AgentContext) => Promise<void>;
  retries?: number;
  timeout?: number;
  onError?: (error: Error, context: AgentContext) => Promise<void>;
  onSuccess?: (context: AgentContext) => Promise<void>;
}

export interface AgentContext {
  agentName: string;
  runId: string;
  startTime: Date;
  state: Map<string, any>;
  hub: HubInterface;
  logger: Logger;
  metrics: MetricsCollector;
}

export interface HubInterface {
  broadcast(message: AgentMessage): Promise<void>;
  send(to: string, message: AgentMessage): Promise<void>;
  receive(agentName: string): Promise<AgentMessage[]>;
}

export interface AgentMessage {
  from: string;
  to: string | 'broadcast';
  type: string;
  payload: any;
  timestamp: Date;
}

export interface OrchestratorConfig {
  agents: AgentConfig[];
  hubName?: string;
  telegramNotifications?: {
    enabled: boolean;
    recipient?: string;
  };
  healthCheckInterval?: number;
  statePersistence?: boolean;
}

export class Logger {
  constructor(private agentName: string) {}
  
  info(message: string, data?: any) {
    console.log(`[${this.agentName}] ${message}`, data || '');
  }
  
  error(message: string, error?: Error) {
    console.error(`[${this.agentName}] ERROR: ${message}`, error?.message || '');
  }
  
  warn(message: string, data?: any) {
    console.warn(`[${this.agentName}] WARN: ${message}`, data || '');
  }
}

export class MetricsCollector {
  private metrics: Map<string, number[]> = new Map();
  
  record(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }
  
  getAverage(name: string): number {
    const values = this.metrics.get(name) || [];
    return values.reduce((a, b) => a + b, 0) / values.length || 0;
  }
  
  getCount(name: string): number {
    return (this.metrics.get(name) || []).length;
  }
}

export class Agent {
  private job: CronJob | null = null;
  private config: AgentConfig;
  
  constructor(config: AgentConfig) {
    this.config = {
      retries: 3,
      timeout: 300000, // 5 minutes
      ...config
    };
  }
  
  async start(hub: HubInterface, orchestrator: AgentOrchestrator) {
    this.job = new CronJob(
      this.config.schedule,
      async () => {
        const runId = `${this.config.name}-${Date.now()}`;
        const context: AgentContext = {
          agentName: this.config.name,
          runId,
          startTime: new Date(),
          state: new Map(),
          hub,
          logger: new Logger(this.config.name),
          metrics: new MetricsCollector()
        };
        
        try {
          context.logger.info(`Starting run ${runId}`);
          
          await this.executeWithRetry(context);
          
          if (this.config.onSuccess) {
            await this.config.onSuccess(context);
          }
          
          context.logger.info(`Run completed successfully`);
        } catch (error) {
          context.logger.error(`Run failed`, error as Error);
          
          if (this.config.onError) {
            await this.config.onError(error as Error, context);
          }
        }
      },
      null,
      true
    );
  }
  
  private async executeWithRetry(context: AgentContext): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= (this.config.retries || 1); attempt++) {
      try {
        await Promise.race([
          this.config.task(context),
          this.createTimeout(context)
        ]);
        return;
      } catch (error) {
        lastError = error as Error;
        context.logger.warn(`Attempt ${attempt} failed`, error);
        
        if (attempt < (this.config.retries || 1)) {
          await this.sleep(1000 * attempt); // Exponential backoff
        }
      }
    }
    
    throw lastError;
  }
  
  private createTimeout(context: AgentContext): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Agent timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);
    });
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  stop() {
    if (this.job) {
      this.job.stop();
    }
  }
}

export class Hub implements HubInterface {
  private messages: Map<string, AgentMessage[]> = new Map();
  private subscribers: Map<string, (message: AgentMessage) => void> = new Map();
  
  constructor(private name: string) {}
  
  async broadcast(message: Omit<AgentMessage, 'timestamp'>): Promise<void> {
    const fullMessage: AgentMessage = {
      ...message,
      from: message.from,
      timestamp: new Date()
    };
    
    // Store for each agent
    for (const [agentName] of this.messages) {
      if (agentName !== message.from) {
        if (!this.messages.has(agentName)) {
          this.messages.set(agentName, []);
        }
        this.messages.get(agentName)!.push(fullMessage);
      }
    }
    
    // Notify subscribers
    for (const [agentName, callback] of this.subscribers) {
      if (agentName !== message.from) {
        callback(fullMessage);
      }
    }
  }
  
  async send(to: string, message: Omit<AgentMessage, 'timestamp'>): Promise<void> {
    const fullMessage: AgentMessage = {
      ...message,
      to,
      timestamp: new Date()
    };
    
    if (!this.messages.has(to)) {
      this.messages.set(to, []);
    }
    this.messages.get(to)!.push(fullMessage);
    
    // Notify subscriber if exists
    if (this.subscribers.has(to)) {
      this.subscribers.get(to)!(fullMessage);
    }
  }
  
  async receive(agentName: string): Promise<AgentMessage[]> {
    const messages = this.messages.get(agentName) || [];
    this.messages.set(agentName, []); // Clear after reading
    return messages;
  }
  
  subscribe(agentName: string, callback: (message: AgentMessage) => void) {
    this.subscribers.set(agentName, callback);
  }
}

export class AgentOrchestrator {
  private agents: Map<string, Agent> = new Map();
  private hub: Hub;
  private config: OrchestratorConfig;
  private running: boolean = false;
  
  constructor(config: OrchestratorConfig) {
    this.config = config;
    this.hub = new Hub(config.hubName || 'default-hub');
    
    for (const agentConfig of config.agents) {
      const agent = new Agent(agentConfig);
      this.agents.set(agentConfig.name, agent);
    }
  }
  
  async start() {
    this.running = true;
    
    console.log(`Starting orchestrator with ${this.agents.size} agents`);
    
    for (const [name, agent] of this.agents) {
      await agent.start(this.hub, this);
      console.log(`Agent ${name} started`);
    }
    
    // Start health monitoring if enabled
    if (this.config.healthCheckInterval) {
      this.startHealthMonitoring();
    }
  }
  
  async stop() {
    this.running = false;
    
    for (const [name, agent] of this.agents) {
      agent.stop();
      console.log(`Agent ${name} stopped`);
    }
  }
  
  private startHealthMonitoring() {
    setInterval(() => {
      for (const [name, agent] of this.agents) {
        // Check agent health
        // Send alerts if needed
      }
    }, this.config.healthCheckInterval || 60000);
  }
  
  getAgent(name: string): Agent | undefined {
    return this.agents.get(name);
  }
  
  getHub(): Hub {
    return this.hub;
  }
}

export default AgentOrchestrator;

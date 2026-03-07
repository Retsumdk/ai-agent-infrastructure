#!/usr/bin/env bun

/**
 * Agent Monitor Pro
 * Real-time health monitoring and diagnostics for AI agents
 */

import chalk from 'chalk';
import { Command } from 'commander';

interface AgentHealth {
  name: string;
  status: 'running' | 'stopped' | 'error' | 'unknown';
  healthScore: number;
  lastRun: Date | null;
  successRate: number;
  avgDuration: number;
  errors: number;
  uptime: number;
}

interface MonitoringConfig {
  agents: AgentConfig[];
  alerts: {
    telegram?: { enabled: boolean; recipient?: string };
    webhook?: { url: string };
  };
  thresholds: {
    healthScore: number;
    successRate: number;
    maxErrors: number;
  };
}

interface AgentConfig {
  name: string;
  type: string;
  critical: boolean;
  schedule: string;
  timeout: number;
}

class HealthCalculator {
  calculate(
    successRate: number,
    avgDuration: number,
    errorCount: number,
    lastRun: Date | null
  ): number {
    let score = 100;
    
    // Success rate impact (0-40 points)
    score -= (100 - successRate) * 0.4;
    
    // Duration impact (0-20 points)
    if (avgDuration > 300000) { // > 5 minutes
      score -= 20;
    } else if (avgDuration > 180000) { // > 3 minutes
      score -= 10;
    }
    
    // Error count impact (0-30 points)
    score -= Math.min(errorCount * 10, 30);
    
    // Staleness impact (0-10 points)
    if (lastRun) {
      const hoursSinceLastRun = (Date.now() - lastRun.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastRun > 24) {
        score -= 10;
      } else if (hoursSinceLastRun > 12) {
        score -= 5;
      }
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  getLevel(score: number): string {
    if (score >= 95) return 'Excellent';
    if (score >= 85) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 50) return 'Poor';
    return 'Critical';
  }
}

class AgentMonitor {
  private agents: Map<string, AgentHealth> = new Map();
  private config: MonitoringConfig;
  private healthCalculator: HealthCalculator;
  
  constructor(config: MonitoringConfig) {
    this.config = config;
    this.healthCalculator = new HealthCalculator();
    
    // Initialize agents
    for (const agentConfig of config.agents) {
      this.agents.set(agentConfig.name, {
        name: agentConfig.name,
        status: 'unknown',
        healthScore: 100,
        lastRun: null,
        successRate: 100,
        avgDuration: 0,
        errors: 0,
        uptime: 0
      });
    }
  }
  
  async checkHealth(agentName: string): Promise<AgentHealth> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }
    
    // In a real implementation, this would check:
    // - Zo API for agent status
    // - Log files for recent activity
    // - Metrics database for performance data
    
    agent.healthScore = this.healthCalculator.calculate(
      agent.successRate,
      agent.avgDuration,
      agent.errors,
      agent.lastRun
    );
    
    return agent;
  }
  
  async checkAll(): Promise<Map<string, AgentHealth>> {
    for (const [name] of this.agents) {
      await this.checkHealth(name);
    }
    return this.agents;
  }
  
  displayHealth(agent: AgentHealth) {
    console.log('\n');
    console.log(chalk.cyan('╔════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.bold('          AGENT MONITOR - LIVE STATUS               ') + chalk.cyan('║'));
    console.log(chalk.cyan('╠════════════════════════════════════════════════════╣'));
    
    // Agent name
    console.log(chalk.cyan('║') + ` Agent: ${chalk.bold(agent.name)}`.padEnd(53) + chalk.cyan('║'));
    
    // Status
    const statusIcon = agent.status === 'running' ? chalk.green('✓') : 
                       agent.status === 'error' ? chalk.red('✗') : chalk.yellow('○');
    console.log(chalk.cyan('║') + ` Status: ${statusIcon} ${agent.status}`.padEnd(53) + chalk.cyan('║'));
    
    // Health score with color
    const healthColor = agent.healthScore >= 85 ? chalk.green :
                        agent.healthScore >= 70 ? chalk.yellow : chalk.red;
    const healthLevel = this.healthCalculator.getLevel(agent.healthScore);
    console.log(chalk.cyan('║') + ` Health: ${healthColor(agent.healthScore + '/100')} (${healthLevel})`.padEnd(53) + chalk.cyan('║'));
    
    // Last run
    const lastRunStr = agent.lastRun ? 
      this.formatTimeAgo(agent.lastRun) : 'Never';
    console.log(chalk.cyan('║') + ` Last Run: ${lastRunStr}`.padEnd(53) + chalk.cyan('║'));
    
    // Success rate
    const successColor = agent.successRate >= 95 ? chalk.green :
                         agent.successRate >= 80 ? chalk.yellow : chalk.red;
    console.log(chalk.cyan('║') + ` Success Rate: ${successColor(agent.successRate.toFixed(1) + '%')}`.padEnd(53) + chalk.cyan('║'));
    
    // Average duration
    const durationStr = this.formatDuration(agent.avgDuration);
    console.log(chalk.cyan('║') + ` Avg Duration: ${durationStr}`.padEnd(53) + chalk.cyan('║'));
    
    console.log(chalk.cyan('╚════════════════════════════════════════════════════╝'));
    console.log('\n');
  }
  
  displayAllHealth() {
    console.log('\n');
    console.log(chalk.cyan('╔══════════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.bold('                   ALL AGENTS - HEALTH OVERVIEW                    ') + chalk.cyan('║'));
    console.log(chalk.cyan('╠══════════════════════════════════════════════════════════════════╣'));
    
    for (const [name, agent] of this.agents) {
      const statusIcon = agent.status === 'running' ? chalk.green('✓') : 
                         agent.status === 'error' ? chalk.red('✗') : chalk.yellow('○');
      const healthColor = agent.healthScore >= 85 ? chalk.green :
                          agent.healthScore >= 70 ? chalk.yellow : chalk.red;
      
      const line = ` ${statusIcon} ${name.padEnd(25)} ${healthColor((agent.healthScore + '/100').padEnd(8))} ${this.formatTimeAgo(agent.lastRun)}`;
      console.log(chalk.cyan('║') + line.padEnd(67) + chalk.cyan('║'));
    }
    
    console.log(chalk.cyan('╚══════════════════════════════════════════════════════════════════╝'));
    console.log('\n');
  }
  
  async sendAlert(agent: AgentHealth, alertType: string, message: string) {
    // Telegram alert
    if (this.config.alerts.telegram?.enabled) {
      console.log(chalk.yellow(`[ALERT] ${agent.name}: ${message}`));
      // In production, would call Telegram API
    }
    
    // Webhook alert
    if (this.config.alerts.webhook) {
      // In production, would POST to webhook URL
    }
  }
  
  private formatTimeAgo(date: Date | null): string {
    if (!date) return 'Never';
    
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }
  
  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }
}

// CLI Interface
const program = new Command();

program
  .name('agent-monitor')
  .description('Real-time health monitoring for AI agents')
  .version('1.0.0');

program
  .command('watch')
  .description('Monitor agents in real-time')
  .option('-a, --agent <name>', 'Monitor specific agent')
  .option('--all', 'Monitor all agents')
  .action(async (options) => {
    const config: MonitoringConfig = {
      agents: [
        { name: 'EMAIL-PROCESSOR', type: 'zo-agent', critical: true, schedule: '0 */2 * * *', timeout: 300000 },
        { name: 'CONTENT-CREATOR', type: 'zo-agent', critical: false, schedule: '0 */6 * * *', timeout: 600000 }
      ],
      alerts: {
        telegram: { enabled: true }
      },
      thresholds: {
        healthScore: 80,
        successRate: 95,
        maxErrors: 3
      }
    };
    
    const monitor = new AgentMonitor(config);
    
    if (options.agent) {
      const health = await monitor.checkHealth(options.agent);
      monitor.displayHealth(health);
    } else if (options.all) {
      await monitor.checkAll();
      monitor.displayAllHealth();
    }
  });

program
  .command('health')
  .description('Check agent health status')
  .option('-a, --agent <name>', 'Agent name')
  .action(async (options) => {
    console.log(chalk.blue('Checking agent health...'));
    // Implementation
  });

program
  .command('report')
  .description('Generate performance report')
  .option('--last <period>', 'Time period (24h, 7d, 30d)')
  .action(async (options) => {
    console.log(chalk.blue('Generating report...'));
    // Implementation
  });

export { AgentMonitor, HealthCalculator, type AgentHealth, type MonitoringConfig };

// Run CLI if called directly
if (import.meta.main) {
  program.parse();
}

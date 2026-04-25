# Getting Started Guide

Complete guide to building autonomous AI agent systems with this infrastructure.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Your First Agent](#your-first-agent)
4. [Multi-Agent Systems](#multi-agent-systems)
5. [Building a Marketplace](#building-a-marketplace)
6. [Monitoring & Observability](#monitoring--observability)
7. [Production Deployment](#production-deployment)
8. [Best Practices](#best-practices)

---

## Prerequisites

- **Runtime**: Bun (recommended) or Node.js 18+
- **Package Manager**: Bun (faster) or npm
- **Knowledge**: Basic TypeScript/JavaScript

Install Bun:
```bash
curl -fsSL https://bun.sh/install | bash
```

---

## Quick Start

### Option 1: Clone and Run

```bash
git clone https://github.com/Retsumdk/ai-agent-infrastructure.git
cd ai-agent-infrastructure
bun install
```

### Option 2: Use as Package

```bash
bun add @thebookmaster/agent-orchestration
```

---

## Your First Agent

Create a simple monitoring agent that runs every hour:

```typescript
import { Agent, AgentOrchestrator, type AgentContext } from '@thebookmaster/agent-orchestration';

const monitorAgent = new Agent({
  name: 'SYSTEM-MONITOR',
  schedule: '0 * * * *', // Every hour
  task: async (context: AgentContext) => {
    // Check system health
    const health = await checkSystemHealth();
    
    // Log results
    context.logger.info('System health check', health);
    
    // Send alert if needed
    if (health.score < 80) {
      await sendAlert(health);
    }
  }
});

const orchestrator = new AgentOrchestrator({
  agents: [monitorAgent]
});

orchestrator.start();
```

That's it! Your agent is now running on a schedule.

---

## Multi-Agent Systems

Build sophisticated multi-agent systems with cross-agent communication:

```typescript
import { Agent, AgentOrchestrator, type AgentContext } from '@thebookmaster/agent-orchestration';

// Agent 1: Data Collector
const collectorAgent = new Agent({
  name: 'DATA-COLLECTOR',
  schedule: '0 */6 * * *',
  task: async (context: AgentContext) => {
    const data = await collectData();
    
    // Store in state
    context.state.set('collectedData', data);
    
    // Notify other agents
    await context.hub.send('DATA-ANALYZER', {
      from: 'DATA-COLLECTOR',
      to: 'DATA-ANALYZER',
      type: 'data-ready',
      payload: { dataId: data.id, timestamp: new Date() }
    });
  }
});

// Agent 2: Data Analyzer
const analyzerAgent = new Agent({
  name: 'DATA-ANALYZER',
  schedule: '0 */6 * * *',
  task: async (context: AgentContext) => {
    // Check for messages from collector
    const messages = await context.hub.receive('DATA-ANALYZER');
    
    for (const message of messages) {
      if (message.type === 'data-ready') {
        const analysis = await analyzeData(message.payload.dataId);
        
        // Send results to reporter
        await context.hub.send('REPORT-GENERATOR', {
          from: 'DATA-ANALYZER',
          to: 'REPORT-GENERATOR',
          type: 'analysis-complete',
          payload: analysis
        });
      }
    }
  }
});

// Agent 3: Report Generator
const reporterAgent = new Agent({
  name: 'REPORT-GENERATOR',
  schedule: '0 */6 * * *',
  task: async (context: AgentContext) => {
    const messages = await context.hub.receive('REPORT-GENERATOR');
    
    for (const message of messages) {
      if (message.type === 'analysis-complete') {
        await generateReport(message.payload);
      }
    }
  }
});

// Start all agents
const orchestrator = new AgentOrchestrator({
  agents: [collectorAgent, analyzerAgent, reporterAgent],
  hubName: 'DATA-PIPELINE-HUB'
});

orchestrator.start();
```

---

## Building a Marketplace

Create an agent marketplace with trust system and payments:

```typescript
import { Marketplace, TrustGraph, PaymentProcessor } from '@thebookmaster/marketplace-sdk';

const marketplace = new Marketplace({
  name: 'My Agent Marketplace',
  trustGraph: new TrustGraph(),
  payments: new PaymentProcessor({
    stripe: { secretKey: process.env.STRIPE_SECRET_KEY },
    crypto: { enabled: true }
  })
});

// List a product
const product = await marketplace.listProduct({
  name: 'AI Content Generator',
  description: 'Generate high-quality content automatically',
  seller: 'seller-001',
  price: { amount: 49, currency: 'USD' },
  features: ['Blog posts', 'Social media', 'Email campaigns'],
  category: 'content-generation',
  status: 'active'
});

// Process a purchase
const purchase = await marketplace.processPurchase({
  productId: product.id,
  buyer: 'buyer-001',
  paymentMethod: 'stripe'
});

console.log('Purchase completed:', purchase.id);
```

---

## Monitoring & Observability

Use Agent Monitor Pro to track your agents:

```bash
# Install globally
bun install -g @thebookmaster/agent-monitor

# Watch all agents
agent-monitor watch --all

# Check specific agent
agent-monitor health --agent EMAIL-AUTOMATION

# Generate report
agent-monitor report --last 7d
```

Programmatic monitoring:

```typescript
import { AgentMonitor } from '@thebookmaster/agent-monitor';

const monitor = new AgentMonitor({
  configPath: './agent-monitor.config.json'
});

monitor.on('health-change', (agent, score) => {
  console.log(`${agent.name} health dropped to ${score}`);
  // Send alert
});

monitor.on('alert', (agent, alert) => {
  // Handle critical alerts
});

monitor.start();
```

---

## Production Deployment

### Option 1: @Retsumdk (Recommended)

Deploy directly on @Retsumdk with automatic scheduling:

```typescript
// Create scheduled agent on Zo
import { createAgent } from '@zo/sdk';

await createAgent({
  name: 'PROD-EMAIL-PROCESSOR',
  schedule: '0 */2 * * *',
  instruction: 'Process unread emails, categorize, and send alerts for urgent items',
  delivery_method: 'telegram'
});
```

### Option 2: Docker

```dockerfile
FROM oven/bun:1

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
CMD ["bun", "run", "src/index.ts"]
```

```bash
docker build -t agent-system .
docker run -d agent-system
```

### Option 3: Cloud Functions

Deploy as serverless functions:

```typescript
// For AWS Lambda, GCP Functions, etc.
export async function handler(event: any) {
  const orchestrator = new AgentOrchestrator({
    agents: [/* your agents */]
  });
  
  // Run once per invocation
  await orchestrator.runOnce();
}
```

---

## Best Practices

### 1. Agent Design

- **Single Responsibility**: Each agent should do one thing well
- **Idempotency**: Agents should be safe to run multiple times
- **Error Handling**: Always handle errors gracefully
- **Logging**: Log important actions and state changes

### 2. Scheduling

- Use appropriate intervals (don't poll too frequently)
- Consider timezone implications
- Implement backoff for failed runs

### 3. State Management

- Persist important state across runs
- Use the built-in state system or external database
- Keep state minimal and focused

### 4. Cross-Agent Communication

- Use the hub for inter-agent messaging
- Keep messages small and focused
- Handle missing messages gracefully

### 5. Monitoring

- Set up alerts for critical agents
- Monitor health scores and success rates
- Review logs regularly

### 6. Security

- Store secrets in environment variables
- Use secure communication channels
- Validate all inputs

---

## Next Steps

- [Explore Examples](../examples/)
- [Read API Documentation](./API.md)
- [Join Community](https://github.com/Retsumdk/ai-agent-infrastructure/discussions)
- [Contribute](../CONTRIBUTING.md)

---

## Need Help?

- **Documentation**: [Full docs](./)
- **Issues**: [GitHub Issues](https://github.com/Retsumdk/ai-agent-infrastructure/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Retsumdk/ai-agent-infrastructure/discussions)
- **Email**: retsumdk@users.noreply.github.com

---

*Built with ❤️ by Retsumdk*

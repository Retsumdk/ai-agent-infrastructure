# Agent Orchestration Framework

A production-ready framework for building autonomous multi-agent systems. Powers SCIEL ecosystem.

## Quick Start

```bash
bun install @retsumdk/agent-orchestration
```

```typescript
import { AgentOrchestrator, Agent } from '@retsumdk/agent-orchestration';

// Define your agent
const emailAgent = new Agent({
  name: 'EMAIL-PROCESSOR',
  schedule: '0 */2 * * *', // Every 2 hours
  task: async (context) => {
    const emails = await context.gmail.fetchUnread();
    for (const email of emails) {
      await processEmail(email);
    }
  }
});

// Add to orchestrator
const orchestrator = new AgentOrchestrator({
  agents: [emailAgent],
  hub: 'SCIEL-HUB' // Cross-agent coordination
});

orchestrator.start();
```

## Features

- **Automatic Scheduling**: Cron-based agent execution
- **Cross-Agent Communication**: Agents can send messages to each other
- **Health Monitoring**: Automatic health checks and alerting
- **Error Recovery**: Configurable retry strategies
- **State Persistence**: Agents maintain state across runs
- **Telegram Integration**: Built-in notifications
- **Performance Metrics**: Track execution time, success rates

## Architecture

```
┌─────────────────────────────────────┐
│        Agent Orchestrator           │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │ Agent 1  │  │ Agent 2  │       │
│  └────┬─────┘  └────┬─────┘       │
│       │              │             │
│       └──────┬───────┘             │
│              │                     │
│        ┌─────▼─────┐               │
│        │   HUB     │               │
│        └───────────┘               │
└─────────────────────────────────────┘
```

## Documentation

- [Agent Configuration](./docs/agent-config.md)
- [Scheduling](./docs/scheduling.md)
- [Cross-Agent Communication](./docs/communication.md)
- [Health Monitoring](./docs/monitoring.md)
- [Examples](./examples/)

## License

MIT

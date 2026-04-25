# Agent Monitor Pro

Real-time health monitoring and diagnostics for AI agents.

## Installation

```bash
bun install -g @thebookmaster/agent-monitor
```

## Usage

### Monitor a single agent

```bash
agent-monitor watch --agent EMAIL-PROCESSOR
```

### Monitor all agents

```bash
agent-monitor watch --all
```

### Health check

```bash
agent-monitor health --agent EMAIL-PROCESSOR
```

### Performance report

```bash
agent-monitor report --last 24h
```

## Features

- **Real-time Monitoring**: Live agent status and metrics
- **Health Scoring**: 5-level reliability assessment
- **Alert System**: Telegram, email, and webhook notifications
- **Performance Analytics**: Execution time, success rates, error tracking
- **Auto-Recovery**: Automatic restart on failure
- **Resource Tracking**: Memory, CPU, and API usage

## Output Example

```
╔════════════════════════════════════════════════════╗
║          AGENT MONITOR - LIVE STATUS               ║
╠════════════════════════════════════════════════════╣
║ Agent: EMAIL-PROCESSOR                             ║
║ Status: ✓ Running                                  ║
║ Health: 98/100 (Excellent)                         ║
║ Last Run: 2 hours ago                              ║
║ Success Rate: 99.2%                                ║
║ Avg Duration: 45.3s                                ║
╚════════════════════════════════════════════════════╝
```

## Configuration

Create `agent-monitor.config.json`:

```json
{
  "agents": [
    {
      "name": "EMAIL-PROCESSOR",
      "type": "zo-agent",
      "critical": true,
      "schedule": "0 */2 * * *",
      "timeout": 300000
    }
  ],
  "alerts": {
    "telegram": {
      "enabled": true,
      "recipient": "@your_username"
    },
    "webhook": {
      "url": "https://your-webhook.com/alerts"
    }
  },
  "thresholds": {
    "healthScore": 80,
    "successRate": 95,
    "maxErrors": 3
  }
}
```

## API

```typescript
import { AgentMonitor } from '@thebookmaster/agent-monitor';

const monitor = new AgentMonitor({
  configPath: './agent-monitor.config.json'
});

monitor.on('health-change', (agent, score) => {
  console.log(`${agent.name} health: ${score}`);
});

monitor.on('alert', (agent, alert) => {
  // Handle alert
});

monitor.start();
```

## License

MIT

[![Build](https://github.com/Retsumdk/ai-agent-infrastructure/workflows/CI/badge.svg)](https://github.com/Retsumdk/ai-agent-infrastructure/actions)
[![TypeScript](https://img.shields.io/badge/typescript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node.js-20-green?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

# Retsumdk - AI Agent Infrastructure

[![Build](https://github.com/Retsumdk/ai-agent-infrastructure/workflows/CI/badge.svg)](https://github.com/Retsumdk/ai-agent-infrastructure/actions)


> Production-ready frameworks for building autonomous AI agents, multi-agent systems, and agent marketplaces.

[![GitHub stars](https://img.shields.io/github/stars/Retsumdk/ai-agent-infrastructure?style=social)](https://github.com/Retsumdk/ai-agent-infrastructure)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/Retsumdk/ai-agent-infrastructure/workflows/CI/badge.svg)](https://github.com/Retsumdk/ai-agent-infrastructure/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6.svg)](https://www.typescriptlang.org/)



## 📊 Key Metrics (November 2026)

| Metric | Value |
|--------|-------|
| Autonomous automations registered | 96 (12 active) |
| Agents on the governance plane | 17 |
| Fleet posture score | 74 / 100 |
| Governance policies / compliance controls | 15 / 24 |
| Marketplace listings | 83 (all QC 95-100%) |
| Marketplace transactions | 0 |
| Skills in the library | 287 |
| Public repositories | 219 |
| Days operational | 479 |
| Uptime | 99.5% |

## 📦 What's Inside

### Frameworks

| Framework | Description | Status |
|-----------|-------------|--------|
| [Agent Orchestration](./frameworks/agent-orchestration/) | Multi-agent coordination with scheduling, health monitoring, and cross-agent communication | Production ready |
| [Marketplace SDK](./frameworks/marketplace-sdk/) | Agent marketplaces with trust tiers, payments, and dispute resolution | Production ready |

### Tools

| Tool | Description | Status |
|------|-------------|--------|
| [Agent Monitor](./tools/agent-monitor/) | Health monitoring and diagnostics for running agents | Production ready |

### Examples

- [Email Automation Agent](./examples/email-automation/) — complete email processing pipeline

Getting started: [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md)

## 🏗️ Shipped Systems (2026)

- **Agent governance plane** — fleet inventory, deterministic policy engine, span-level traces, approval queue with SLA clocks, 24 compliance controls mapped to EU AI Act / NIST AI RMF / ISO 42001 / SOC 2, Ed25519 signed receipts, and a hash-chained audit ledger. An agent joins with one POST and gets a key, an agent card, and a live link; MCP, OTLP/HTTP, HMAC webhooks and a receipt verifier are additional front doors.
- **Document engine** — upload-to-form extraction across 13 formats with OCR, font-level PDF decoding, table geometry parsing, 400 MB chunked resumable uploads, and streamed field events.
- **Agent reinforcement arena** — 9 scored environments where the environment, not the agent, computes reward; 1,138 episodes recorded, 828 solved, policy cards reallocated by UCB and promoted only after held-out evaluation.
- **Client delivery pipeline** — two governed agents, one building and one independently reviewing, with a public intake form and per-run traces.
- **OpenAI-compatible AI gateway** — streaming chat completions with tool-call passthrough and eight model routes across six providers, so editor extensions share one endpoint.

## 🔗 Related Repos

- [agent-memory-store](https://github.com/Retsumdk/agent-memory-store) — Persistent memory for AI agents
- [agent-task-queue](https://github.com/Retsumdk/agent-task-queue) — Priority task queue for agents
- [prompt-version-control](https://github.com/Retsumdk/prompt-version-control) — Version control for AI prompts


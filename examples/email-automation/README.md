# Example: Email Automation Agent

Complete example of an email processing agent using the Agent Orchestration Framework.

## What This Does

- Fetches unread emails every 2 hours
- Categorizes and prioritizes them
- Sends Telegram notifications for urgent emails
- Maintains processing statistics

## Setup

```bash
bun install
```

Create `.env`:
```
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

## Run

```bash
bun run src/index.ts
```

## Code

See `src/index.ts` for the complete implementation.

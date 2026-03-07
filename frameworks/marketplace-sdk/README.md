# AI Agent Marketplace SDK

Build your own agent marketplace in minutes. Powers BOLT.

## Quick Start

```bash
bun install @thebookmaster/marketplace-sdk
```

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
await marketplace.listProduct({
  name: 'Data Analysis Agent',
  seller: 'agent-001',
  price: { amount: 99, currency: 'USD' },
  features: ['Automated analysis', 'Report generation']
});

// Process a purchase
await marketplace.processPurchase({
  productId: 'product-001',
  buyer: 'agent-002',
  paymentMethod: 'stripe'
});
```

## Features

- **Trust System**: Multi-tier trust verification (Registered → Verified → Trusted → Elite)
- **Dispute Resolution**: Automated dispute handling with evidence collection
- **Multi-Chain Payments**: Stripe + USDC + other cryptocurrencies
- **Analytics**: Real-time marketplace metrics
- **Webhooks**: Event-driven integrations
- **API**: RESTful and GraphQL endpoints

## Architecture

```
┌────────────────────────────────────────┐
│           Marketplace SDK              │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────┐  ┌───────────────┐  │
│  │  TrustGraph  │  │  Payments     │  │
│  └──────────────┘  └───────────────┘  │
│                                        │
│  ┌──────────────┐  ┌───────────────┐  │
│  │  Disputes    │  │  Analytics    │  │
│  └──────────────┘  └───────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

## Trust Levels

| Level | Requirements | Benefits |
|-------|--------------|----------|
| Registered | None | Basic listing access |
| Verified | Identity proof + 10 transactions | Higher visibility |
| Trusted | 100+ transactions + 95% success rate | Premium placement |
| Elite | 500+ transactions + 99% success rate | Featured + lower fees |

## Documentation

- [Getting Started](./docs/getting-started.md)
- [Trust System](./docs/trust-system.md)
- [Payments](./docs/payments.md)
- [Dispute Resolution](./docs/disputes.md)
- [API Reference](./docs/api.md)

## Examples

- [Basic Marketplace](./examples/basic/)
- [With Trust Graph](./examples/trust-graph/)
- [Full BOLT Clone](./examples/bolt-clone/)

## License

MIT

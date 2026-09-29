import { describe, test, expect } from "bun:test";
import { Logger, MetricsCollector, Hub } from "../frameworks/agent-orchestration/src/index";
import {
  TrustGraph,
  PaymentProcessor,
  DisputeResolver,
  Marketplace,
} from "../frameworks/marketplace-sdk/src/index";

describe("agent-orchestration", () => {
  test("MetricsCollector averages and counts", () => {
    const m = new MetricsCollector();
    m.record("latency", 100);
    m.record("latency", 200);
    expect(m.getCount("latency")).toBe(2);
    expect(m.getAverage("latency")).toBe(150);
    expect(m.getAverage("missing")).toBe(0);
  });

  test("Hub broadcast and direct send deliver to receivers", async () => {
    const hub = new Hub("test-hub");
    hub.registerAgent("a");
    hub.registerAgent("b");
    await hub.broadcast({ from: "a", to: "broadcast", type: "ping", payload: { n: 1 } });
    await hub.send("b", { from: "a", to: "b", type: "direct", payload: { n: 2 } });

    const forB = await hub.receive("b");
    expect(forB.length).toBe(2);
    expect(forB.some((m) => m.type === "direct")).toBe(true);
    expect((await hub.receive("c")).length).toBe(0);
  });

  test("Hub subscribe callback fires on broadcast", async () => {
    const hub = new Hub("sub-hub");
    let seen: string | undefined;
    hub.subscribe("listener", (m) => { seen = m.type; });
    await hub.broadcast({ from: "x", to: "broadcast", type: "evt", payload: null });
    expect(seen).toBe("evt");
  });
});

describe("marketplace-sdk", () => {
  test("TrustGraph starts at registered and promotes with transactions", () => {
    const tg = new TrustGraph();
    expect(tg.getProfile("a1").level).toBe("registered");

    for (let i = 0; i < 10; i++) tg.recordTransaction("a1", true);
    expect(tg.getProfile("a1").level).toBe("verified");

    tg.recordTransaction("a1", false);
    expect(tg.getProfile("a1").successRate).toBeLessThan(100);
  });

  test("TrustGraph ratings accumulate a correct average", () => {
    const tg = new TrustGraph();
    tg.recordRating("a2", 5);
    tg.recordRating("a2", 3);
    const p = tg.getProfile("a2");
    expect(p.ratings.count).toBe(2);
    expect(p.ratings.average).toBe(4);
  });

  test("PaymentProcessor succeeds for configured methods and throws otherwise", async () => {
    const stripe = new PaymentProcessor({ stripe: { secretKey: "sk_test_x" } });
    const ok = await stripe.processPayment(1000, "usd", "stripe", {});
    expect(ok.success).toBe(true);

    const none = new PaymentProcessor({});
    await expect(none.processPayment(1000, "usd", "stripe", {})).rejects.toThrow(/not configured/);
  });

  test("Marketplace end-to-end: list, purchase, rate", async () => {
    const tg = new TrustGraph();
    const market = new Marketplace({
      name: "test-market",
      trustGraph: tg,
      payments: new PaymentProcessor({ stripe: { secretKey: "sk_test_x" } }),
    });

    const product = await market.listProduct({
      name: "Agent Tool",
      description: "Does a thing",
      seller: "seller-1",
      price: { amount: 500, currency: "usd" },
      features: ["fast"],
      category: "tools",
      status: "active",
    });
    expect(market.getProduct(product.id)!.seller).toBe("seller-1");

    const purchase = await market.processPurchase({
      productId: product.id,
      buyer: "buyer-1",
      paymentMethod: "stripe",
    });
    expect(purchase.status).toBe("completed");
    expect(tg.getProfile("seller-1").transactions).toBe(1);

    market.rateProduct(product.id, "buyer-1", 4);
    expect(market.getProduct(product.id)!.ratings.length).toBe(1);
    expect(market.getProducts({ seller: "seller-1" }).length).toBe(1);
  });

  test("DisputeResolver lifecycle: create, evidence, resolve", async () => {
    const dr = new DisputeResolver();
    const d = dr.createDispute("p-1", "buyer-1", "Item not as described");
    expect(d.status).toBe("open");

    dr.addEvidence(d.id, { type: "log", content: "err.log", submittedBy: "buyer-1" });
    const resolved = await dr.autoResolve(d);
    expect(["buyer", "seller", "split"]).toContain(resolved!.decision);
  });
});

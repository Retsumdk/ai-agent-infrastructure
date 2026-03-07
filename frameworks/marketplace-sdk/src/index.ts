/**
 * AI Agent Marketplace SDK
 * Build production-ready agent marketplaces
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  seller: string;
  price: Price;
  features: string[];
  category: string;
  status: 'active' | 'paused' | 'discontinued';
  trustLevel: TrustLevel;
  ratings: Rating[];
  createdAt: Date;
}

export interface Price {
  amount: number;
  currency: string;
  recurring?: {
    interval: 'month' | 'year';
    intervalCount: number;
  };
}

export interface Rating {
  buyer: string;
  score: number; // 1-5
  comment?: string;
  timestamp: Date;
}

export type TrustLevel = 'registered' | 'verified' | 'trusted' | 'elite';

export interface TrustProfile {
  agentId: string;
  level: TrustLevel;
  transactions: number;
  successRate: number;
  disputes: number;
  ratings: {
    average: number;
    count: number;
  };
  badges: string[];
  verifiedAt?: Date;
}

export interface Purchase {
  id: string;
  productId: string;
  buyer: string;
  seller: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'disputed' | 'refunded';
  paymentMethod: 'stripe' | 'crypto' | 'internal';
  createdAt: Date;
  completedAt?: Date;
}

export interface Dispute {
  id: string;
  purchaseId: string;
  initiator: string;
  reason: string;
  evidence: Evidence[];
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  resolution?: {
    decision: 'buyer' | 'seller' | 'split';
    amount: number;
    notes: string;
  };
  createdAt: Date;
  resolvedAt?: Date;
}

export interface Evidence {
  type: 'screenshot' | 'log' | 'message' | 'document';
  content: string;
  submittedBy: string;
  timestamp: Date;
}

export class TrustGraph {
  private profiles: Map<string, TrustProfile> = new Map();
  
  constructor() {
    // Initialize with default values
  }
  
  getProfile(agentId: string): TrustProfile {
    if (!this.profiles.has(agentId)) {
      this.profiles.set(agentId, {
        agentId,
        level: 'registered',
        transactions: 0,
        successRate: 100,
        disputes: 0,
        ratings: { average: 0, count: 0 },
        badges: []
      });
    }
    
    return this.profiles.get(agentId)!;
  }
  
  recordTransaction(agentId: string, success: boolean) {
    const profile = this.getProfile(agentId);
    profile.transactions++;
    
    // Update success rate
    const previousSuccesses = profile.successRate * (profile.transactions - 1) / 100;
    profile.successRate = ((previousSuccesses + (success ? 1 : 0)) / profile.transactions) * 100;
    
    this.updateLevel(agentId);
  }
  
  recordRating(agentId: string, score: number) {
    const profile = this.getProfile(agentId);
    const previousTotal = profile.ratings.average * profile.ratings.count;
    profile.ratings.count++;
    profile.ratings.average = (previousTotal + score) / profile.ratings.count;
    
    this.updateLevel(agentId);
  }
  
  recordDispute(agentId: string) {
    const profile = this.getProfile(agentId);
    profile.disputes++;
  }
  
  private updateLevel(agentId: string) {
    const profile = this.getProfile(agentId);
    
    // Elite: 500+ transactions, 99%+ success rate
    if (profile.transactions >= 500 && profile.successRate >= 99) {
      profile.level = 'elite';
      if (!profile.badges.includes('elite-seller')) {
        profile.badges.push('elite-seller');
      }
      return;
    }
    
    // Trusted: 100+ transactions, 95%+ success rate
    if (profile.transactions >= 100 && profile.successRate >= 95) {
      profile.level = 'trusted';
      if (!profile.badges.includes('trusted-seller')) {
        profile.badges.push('trusted-seller');
      }
      return;
    }
    
    // Verified: 10+ transactions
    if (profile.transactions >= 10) {
      profile.level = 'verified';
      if (!profile.badges.includes('verified')) {
        profile.badges.push('verified');
      }
      return;
    }
    
    profile.level = 'registered';
  }
  
  verifyAgent(agentId: string) {
    const profile = this.getProfile(agentId);
    profile.verifiedAt = new Date();
    this.updateLevel(agentId);
  }
}

export class PaymentProcessor {
  private stripeKey?: string;
  private cryptoEnabled: boolean;
  
  constructor(config: { stripe?: { secretKey: string }; crypto?: { enabled: boolean } }) {
    this.stripeKey = config.stripe?.secretKey;
    this.cryptoEnabled = config.crypto?.enabled || false;
  }
  
  async processPayment(
    amount: number,
    currency: string,
    method: 'stripe' | 'crypto',
    metadata: any
  ): Promise<{ success: boolean; transactionId: string }> {
    if (method === 'stripe' && this.stripeKey) {
      // In production, would call Stripe API
      const transactionId = `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return { success: true, transactionId };
    }
    
    if (method === 'crypto' && this.cryptoEnabled) {
      // In production, would interact with blockchain
      const transactionId = `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return { success: true, transactionId };
    }
    
    throw new Error(`Payment method ${method} not configured`);
  }
  
  async refund(transactionId: string, amount: number): Promise<boolean> {
    // In production, would process refund through appropriate provider
    return true;
  }
}

export class DisputeResolver {
  private disputes: Map<string, Dispute> = new Map();
  
  createDispute(
    purchaseId: string,
    initiator: string,
    reason: string
  ): Dispute {
    const dispute: Dispute = {
      id: `dispute_${Date.now()}`,
      purchaseId,
      initiator,
      reason,
      evidence: [],
      status: 'open',
      createdAt: new Date()
    };
    
    this.disputes.set(dispute.id, dispute);
    return dispute;
  }
  
  addEvidence(disputeId: string, evidence: Evidence): void {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) throw new Error('Dispute not found');
    
    dispute.evidence.push(evidence);
    dispute.status = 'investigating';
  }
  
  async autoResolve(dispute: Dispute): Promise<Dispute['resolution']> {
    // Simple auto-resolution logic
    // In production, this would be much more sophisticated
    
    if (dispute.evidence.length === 0) {
      return {
        decision: 'seller',
        amount: 0,
        notes: 'No evidence provided by buyer'
      };
    }
    
    // If seller has high trust level, favor seller
    // If buyer has high trust level, favor buyer
    // Otherwise, split
    
    return {
      decision: 'split',
      amount: 50,
      notes: 'Automatic resolution - insufficient evidence for full refund'
    };
  }
}

export class Marketplace {
  private products: Map<string, Product> = new Map();
  private purchases: Map<string, Purchase> = new Map();
  private trustGraph: TrustGraph;
  private paymentProcessor: PaymentProcessor;
  private disputeResolver: DisputeResolver;
  
  constructor(config: {
    name: string;
    trustGraph: TrustGraph;
    payments: PaymentProcessor;
  }) {
    this.trustGraph = config.trustGraph;
    this.paymentProcessor = config.payments;
    this.disputeResolver = new DisputeResolver();
  }
  
  async listProduct(product: Omit<Product, 'id' | 'createdAt' | 'ratings' | 'trustLevel'>): Promise<Product> {
    const sellerProfile = this.trustGraph.getProfile(product.seller);
    
    const fullProduct: Product = {
      ...product,
      id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ratings: [],
      trustLevel: sellerProfile.level,
      createdAt: new Date()
    };
    
    this.products.set(fullProduct.id, fullProduct);
    return fullProduct;
  }
  
  async processPurchase(params: {
    productId: string;
    buyer: string;
    paymentMethod: 'stripe' | 'crypto';
  }): Promise<Purchase> {
    const product = this.products.get(params.productId);
    if (!product) throw new Error('Product not found');
    
    // Process payment
    const payment = await this.paymentProcessor.processPayment(
      product.price.amount,
      product.price.currency,
      params.paymentMethod,
      { productId: product.id, buyer: params.buyer }
    );
    
    if (!payment.success) {
      throw new Error('Payment failed');
    }
    
    const purchase: Purchase = {
      id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      buyer: params.buyer,
      seller: product.seller,
      amount: product.price.amount,
      currency: product.price.currency,
      status: 'completed',
      paymentMethod: params.paymentMethod,
      createdAt: new Date(),
      completedAt: new Date()
    };
    
    this.purchases.set(purchase.id, purchase);
    
    // Update trust graph
    this.trustGraph.recordTransaction(product.seller, true);
    this.trustGraph.recordTransaction(params.buyer, true);
    
    return purchase;
  }
  
  getProduct(id: string): Product | undefined {
    return this.products.get(id);
  }
  
  getProducts(filter?: { seller?: string; category?: string }): Product[] {
    let products = Array.from(this.products.values());
    
    if (filter?.seller) {
      products = products.filter(p => p.seller === filter.seller);
    }
    
    if (filter?.category) {
      products = products.filter(p => p.category === filter.category);
    }
    
    return products;
  }
  
  rateProduct(productId: string, buyer: string, score: number, comment?: string): void {
    const product = this.products.get(productId);
    if (!product) throw new Error('Product not found');
    
    product.ratings.push({
      buyer,
      score,
      comment,
      timestamp: new Date()
    });
    
    this.trustGraph.recordRating(product.seller, score);
  }
}

export default Marketplace;

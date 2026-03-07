/**
 * Email Automation Agent
 * Example using Agent Orchestration Framework
 */

import { Agent, AgentOrchestrator, type AgentContext } from '../../frameworks/agent-orchestration/src';

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
}

interface EmailStats {
  processed: number;
  urgent: number;
  archived: number;
  errors: number;
}

class EmailAutomationAgent {
  private stats: EmailStats = {
    processed: 0,
    urgent: 0,
    archived: 0,
    errors: 0
  };
  
  async fetchUnreadEmails(): Promise<Email[]> {
    // In production, would call Gmail API
    // Simulated for demo
    return [
      {
        id: 'email_001',
        from: 'urgent@client.com',
        subject: 'URGENT: Contract Review Needed',
        body: 'Please review the attached contract...',
        timestamp: new Date(),
        isRead: false
      },
      {
        id: 'email_002',
        from: 'newsletter@updates.com',
        subject: 'Weekly Update',
        body: 'Here are this week\'s updates...',
        timestamp: new Date(),
        isRead: false
      }
    ];
  }
  
  categorizeEmail(email: Email): 'urgent' | 'important' | 'normal' | 'low' {
    const subject = email.subject.toLowerCase();
    
    if (subject.includes('urgent') || subject.includes('asap')) {
      return 'urgent';
    }
    
    if (subject.includes('important') || subject.includes('deadline')) {
      return 'important';
    }
    
    if (subject.includes('newsletter') || subject.includes('unsubscribe')) {
      return 'low';
    }
    
    return 'normal';
  }
  
  async sendTelegramAlert(email: Email, category: string): Promise<void> {
    // In production, would call Telegram API
    console.log(`[TELEGRAM] Urgent email detected: ${email.subject}`);
  }
  
  async processEmail(email: Email): Promise<void> {
    const category = this.categorizeEmail(email);
    
    console.log(`Processing email: ${email.subject} [${category}]`);
    
    if (category === 'urgent') {
      await this.sendTelegramAlert(email, category);
      this.stats.urgent++;
    } else if (category === 'low') {
      // Auto-archive newsletters
      this.stats.archived++;
    }
    
    this.stats.processed++;
  }
  
  getStats(): EmailStats {
    return this.stats;
  }
}

// Create the agent
const emailAgent = new Agent({
  name: 'EMAIL-AUTOMATION',
  schedule: '0 */2 * * *', // Every 2 hours
  task: async (context: AgentContext) => {
    const automation = new EmailAutomationAgent();
    
    context.logger.info('Starting email processing');
    
    // Fetch unread emails
    const emails = await automation.fetchUnreadEmails();
    context.logger.info(`Found ${emails.length} unread emails`);
    
    // Process each email
    for (const email of emails) {
      try {
        await automation.processEmail(email);
      } catch (error) {
        context.logger.error(`Failed to process email ${email.id}`, error as Error);
      }
    }
    
    // Store stats in context
    context.state.set('lastRun', new Date());
    context.state.set('stats', automation.getStats());
    
    context.logger.info('Email processing complete', automation.getStats());
  },
  retries: 3,
  timeout: 300000, // 5 minutes
  onError: async (error, context) => {
    context.logger.error('Email automation failed', error);
    
    // Could send Telegram notification here
  },
  onSuccess: async (context) => {
    const stats = context.state.get('stats');
    context.logger.info('Run completed successfully', stats);
  }
});

// Start the orchestrator
const orchestrator = new AgentOrchestrator({
  agents: [emailAgent],
  hubName: 'EMAIL-HUB'
});

console.log('Starting Email Automation Agent...');
orchestrator.start();

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  orchestrator.stop();
  process.exit(0);
});

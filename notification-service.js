/**
 * Notification service that listens to domain events
 * and dispatches notifications through configured channels.
 */

const { EventBus } = require('./event-bus');

class NotificationService {
  constructor(eventBus, channels = []) {
    this.eventBus = eventBus;
    this.channels = channels;
    this.queue = [];
    this.processing = false;

    this.eventBus.on('order.completed', (_, payload) => this.enqueue('order_confirmation', payload));
    this.eventBus.on('order.refunded', (_, payload) => this.enqueue('refund_notice', payload));
    this.eventBus.on('user.registered', (_, payload) => this.enqueue('welcome_email', payload));
  }

  enqueue(template, data) {
    this.queue.push({ template, data, createdAt: Date.now(), retries: 0 });
    if (!this.processing) this.processQueue();
  }

  async processQueue() {
    this.processing = true;
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      try {
        await this.dispatch(item);
      } catch (err) {
        if (item.retries < 3) {
          item.retries++;
          this.queue.push(item);
        } else {
          console.error(`Notification dropped after 3 retries: ${item.template}`, err);
        }
      }
    }
    this.processing = false;
  }

  async dispatch(item) {
    for (const channel of this.channels) {
      if (channel.supports(item.template)) {
        await channel.send(item.template, item.data);
      }
    }
  }
}

class EmailChannel {
  constructor(smtpConfig) {
    this.smtp = smtpConfig;
    this.templates = ['order_confirmation', 'refund_notice', 'welcome_email'];
  }

  supports(template) {
    return this.templates.includes(template);
  }

  async send(template, data) {
    // In production: use nodemailer or similar
    console.log(`[Email] Sending ${template} to ${data.email}`);
  }
}

class SlackChannel {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
    this.templates = ['order.completed', 'order.refunded'];
  }

  supports(template) {
    return this.templates.includes(template);
  }

  async send(template, data) {
    console.log(`[Slack] Posting ${template} to channel`);
  }
}

module.exports = { NotificationService, EmailChannel, SlackChannel };

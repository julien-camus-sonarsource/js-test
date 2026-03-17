/**
 * Order lifecycle manager: coordinates order state transitions
 * and emits domain events for downstream consumers.
 */

const { EventBus } = require('./event-bus');

class OrderLifecycle {
  constructor(eventBus, repository) {
    this.eventBus = eventBus;
    this.repository = repository;
  }

  async create(orderData) {
    const order = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await this.repository.save(order);
    await this.eventBus.emit('order.created', order);
    return order;
  }

  async complete(orderId) {
    const order = await this.repository.findById(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    if (order.status !== 'pending') {
      throw new Error(`Cannot complete order in status: ${order.status}`);
    }

    order.status = 'completed';
    order.completedAt = new Date().toISOString();

    await this.repository.save(order);
    await this.eventBus.emit('order.completed', order);
    return order;
  }

  async refund(orderId, reason) {
    const order = await this.repository.findById(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    if (order.status !== 'completed') {
      throw new Error(`Cannot refund order in status: ${order.status}`);
    }

    const daysSinceCompleted = (Date.now() - new Date(order.completedAt)) / 86400000;
    if (daysSinceCompleted > 30) {
      throw new Error('Refund window expired');
    }

    order.status = 'refunded';
    order.refundedAt = new Date().toISOString();
    order.refundReason = reason;

    await this.repository.save(order);
    await this.eventBus.emit('order.refunded', { ...order, reason });
    return order;
  }
}

module.exports = { OrderLifecycle };

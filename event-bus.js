/**
 * Lightweight publish-subscribe event bus for decoupling modules.
 * Supports wildcard subscriptions and async handlers.
 */

class EventBus {
  constructor() {
    this.listeners = new Map();
    this.history = [];
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      const idx = handlers.indexOf(handler);
      if (idx !== -1) handlers.splice(idx, 1);
    }
  }

  async emit(event, payload) {
    this.history.push({ event, payload, timestamp: Date.now() });

    const handlers = this.listeners.get(event) || [];
    const wildcardHandlers = this.listeners.get('*') || [];

    const all = [...handlers, ...wildcardHandlers];
    await Promise.all(all.map((h) => h(event, payload)));
  }

  getHistory(event) {
    if (event) return this.history.filter((e) => e.event === event);
    return [...this.history];
  }
}

module.exports = { EventBus };

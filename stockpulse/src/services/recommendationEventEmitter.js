const EventEmitter = require('events');

class RecommendationEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Set maximum listeners to avoid memory leaks warning
    this.setMaxListeners(20);
  }
  
  // Emit an inventory low event
  emitInventoryLow(productId) {
    this.emit('inventoryLow', { productId, triggerReason: 'INVENTORY_LOW', eventType: 'inventoryLow', occurredAt: new Date() });
  }
  
  // Emit a demand spike event
  emitDemandSpike(productId) {
    this.emit('demandSpike', { productId, triggerReason: 'DEMAND_SPIKE', eventType: 'demandSpike', occurredAt: new Date() });
  }
}

module.exports = new RecommendationEventEmitter();
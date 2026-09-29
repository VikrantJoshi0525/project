const RecommendationEventEmitter = require('../../services/recommendationEventEmitter');

describe('RecommendationEventEmitter', () => {
  it('should emit inventory low event', (done) => {
    const productId = 'test-product-id';
    
    RecommendationEventEmitter.once('inventoryLow', (eventPayload) => {
      expect(eventPayload.productId).toBe(productId);
      expect(eventPayload.triggerReason).toBe('INVENTORY_LOW');
      expect(eventPayload.eventType).toBe('inventoryLow');
      done();
    });
    
    RecommendationEventEmitter.emitInventoryLow(productId);
  });
  
  it('should emit demand spike event', (done) => {
    const productId = 'test-product-id';
    
    RecommendationEventEmitter.once('demandSpike', (eventPayload) => {
      expect(eventPayload.productId).toBe(productId);
      expect(eventPayload.triggerReason).toBe('DEMAND_SPIKE');
      expect(eventPayload.eventType).toBe('demandSpike');
      done();
    });
    
    RecommendationEventEmitter.emitDemandSpike(productId);
  });
});
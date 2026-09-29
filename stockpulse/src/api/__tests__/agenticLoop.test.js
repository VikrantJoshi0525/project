const request = require('supertest');
const app = require('../../app');
const Product = require('../../models/Product');
const recommendationEventEmitter = require('../../services/recommendationEventEmitter');
const { PRODUCT_LIFECYCLE, PRODUCT_CATEGORY } = require('../../utils/constants');

// Mock the models to avoid database calls
jest.mock('../../models/Product');

describe('Agentic Recommendation Loop Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('INVENTORY_LOW Trigger', () => {
    it('should trigger async recommendation loop on PATCH /products/:id/stock when stock < reorderThreshold', async () => {
      const productId = 'test-product-id';
      const mockProduct = {
        _id: productId,
        sku: 'TEST001',
        name: 'Test Product',
        category: PRODUCT_CATEGORY.ELECTRONICS,
        currentPrice: 100,
        stockLevel: 15,
        reorderThreshold: 10,
        demandVelocity: 5,
        lifecycle: PRODUCT_LIFECYCLE.ACTIVE,
        save: jest.fn().mockResolvedValue({
          _id: productId,
          sku: 'TEST001',
          name: 'Test Product',
          category: PRODUCT_CATEGORY.ELECTRONICS,
          currentPrice: 100,
          stockLevel: 5, // New stock level
          reorderThreshold: 10,
          demandVelocity: 5,
          lifecycle: PRODUCT_LIFECYCLE.ACTIVE
        })
      };

      Product.findById.mockResolvedValue(mockProduct);

      // Spy on event emitter
      const emitSpy = jest.spyOn(recommendationEventEmitter, 'emitInventoryLow');

      // Make the request
      const response = await request(app)
        .patch(`/api/v1/products/${productId}/stock`)
        .send({ stockLevel: 5 })
        .expect(200);

      // Wait for the async event to be processed
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify the response
      expect(response.body.success).toBe(true);
      expect(response.body.data.stockLevel).toBe(5);

      // Verify inventory low event was emitted
      expect(emitSpy).toHaveBeenCalledWith(productId);
    });
  });
});
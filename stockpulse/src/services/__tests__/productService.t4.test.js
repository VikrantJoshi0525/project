const productService = require('../../services/productService');
const Product = require('../../models/Product');
const recommendationEventEmitter = require('../../services/recommendationEventEmitter');
const { PRODUCT_LIFECYCLE } = require('../../utils/constants');

// Mock the models and event emitter
jest.mock('../../models/Product');
jest.mock('../../services/recommendationEventEmitter');

describe('ProductService T4 Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateStock', () => {
    it('should emit inventory low event when stock falls below reorder threshold', async () => {
      const productId = 'test-product-id';
      const newStockLevel = 5;
      const mockProduct = {
        _id: productId,
        stockLevel: 15,
        reorderThreshold: 10,
        lifecycle: PRODUCT_LIFECYCLE.ACTIVE,
        save: jest.fn().mockResolvedValue({
          _id: productId,
          stockLevel: newStockLevel,
          reorderThreshold: 10,
          lifecycle: PRODUCT_LIFECYCLE.ACTIVE
        })
      };

      Product.findById.mockResolvedValue(mockProduct);

      await productService.updateStock(productId, newStockLevel);

      // Wait a bit for the setImmediate to execute
      await new Promise(resolve => setImmediate(resolve));

      // Verify inventory low event was emitted
      expect(recommendationEventEmitter.emitInventoryLow).toHaveBeenCalledWith(productId);
    });

    it('should not emit inventory low event when stock is above reorder threshold', async () => {
      const productId = 'test-product-id';
      const newStockLevel = 15;
      const mockProduct = {
        _id: productId,
        stockLevel: 20,
        reorderThreshold: 10,
        lifecycle: PRODUCT_LIFECYCLE.ACTIVE,
        save: jest.fn().mockResolvedValue({
          _id: productId,
          stockLevel: newStockLevel,
          reorderThreshold: 10,
          lifecycle: PRODUCT_LIFECYCLE.ACTIVE
        })
      };

      Product.findById.mockResolvedValue(mockProduct);

      await productService.updateStock(productId, newStockLevel);

      // Wait a bit for the setImmediate to execute
      await new Promise(resolve => setImmediate(resolve));

      // Verify inventory low event was not emitted
      expect(recommendationEventEmitter.emitInventoryLow).not.toHaveBeenCalled();
    });
  });

  describe('processOrder', () => {
    it('should emit inventory low event when order causes stock to fall below reorder threshold', async () => {
      const productId = 'test-product-id';
      const quantity = 5;
      const mockProduct = {
        _id: productId,
        stockLevel: 12,
        reorderThreshold: 10,
        demandVelocity: 5,
        save: jest.fn().mockResolvedValue({
          _id: productId,
          stockLevel: 7, // 12 - 5
          reorderThreshold: 10,
          demandVelocity: 10, // 5 + 5
          lifecycle: PRODUCT_LIFECYCLE.ACTIVE
        })
      };

      Product.findById.mockResolvedValue(mockProduct);
      Product.aggregate.mockResolvedValue([{ avgDemandVelocity: 3 }]);

      await productService.processOrder(productId, quantity);

      // Wait a bit for the setImmediate to execute
      await new Promise(resolve => setImmediate(resolve));

      // Verify inventory low event was emitted
      expect(recommendationEventEmitter.emitInventoryLow).toHaveBeenCalledWith(productId);
    });

    it('should emit demand spike event when order causes demand velocity to exceed threshold', async () => {
      const productId = 'test-product-id';
      const quantity = 10;
      const mockProduct = {
        _id: productId,
        stockLevel: 50,
        reorderThreshold: 10,
        demandVelocity: 2,
        category: 'ELECTRONICS',
        save: jest.fn().mockResolvedValue({
          _id: productId,
          stockLevel: 40, // 50 - 10
          reorderThreshold: 10,
          demandVelocity: 12, // 2 + 10
          category: 'ELECTRONICS',
          lifecycle: PRODUCT_LIFECYCLE.ACTIVE
        })
      };

      Product.findById.mockResolvedValue(mockProduct);
      Product.aggregate.mockResolvedValue([{ avgDemandVelocity: 3 }]); // 3 * 3 = 9, 12 > 9

      await productService.processOrder(productId, quantity);

      // Wait a bit for the setImmediate to execute
      await new Promise(resolve => setImmediate(resolve));

      // Verify demand spike event was emitted
      expect(recommendationEventEmitter.emitDemandSpike).toHaveBeenCalledWith(productId);
    });

    it('should not emit events when neither condition is met', async () => {
      const productId = 'test-product-id';
      const quantity = 1;
      const mockProduct = {
        _id: productId,
        stockLevel: 15,
        reorderThreshold: 10,
        demandVelocity: 2,
        category: 'ELECTRONICS',
        save: jest.fn().mockResolvedValue({
          _id: productId,
          stockLevel: 14, // 15 - 1
          reorderThreshold: 10,
          demandVelocity: 3, // 2 + 1
          category: 'ELECTRONICS',
          lifecycle: PRODUCT_LIFECYCLE.ACTIVE
        })
      };

      Product.findById.mockResolvedValue(mockProduct);
      Product.aggregate.mockResolvedValue([{ avgDemandVelocity: 5 }]); // 5 * 3 = 15, 3 < 15

      await productService.processOrder(productId, quantity);

      // Wait a bit for the setImmediate to execute
      await new Promise(resolve => setImmediate(resolve));

      // Verify no events were emitted
      expect(recommendationEventEmitter.emitInventoryLow).not.toHaveBeenCalled();
      expect(recommendationEventEmitter.emitDemandSpike).not.toHaveBeenCalled();
    });
  });
});
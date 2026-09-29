const CommerceAdvisorService = require('../../services/commerceAdvisorService');
const StrategyRegistry = require('../../strategies/StrategyRegistry');

// Mock the Product model for testing category average calculation
jest.mock('../../models/Product', () => ({
  aggregate: jest.fn()
}));

const Product = require('../../models/Product');

describe('CommerceAdvisorService', () => {
  let testContext;

  beforeEach(() => {
    testContext = {
      product: {
        currentPrice: 100,
        stockLevel: 50,
        reorderThreshold: 20,
        demandVelocity: 5,
        category: 'ELECTRONICS'
      },
      categoryAverageDemandVelocity: 10,
      triggerReason: 'test'
    };

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('runtime strategy switching', () => {
    it('should use the active registered strategy without restarting the server', async () => {
      // Arrange
      StrategyRegistry.setActiveStrategy('rule');

      // Act
      const result = await CommerceAdvisorService.getRecommendations(testContext);

      // Assert
      expect(result).toHaveProperty('pricing');
      expect(result).toHaveProperty('reorder');
      expect(result).toHaveProperty('triggerReason');
    });
  });

  describe('invalid inputs', () => {
    it('should throw error for invalid context', async () => {
      // Act & Assert
      await expect(CommerceAdvisorService.getRecommendations(null))
        .rejects
        .toThrow('Invalid context: product data is required');

      await expect(CommerceAdvisorService.getRecommendations({}))
        .rejects
        .toThrow('Invalid context: product data is required');
    });
  });

  describe('category average demand velocity calculation', () => {
    it('should calculate category average from product data', async () => {
      // Arrange
      Product.aggregate.mockResolvedValue([{ avgDemandVelocity: 15.5 }]);

      // Act
      const result = await CommerceAdvisorService.getCategoryAverageDemandVelocity('ELECTRONICS');

      // Assert
      expect(result).toBe(15.5);
      expect(Product.aggregate).toHaveBeenCalledWith([
        { $match: { category: 'ELECTRONICS' } },
        { $group: { _id: null, avgDemandVelocity: { $avg: "$demandVelocity" } } }
      ]);
    });

    it('should return default value when no products found', async () => {
      // Arrange
      Product.aggregate.mockResolvedValue([]);

      // Act
      const result = await CommerceAdvisorService.getCategoryAverageDemandVelocity('NONEXISTENT');

      // Assert
      expect(result).toBe(1);
    });
  });
});
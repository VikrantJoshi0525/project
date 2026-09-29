const RuleBasedStrategy = require('../../strategies/RuleBasedStrategy');

describe('RuleBasedStrategy - Reorder Calculation Tests', () => {
  let strategy;
  let testProduct;
  let context;

  beforeEach(() => {
    strategy = new RuleBasedStrategy();
    testProduct = {
      currentPrice: 100,
      stockLevel: 50,
      reorderThreshold: 20,
      demandVelocity: 5
    };
    context = {
      product: testProduct,
      categoryAverageDemandVelocity: 10,
      triggerReason: 'test'
    };
  });

  describe('reorder calculation', () => {
    it('should calculate recommended quantity as (reorderThreshold × 3) - currentStock', () => {
      // Arrange
      context.product.stockLevel = 15;
      context.product.reorderThreshold = 20;

      // Act
      const result = strategy.getRecommendations(context);

      // Assert
      expect(result.reorder.currentStock).toBe(15);
      expect(result.reorder.recommendedQuantity).toBe(45); // (20 * 3) - 15
      expect(result.reorder.suggestedLeadTimeDays).toBe(3); // Less than 100 threshold
    });

    it('should have minimum recommended quantity of 1', () => {
      // Arrange
      context.product.stockLevel = 100;
      context.product.reorderThreshold = 20;

      // Act
      const result = strategy.getRecommendations(context);

      // Assert
      expect(result.reorder.recommendedQuantity).toBe(1); // Min value enforced
    });

    it('should adjust lead time based on reorder threshold', () => {
      // Arrange
      context.product.reorderThreshold = 150; // Above 100

      // Act
      const result = strategy.getRecommendations(context);

      // Assert
      expect(result.reorder.suggestedLeadTimeDays).toBe(7);
    });
  });
});
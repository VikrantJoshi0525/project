const RuleBasedStrategy = require('../../strategies/RuleBasedStrategy');

describe('RuleBasedStrategy - Continued Tests', () => {
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

  describe('both conditions true', () => {
    it('should prioritize stock-low rule deterministically', () => {
      // Arrange
      context.product.stockLevel = 10; // Below reorderThreshold
      context.product.demandVelocity = 25; // Also above 2x category average

      // Act
      const result = strategy.getRecommendations(context);

      // Assert
      expect(result.pricing.direction).toBe('INCREASE');
      expect(result.pricing.recommendedPrice).toBe(110); // 10% increase (stock rule wins)
      expect(result.pricing.confidence).toBe(0.9);
      expect(result.pricing.reasoning).toContain('Stock level below reorder threshold');
    });
  });

  describe('neither condition true', () => {
    it('should recommend HOLD', () => {
      // Arrange
      context.product.stockLevel = 30; // Above reorderThreshold
      context.product.demandVelocity = 15; // Not above 2x category average

      // Act
      const result = strategy.getRecommendations(context);

      // Assert
      expect(result.pricing.direction).toBe('HOLD');
      expect(result.pricing.recommendedPrice).toBe(100); // Same as current
      expect(result.pricing.confidence).toBe(0.8);
      expect(result.pricing.reasoning).toContain('No significant factors affecting pricing');
    });
  });
});
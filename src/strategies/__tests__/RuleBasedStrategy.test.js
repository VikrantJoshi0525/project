const RuleBasedStrategy = require('../../strategies/RuleBasedStrategy');
const StrategyRegistry = require('../../strategies/StrategyRegistry');
const CommerceAdvisor = require('../../services/CommerceAdvisor');
const CompetitorAwareStrategy = require('../../strategies/CompetitorAwareStrategy');

describe('RuleBasedStrategy', () => {
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

  describe('stock below reorder threshold', () => {
    it('should recommend 10% price increase', () => {
      // Arrange
      context.product.stockLevel = 10; // Below reorderThreshold of 20
      context.product.reorderThreshold = 20;

      // Act
      const result = strategy.getRecommendations(context);

      // Assert
      expect(result.pricing.direction).toBe('INCREASE');
      expect(result.pricing.recommendedPrice).toBe(110); // 100 * 1.10
      expect(result.pricing.confidence).toBe(0.9);
      expect(result.pricing.reasoning).toContain('Stock level below reorder threshold');
    });
  });

  describe('demand velocity greater than 2 × category average', () => {
    it('should recommend 5% price increase', () => {
      // Arrange
      context.product.demandVelocity = 25; // Greater than 2 * 10 (category average)
      context.categoryAverageDemandVelocity = 10;

      // Act
      const result = strategy.getRecommendations(context);

      // Assert
      expect(result.pricing.direction).toBe('INCREASE');
      expect(result.pricing.recommendedPrice).toBe(105); // 100 * 1.05
      expect(result.pricing.confidence).toBe(0.7);
      expect(result.pricing.reasoning).toContain('Demand velocity significantly higher than category average');
    });
  });
});
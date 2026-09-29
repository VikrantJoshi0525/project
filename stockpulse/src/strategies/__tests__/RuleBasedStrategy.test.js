const RuleBasedStrategy = require('../../strategies/RuleBasedStrategy');
const { PRODUCT_CATEGORY, PRICING_DIRECTION, TRIGGER_REASON } = require('../../utils/constants');

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
      demandVelocity: 5,
      category: PRODUCT_CATEGORY.ELECTRONICS
    };
    context = {
      product: testProduct,
      categoryAverageDemandVelocity: 10,
      triggerReason: TRIGGER_REASON.MANUAL
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
      expect(result.pricing.direction).toBe(PRICING_DIRECTION.INCREASE);
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
      expect(result.pricing.direction).toBe(PRICING_DIRECTION.INCREASE);
      expect(result.pricing.recommendedPrice).toBe(105); // 100 * 1.05
      expect(result.pricing.confidence).toBe(0.7);
      expect(result.pricing.reasoning).toContain('Demand velocity significantly higher than category average');
    });
  });

  describe('both conditions true', () => {
    it('should prioritize stock-low rule deterministically', () => {
      // Arrange
      context.product.stockLevel = 10; // Below reorderThreshold
      context.product.demandVelocity = 25; // Also above 2x category average

      // Act
      const result = strategy.getRecommendations(context);

      // Assert
      expect(result.pricing.direction).toBe(PRICING_DIRECTION.INCREASE);
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
      expect(result.pricing.direction).toBe(PRICING_DIRECTION.HOLD);
      expect(result.pricing.recommendedPrice).toBe(100); // Same as current
      expect(result.pricing.confidence).toBe(0.8);
      expect(result.pricing.reasoning).toContain('No significant factors affecting pricing');
    });
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
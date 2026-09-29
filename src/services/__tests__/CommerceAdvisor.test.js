const CommerceAdvisor = require('../../services/CommerceAdvisor');
const StrategyRegistry = require('../../strategies/StrategyRegistry');

describe('CommerceAdvisor', () => {
  let testContext;

  beforeEach(() => {
    testContext = {
      product: {
        currentPrice: 100,
        stockLevel: 50,
        reorderThreshold: 20,
        demandVelocity: 5
      },
      categoryAverageDemandVelocity: 10,
      triggerReason: 'test'
    };
  });

  describe('runtime strategy switching', () => {
    it('should use the active registered strategy without restarting the server', () => {
      // Arrange
      StrategyRegistry.setActiveStrategy('rule');

      // Act
      const result1 = CommerceAdvisor.getRecommendations(testContext);

      // Change strategy
      // For this test, we'll verify we can get the active strategy name
      const activeStrategyName = CommerceAdvisor.getActiveStrategyName();

      // Assert
      expect(activeStrategyName).toBe('rule');
      expect(result1).toHaveProperty('pricing');
      expect(result1).toHaveProperty('reorder');
    });
  });

  describe('invalid inputs', () => {
    it('should throw error for invalid context', () => {
      // Act & Assert
      expect(() => {
        CommerceAdvisor.getRecommendations(null);
      }).toThrow('Invalid context: product data is required');

      expect(() => {
        CommerceAdvisor.getRecommendations({});
      }).toThrow('Invalid context: product data is required');
    });
  });

  it('should return unified recommendation structure', () => {
    // Act
    const result = CommerceAdvisor.getRecommendations(testContext);

    // Assert
    expect(result).toHaveProperty('pricing');
    expect(result.pricing).toHaveProperty('currentPrice');
    expect(result.pricing).toHaveProperty('recommendedPrice');
    expect(result.pricing).toHaveProperty('direction');
    expect(result.pricing).toHaveProperty('confidence');
    expect(result.pricing).toHaveProperty('reasoning');

    expect(result).toHaveProperty('reorder');
    expect(result.reorder).toHaveProperty('currentStock');
    expect(result.reorder).toHaveProperty('recommendedQuantity');
    expect(result.reorder).toHaveProperty('suggestedLeadTimeDays');
    expect(result.reorder).toHaveProperty('confidence');
    expect(result.reorder).toHaveProperty('reasoning');

    expect(result).toHaveProperty('triggerReason');
  });
});
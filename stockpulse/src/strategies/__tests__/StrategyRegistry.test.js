const StrategyRegistry = require('../../strategies/StrategyRegistry');
const RuleBasedStrategy = require('../../strategies/RuleBasedStrategy');
const CompetitorAwareStrategy = require('../../strategies/CompetitorAwareStrategy');

describe('StrategyRegistry', () => {
  beforeEach(() => {
    // Reset to clean state by creating a new instance
    jest.resetModules();
  });

  describe('invalid strategy selection', () => {
    it('should throw error for unregistered strategy', () => {
      // Act & Assert
      expect(() => {
        StrategyRegistry.setActiveStrategy('nonexistent');
      }).toThrow("Strategy 'nonexistent' is not registered");
    });
  });

  describe('strategy registration and retrieval', () => {
    it('should register and retrieve strategies', () => {
      // Act
      const ruleStrategy = StrategyRegistry.getStrategy('rule');
      const competitorStrategy = StrategyRegistry.getStrategy('competitor');

      // Assert
      expect(ruleStrategy).toBeInstanceOf(RuleBasedStrategy);
      expect(competitorStrategy).toBeInstanceOf(CompetitorAwareStrategy);
    });

    it('should return null for non-existent strategies', () => {
      // Act
      const result = StrategyRegistry.getStrategy('nonexistent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('active strategy management', () => {
    it('should set and get active strategy', () => {
      // Act
      StrategyRegistry.setActiveStrategy('rule');
      const activeStrategy = StrategyRegistry.getActiveStrategy();
      const activeStrategyName = StrategyRegistry.getActiveStrategyName();

      // Assert
      expect(activeStrategy).toBeInstanceOf(RuleBasedStrategy);
      expect(activeStrategyName).toBe('rule');
    });
  });
});
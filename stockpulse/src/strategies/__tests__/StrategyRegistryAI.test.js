const StrategyRegistry = require('../../strategies/StrategyRegistry');
const AICommerceStrategy = require('../../strategies/AICommerceStrategy');

describe('Strategy Registry Integration', () => {
  it('should register AI strategy', () => {
    const aiStrategy = StrategyRegistry.getStrategy('ai');
    expect(aiStrategy).toBeInstanceOf(AICommerceStrategy);
  });

  it('should include AI strategy in available strategies', () => {
    const availableStrategies = StrategyRegistry.getAvailableStrategies();
    expect(availableStrategies).toContain('ai');
    expect(availableStrategies).toContain('rule');
    expect(availableStrategies).toContain('competitor');
  });

  it('should allow switching to AI strategy', () => {
    // Switch to AI strategy
    StrategyRegistry.setActiveStrategy('ai');
    
    // Verify it's active
    const activeStrategy = StrategyRegistry.getActiveStrategy();
    const activeStrategyName = StrategyRegistry.getActiveStrategyName();
    
    expect(activeStrategy).toBeInstanceOf(AICommerceStrategy);
    expect(activeStrategyName).toBe('ai');
    
    // Switch back to rule strategy
    StrategyRegistry.setActiveStrategy('rule');
    const ruleStrategy = StrategyRegistry.getActiveStrategy();
    expect(ruleStrategy.constructor.name).toBe('RuleBasedStrategy');
  });

  it('should reject unregistered strategies', () => {
    expect(() => {
      StrategyRegistry.setActiveStrategy('nonexistent');
    }).toThrow("Strategy 'nonexistent' is not registered");
  });
});
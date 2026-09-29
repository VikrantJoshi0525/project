const RuleBasedStrategy = require('./RuleBasedStrategy');
const CompetitorAwareStrategy = require('./CompetitorAwareStrategy');

class StrategyRegistry {
  constructor() {
    this.strategies = new Map();
    this.activeStrategy = null;
    
    // Register default strategies
    this.register('rule', new RuleBasedStrategy());
    // Register competitor strategy (but don't make it active by default)
    this.register('competitor', new CompetitorAwareStrategy());
    
    // Set default active strategy
    this.setActiveStrategy('rule');
  }

  /**
   * Register a new strategy
   * @param {string} name - The strategy name
   * @param {CommerceStrategy} strategy - The strategy instance
   */
  register(name, strategy) {
    this.strategies.set(name, strategy);
  }

  /**
   * Get a strategy by name
   * @param {string} name - The strategy name
   * @returns {CommerceStrategy|null} The strategy instance or null if not found
   */
  getStrategy(name) {
    return this.strategies.get(name) || null;
  }

  /**
   * Get all registered strategy names
   * @returns {string[]} Array of strategy names
   */
  getAvailableStrategies() {
    return Array.from(this.strategies.keys());
  }

  /**
   * Set the active strategy
   * @param {string} name - The strategy name to activate
   * @throws {Error} If strategy is not registered
   */
  setActiveStrategy(name) {
    if (!this.strategies.has(name)) {
      throw new Error(`Strategy '${name}' is not registered`);
    }
    this.activeStrategy = name;
  }

  /**
   * Get the active strategy
   * @returns {CommerceStrategy} The active strategy instance
   */
  getActiveStrategy() {
    if (!this.activeStrategy) {
      throw new Error('No active strategy configured');
    }
    return this.strategies.get(this.activeStrategy);
  }

  /**
   * Get the name of the active strategy
   * @returns {string} The active strategy name
   */
  getActiveStrategyName() {
    return this.activeStrategy;
  }
}

// Singleton instance
const registry = new StrategyRegistry();

module.exports = registry;
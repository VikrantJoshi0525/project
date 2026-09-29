const StrategyRegistry = require('./strategies/StrategyRegistry');

class CommerceAdvisor {
  /**
   * Get recommendations from the active strategy
   * @param {Object} context - The product context
   * @param {Object} context.product - The product data
   * @param {number} context.categoryAverageDemandVelocity - Average demand velocity for the product's category
   * @param {string} context.triggerReason - Reason for triggering the recommendation
   * @returns {Object} Unified recommendation containing both pricing and reorder advice
   */
  static getRecommendations(context) {
    // Validate context
    if (!context || !context.product) {
      throw new Error('Invalid context: product data is required');
    }
    
    // Get the active strategy
    const strategy = StrategyRegistry.getActiveStrategy();
    
    // Get recommendations from the strategy
    return strategy.getRecommendations(context);
  }
  
  /**
   * Get the name of the currently active strategy
   * @returns {string} The active strategy name
   */
  static getActiveStrategyName() {
    return StrategyRegistry.getActiveStrategyName();
  }
}

module.exports = CommerceAdvisor;
const StrategyRegistry = require('../strategies/StrategyRegistry');
const Product = require('../models/Product');
const { PRODUCT_CATEGORY } = require('../utils/constants');

class CommerceAdvisorService {
  /**
   * Get recommendations from the active strategy
   * @param {Object} context - The product context
   * @param {Object} context.product - The product data
   * @param {number} context.categoryAverageDemandVelocity - Average demand velocity for the product's category
   * @param {string} context.triggerReason - Reason for triggering the recommendation
   * @returns {Object} Unified recommendation containing both pricing and reorder advice
   */
  static async getRecommendations(context) {
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

  /**
   * Set the active strategy
   * @param {string} name - The strategy name to activate
   * @throws {Error} If strategy is not registered
   */
  static setActiveStrategy(name) {
    StrategyRegistry.setActiveStrategy(name);
  }

  /**
   * Get all available strategies
   * @returns {string[]} Array of strategy names
   */
  static getAvailableStrategies() {
    return StrategyRegistry.getAvailableStrategies();
  }

  /**
   * Calculate category average demand velocity
   * @param {string} category - Product category
   * @returns {Promise<number>} Average demand velocity for the category
   */
  static async getCategoryAverageDemandVelocity(category) {
    // Aggregate products by category to calculate average demand velocity
    const result = await Product.aggregate([
      { $match: { category: category } },
      { $group: { _id: null, avgDemandVelocity: { $avg: "$demandVelocity" } } }
    ]);

    // Return the average or 1 as default to avoid division by zero
    return result.length > 0 ? result[0].avgDemandVelocity || 1 : 1;
  }
}

module.exports = CommerceAdvisorService;
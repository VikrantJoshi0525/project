class CommerceStrategy {
  /**
   * Get pricing and reorder recommendations based on product context
   * @param {Object} context - The product context
   * @param {Object} context.product - The product data
   * @param {number} context.categoryAverageDemandVelocity - Average demand velocity for the product's category
   * @param {string} context.triggerReason - Reason for triggering the recommendation
   * @returns {Object} Recommendation containing both pricing and reorder advice
   */
  getRecommendations(context) {
    throw new Error('getRecommendations method must be implemented by subclass');
  }
}

module.exports = CommerceStrategy;
const CommerceStrategy = require('./CommerceStrategy');

class RuleBasedStrategy extends CommerceStrategy {
  /**
   * Get pricing and reorder recommendations based on predefined rules
   * @param {Object} context - The product context
   * @param {Object} context.product - The product data
   * @param {number} context.categoryAverageDemandVelocity - Average demand velocity for the product's category
   * @param {string} context.triggerReason - Reason for triggering the recommendation
   * @returns {Object} Recommendation containing both pricing and reorder advice
   */
  getRecommendations(context) {
    const { product, categoryAverageDemandVelocity, triggerReason } = context;
    
    // Generate pricing recommendation
    const pricingRecommendation = this._generatePricingRecommendation(
      product, 
      categoryAverageDemandVelocity
    );
    
    // Generate reorder recommendation
    const reorderRecommendation = this._generateReorderRecommendation(product);
    
    return {
      pricing: pricingRecommendation,
      reorder: reorderRecommendation,
      triggerReason
    };
  }

  /**
   * Generate pricing recommendation based on rules
   * @private
   */
  _generatePricingRecommendation(product, categoryAverageDemandVelocity) {
    const { currentPrice, stockLevel, reorderThreshold, demandVelocity } = product;
    
    let direction = 'HOLD';
    let recommendedPrice = currentPrice;
    let confidence = 0.8;
    let reasoning = '';

    // Rule 1: If stockLevel < reorderThreshold, recommend 10% price increase
    if (stockLevel < reorderThreshold) {
      direction = 'INCREASE';
      recommendedPrice = currentPrice * 1.10;
      confidence = 0.9;
      reasoning = 'Stock level below reorder threshold';
    }
    // Rule 2: If demandVelocity > 2 × category average demand velocity, recommend 5% price increase
    else if (demandVelocity > 2 * categoryAverageDemandVelocity) {
      direction = 'INCREASE';
      recommendedPrice = currentPrice * 1.05;
      confidence = 0.7;
      reasoning = 'Demand velocity significantly higher than category average';
    } else {
      reasoning = 'No significant factors affecting pricing';
    }

    return {
      currentPrice,
      recommendedPrice: parseFloat(recommendedPrice.toFixed(2)),
      direction,
      confidence,
      reasoning
    };
  }

  /**
   * Generate reorder recommendation based on rules
   * @private
   */
  _generateReorderRecommendation(product) {
    const { stockLevel: currentStock, reorderThreshold } = product;
    
    // Calculate recommended quantity: (reorderThreshold × 3) - currentStock
    let recommendedQuantity = (reorderThreshold * 3) - currentStock;
    
    // Minimum recommended quantity is 1
    if (recommendedQuantity < 1) {
      recommendedQuantity = 1;
    }
    
    // Suggested lead time is based on reorder threshold
    const suggestedLeadTimeDays = reorderThreshold > 100 ? 7 : 3;
    
    return {
      currentStock,
      recommendedQuantity: Math.round(recommendedQuantity),
      suggestedLeadTimeDays,
      confidence: 0.85,
      reasoning: `Calculated as (reorderThreshold * 3) - currentStock = (${reorderThreshold} * 3) - ${currentStock}`
    };
  }
}

module.exports = RuleBasedStrategy;
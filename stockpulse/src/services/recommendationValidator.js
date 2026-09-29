const { PRICING_DIRECTION } = require('../utils/constants');

class RecommendationValidator {
  /**
   * Validate pricing recommendation
   * @param {Object} pricing - The pricing recommendation
   * @param {number} currentPrice - The current product price
   * @returns {Object} Validated pricing recommendation
   * @throws {Error} If validation fails
   */
  static validatePricing(pricing, currentPrice) {
    // Check required fields
    if (pricing.recommendedPrice === undefined) {
      throw new Error('Pricing: recommendedPrice is required');
    }
    
    if (!pricing.direction) {
      throw new Error('Pricing: direction is required');
    }
    
    if (pricing.confidence === undefined) {
      throw new Error('Pricing: confidence is required');
    }
    
    if (!pricing.reasoning) {
      throw new Error('Pricing: reasoning is required');
    }
    
    // Validate types and values
    const recommendedPrice = parseFloat(pricing.recommendedPrice);
    if (isNaN(recommendedPrice) || !isFinite(recommendedPrice)) {
      throw new Error('Pricing: recommendedPrice must be a valid number');
    }
    
    if (recommendedPrice <= 0) {
      throw new Error('Pricing: recommendedPrice must be positive');
    }
    
    // Check for unsafe price (more than 10x current price)
    if (currentPrice && recommendedPrice > currentPrice * 10) {
      throw new Error('Pricing: recommendedPrice is unsafe (more than 10x current price)');
    }
    
    const confidence = parseFloat(pricing.confidence);
    if (isNaN(confidence) || confidence < 0 || confidence > 1) {
      throw new Error('Pricing: confidence must be between 0 and 1');
    }
    
    if (!Object.values(PRICING_DIRECTION).includes(pricing.direction)) {
      throw new Error(`Pricing: direction must be one of ${Object.values(PRICING_DIRECTION).join(', ')}`);
    }
    
    return {
      recommendedPrice: recommendedPrice,
      direction: pricing.direction,
      confidence: confidence,
      reasoning: pricing.reasoning
    };
  }

  /**
   * Validate reorder recommendation
   * @param {Object} reorder - The reorder recommendation
   * @returns {Object} Validated reorder recommendation
   * @throws {Error} If validation fails
   */
  static validateReorder(reorder) {
    // Check required fields
    if (reorder.recommendedQuantity === undefined) {
      throw new Error('Reorder: recommendedQuantity is required');
    }
    
    if (reorder.confidence === undefined) {
      throw new Error('Reorder: confidence is required');
    }
    
    if (!reorder.reasoning) {
      throw new Error('Reorder: reasoning is required');
    }
    
    // Validate types and values
    const recommendedQuantity = parseInt(reorder.recommendedQuantity);
    if (isNaN(recommendedQuantity) || !isFinite(recommendedQuantity)) {
      throw new Error('Reorder: recommendedQuantity must be a valid integer');
    }
    
    if (recommendedQuantity <= 0) {
      throw new Error('Reorder: recommendedQuantity must be positive');
    }
    
    const confidence = parseFloat(reorder.confidence);
    if (isNaN(confidence) || confidence < 0 || confidence > 1) {
      throw new Error('Reorder: confidence must be between 0 and 1');
    }
    
    return {
      recommendedQuantity: recommendedQuantity,
      confidence: confidence,
      reasoning: reorder.reasoning
    };
  }

  /**
   * Validate complete recommendation
   * @param {Object} recommendation - The complete recommendation
   * @param {number} currentPrice - The current product price
   * @returns {Object} Validated recommendation
   * @throws {Error} If validation fails
   */
  static validateRecommendation(recommendation, currentPrice) {
    if (!recommendation || !recommendation.pricing || !recommendation.reorder) {
      throw new Error('Recommendation must contain pricing and reorder objects');
    }
    
    const validatedPricing = this.validatePricing(recommendation.pricing, currentPrice);
    const validatedReorder = this.validateReorder(recommendation.reorder);
    
    return {
      pricing: validatedPricing,
      reorder: validatedReorder
    };
  }
}

module.exports = RecommendationValidator;
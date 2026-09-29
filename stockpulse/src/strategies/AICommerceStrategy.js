const CommerceStrategy = require('./CommerceStrategy');
const LLMClient = require('../services/llmClient');
const PromptBuilder = require('../services/promptBuilder');
const ResponseParser = require('../services/responseParser');
const RecommendationValidator = require('../services/recommendationValidator');
const RuleBasedStrategy = require('./RuleBasedStrategy');

class AICommerceStrategy extends CommerceStrategy {
  constructor() {
    super();
    this.fallbackStrategy = new RuleBasedStrategy();
  }

  /**
   * Get pricing and reorder recommendations using AI
   * @param {Object} context - The product context
   * @param {Object} context.product - The product data
   * @param {number} context.categoryAverageDemandVelocity - Average demand velocity for the product's category
   * @param {string} context.triggerReason - Reason for triggering the recommendation
   * @returns {Object} Recommendation containing both pricing and reorder advice
   */
  async getRecommendations(context) {
    const { product, categoryAverageDemandVelocity, triggerReason } = context;
    
    try {
      // Build prompt based on trigger reason
      const prompt = PromptBuilder.buildPrompt(context);
      
      // Call LLM
      const llmResponse = await LLMClient.callLLM(prompt, product._id || product.id);
      
      // Parse response
      const parsedResponse = ResponseParser.parseResponse(llmResponse);
      
      // Validate recommendation
      const validatedRecommendation = RecommendationValidator.validateRecommendation(
        parsedResponse, 
        product.currentPrice
      );
      
      // Return validated recommendation
      return {
        pricing: {
          currentPrice: product.currentPrice,
          recommendedPrice: validatedRecommendation.pricing.recommendedPrice,
          direction: validatedRecommendation.pricing.direction,
          confidence: validatedRecommendation.pricing.confidence,
          reasoning: validatedRecommendation.pricing.reasoning
        },
        reorder: {
          currentStock: product.stockLevel,
          recommendedQuantity: validatedRecommendation.reorder.recommendedQuantity,
          suggestedLeadTimeDays: this._calculateSuggestedLeadTime(product.reorderThreshold),
          confidence: validatedRecommendation.reorder.confidence,
          reasoning: validatedRecommendation.reorder.reasoning
        },
        triggerReason
      };
    } catch (error) {
      // Log fallback (without exposing sensitive data)
      console.warn(`AI strategy failed for product ${product._id || product.id}, falling back to RuleBasedStrategy: ${error.message}`);
      
      // Fallback to RuleBasedStrategy
      return this._getFallbackRecommendation(context, error.message);
    }
  }

  /**
   * Get fallback recommendation using RuleBasedStrategy
   * @private
   */
  _getFallbackRecommendation(context, fallbackReason) {
    const recommendation = this.fallbackStrategy.getRecommendations(context);
    
    // Add fallback metadata
    return {
      ...recommendation,
      fallback: true,
      fallbackReason: fallbackReason
    };
  }

  /**
   * Calculate suggested lead time based on reorder threshold
   * @private
   */
  _calculateSuggestedLeadTime(reorderThreshold) {
    return reorderThreshold > 100 ? 7 : 3;
  }
}

module.exports = AICommerceStrategy;
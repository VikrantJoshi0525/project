const Product = require('../models/Product');
const PricingSuggestion = require('../models/PricingSuggestion');
const ReorderSuggestion = require('../models/ReorderSuggestion');
const CommerceAdvisorService = require('./commerceAdvisorService');
const { SUGGESTION_STATUS, TRIGGER_REASON } = require('../utils/constants');

class RecommendationHandlerService {
  /**
   * Handle inventory low event and generate recommendations
   * @param {Object} eventPayload - The event payload
   */
  async handleInventoryLow(eventPayload) {
    try {
      console.log(`[AGENTIC LOOP] Processing inventory low event for product ${eventPayload.productId}`);
      
      // Fetch the latest product data
      const product = await Product.findById(eventPayload.productId);
      if (!product) {
        console.warn(`[AGENTIC LOOP] Product not found: ${eventPayload.productId}`);
        return;
      }
      
      // Calculate category average demand velocity
      const categoryAverageDemandVelocity = await CommerceAdvisorService.getCategoryAverageDemandVelocity(product.category);
      
      // Prepare context for the advisor
      const context = {
        product: product.toObject(),
        categoryAverageDemandVelocity,
        triggerReason: TRIGGER_REASON.INVENTORY_LOW
      };
      
      // Get recommendations from the active strategy
      const recommendations = await CommerceAdvisorService.getRecommendations(context);
      
      // Create both pricing and reorder suggestions
      await this._createSuggestions(product, recommendations, TRIGGER_REASON.INVENTORY_LOW);
      
      console.log(`[AGENTIC LOOP] Successfully processed inventory low event for product ${eventPayload.productId}`);
    } catch (error) {
      console.error(`[AGENTIC LOOP] Error processing inventory low event for product ${eventPayload.productId}:`, error.message);
      // Error is caught and logged, but not rethrown to prevent crashing the event loop
    }
  }
  
  /**
   * Handle demand spike event and generate recommendations
   * @param {Object} eventPayload - The event payload
   */
  async handleDemandSpike(eventPayload) {
    try {
      console.log(`[AGENTIC LOOP] Processing demand spike event for product ${eventPayload.productId}`);
      
      // Fetch the latest product data
      const product = await Product.findById(eventPayload.productId);
      if (!product) {
        console.warn(`[AGENTIC LOOP] Product not found: ${eventPayload.productId}`);
        return;
      }
      
      // Calculate category average demand velocity
      const categoryAverageDemandVelocity = await CommerceAdvisorService.getCategoryAverageDemandVelocity(product.category);
      
      // Prepare context for the advisor
      const context = {
        product: product.toObject(),
        categoryAverageDemandVelocity,
  /**
   * Create both pricing and reorder suggestions
   * @private
   */
  async _createSuggestions(product, recommendations, triggerReason) {
    try {
      // Check for existing pending pricing suggestion with same trigger reason
      const existingPricingSuggestion = await PricingSuggestion.findOne({
        product: product._id,
        triggerReason: triggerReason,
        status: SUGGESTION_STATUS.PENDING
      });
      
      if (existingPricingSuggestion) {
        console.log(`[AGENTIC LOOP] Skipping duplicate pending pricing suggestion for product ${product._id} with trigger ${triggerReason}`);
      } else {
        // Create new pricing suggestion
        const pricingSuggestion = new PricingSuggestion({
          product: product._id,
          currentPrice: recommendations.pricing.currentPrice,
          recommendedPrice: recommendations.pricing.recommendedPrice,
          direction: recommendations.pricing.direction,
          confidence: recommendations.pricing.confidence,
          reasoning: recommendations.pricing.reasoning,
          triggerReason: triggerReason
        });
        
        await pricingSuggestion.save();
        console.log(`[AGENTIC LOOP] Created pricing suggestion for product ${product._id} with trigger ${triggerReason}`);
      }
      
      // Check for existing pending reorder suggestion with same trigger reason
      const existingReorderSuggestion = await ReorderSuggestion.findOne({
        product: product._id,
        triggerReason: triggerReason,
        status: SUGGESTION_STATUS.PENDING
      });
      
      if (existingReorderSuggestion) {
        console.log(`[AGENTIC LOOP] Skipping duplicate pending reorder suggestion for product ${product._id} with trigger ${triggerReason}`);
      } else {
        // Create new reorder suggestion
        const reorderSuggestion = new ReorderSuggestion({
          product: product._id,
          currentStock: recommendations.reorder.currentStock,
          recommendedQuantity: recommendations.reorder.recommendedQuantity,
          suggestedLeadTimeDays: recommendations.reorder.suggestedLeadTimeDays,
          confidence: recommendations.reorder.confidence,
          reasoning: recommendations.reorder.reasoning,
          triggerReason: triggerReason
        });
        
        await reorderSuggestion.save();
        console.log(`[AGENTIC LOOP] Created reorder suggestion for product ${product._id} with trigger ${triggerReason}`);
      }
    } catch (error) {
      console.error(`[AGENTIC LOOP] Error creating suggestions for product ${product._id}:`, error.message);
      throw error;
    }
  }
}

module.exports = new RecommendationHandlerService();
        triggerReason: TRIGGER_REASON.DEMAND_SPIKE
      };
      
      // Get recommendations from the active strategy
      const recommendations = await CommerceAdvisorService.getRecommendations(context);
      
      // Create both pricing and reorder suggestions
      await this._createSuggestions(product, recommendations, TRIGGER_REASON.DEMAND_SPIKE);
      
      console.log(`[AGENTIC LOOP] Successfully processed demand spike event for product ${eventPayload.productId}`);
    } catch (error) {
      console.error(`[AGENTIC LOOP] Error processing demand spike event for product ${eventPayload.productId}:`, error.message);
      // Error is caught and logged, but not rethrown to prevent crashing the event loop
    }
  }
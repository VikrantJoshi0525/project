const ReorderSuggestion = require('../models/ReorderSuggestion');
const Product = require('../models/Product');
const CommerceAdvisorService = require('./commerceAdvisorService');
const { SUGGESTION_STATUS, TRIGGER_REASON } = require('../utils/constants');

class ReorderSuggestionService {
  // Create a reorder suggestion using the active commerce strategy
  async createReorderSuggestion(productId, triggerReason = TRIGGER_REASON.MANUAL) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Calculate category average demand velocity
    const categoryAverageDemandVelocity = await CommerceAdvisorService.getCategoryAverageDemandVelocity(product.category);

    // Prepare context for CommerceAdvisor
    const context = {
      product,
      categoryAverageDemandVelocity,
      triggerReason
    };

    // Get recommendations from the active strategy through CommerceAdvisor
    const recommendations = await CommerceAdvisorService.getRecommendations(context);
    const { reorder } = recommendations;

    const suggestion = new ReorderSuggestion({
      product: productId,
      currentStock: reorder.currentStock,
      recommendedQuantity: reorder.recommendedQuantity,
      suggestedLeadTimeDays: reorder.suggestedLeadTimeDays,
      confidence: reorder.confidence,
      reasoning: reorder.reasoning,
      triggerReason
    });

    return await suggestion.save();
  }

  // Get reorder suggestion by ID
  async getReorderSuggestionById(id) {
    return await ReorderSuggestion.findById(id).populate('product');
  }

  // Update reorder suggestion status
  async updateReorderSuggestionStatus(suggestionId, status, session = null) {
    const suggestion = await ReorderSuggestion.findById(suggestionId);
    if (!suggestion) {
      throw new Error('Reorder suggestion not found');
    }

    if (suggestion.status !== SUGGESTION_STATUS.PENDING) {
      throw new Error('Only PENDING suggestions can be updated');
    }

    suggestion.status = status;
    return await suggestion.save({ session });
  }

  // Accept reorder suggestion and update product stock
  async acceptReorderSuggestion(suggestionId) {
    const session = await ReorderSuggestion.startSession();
    session.startTransaction();
    
    try {
      const suggestion = await ReorderSuggestion.findById(suggestionId).session(session);
      if (!suggestion) {
        throw new Error('Reorder suggestion not found');
      }

      if (suggestion.status !== SUGGESTION_STATUS.PENDING) {
        throw new Error('Only PENDING suggestions can be accepted');
      }

      // Update suggestion status
      suggestion.status = SUGGESTION_STATUS.ACCEPTED;
      await suggestion.save({ session });

      // Update product stock
      const product = await Product.findById(suggestion.product).session(session);
      if (!product) {
        throw new Error('Product not found');
      }

      product.stockLevel += suggestion.recommendedQuantity;
      
      // Update product lifecycle if needed
      if (product.stockLevel > 0 && product.lifecycle === 'OUT_OF_STOCK') {
        product.lifecycle = 'ACTIVE';
      }
      
      await product.save({ session });

      await session.commitTransaction();
      session.endSession();

      return { suggestion: await suggestion.populate('product'), product };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // Reject reorder suggestion
  async rejectReorderSuggestion(suggestionId) {
    const session = await ReorderSuggestion.startSession();
    session.startTransaction();
    
    try {
      const suggestion = await ReorderSuggestion.findById(suggestionId).session(session);
      if (!suggestion) {
        throw new Error('Reorder suggestion not found');
      }

      if (suggestion.status !== SUGGESTION_STATUS.PENDING) {
        throw new Error('Only PENDING suggestions can be rejected');
      }

      suggestion.status = SUGGESTION_STATUS.REJECTED;
      await suggestion.save({ session });

      await session.commitTransaction();
      session.endSession();

      return await suggestion.populate('product');
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}

module.exports = new ReorderSuggestionService();
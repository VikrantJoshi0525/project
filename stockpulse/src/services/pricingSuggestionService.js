const PricingSuggestion = require('../models/PricingSuggestion');
const Product = require('../models/Product');
const CommerceAdvisorService = require('./commerceAdvisorService');
const { SUGGESTION_STATUS, PRICING_DIRECTION, TRIGGER_REASON } = require('../utils/constants');

class PricingSuggestionService {
  // Create a pricing suggestion using the active commerce strategy
  async createPricingSuggestion(productId, triggerReason = TRIGGER_REASON.MANUAL) {
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
    const { pricing } = recommendations;

    const suggestion = new PricingSuggestion({
      product: productId,
      currentPrice: pricing.currentPrice,
      recommendedPrice: pricing.recommendedPrice,
      direction: pricing.direction,
      confidence: pricing.confidence,
      reasoning: pricing.reasoning,
      triggerReason
    });

    return await suggestion.save();
  }

  // Get pricing suggestion by ID
  async getPricingSuggestionById(id) {
    return await PricingSuggestion.findById(id).populate('product');
  }

  // Update pricing suggestion status
  async updatePricingSuggestionStatus(suggestionId, status, session = null) {
    const suggestion = await PricingSuggestion.findById(suggestionId);
    if (!suggestion) {
      throw new Error('Pricing suggestion not found');
    }

    if (suggestion.status !== SUGGESTION_STATUS.PENDING) {
      throw new Error('Only PENDING suggestions can be updated');
    }

    suggestion.status = status;
    return await suggestion.save({ session });
  }

  // Accept pricing suggestion and update product price
  async acceptPricingSuggestion(suggestionId) {
    const session = await PricingSuggestion.startSession();
    session.startTransaction();
    
    try {
      const suggestion = await PricingSuggestion.findById(suggestionId).session(session);
      if (!suggestion) {
        throw new Error('Pricing suggestion not found');
      }

      if (suggestion.status !== SUGGESTION_STATUS.PENDING) {
        throw new Error('Only PENDING suggestions can be accepted');
      }

      // Update suggestion status
      suggestion.status = SUGGESTION_STATUS.ACCEPTED;
      await suggestion.save({ session });

      // Update product price
      const product = await Product.findById(suggestion.product).session(session);
      if (!product) {
        throw new Error('Product not found');
      }

      product.currentPrice = suggestion.recommendedPrice;
      
      // Update product lifecycle if needed
      if (product.stockLevel === 0) {
        product.lifecycle = 'OUT_OF_STOCK';
      } else if (product.lifecycle === 'OUT_OF_STOCK') {
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

  // Reject pricing suggestion
  async rejectPricingSuggestion(suggestionId) {
    const session = await PricingSuggestion.startSession();
    session.startTransaction();
    
    try {
      const suggestion = await PricingSuggestion.findById(suggestionId).session(session);
      if (!suggestion) {
        throw new Error('Pricing suggestion not found');
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

module.exports = new PricingSuggestionService();
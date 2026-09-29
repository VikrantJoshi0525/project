const ProductService = require('../services/productService');
const StrategyRegistry = require('../strategies/StrategyRegistry');

// Mock models for suggestions (in a real app, these would be proper Mongoose models)
class PricingSuggestion {
  constructor(data) {
    this.productId = data.productId;
    this.currentPrice = data.currentPrice;
    this.recommendedPrice = data.recommendedPrice;
    this.direction = data.direction;
    this.confidence = data.confidence;
    this.reasoning = data.reasoning;
    this.createdAt = new Date();
  }
  
  save() {
    // In a real implementation, this would save to MongoDB
    console.log('Saving pricing suggestion:', this);
    return Promise.resolve(this);
  }
}

class ReorderSuggestion {
  constructor(data) {
    this.productId = data.productId;
    this.currentStock = data.currentStock;
    this.recommendedQuantity = data.recommendedQuantity;
    this.suggestedLeadTimeDays = data.suggestedLeadTimeDays;
    this.confidence = data.confidence;
    this.reasoning = data.reasoning;
    this.createdAt = new Date();
  }
  
  save() {
    // In a real implementation, this would save to MongoDB
    console.log('Saving reorder suggestion:', this);
    return Promise.resolve(this);
  }
}

/**
 * Get pricing recommendation for a product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function suggestPricing(req, res) {
  try {
    const { id: productId } = req.params;
    const { triggerReason = 'manual_request' } = req.body;
    
    // Get recommendations from the active strategy through CommerceAdvisor
    const recommendations = await ProductService.getRecommendations(
      productId, 
      triggerReason
    );
    
    // Extract pricing recommendation
    const { pricing } = recommendations;
    
    // Create and save pricing suggestion
    const pricingSuggestion = new PricingSuggestion({
      productId,
      ...pricing
    });
    
    await pricingSuggestion.save();
    
    // Return the recommendation
    res.status(200).json({
      success: true,
      data: {
        recommendation: pricing,
        savedSuggestionId: 'mock-id-' + Date.now()
      }
    });
  } catch (error) {
    console.error('Error in suggestPricing:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get reorder recommendation for a product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function suggestReorder(req, res) {
  try {
    const { id: productId } = req.params;
    const { triggerReason = 'manual_request' } = req.body;
    
    // Get recommendations from the active strategy through CommerceAdvisor
    const recommendations = await ProductService.getRecommendations(
      productId, 
      triggerReason
    );
    
    // Extract reorder recommendation
    const { reorder } = recommendations;
    
    // Create and save reorder suggestion
    const reorderSuggestion = new ReorderSuggestion({
      productId,
      ...reorder
    });
    
    await reorderSuggestion.save();
    
    // Return the recommendation
    res.status(200).json({
      success: true,
      data: {
        recommendation: reorder,
        savedSuggestionId: 'mock-id-' + Date.now()
      }
    });
  } catch (error) {
    console.error('Error in suggestReorder:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get current strategy configuration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function getCurrentStrategy(req, res) {
  try {
    const activeStrategy = StrategyRegistry.getActiveStrategyName();
    const availableStrategies = StrategyRegistry.getAvailableStrategies();
    
    res.status(200).json({
      success: true,
      data: {
        active: activeStrategy,
        available: availableStrategies
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Update strategy configuration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function updateStrategy(req, res) {
  try {
    const { strategy } = req.body;
    
    if (!strategy) {
      return res.status(400).json({
        success: false,
        error: 'Strategy name is required'
      });
    }
    
    // Attempt to set the active strategy
    StrategyRegistry.setActiveStrategy(strategy);
    
    res.status(200).json({
      success: true,
      message: `Successfully activated strategy: ${strategy}`,
      data: {
        active: strategy
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  suggestPricing,
  suggestReorder,
  getCurrentStrategy,
  updateStrategy
};
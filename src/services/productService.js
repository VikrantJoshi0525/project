const Product = require('../models/Product');
const CommerceAdvisor = require('./CommerceAdvisor');

class ProductService {
  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Product>} Product instance
   */
  static async getProductById(id) {
    const product = Product.findById(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }
    return product;
  }

  /**
   * Calculate category average demand velocity
   * @param {string} category - Product category
   * @returns {Promise<number>} Average demand velocity for the category
   */
  static async getCategoryAverageDemandVelocity(category) {
    return await Product.getCategoryAverageDemandVelocity(category);
  }

  /**
   * Get pricing and reorder recommendations for a product
   * @param {string} productId - Product ID
   * @param {string} triggerReason - Reason for triggering the recommendation
   * @returns {Promise<Object>} Combined recommendations
   */
  static async getRecommendations(productId, triggerReason) {
    // Get product
    const product = await this.getProductById(productId);
    
    // Calculate category average demand velocity
    const categoryAverageDemandVelocity = await this.getCategoryAverageDemandVelocity(
      product.category
    );
    
    // Prepare context for CommerceAdvisor
    const context = {
      product,
      categoryAverageDemandVelocity,
      triggerReason
    };
    
    // Get recommendations from CommerceAdvisor
    return CommerceAdvisor.getRecommendations(context);
  }
}

module.exports = ProductService;
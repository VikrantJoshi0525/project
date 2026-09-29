const Product = require('../models/Product');
const { PRODUCT_LIFECYCLE, VALID_LIFECYCLE_TRANSITIONS } = require('../utils/constants');
const { isValidCategory, isValidLifecycle } = require('../validators/productValidator');
const recommendationEventEmitter = require('./recommendationEventEmitter');

class ProductService {
  // Create a new product
  async createProduct(productData) {
    const { sku, stockLevel } = productData;
    
    // Set initial lifecycle based on stock level
    if (stockLevel === 0) {
      productData.lifecycle = PRODUCT_LIFECYCLE.OUT_OF_STOCK;
    } else {
      productData.lifecycle = PRODUCT_LIFECYCLE.ACTIVE;
    }
    
    // Set default demandVelocity if not provided
    if (productData.demandVelocity === undefined) {
      productData.demandVelocity = 0;
    }
    
    const product = new Product(productData);
    return await product.save();
  }

  // Get products with optional filters
  async getProducts(filters = {}) {
    const query = {};
    
    if (filters.status && isValidLifecycle(filters.status)) {
      query.lifecycle = filters.status;
    }
    
    if (filters.category && isValidCategory(filters.category)) {
      query.category = filters.category;
    }
    
    return await Product.find(query).sort({ createdAt: -1 });
  }

  // Get product by ID
  async getProductById(id) {
    return await Product.findById(id);
  }

  // Update stock level
  async updateStock(productId, newStockLevel) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const oldStockLevel = product.stockLevel;
    product.stockLevel = newStockLevel;
    
    // Update lifecycle based on stock level
    if (newStockLevel === 0) {
      product.lifecycle = PRODUCT_LIFECYCLE.OUT_OF_STOCK;
    } else if (product.lifecycle === PRODUCT_LIFECYCLE.OUT_OF_STOCK) {
      // If stock becomes positive after being out of stock, return to ACTIVE
      // unless a pricing review is explicitly pending
      if (product.lifecycle !== PRODUCT_LIFECYCLE.PRICE_REVIEW_PENDING) {
        product.lifecycle = PRODUCT_LIFECYCLE.ACTIVE;
      }
    }
    
    const savedProduct = await product.save();
    
    // Check for inventory low condition (after save to use updated values)
    if (this.isBelowReorderThreshold(savedProduct)) {
      // Emit inventory low event asynchronously
      setImmediate(() => {
        recommendationEventEmitter.emitInventoryLow(productId);
      });
    }
    
    return savedProduct;
  }

  // Process order (decrement stock, increment demand velocity)
  async processOrder(productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stockLevel < quantity) {
      throw new Error('Insufficient stock');
    }

    const oldStockLevel = product.stockLevel;
    product.stockLevel -= quantity;
    product.demandVelocity += quantity;
    
    // Update lifecycle based on new stock level
    if (product.stockLevel === 0) {
      product.lifecycle = PRODUCT_LIFECYCLE.OUT_OF_STOCK;
    }
    
    const savedProduct = await product.save();
    
    // Check for inventory low condition
    if (this.isBelowReorderThreshold(savedProduct)) {
      // Emit inventory low event asynchronously
      setImmediate(() => {
        recommendationEventEmitter.emitInventoryLow(productId);
      });
    }
    
    // Check for demand spike condition
    const categoryAverageDemandVelocity = await this._getCategoryAverageDemandVelocity(product.category);
    const demandSpikeMultiplier = process.env.DEMAND_SPIKE_MULTIPLIER ? 
      parseFloat(process.env.DEMAND_SPIKE_MULTIPLIER) : 3;
    
    if (savedProduct.demandVelocity > demandSpikeMultiplier * categoryAverageDemandVelocity) {
      // Emit demand spike event asynchronously
      setImmediate(() => {
        recommendationEventEmitter.emitDemandSpike(productId);
      });
    }
    
    return savedProduct;
  }

  // Check if product is below reorder threshold
  isBelowReorderThreshold(product) {
    return product.stockLevel < product.reorderThreshold;
  }

  // Validate lifecycle transition
  isValidLifecycleTransition(currentLifecycle, newLifecycle) {
    const validTransitions = VALID_LIFECYCLE_TRANSITIONS[currentLifecycle];
    return validTransitions ? validTransitions.includes(newLifecycle) : false;
  }
  
  // Calculate category average demand velocity
  async _getCategoryAverageDemandVelocity(category) {
    // Aggregate products by category to calculate average demand velocity
    const result = await Product.aggregate([
      { $match: { category: category } },
      { $group: { _id: null, avgDemandVelocity: { $avg: "$demandVelocity" } } }
    ]);

    // Return the average or 1 as default to avoid division by zero
    return result.length > 0 ? result[0].avgDemandVelocity || 1 : 1;
  }
}

module.exports = new ProductService();
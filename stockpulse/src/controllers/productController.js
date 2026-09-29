const productService = require('../services/productService');
const pricingSuggestionService = require('../services/pricingSuggestionService');
const reorderSuggestionService = require('../services/reorderSuggestionService');
const { isValidCategory, isValidLifecycle, isValidNonNegativeInteger, isValidPositiveInteger } = require('../validators/productValidator');

// Create a new product
exports.createProduct = async (req, res, next) => {
  try {
    const { sku, name, category, currentPrice, stockLevel, reorderThreshold, demandVelocity, costPrice, supplierId } = req.body;

    // Validation
    if (!sku || !name || !category || currentPrice === undefined || stockLevel === undefined || 
        reorderThreshold === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (!isValidCategory(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category'
      });
    }

    if (!isValidNonNegativeInteger(stockLevel) || !isValidNonNegativeInteger(reorderThreshold) ||
        !isValidNonNegativeInteger(currentPrice)) {
      return res.status(400).json({
        success: false,
        error: 'Stock level, reorder threshold, and current price must be non-negative numbers'
      });
    }

    const product = await productService.createProduct({
      sku,
      name,
      category,
      currentPrice,
      stockLevel,
      reorderThreshold,
      demandVelocity,
      costPrice,
      supplierId
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Get products with optional filters
exports.getProducts = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const filters = {};

    if (status) {
      if (!isValidLifecycle(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid lifecycle status'
        });
      }
      filters.status = status;
    }

    if (category) {
      if (!isValidCategory(category)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category'
        });
      }
      filters.category = category;
    }

    const products = await productService.getProducts(filters);

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Update product stock
exports.updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stockLevel } = req.body;

    if (stockLevel === undefined || !isValidNonNegativeInteger(stockLevel)) {
      return res.status(400).json({
        success: false,
        error: 'Stock level must be a non-negative integer'
      });
    }

    const product = await productService.updateStock(id, stockLevel);
    
    const response = {
      success: true,
      data: product
    };

    // Check if product is below reorder threshold
    if (productService.isBelowReorderThreshold(product)) {
      response.message = 'Product is below reorder threshold';
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Process order
exports.processOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || !isValidPositiveInteger(quantity)) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a positive integer'
      });
    }

    const product = await productService.processOrder(id, quantity);

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.message === 'Insufficient stock') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    next(error);
  }
};

// Suggest pricing for a product
exports.suggestPricing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { triggerReason } = req.body;

    const suggestion = await pricingSuggestionService.createPricingSuggestion(id, triggerReason);

    res.status(201).json({
      success: true,
      data: suggestion
    });
  } catch (error) {
    next(error);
  }
};

// Suggest reorder for a product
exports.suggestReorder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { triggerReason } = req.body;

    const suggestion = await reorderSuggestionService.createReorderSuggestion(id, triggerReason);

    res.status(201).json({
      success: true,
      data: suggestion
    });
  } catch (error) {
    next(error);
  }
};
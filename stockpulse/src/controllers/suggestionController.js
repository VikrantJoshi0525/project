const PricingSuggestion = require('../models/PricingSuggestion');
const ReorderSuggestion = require('../models/ReorderSuggestion');

// Get pending pricing suggestions for products
exports.getPendingPricingSuggestions = async (req, res, next) => {
  try {
    const suggestions = await PricingSuggestion.find({ 
      status: 'PENDING' 
    }).populate('product');
    
    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};

// Get pending reorder suggestions for products
exports.getPendingReorderSuggestions = async (req, res, next) => {
  try {
    const suggestions = await ReorderSuggestion.find({ 
      status: 'PENDING' 
    }).populate('product');
    
    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};
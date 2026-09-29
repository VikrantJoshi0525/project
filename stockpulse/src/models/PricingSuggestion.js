const mongoose = require('mongoose');
const { SUGGESTION_STATUS, PRICING_DIRECTION, TRIGGER_REASON } = require('../utils/constants');

const pricingSuggestionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  recommendedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  direction: {
    type: String,
    required: true,
    enum: Object.values(PRICING_DIRECTION)
  },
  confidence: {
    type: Number,
    required: true,
    min: 0.0,
    max: 1.0
  },
  reasoning: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(SUGGESTION_STATUS),
    default: SUGGESTION_STATUS.PENDING
  },
  triggerReason: {
    type: String,
    required: true,
    enum: Object.values(TRIGGER_REASON)
  }
}, {
  timestamps: true
});

// Indexes for efficient querying and duplicate prevention
pricingSuggestionSchema.index({ product: 1, triggerReason: 1, status: 1 });
pricingSuggestionSchema.index({ status: 1 });
pricingSuggestionSchema.index({ product: 1 });

module.exports = mongoose.model('PricingSuggestion', pricingSuggestionSchema);
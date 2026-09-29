const mongoose = require('mongoose');
const { SUGGESTION_STATUS, TRIGGER_REASON } = require('../utils/constants');

const reorderSuggestionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0
  },
  recommendedQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  suggestedLeadTimeDays: {
    type: Number,
    required: true,
    min: 0
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
reorderSuggestionSchema.index({ product: 1, triggerReason: 1, status: 1 });
reorderSuggestionSchema.index({ status: 1 });
reorderSuggestionSchema.index({ product: 1 });

module.exports = mongoose.model('ReorderSuggestion', reorderSuggestionSchema);
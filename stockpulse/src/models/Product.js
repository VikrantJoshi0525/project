const mongoose = require('mongoose');
const { PRODUCT_LIFECYCLE, PRODUCT_CATEGORY } = require('../utils/constants');

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: Object.values(PRODUCT_CATEGORY)
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  stockLevel: {
    type: Number,
    required: true,
    min: 0
  },
  reorderThreshold: {
    type: Number,
    required: true,
    min: 0
  },
  demandVelocity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lifecycle: {
    type: String,
    required: true,
    enum: Object.values(PRODUCT_LIFECYCLE),
    default: PRODUCT_LIFECYCLE.ACTIVE
  },
  costPrice: {
    type: Number,
    min: 0,
    default: null
  },
  supplierId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
productSchema.index({ category: 1, lifecycle: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ lifecycle: 1 });
productSchema.index({ stockLevel: 1 });

// Pre-save hook to automatically set lifecycle based on stock level
productSchema.pre('save', function(next) {
  if (this.stockLevel === 0) {
    this.lifecycle = PRODUCT_LIFECYCLE.OUT_OF_STOCK;
  } else if (this.isModified('stockLevel') && this.lifecycle === PRODUCT_LIFECYCLE.OUT_OF_STOCK) {
    // If stock becomes positive after being out of stock, return to ACTIVE
    // unless a pricing review is explicitly pending
    if (this.lifecycle !== PRODUCT_LIFECYCLE.PRICE_REVIEW_PENDING) {
      this.lifecycle = PRODUCT_LIFECYCLE.ACTIVE;
    }
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
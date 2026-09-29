import React, { useState } from 'react';
import { formatCurrency, formatPercentage, getStatusBadgeClass, calculateStockHealth, getStockHealthClass } from '../utils/formatUtils';
import PricingSuggestion from './PricingSuggestion';
import ReorderSuggestion from './ReorderSuggestion';
import StockUpdateForm from './StockUpdateForm';
import './ProductCard.css';

const ProductCard = ({ 
  product, 
  pricingSuggestion, 
  reorderSuggestion, 
  onSimulateSale, 
  onUpdateStock, 
  onAcceptPricing, 
  onRejectPricing, 
  onAcceptReorder, 
  onRejectReorder 
}) => {
  const [showStockForm, setShowStockForm] = useState(false);
  const stockHealth = calculateStockHealth(product.stockLevel, product.reorderThreshold);

  // Calculate margin if costPrice is available
  const calculateMargin = () => {
    if (product.costPrice !== undefined && product.costPrice !== null && product.currentPrice > 0) {
      const margin = product.currentPrice - product.costPrice;
      const marginPercent = ((margin / product.currentPrice) * 100);
      return { margin, marginPercent };
    }
    return null;
  };

  const marginData = calculateMargin();

  const handleSimulateSale = async () => {
    try {
      await onSimulateSale(product._id);
    } catch (error) {
      console.error('Failed to simulate sale:', error);
    }
  };

  const handleStockUpdate = async (stockLevel) => {
    try {
      await onUpdateStock(product._id, stockLevel);
      setShowStockForm(false);
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  };

  return (
    <div className="product-card card">
      <div className="card-body">
        {/* Product Header */}
        <div className="product-header">
          <div className="product-info">
            <h3 className="product-name">{product.name}</h3>
            <div className="product-meta">
              <span className="product-sku">SKU: {product.sku}</span>
              <span className="product-category badge badge-secondary">{product.category}</span>
              <span className={`product-status badge ${getStatusBadgeClass(product.lifecycle)}`}>
                {product.lifecycle.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="product-actions">
            <button 
              className="btn btn-sm btn-outline"
              onClick={handleSimulateSale}
            >
              Simulate Sale
            </button>
            <button 
              className="btn btn-sm btn-outline"
              onClick={() => setShowStockForm(!showStockForm)}
            >
              Update Stock
            </button>
          </div>
        </div>

        {/* Stock Form */}
        {showStockForm && (
          <div className="stock-form-container mt-2">
            <StockUpdateForm 
              currentStock={product.stockLevel}
              onSubmit={handleStockUpdate}
              onCancel={() => setShowStockForm(false)}
            />
          </div>
        )}

        {/* Product Details */}
        <div className="product-details grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="detail-item">
            <span className="detail-label">Current Price</span>
            <span className="detail-value font-bold">{formatCurrency(product.currentPrice)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Stock Level</span>
            <span className={`detail-value font-bold ${getStockHealthClass(stockHealth)}`}>
              {product.stockLevel}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Reorder Threshold</span>
            <span className="detail-value">{product.reorderThreshold}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Demand Velocity</span>
            <span className="detail-value">{product.demandVelocity}</span>
          </div>
          {/* Margin Display */}
          {marginData && (
            <div className="detail-item">
              <span className="detail-label">Margin</span>
              <span className="detail-value">
                {formatCurrency(marginData.margin)} ({formatPercentage(marginData.marginPercent / 100)})
              </span>
            </div>
          )}
          {!marginData && product.costPrice === undefined && (
            <div className="detail-item">
              <span className="detail-label">Margin</span>
              <span className="detail-value text-muted">Cost unavailable</span>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {(pricingSuggestion || reorderSuggestion) && (
          <div className="suggestions-container mt-4">
            <h4>Suggestions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pricingSuggestion && (
                <PricingSuggestion 
                  suggestion={pricingSuggestion}
                  onAccept={() => onAcceptPricing(pricingSuggestion._id)}
                  onReject={() => onRejectPricing(pricingSuggestion._id)}
                />
              )}
              {reorderSuggestion && (
                <ReorderSuggestion 
                  suggestion={reorderSuggestion}
                  onAccept={() => onAcceptReorder(reorderSuggestion._id)}
                  onReject={() => onRejectReorder(reorderSuggestion._id)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
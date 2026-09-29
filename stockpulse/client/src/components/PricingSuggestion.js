import React, { useState } from 'react';
import { formatCurrency, formatPercentage, getPricingDirectionClass, getTriggerBadgeClass, formatTriggerReason } from '../utils/formatUtils';
import './Suggestion.css';

const PricingSuggestion = ({ suggestion, onAccept, onReject }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="suggestion-card card">
      <div className="card-body">
        <div className="suggestion-header">
          <h5>Pricing Recommendation</h5>
          <span className={`trigger-badge badge ${getTriggerBadgeClass(suggestion.triggerReason)}`}>
            {formatTriggerReason(suggestion.triggerReason)}
          </span>
        </div>

        <div className="suggestion-details">
          <div className="price-comparison">
            <div className="price-item">
              <span className="price-label">Current Price</span>
              <span className="price-value">{formatCurrency(suggestion.currentPrice)}</span>
            </div>
            <div className="price-arrow">→</div>
            <div className="price-item">
              <span className="price-label">Recommended</span>
              <span className="price-value font-bold">{formatCurrency(suggestion.recommendedPrice)}</span>
            </div>
          </div>

          <div className="suggestion-meta">
            <div className="meta-item">
              <span className="meta-label">Direction</span>
              <span className={`meta-value badge ${getPricingDirectionClass(suggestion.direction)}`}>
                {suggestion.direction}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Confidence</span>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill" 
                  style={{ width: `${suggestion.confidence * 100}%` }}
                ></div>
                <span className="confidence-text">{formatPercentage(suggestion.confidence)}</span>
              </div>
            </div>
          </div>

          <div className="suggestion-reasoning">
            <button 
              className="reasoning-toggle btn btn-sm btn-outline"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Show Less' : 'Show Reasoning'}
            </button>
            {expanded && (
              <div className="reasoning-content mt-2 p-2 bg-light rounded">
                <p className="mb-0">{suggestion.reasoning}</p>
              </div>
            )}
          </div>
        </div>

        <div className="suggestion-actions">
          <button 
            className="btn btn-success"
            onClick={onAccept}
          >
            Accept
          </button>
          <button 
            className="btn btn-danger"
            onClick={onReject}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingSuggestion;
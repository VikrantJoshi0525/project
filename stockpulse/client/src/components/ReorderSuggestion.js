import React, { useState } from 'react';
import { formatPercentage, getTriggerBadgeClass, formatTriggerReason } from '../utils/formatUtils';
import './Suggestion.css';

const ReorderSuggestion = ({ suggestion, onAccept, onReject }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="suggestion-card card">
      <div className="card-body">
        <div className="suggestion-header">
          <h5>Reorder Recommendation</h5>
          <span className={`trigger-badge badge ${getTriggerBadgeClass(suggestion.triggerReason)}`}>
            {formatTriggerReason(suggestion.triggerReason)}
          </span>
        </div>

        <div className="suggestion-details">
          <div className="reorder-comparison">
            <div className="reorder-item">
              <span className="reorder-label">Current Stock</span>
              <span className="reorder-value font-bold">{suggestion.currentStock}</span>
            </div>
            <div className="reorder-arrow">→</div>
            <div className="reorder-item">
              <span className="reorder-label">Recommended Quantity</span>
              <span className="reorder-value font-bold">{suggestion.recommendedQuantity}</span>
            </div>
          </div>

          <div className="suggestion-meta">
            <div className="meta-item">
              <span className="meta-label">Lead Time</span>
              <span className="meta-value">{suggestion.suggestedLeadTimeDays} days</span>
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

export default ReorderSuggestion;
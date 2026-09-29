import React, { useState } from 'react';

const StockUpdateForm = ({ currentStock, onSubmit, onCancel }) => {
  const [stockLevel, setStockLevel] = useState(currentStock.toString());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stockLevel || isNaN(stockLevel) || parseInt(stockLevel) < 0) {
      return;
    }
    
    try {
      setLoading(true);
      await onSubmit(parseInt(stockLevel));
    } catch (error) {
      console.error('Failed to update stock:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stock-update-form">
      <div className="form-group mb-2">
        <label htmlFor="stockLevel" className="form-label">Update Stock Level</label>
        <input
          type="number"
          id="stockLevel"
          className="form-control"
          value={stockLevel}
          onChange={(e) => setStockLevel(e.target.value)}
          min="0"
          required
        />
      </div>
      <div className="form-actions flex gap-2">
        <button 
          type="submit" 
          className="btn btn-primary btn-sm"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
        <button 
          type="button" 
          className="btn btn-outline btn-sm"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default StockUpdateForm;
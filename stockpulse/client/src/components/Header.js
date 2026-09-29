import React, { useState, useEffect } from 'react';
import { strategyAPI } from '../api/api';
import './Header.css';

const Header = ({ stats, onRefresh }) => {
  const [activeStrategy, setActiveStrategy] = useState('rule');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStrategyConfig();
  }, []);

  const fetchStrategyConfig = async () => {
    try {
      setLoading(true);
      const response = await strategyAPI.getConfig();
      if (response.data.success) {
        setActiveStrategy(response.data.data.active);
      }
    } catch (error) {
      console.error('Failed to fetch strategy config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStrategyChange = async (event) => {
    const newStrategy = event.target.value;
    try {
      setLoading(true);
      const response = await strategyAPI.updateConfig(newStrategy);
      if (response.data.success) {
        setActiveStrategy(newStrategy);
      }
    } catch (error) {
      console.error('Failed to update strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-branding">
            <h1>StockPulse</h1>
            <p className="header-subtitle">Merchandising Console</p>
          </div>
          
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-value">{stats.totalProducts || 0}</span>
              <span className="stat-label">Total Products</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.needsAttention || 0}</span>
              <span className="stat-label">Needs Attention</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.pendingSuggestions || 0}</span>
              <span className="stat-label">Pending Suggestions</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.outOfStock || 0}</span>
              <span className="stat-label">Out of Stock</span>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="strategy-selector">
              <label htmlFor="strategy-select">Active Strategy:</label>
              <select 
                id="strategy-select"
                value={activeStrategy}
                onChange={handleStrategyChange}
                disabled={loading}
                className="form-control"
              >
                <option value="rule">Rule-Based</option>
                <option value="ai">AI-Powered</option>
              </select>
            </div>
            
            <button 
              className="btn btn-outline"
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span className="ml-2">Loading...</span>
                </>
              ) : (
                'Refresh'
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
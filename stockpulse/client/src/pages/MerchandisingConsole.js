import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import { 
  productAPI, 
  pricingSuggestionAPI, 
  reorderSuggestionAPI 
} from '../api/api';
import { SUGGESTION_STATUS } from '../utils/constants';
import './MerchandisingConsole.css';

const MerchandisingConsole = () => {
  const [products, setProducts] = useState([]);
  const [pricingSuggestions, setPricingSuggestions] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [filters, setFilters] = useState({ status: '', category: '' });
  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchData();
  }, [filters]);

  // Set up polling
  useEffect(() => {
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch products
      const productsResponse = await productAPI.getProducts(filters);
      if (productsResponse.data.success) {
        setProducts(productsResponse.data.data);
      }
  const handleRefresh = () => {
    fetchData();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSimulateSale = async (productId) => {
    try {
      setLoading(true);
      const response = await productAPI.processOrder(productId, 1);
      if (response.data.success) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to simulate sale:', err);
      setError('Failed to simulate sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (productId, stockLevel) => {
    try {
      setLoading(true);
      const response = await productAPI.updateStock(productId, stockLevel);
      if (response.data.success) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
      setError('Failed to update stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPricing = async (suggestionId) => {
    try {
      setLoading(true);
      const response = await pricingSuggestionAPI.updateStatus(suggestionId, SUGGESTION_STATUS.ACCEPTED);
      if (response.data.success) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to accept pricing suggestion:', err);
      setError('Failed to accept pricing suggestion. Please try again.');
    } finally {
      setLoading(false);
  // Calculate stats for header
  const stats = {
    totalProducts: products.length,
    needsAttention: products.filter(p => 
      p.lifecycle === 'PRICE_REVIEW_PENDING' || 
      p.stockLevel < p.reorderThreshold ||
      p.stockLevel === 0
    ).length,
    pendingSuggestions: pricingSuggestions.filter(s => s.status === SUGGESTION_STATUS.PENDING).length +
                       reorderSuggestions.filter(s => s.status === SUGGESTION_STATUS.PENDING).length,
    outOfStock: products.filter(p => p.stockLevel === 0).length
  };

  // Group products with their suggestions
  const productsWithSuggestions = products.map(product => {
    const pricingSuggestion = pricingSuggestions.find(s => 
      s.product && s.product._id === product._id && s.status === SUGGESTION_STATUS.PENDING
    ) || null;
    
    const reorderSuggestion = reorderSuggestions.find(s => 
      s.product && s.product._id === product._id && s.status === SUGGESTION_STATUS.PENDING
    ) || null;
    
    return {
      product,
      pricingSuggestion,
      reorderSuggestion
    };
  });

  return (
    <div className="merchandising-console">
      <Header 
        stats={stats}
        onRefresh={handleRefresh}
        loading={loading}
      />
      
      <div className="console-container">
        <Sidebar 
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />
        
        <main className="main-content">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError(null)}
              ></button>
            </div>
          )}
          
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}
          
          <div className="products-grid">
            {productsWithSuggestions.length > 0 ? (
              productsWithSuggestions.map(({ product, pricingSuggestion, reorderSuggestion }) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  pricingSuggestion={pricingSuggestion}
                  reorderSuggestion={reorderSuggestion}
                  onSimulateSale={handleSimulateSale}
                  onUpdateStock={handleUpdateStock}
                  onAcceptPricing={handleAcceptPricing}
                  onRejectPricing={handleRejectPricing}
                  onAcceptReorder={handleAcceptReorder}
                  onRejectReorder={handleRejectReorder}
                />
              ))
            ) : (
              <div className="empty-state card">
                <div className="card-body text-center">
                  <h3>All caught up!</h3>
                  <p>No products match your current filters.</p>
                  <button className="btn btn-primary" onClick={() => setFilters({ status: '', category: '' })}>
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MerchandisingConsole;
    }
  };

  const handleRejectPricing = async (suggestionId) => {
    try {
      setLoading(true);
      const response = await pricingSuggestionAPI.updateStatus(suggestionId, SUGGESTION_STATUS.REJECTED);
      if (response.data.success) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to reject pricing suggestion:', err);
      setError('Failed to reject pricing suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptReorder = async (suggestionId) => {
    try {
      setLoading(true);
      const response = await reorderSuggestionAPI.updateStatus(suggestionId, SUGGESTION_STATUS.ACCEPTED);
      if (response.data.success) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to accept reorder suggestion:', err);
      setError('Failed to accept reorder suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectReorder = async (suggestionId) => {
    try {
      setLoading(true);
      const response = await reorderSuggestionAPI.updateStatus(suggestionId, SUGGESTION_STATUS.REJECTED);
      if (response.data.success) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to reject reorder suggestion:', err);
      setError('Failed to reject reorder suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };
      
      // Fetch pending pricing suggestions
      const pricingResponse = await pricingSuggestionAPI.getPendingSuggestions();
      if (pricingResponse.data.success) {
        setPricingSuggestions(pricingResponse.data.data);
      }
      
      // Fetch pending reorder suggestions
      const reorderResponse = await reorderSuggestionAPI.getPendingSuggestions();
      if (reorderResponse.data.success) {
        setReorderSuggestions(reorderResponse.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
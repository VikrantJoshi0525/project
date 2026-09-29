import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  timeout: 10000,
});

// Request interceptor for adding headers if needed
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Product API
export const productAPI = {
  // Get all products with optional filters
  getProducts: (filters = {}) => {
    return api.get('/products', { params: filters });
  },

  // Update product stock
  updateStock: (productId, stockLevel) => {
    return api.patch(`/products/${productId}/stock`, { stockLevel });
  },

  // Simulate sale/order
  processOrder: (productId, quantity = 1) => {
    return api.post(`/products/${productId}/orders`, { quantity });
  },

  // Suggest pricing
  suggestPricing: (productId, triggerReason) => {
    return api.post(`/products/${productId}/suggest-pricing`, { triggerReason });
  },

  // Suggest reorder
  suggestReorder: (productId, triggerReason) => {
    return api.post(`/products/${productId}/suggest-reorder`, { triggerReason });
  }
};

// Pricing Suggestion API
export const pricingSuggestionAPI = {
  // Update pricing suggestion status
  updateStatus: (suggestionId, status) => {
    return api.patch(`/pricing-suggestions/${suggestionId}`, { status });
  },
  
  // Get pending pricing suggestions
  getPendingSuggestions: () => {
    return api.get('/pricing-suggestions/pending');
  }
};

// Reorder Suggestion API
export const reorderSuggestionAPI = {
  // Update reorder suggestion status
  updateStatus: (suggestionId, status) => {
    return api.patch(`/reorder-suggestions/${suggestionId}`, { status });
  },
  
  // Get pending reorder suggestions
  getPendingSuggestions: () => {
    return api.get('/reorder-suggestions/pending');
  }
};

// Strategy API
export const strategyAPI = {
  // Get current strategy configuration
  getConfig: () => {
    return api.get('/config/strategy');
  },

  // Update strategy configuration
  updateConfig: (strategy) => {
    return api.patch('/config/strategy', { strategy });
  }
};

export default api;
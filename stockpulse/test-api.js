// Test script to verify backend endpoints
const axios = require('axios');

const testAPI = async () => {
  try {
    console.log('Testing backend endpoints...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('Health check:', healthResponse.data);
    
    // Test products endpoint
    const productsResponse = await axios.get('http://localhost:5000/api/v1/products');
    console.log('Products endpoint:', productsResponse.data.success ? 'OK' : 'ERROR');
    
    // Test pricing suggestions endpoint
    const pricingResponse = await axios.get('http://localhost:5000/api/v1/pricing-suggestions/pending');
    console.log('Pricing suggestions endpoint:', pricingResponse.data.success ? 'OK' : 'ERROR');
    
    // Test reorder suggestions endpoint
    const reorderResponse = await axios.get('http://localhost:5000/api/v1/reorder-suggestions/pending');
    console.log('Reorder suggestions endpoint:', reorderResponse.data.success ? 'OK' : 'ERROR');
    
    console.log('All endpoints tested successfully!');
  } catch (error) {
    console.error('API Test Error:', error.message);
  }
};

testAPI();
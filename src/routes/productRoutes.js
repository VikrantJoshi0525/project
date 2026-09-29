const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Existing T-1 endpoints (modified to use CommerceAdvisor)
router.post('/products/:id/suggest-pricing', productController.suggestPricing);
router.post('/products/:id/suggest-reorder', productController.suggestReorder);

// New endpoints for strategy configuration
router.get('/config/strategy', productController.getCurrentStrategy);
router.patch('/config/strategy', productController.updateStrategy);

module.exports = router;
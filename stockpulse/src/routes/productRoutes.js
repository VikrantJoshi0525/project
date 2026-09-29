const express = require('express');
const router = express.Router();
const { createProduct, getProducts, updateStock, processOrder, suggestPricing, suggestReorder } = require('../controllers/productController');

// Product routes
router.route('/products')
  .post(createProduct)
  .get(getProducts);

router.route('/products/:id/stock')
  .patch(updateStock);

router.route('/products/:id/orders')
  .post(processOrder);

router.route('/products/:id/suggest-pricing')
  .post(suggestPricing);

router.route('/products/:id/suggest-reorder')
  .post(suggestReorder);

module.exports = router;
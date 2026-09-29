const express = require('express');
const router = express.Router();
const { updatePricingSuggestion } = require('../controllers/pricingSuggestionController');

// Pricing suggestion routes
router.route('/pricing-suggestions/:id')
  .patch(updatePricingSuggestion);

module.exports = router;
const express = require('express');
const router = express.Router();
const { getPendingPricingSuggestions, getPendingReorderSuggestions } = require('../controllers/suggestionController');

// Suggestion routes
router.route('/pricing-suggestions/pending')
  .get(getPendingPricingSuggestions);

router.route('/reorder-suggestions/pending')
  .get(getPendingReorderSuggestions);

module.exports = router;
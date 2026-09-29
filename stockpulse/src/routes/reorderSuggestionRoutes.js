const express = require('express');
const router = express.Router();
const { updateReorderSuggestion } = require('../controllers/reorderSuggestionController');

// Reorder suggestion routes
router.route('/reorder-suggestions/:id')
  .patch(updateReorderSuggestion);

module.exports = router;
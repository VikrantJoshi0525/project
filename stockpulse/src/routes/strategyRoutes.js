const express = require('express');
const router = express.Router();
const { getStrategyConfig, updateStrategyConfig } = require('../controllers/strategyController');

// Strategy configuration routes
router.route('/config/strategy')
  .get(getStrategyConfig)
  .patch(updateStrategyConfig);

module.exports = router;
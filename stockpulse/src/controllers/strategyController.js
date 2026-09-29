const CommerceAdvisorService = require('../services/commerceAdvisorService');

// Get current strategy configuration
exports.getStrategyConfig = async (req, res, next) => {
  try {
    const activeStrategy = CommerceAdvisorService.getActiveStrategyName();
    const availableStrategies = CommerceAdvisorService.getAvailableStrategies();
    
    res.status(200).json({
      success: true,
      data: {
        active: activeStrategy,
        available: availableStrategies
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update strategy configuration
exports.updateStrategyConfig = async (req, res, next) => {
  try {
    const { strategy } = req.body;
    
    if (!strategy) {
      return res.status(400).json({
        success: false,
        error: 'Strategy name is required'
      });
    }
    
    // Attempt to set the active strategy
    CommerceAdvisorService.setActiveStrategy(strategy);
    
    res.status(200).json({
      success: true,
      message: `Successfully activated strategy: ${strategy}`,
      data: {
        active: strategy
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
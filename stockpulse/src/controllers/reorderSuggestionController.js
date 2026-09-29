const reorderSuggestionService = require('../services/reorderSuggestionService');

// Update reorder suggestion status
exports.updateReorderSuggestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be either ACCEPTED or REJECTED'
      });
    }

    let result;
    if (status === 'ACCEPTED') {
      result = await reorderSuggestionService.acceptReorderSuggestion(id);
      res.status(200).json({
        success: true,
        data: {
          suggestion: result.suggestion,
          product: result.product
        }
      });
    } else {
      const suggestion = await reorderSuggestionService.rejectReorderSuggestion(id);
      res.status(200).json({
        success: true,
        data: suggestion
      });
    }
  } catch (error) {
    if (error.message === 'Only PENDING suggestions can be updated' ||
        error.message === 'Only PENDING suggestions can be accepted' ||
        error.message === 'Only PENDING suggestions can be rejected') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    next(error);
  }
};
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    return res.status(404).json({
      success: false,
      error: message
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    return res.status(409).json({
      success: false,
      error: message
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: message
    });
  }

  // Custom validation errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Server Error'
  });
};

module.exports = errorHandler;
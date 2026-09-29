const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const productRoutes = require('./routes/productRoutes');
const pricingSuggestionRoutes = require('./routes/pricingSuggestionRoutes');
const reorderSuggestionRoutes = require('./routes/reorderSuggestionRoutes');
const strategyRoutes = require('./routes/strategyRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/v1', productRoutes);
app.use('/api/v1', pricingSuggestionRoutes);
app.use('/api/v1', reorderSuggestionRoutes);
app.use('/api/v1', strategyRoutes);
app.use('/api/v1', suggestionRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
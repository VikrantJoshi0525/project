const express = require('express');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', productRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'StockPulse Commerce Engine'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`StockPulse Commerce Engine listening on port ${PORT}`);
});

module.exports = app;
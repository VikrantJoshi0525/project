const app = require('./app');
const connectDB = require('./config/db');
const recommendationEventEmitter = require('./services/recommendationEventEmitter');
const recommendationHandlerService = require('./services/recommendationHandlerService');

// Connect to database
connectDB();

// Set up event listeners for the agentic loop
recommendationEventEmitter.on('inventoryLow', async (eventPayload) => {
  await recommendationHandlerService.handleInventoryLow(eventPayload);
});

recommendationEventEmitter.on('demandSpike', async (eventPayload) => {
  await recommendationHandlerService.handleDemandSpike(eventPayload);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
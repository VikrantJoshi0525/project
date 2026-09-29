const RuleBasedStrategy = require('./src/strategies/RuleBasedStrategy');

async function runReorderTests() {
  console.log('Running Reorder Calculation Tests...\n');

  // Test 5: Reorder calculation
  console.log('Test 5: Reorder calculation');
  try {
    const strategy = new RuleBasedStrategy();
    const context = {
      product: {
        currentPrice: 100,
        stockLevel: 15,
        reorderThreshold: 20,
        demandVelocity: 5
      },
      categoryAverageDemandVelocity: 10,
      triggerReason: 'test'
    };
    
    const result = strategy.getRecommendations(context);
    console.log('Result:', JSON.stringify(result.reorder, null, 2));
    
    const expectedQuantity = (20 * 3) - 15; // 45
    if (result.reorder.recommendedQuantity === expectedQuantity) {
      console.log('✅ PASS: Correct reorder calculation\n');
    } else {
      console.log(`❌ FAIL: Expected ${expectedQuantity}, got ${result.reorder.recommendedQuantity}\n`);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message, '\n');
  }
}

runReorderTests();
const RuleBasedStrategy = require('./src/strategies/RuleBasedStrategy');

async function runRuleTests() {
  console.log('Running Rule-Based Strategy Tests...\n');

  // Test 3: RuleBasedStrategy - both conditions true (should prioritize stock-low rule)
  console.log('Test 3: RuleBasedStrategy - both conditions true (should prioritize stock-low rule)');
  try {
    const strategy = new RuleBasedStrategy();
    const context = {
      product: {
        currentPrice: 100,
        stockLevel: 10, // Below reorderThreshold
        reorderThreshold: 20,
        demandVelocity: 25 // Also greater than 2 * 10
      },
      categoryAverageDemandVelocity: 10,
      triggerReason: 'test'
    };
    
    const result = strategy.getRecommendations(context);
    console.log('Result:', JSON.stringify(result.pricing, null, 2));
    
    if (result.pricing.direction === 'INCREASE' && result.pricing.recommendedPrice === 110) {
      console.log('✅ PASS: Prioritized stock-low rule (10% increase)\n');
    } else {
      console.log('❌ FAIL: Did not prioritize stock-low rule\n');
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message, '\n');
  }

  // Test 4: RuleBasedStrategy - neither condition true
  console.log('Test 4: RuleBasedStrategy - neither condition true');
  try {
    const strategy = new RuleBasedStrategy();
    const context = {
      product: {
        currentPrice: 100,
        stockLevel: 50, // Above reorderThreshold
        reorderThreshold: 20,
        demandVelocity: 15 // Not greater than 2 * 10
      },
      categoryAverageDemandVelocity: 10,
      triggerReason: 'test'
    };
    
    const result = strategy.getRecommendations(context);
    console.log('Result:', JSON.stringify(result.pricing, null, 2));
    
    if (result.pricing.direction === 'HOLD' && result.pricing.recommendedPrice === 100) {
      console.log('✅ PASS: Recommended HOLD\n');
    } else {
      console.log('❌ FAIL: Did not recommend HOLD\n');
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message, '\n');
  }
}

runRuleTests();
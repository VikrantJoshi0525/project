const RuleBasedStrategy = require('./src/strategies/RuleBasedStrategy');
const StrategyRegistry = require('./src/strategies/StrategyRegistry');
const CommerceAdvisor = require('./src/services/CommerceAdvisor');
const Product = require('./src/models/Product');

async function runBasicTests() {
  console.log('Running Pluggable Commerce Engine Basic Tests...\n');

  // Test 1: RuleBasedStrategy - stock below reorder threshold
  console.log('Test 1: RuleBasedStrategy - stock below reorder threshold');
  try {
    const strategy = new RuleBasedStrategy();
    const context = {
      product: {
        currentPrice: 100,
        stockLevel: 10, // Below reorderThreshold
        reorderThreshold: 20,
        demandVelocity: 5
      },
      categoryAverageDemandVelocity: 10,
      triggerReason: 'test'
    };
    
    const result = strategy.getRecommendations(context);
    console.log('Result:', JSON.stringify(result.pricing, null, 2));
    
    if (result.pricing.direction === 'INCREASE' && result.pricing.recommendedPrice === 110) {
      console.log('✅ PASS: Recommended 10% price increase\n');
    } else {
      console.log('❌ FAIL: Did not recommend 10% price increase\n');
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message, '\n');
  }

  // Test 2: RuleBasedStrategy - demand velocity greater than 2 × category average
  console.log('Test 2: RuleBasedStrategy - demand velocity greater than 2 × category average');
  try {
    const strategy = new RuleBasedStrategy();
    const context = {
      product: {
        currentPrice: 100,
        stockLevel: 50, // Above reorderThreshold
        reorderThreshold: 20,
        demandVelocity: 25 // Greater than 2 * 10
      },
      categoryAverageDemandVelocity: 10,
      triggerReason: 'test'
    };
    
    const result = strategy.getRecommendations(context);
    console.log('Result:', JSON.stringify(result.pricing, null, 2));
    
    if (result.pricing.direction === 'INCREASE' && result.pricing.recommendedPrice === 105) {
      console.log('✅ PASS: Recommended 5% price increase\n');
    } else {
      console.log('❌ FAIL: Did not recommend 5% price increase\n');
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message, '\n');
  }
}

runBasicTests();
const StrategyRegistry = require('./src/strategies/StrategyRegistry');
const CommerceAdvisor = require('./src/services/CommerceAdvisor');
const Product = require('./src/models/Product');

async function runIntegrationTests() {
  console.log('Running Integration Tests...\n');

  // Test 6: Runtime strategy switching
  console.log('Test 6: Runtime strategy switching');
  try {
    // Check initial state
    const initialStrategy = StrategyRegistry.getActiveStrategyName();
    console.log('Initial active strategy:', initialStrategy);
    
    // Switch strategy
    StrategyRegistry.setActiveStrategy('rule');
    const newStrategy = StrategyRegistry.getActiveStrategyName();
    console.log('New active strategy:', newStrategy);
    
    if (newStrategy === 'rule') {
      console.log('✅ PASS: Successfully switched strategy\n');
    } else {
      console.log('❌ FAIL: Failed to switch strategy\n');
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message, '\n');
  }

  // Test 7: Invalid strategy selection
  console.log('Test 7: Invalid strategy selection');
  try {
    StrategyRegistry.setActiveStrategy('nonexistent');
    console.log('❌ FAIL: Should have thrown error for invalid strategy\n');
  } catch (error) {
    console.log('✅ PASS: Correctly rejected invalid strategy:', error.message, '\n');
  }

  // Test 8: CommerceAdvisor integration
  console.log('Test 8: CommerceAdvisor integration');
  try {
    // Set up context with mock product
    const mockProduct = new Product({
      id: 'test-1',
      name: 'Test Product',
      category: 'Electronics',
      currentPrice: 50,
      stockLevel: 5,
      reorderThreshold: 10,
      demandVelocity: 3
    });
    
    const context = {
      product: mockProduct,
      categoryAverageDemandVelocity: 8,
      triggerReason: 'integration_test'
    };
    
    const result = CommerceAdvisor.getRecommendations(context);
    console.log('Result structure check:');
    console.log('- Has pricing:', !!result.pricing);
    console.log('- Has reorder:', !!result.reorder);
    console.log('- Has triggerReason:', !!result.triggerReason);
    
    if (result.pricing && result.reorder) {
      console.log('✅ PASS: CommerceAdvisor returned unified recommendation\n');
    } else {
      console.log('❌ FAIL: CommerceAdvisor did not return unified recommendation\n');
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message, '\n');
  }

  console.log('Integration tests completed!');
}

runIntegrationTests();
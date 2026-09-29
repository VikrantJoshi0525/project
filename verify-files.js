// Simple verification script to check file creation
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'src/strategies/CommerceStrategy.js',
  'src/strategies/RuleBasedStrategy.js',
  'src/strategies/StrategyRegistry.js',
  'src/services/CommerceAdvisor.js',
  'src/models/Product.js',
  'src/services/productService.js',
  'src/controllers/productController.js',
  'src/routes/productRoutes.js',
  'src/server.js',
  'package.json',
  'src/strategies/CompetitorAwareStrategy.js',
  'docs/adr-pluggable-commerce-engine.md'
];

console.log('Verifying file creation...\n');

filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  try {
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      console.log(`✅ ${file} - Created (${stats.size} bytes)`);
    } else {
      console.log(`❌ ${file} - Missing`);
    }
  } catch (error) {
    console.log(`❌ ${file} - Error: ${error.message}`);
  }
});

console.log('\nVerification complete.');
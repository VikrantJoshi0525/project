// Test runner for T4 Agentic Recommendation Loop
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

async function runT4Tests() {
  console.log('Running T4 Agentic Recommendation Loop Tests...\n');
  
  const testFiles = [
    'src/services/__tests__/recommendationEventEmitter.test.js',
    'src/services/__tests__/recommendationHandlerService.test.js',
    'src/services/__tests__/productService.t4.test.js',
    'src/api/__tests__/agenticLoop.test.js'
  ];
  
  for (const testFile of testFiles) {
    try {
      console.log(`Running ${testFile}...`);
      const { stdout, stderr } = await execPromise(`npx jest ${testFile} --verbose`);
      console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error) {
      console.error(`Error running ${testFile}:`, error.message);
      if (error.stdout) console.log(error.stdout);
      if (error.stderr) console.error(error.stderr);
    }
  }
  
  console.log('\nT4 Tests completed.');
}

runT4Tests();
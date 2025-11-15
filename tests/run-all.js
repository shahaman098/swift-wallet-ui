const { exec } = require('child_process');
const path = require('path');

console.log('🧪 Running All Tests...\n');

const testFiles = [
  'tests/unit/api.test.js',
  'tests/unit/buttons.test.js',
  'tests/integration/routes.test.js',
  'tests/e2e/button-navigation.test.js'
];

let passed = 0;
let failed = 0;

function runTest(file) {
  return new Promise((resolve) => {
    console.log(`\n📝 Running: ${file}`);
    exec(`node ${file}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Failed: ${file}`);
        console.error(stderr);
        failed++;
      } else {
        console.log(`✅ Passed: ${file}`);
        if (stdout) console.log(stdout);
        passed++;
      }
      resolve();
    });
  });
}

async function runAllTests() {
  for (const file of testFiles) {
    await runTest(file);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  console.log('='.repeat(50));
  
  process.exit(failed > 0 ? 1 : 0);
}

runAllTests();


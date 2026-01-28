const fs = require('fs');
const path = require('path');

console.log('Setting up test configuration...\n');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add test scripts if not present
if (!packageJson.scripts.test) {
  packageJson.scripts.test = 'jest';
  packageJson.scripts['test:watch'] = 'jest --watch';
  packageJson.scripts['test:coverage'] = 'jest --coverage';
  console.log('✅ Added test scripts to package.json');
}

// Add test dependencies if not present
const testDeps = {
  'jest': '^29.7.0',
  '@testing-library/react': '^14.1.2',
  '@testing-library/jest-dom': '^6.1.5',
  '@testing-library/user-event': '^14.5.1',
  '@types/jest': '^29.5.11',
  'jest-environment-jsdom': '^29.7.0'
};

let depsAdded = false;
Object.entries(testDeps).forEach(([dep, version]) => {
  if (!packageJson.devDependencies[dep]) {
    packageJson.devDependencies[dep] = version;
    depsAdded = true;
  }
});

if (depsAdded) {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ Added test dependencies to package.json\n');
  console.log('Run "npm install" to install the new dependencies\n');
} else {
  console.log('ℹ️  Test dependencies already present in package.json\n');
}

console.log('Test setup complete!');
console.log('\nNext steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm test');
console.log('3. Run: npm run test:coverage (to see coverage report)');

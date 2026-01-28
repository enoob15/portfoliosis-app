const fs = require('fs');
const { execSync } = require('child_process');

console.log('Installing test dependencies...');

try {
  // Install dependencies
  execSync('npm install --save-dev jest@^29.7.0 @testing-library/react@^14.1.2 @testing-library/jest-dom@^6.1.5 @testing-library/user-event@^14.5.1 @types/jest@^29.5.11 jest-environment-jsdom@^29.7.0', {
    stdio: 'inherit',
    cwd: __dirname + '/..'
  });

  console.log('\n✅ Test dependencies installed successfully!');
  console.log('\nYou can now run:');
  console.log('  npm test           - Run all tests');
  console.log('  npm run test:watch - Run tests in watch mode');
  console.log('  npm run test:coverage - Run tests with coverage report');

} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

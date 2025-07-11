#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Starting Netlify build process...');

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm ci', { stdio: 'inherit' });

  // Build the project
  console.log('🏗️ Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error('Error details:', error);
  process.exit(1);
}

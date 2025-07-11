#!/usr/bin/env node

/**
 * Fallback Netlify Build Script
 * سكريپت بناء Netlify البديل
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting fallback Netlify build...');

try {
  // Set environment
  process.env.NODE_ENV = 'production';
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  
  console.log('📋 Environment check:');
  console.log(`- Node: ${process.version}`);
  console.log(`- Working dir: ${process.cwd()}`);
  
  // Check essential files
  const essentialFiles = ['package.json', 'next.config.js'];
  for (const file of essentialFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
      throw new Error(`Essential file ${file} is missing`);
    }
  }
  
  // Install dependencies
  console.log('\n📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Build
  console.log('\n🏗️ Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Verify output
  if (fs.existsSync('out')) {
    console.log('✅ Build output verified');
  } else {
    throw new Error('Build output not found');
  }
  
  console.log('🎉 Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

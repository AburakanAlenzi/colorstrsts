#!/usr/bin/env node

/**
 * Simple Netlify Build Script
 * سكريپت بناء Netlify البسيط
 */

const { execSync } = require('child_process');

console.log('🚀 Starting simple build...');

try {
  // Set environment
  process.env.NODE_ENV = 'production';
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  
  console.log('📦 Installing dependencies...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  
  console.log('🏗️ Building with Next.js...');
  execSync('npx next build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Fallback: try without legacy-peer-deps
  try {
    console.log('🔄 Trying fallback build...');
    execSync('npm install', { stdio: 'inherit' });
    execSync('npx next build', { stdio: 'inherit' });
    console.log('✅ Fallback build successful!');
  } catch (fallbackError) {
    console.error('❌ Fallback build also failed:', fallbackError.message);
    process.exit(1);
  }
}

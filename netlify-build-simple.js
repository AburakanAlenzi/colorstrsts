#!/usr/bin/env node

/**
 * Simple Netlify Build Script
 * سكريپت بناء Netlify المبسط
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Netlify build...');
console.log('🚀 بدء بناء Netlify...');

try {
  // Set environment variables
  process.env.NODE_ENV = 'production';
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  process.env.CI = 'true';
  process.env.NETLIFY = 'true';
  
  console.log('📋 Environment:');
  console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`- NETLIFY: ${process.env.NETLIFY}`);
  console.log(`- CI: ${process.env.CI}`);
  
  // Step 1: Clean install
  console.log('\n📦 Step 1: Installing dependencies...');
  console.log('📦 الخطوة 1: تثبيت التبعيات...');
  
  // Skip removing node_modules on Netlify for faster builds
  console.log('Installing dependencies...');
  execSync('npm ci --legacy-peer-deps', { stdio: 'inherit' });
  
  // Step 2: Verify critical dependencies
  console.log('\n📦 Step 2: Verifying dependencies...');
  console.log('📦 الخطوة 2: التحقق من التبعيات...');

  try {
    // Check if critical packages exist
    const criticalPackages = ['next', 'react', 'react-dom'];
    for (const pkg of criticalPackages) {
      require.resolve(pkg);
      console.log(`✅ ${pkg} found`);
    }
  } catch (error) {
    console.log(`⚠️ Some dependencies missing, installing...`);
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  }
  
  // Step 3: Clear Next.js cache
  console.log('\n🧹 Step 3: Clearing caches...');
  console.log('🧹 الخطوة 3: مسح التخزين المؤقت...');

  try {
    if (fs.existsSync('.next')) {
      execSync('rm -rf .next', { stdio: 'inherit' });
    }

    if (fs.existsSync('out')) {
      execSync('rm -rf out', { stdio: 'inherit' });
    }
  } catch (error) {
    console.log('⚠️ Cache clearing failed, continuing...');
  }
  
  // Step 4: Build the application
  console.log('\n🏗️ Step 4: Building application...');
  console.log('🏗️ الخطوة 4: بناء التطبيق...');
  
  execSync('next build', { stdio: 'inherit' });
  
  // Step 5: Verify build output
  console.log('\n✅ Step 5: Verifying build...');
  console.log('✅ الخطوة 5: التحقق من البناء...');
  
  const outDir = path.join(process.cwd(), 'out');
  if (fs.existsSync(outDir)) {
    const files = fs.readdirSync(outDir);
    console.log(`✅ Build output contains ${files.length} files`);
    
    // List some key files
    const keyFiles = ['index.html', '_next', 'ar', 'en'];
    keyFiles.forEach(file => {
      if (files.includes(file)) {
        console.log(`✅ ${file} found`);
      } else {
        console.log(`⚠️ ${file} not found`);
      }
    });
  } else {
    throw new Error('Build output directory not found');
  }
  
  console.log('\n🎉 Build completed successfully!');
  console.log('🎉 اكتمل البناء بنجاح!');
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  console.error('❌ فشل البناء:', error.message);
  
  // Debug information
  console.error('\n🔍 Debug Information:');
  console.error(`Working directory: ${process.cwd()}`);
  console.error(`Node version: ${process.version}`);
  
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.error(`NPM version: ${npmVersion}`);
  } catch (e) {
    console.error('NPM version: unknown');
  }
  
  // Check if package.json exists
  if (fs.existsSync('package.json')) {
    console.error('✅ package.json exists');
  } else {
    console.error('❌ package.json missing');
  }
  
  // Check if next.config.js exists
  if (fs.existsSync('next.config.js')) {
    console.error('✅ next.config.js exists');
  } else {
    console.error('❌ next.config.js missing');
  }
  
  process.exit(1);
}

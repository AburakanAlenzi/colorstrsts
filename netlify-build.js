#!/usr/bin/env node

/**
 * Netlify Build Script for Color Testing Drug Detection App
 * سكريپت البناء الخاص بـ Netlify لتطبيق اختبار الألوان
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌐 Netlify Build Process Starting...');
console.log('🌐 بدء عملية البناء على Netlify...');

try {
  // Set environment variables
  process.env.NODE_ENV = 'production';
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  process.env.CI = 'true';
  
  console.log('📋 Environment Variables:');
  console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`- CI: ${process.env.CI}`);
  console.log(`- NETLIFY: ${process.env.NETLIFY}`);
  
  // Step 1: Install dependencies
  console.log('\n📦 Step 1: Installing dependencies...');
  console.log('📦 الخطوة 1: تثبيت التبعيات...');
  
  // Check if package-lock.json exists
  if (fs.existsSync('package-lock.json')) {
    console.log('Using npm ci for faster installation...');
    execSync('npm ci --production=false', { stdio: 'inherit' });
  } else {
    console.log('Using npm install...');
    execSync('npm install', { stdio: 'inherit' });
  }
  
  // Step 2: Build the application
  console.log('\n🏗️ Step 2: Building application...');
  console.log('🏗️ الخطوة 2: بناء التطبيق...');
  
  execSync('next build', { stdio: 'inherit' });
  
  // Step 3: Verify build output
  console.log('\n✅ Step 3: Verifying build output...');
  console.log('✅ الخطوة 3: التحقق من ناتج البناء...');
  
  const outDir = path.join(process.cwd(), 'out');
  if (fs.existsSync(outDir)) {
    console.log('✅ Output directory exists');
    
    const files = fs.readdirSync(outDir);
    console.log(`✅ Found ${files.length} files in output directory`);
    
    // Check for index.html
    if (files.includes('index.html')) {
      console.log('✅ index.html found');
    } else {
      console.log('⚠️ index.html not found');
    }
    
    // Check for _next directory
    if (files.includes('_next')) {
      console.log('✅ _next directory found');
    }
    
  } else {
    console.log('❌ Output directory not found');
    throw new Error('Build output directory not found');
  }
  
  console.log('\n🎉 Netlify build completed successfully!');
  console.log('🎉 اكتمل البناء على Netlify بنجاح!');
  
} catch (error) {
  console.error('\n❌ Netlify build failed:', error.message);
  console.error('❌ فشل البناء على Netlify:', error.message);
  
  // Provide debugging information
  console.error('\n🔍 Debug Information:');
  console.error('🔍 معلومات التشخيص:');
  
  console.error('Current directory:', process.cwd());
  console.error('Node version:', process.version);
  console.error('NPM version:', execSync('npm --version', { encoding: 'utf8' }).trim());
  
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
  
  // Check if src directory exists
  if (fs.existsSync('src')) {
    console.error('✅ src directory exists');
  } else {
    console.error('❌ src directory missing');
  }
  
  process.exit(1);
}

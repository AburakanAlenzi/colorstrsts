#!/usr/bin/env node

/**
 * Netlify Build Script
 * سكريبت البناء لـ Netlify
 * 
 * This script sets environment variables and runs Next.js build
 * هذا السكريبت يعين متغيرات البيئة ويشغل بناء Next.js
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Netlify build process...');
console.log('🚀 بدء عملية البناء لـ Netlify...');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.NETLIFY = 'true';
process.env.NEXT_TELEMETRY_DISABLED = '1';

console.log('🌍 Environment variables set:');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`NETLIFY: ${process.env.NETLIFY}`);
console.log(`NEXT_TELEMETRY_DISABLED: ${process.env.NEXT_TELEMETRY_DISABLED}`);

// Run Next.js build
const buildProcess = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd()
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully!');
    console.log('✅ اكتمل البناء بنجاح!');
  } else {
    console.error(`❌ Build failed with exit code ${code}`);
    console.error(`❌ فشل البناء برمز الخروج ${code}`);
    process.exit(code);
  }
});

buildProcess.on('error', (error) => {
  console.error('❌ Build process error:', error);
  console.error('❌ خطأ في عملية البناء:', error);
  process.exit(1);
});

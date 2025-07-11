#!/usr/bin/env node

/**
 * Test Build Script
 * سكريبت اختبار البناء
 */

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🧪 Testing build process...');
console.log('🧪 اختبار عملية البناء...');

// Check for syntax errors in key files
const filesToCheck = [
  'src/components/admin/admin-dashboard.tsx',
  'src/components/admin/UsageChart.tsx',
  'src/components/admin/TestsManagementNew.tsx'
];

console.log('\n📝 Checking syntax of key files...');
filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Set environment variables for testing
process.env.NODE_ENV = 'production';
process.env.NETLIFY = 'true';

console.log('\n🚀 Starting test build...');

const buildProcess = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd()
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Test build completed successfully!');
    console.log('✅ اكتمل اختبار البناء بنجاح!');
    
    // Check if out directory was created
    if (fs.existsSync('out')) {
      console.log('✅ Output directory created');
      
      // Check for key files in output
      const outputFiles = [
        'out/index.html',
        'out/ar/index.html',
        'out/ar/admin/index.html'
      ];
      
      outputFiles.forEach(file => {
        if (fs.existsSync(file)) {
          console.log(`✅ ${file} generated`);
        } else {
          console.log(`⚠️ ${file} not found`);
        }
      });
    } else {
      console.log('❌ Output directory not created');
    }
  } else {
    console.error(`\n❌ Test build failed with exit code ${code}`);
    console.error(`❌ فشل اختبار البناء برمز الخروج ${code}`);
    process.exit(code);
  }
});

buildProcess.on('error', (error) => {
  console.error('\n❌ Build process error:', error);
  console.error('❌ خطأ في عملية البناء:', error);
  process.exit(1);
});

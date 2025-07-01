#!/usr/bin/env node

/**
 * Simple deployment script for Color Testing Application
 * نص نشر بسيط لتطبيق اختبار الألوان
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment process...');
console.log('🚀 بدء عملية النشر...');

try {
  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    console.error('❌ Error: package.json not found. Please run this script from the project root.');
    console.error('❌ خطأ: لم يتم العثور على package.json. يرجى تشغيل هذا النص من جذر المشروع.');
    process.exit(1);
  }

  // Install dependencies
  console.log('📦 Installing dependencies...');
  console.log('📦 تثبيت التبعيات...');
  execSync('npm install', { stdio: 'inherit' });

  // Build the application
  console.log('🔨 Building application...');
  console.log('🔨 بناء التطبيق...');
  execSync('npm run build', { stdio: 'inherit' });

  // Check if build was successful
  if (!fs.existsSync('out')) {
    console.error('❌ Build failed: out directory not found');
    console.error('❌ فشل البناء: لم يتم العثور على مجلد out');
    process.exit(1);
  }

  console.log('✅ Build completed successfully!');
  console.log('✅ تم البناء بنجاح!');
  
  console.log('\n📁 Build output is in the "out" directory');
  console.log('📁 مخرجات البناء في مجلد "out"');
  
  console.log('\n🌐 To deploy to different platforms:');
  console.log('🌐 للنشر على منصات مختلفة:');
  
  console.log('\n📋 GitHub Pages:');
  console.log('   1. Push to GitHub');
  console.log('   2. Go to Settings → Pages');
  console.log('   3. Select "GitHub Actions" as source');
  console.log('   4. The workflow will deploy automatically');
  
  console.log('\n📋 Netlify:');
  console.log('   1. Drag and drop the "out" folder to netlify.com/drop');
  console.log('   2. Or connect your GitHub repo at netlify.com');
  
  console.log('\n📋 Surge.sh:');
  console.log('   1. npm install -g surge');
  console.log('   2. cd out');
  console.log('   3. surge');
  
  console.log('\n📋 Local testing:');
  console.log('   1. cd out');
  console.log('   2. python -m http.server 8000');
  console.log('   3. Open http://localhost:8000');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.error('❌ فشل النشر:', error.message);
  process.exit(1);
}

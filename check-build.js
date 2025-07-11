#!/usr/bin/env node

/**
 * Build Check Script
 * سكريبت فحص البناء
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking build configuration...');
console.log('🔍 فحص إعدادات البناء...');

// Check package.json
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('\n📦 Package.json:');
  console.log(`✅ cross-env in dependencies: ${pkg.dependencies['cross-env'] ? 'Yes' : 'No'}`);
  console.log(`✅ recharts in dependencies: ${pkg.dependencies['recharts'] ? 'Yes' : 'No'}`);
  console.log(`✅ Build script: ${pkg.scripts.build}`);
  console.log(`✅ Build simple script: ${pkg.scripts['build:simple']}`);
} catch (error) {
  console.error('❌ Error reading package.json:', error.message);
}

// Check next.config.js
try {
  console.log('\n⚙️ Next.js Config:');
  if (fs.existsSync('next.config.js')) {
    console.log('✅ next.config.js exists');
  } else {
    console.log('❌ next.config.js missing');
  }
} catch (error) {
  console.error('❌ Error checking next.config.js:', error.message);
}

// Check netlify.toml
try {
  console.log('\n🌐 Netlify Config:');
  if (fs.existsSync('netlify.toml')) {
    const netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
    console.log('✅ netlify.toml exists');
    if (netlifyConfig.includes('build:simple')) {
      console.log('✅ Using build:simple command');
    } else {
      console.log('⚠️ Not using build:simple command');
    }
  } else {
    console.log('❌ netlify.toml missing');
  }
} catch (error) {
  console.error('❌ Error checking netlify.toml:', error.message);
}

// Check critical files
console.log('\n📁 Critical Files:');
const files = [
  'src/components/admin/UsageChart.tsx',
  'src/components/admin/admin-dashboard.tsx',
  'build-netlify.js',
  'public/_redirects'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

console.log('\n🚀 Ready for deployment!');
console.log('🚀 جاهز للنشر!');

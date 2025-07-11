#!/usr/bin/env node

/**
 * Build Debug Script
 * سكريبت تشخيص البناء
 * 
 * This script helps diagnose build issues for Netlify deployment
 * هذا السكريبت يساعد في تشخيص مشاكل البناء لنشر Netlify
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Build Debug Information / معلومات تشخيص البناء');
console.log('='.repeat(50));

// Check Node.js version
console.log(`📦 Node.js Version: ${process.version}`);
console.log(`📦 Platform: ${process.platform}`);
console.log(`📦 Architecture: ${process.arch}`);

// Check environment variables
console.log('\n🌍 Environment Variables / متغيرات البيئة:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`NETLIFY: ${process.env.NETLIFY || 'undefined'}`);
console.log(`CI: ${process.env.CI || 'undefined'}`);

// Check package.json
console.log('\n📋 Package Information / معلومات الحزمة:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`Name: ${packageJson.name}`);
  console.log(`Version: ${packageJson.version}`);
  console.log(`Next.js Version: ${packageJson.dependencies?.next || 'Not found'}`);
  console.log(`React Version: ${packageJson.dependencies?.react || 'Not found'}`);
  console.log(`TypeScript Version: ${packageJson.dependencies?.typescript || packageJson.devDependencies?.typescript || 'Not found'}`);
} catch (error) {
  console.error('❌ Error reading package.json:', error.message);
}

// Check Next.js config
console.log('\n⚙️ Next.js Configuration / إعدادات Next.js:');
try {
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    console.log('✅ next.config.js exists');
    const config = require(nextConfigPath);
    console.log(`Output mode: ${config.output || 'default'}`);
    console.log(`Trailing slash: ${config.trailingSlash || 'default'}`);
    console.log(`Dist dir: ${config.distDir || 'default'}`);
  } else {
    console.log('❌ next.config.js not found');
  }
} catch (error) {
  console.error('❌ Error reading next.config.js:', error.message);
}

// Check TypeScript config
console.log('\n📝 TypeScript Configuration / إعدادات TypeScript:');
try {
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  const tsconfigBuildPath = path.join(process.cwd(), 'tsconfig.build.json');
  
  if (fs.existsSync(tsconfigPath)) {
    console.log('✅ tsconfig.json exists');
  } else {
    console.log('❌ tsconfig.json not found');
  }
  
  if (fs.existsSync(tsconfigBuildPath)) {
    console.log('✅ tsconfig.build.json exists');
  } else {
    console.log('❌ tsconfig.build.json not found');
  }
} catch (error) {
  console.error('❌ Error checking TypeScript configs:', error.message);
}

// Check critical files
console.log('\n📁 Critical Files Check / فحص الملفات المهمة:');
const criticalFiles = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/components/admin/admin-dashboard.tsx',
  'src/components/admin/UsageChart.tsx',
  'src/lib/firebase.ts',
  'public/_redirects',
  'netlify.toml'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing!`);
  }
});

// Check for common issues
console.log('\n🔧 Common Issues Check / فحص المشاكل الشائعة:');

// Check for conflicting dependencies
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Check for recharts
  if (deps.recharts) {
    console.log(`✅ recharts: ${deps.recharts}`);
  } else {
    console.log('❌ recharts not found - required for UsageChart');
  }
  
  // Check for cross-env
  if (deps['cross-env']) {
    console.log(`✅ cross-env: ${deps['cross-env']}`);
  } else {
    console.log('❌ cross-env not found - required for build script');
  }
  
} catch (error) {
  console.error('❌ Error checking dependencies:', error.message);
}

console.log('\n🚀 Build Recommendations / توصيات البناء:');
console.log('1. Ensure all environment variables are set in Netlify dashboard');
console.log('2. Check that recharts is properly installed');
console.log('3. Verify TypeScript compilation passes');
console.log('4. Make sure Firebase config is valid');
console.log('5. Test build locally with: npm run build');

console.log('\n✨ Debug completed / اكتمل التشخيص');

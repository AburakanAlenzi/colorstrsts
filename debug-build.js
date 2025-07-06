#!/usr/bin/env node

/**
 * Debug Build Script - تشخيص مشاكل البناء
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Build Debug Information');
console.log('🔍 معلومات تشخيص البناء');
console.log('='.repeat(50));

// Environment Information
console.log('\n📋 Environment:');
console.log(`Node.js: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);
console.log(`Working Directory: ${process.cwd()}`);

// Environment Variables
console.log('\n🌐 Environment Variables:');
const envVars = [
  'NODE_ENV',
  'CI',
  'NETLIFY',
  'NEXT_TELEMETRY_DISABLED',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
];

envVars.forEach(varName => {
  console.log(`${varName}: ${process.env[varName] || 'undefined'}`);
});

// File Checks
console.log('\n📁 File Checks:');
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  'src/app',
  'src/components',
  'src/lib'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Package.json Analysis
console.log('\n📦 Package.json Analysis:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`Name: ${packageJson.name}`);
  console.log(`Version: ${packageJson.version}`);
  console.log(`Scripts available: ${Object.keys(packageJson.scripts || {}).join(', ')}`);
  
  // Check for build script
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log(`Build script: ${packageJson.scripts.build}`);
  } else {
    console.log('❌ No build script found');
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Next.js Config Check
console.log('\n⚙️ Next.js Configuration:');
try {
  const nextConfig = require('./next.config.js');
  console.log(`Output: ${nextConfig.output || 'default'}`);
  console.log(`Dist Dir: ${nextConfig.distDir || '.next'}`);
  console.log(`Trailing Slash: ${nextConfig.trailingSlash || false}`);
} catch (error) {
  console.log('❌ Error reading next.config.js:', error.message);
}

// Dependencies Check
console.log('\n📚 Dependencies Check:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = packageJson.dependencies || {};
  const devDeps = packageJson.devDependencies || {};
  
  console.log(`Dependencies: ${Object.keys(deps).length}`);
  console.log(`Dev Dependencies: ${Object.keys(devDeps).length}`);
  
  // Check for Next.js
  if (deps.next) {
    console.log(`✅ Next.js: ${deps.next}`);
  } else {
    console.log('❌ Next.js not found in dependencies');
  }
  
  // Check for React
  if (deps.react) {
    console.log(`✅ React: ${deps.react}`);
  } else {
    console.log('❌ React not found in dependencies');
  }
  
} catch (error) {
  console.log('❌ Error checking dependencies:', error.message);
}

// NPM/Node Versions
console.log('\n🔧 Tool Versions:');
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`NPM: ${npmVersion}`);
} catch (error) {
  console.log('❌ NPM not available');
}

// Source Code Structure
console.log('\n📂 Source Code Structure:');
const srcDir = 'src';
if (fs.existsSync(srcDir)) {
  const srcContents = fs.readdirSync(srcDir);
  console.log(`src/ contents: ${srcContents.join(', ')}`);
  
  // Check app directory
  const appDir = path.join(srcDir, 'app');
  if (fs.existsSync(appDir)) {
    const appContents = fs.readdirSync(appDir);
    console.log(`src/app/ contents: ${appContents.join(', ')}`);
  }
} else {
  console.log('❌ src directory not found');
}

// Build Test
console.log('\n🧪 Build Test:');
console.log('Attempting to run type check...');
try {
  execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
  console.log('✅ TypeScript check passed');
} catch (error) {
  console.log('⚠️ TypeScript check failed (this might be okay)');
}

console.log('\n🎯 Recommendations:');
console.log('1. Make sure all Firebase environment variables are set');
console.log('2. Ensure package.json has correct build script');
console.log('3. Check that next.config.js is properly configured');
console.log('4. Verify all source files are present');

console.log('\n📋 Debug completed!');
console.log('📋 اكتمل التشخيص!');

#!/usr/bin/env node

/**
 * Package Installation Script for Netlify
 * سكريپت تثبيت الحزم لـ Netlify
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('📦 Installing packages for Netlify build...');
console.log('📦 تثبيت الحزم لبناء Netlify...');

try {
  // Required packages for the build
  const requiredPackages = [
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-dialog',
    '@radix-ui/react-select',
    '@radix-ui/react-label',
    '@radix-ui/react-slot',
    '@radix-ui/react-primitive',
    'class-variance-authority',
    'react-hook-form',
    'exceljs',
    'cross-env'
  ];

  console.log('Installing required packages...');
  console.log('تثبيت الحزم المطلوبة...');
  
  // Install packages one by one to avoid conflicts
  for (const pkg of requiredPackages) {
    try {
      console.log(`Installing ${pkg}...`);
      execSync(`npm install ${pkg}`, { stdio: 'inherit' });
      console.log(`✅ ${pkg} installed successfully`);
    } catch (error) {
      console.log(`⚠️ Failed to install ${pkg}, but continuing...`);
    }
  }

  console.log('\n✅ Package installation completed!');
  console.log('✅ اكتمل تثبيت الحزم!');

} catch (error) {
  console.error('❌ Package installation failed:', error.message);
  console.error('❌ فشل تثبيت الحزم:', error.message);
  process.exit(1);
}

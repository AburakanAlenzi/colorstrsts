#!/usr/bin/env node

/**
 * Dependencies Check Script
 * سكريپت فحص التبعيات
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking dependencies...');
console.log('🔍 فحص التبعيات...');

// Required dependencies for the project
const requiredDependencies = {
  'next': 'Next.js framework',
  'react': 'React library',
  'react-dom': 'React DOM',
  'firebase': 'Firebase SDK',
  'react-hook-form': 'Form handling',
  'react-hot-toast': 'Toast notifications',
  'lucide-react': 'Icons',
  'exceljs': 'Excel handling',
  '@radix-ui/react-dropdown-menu': 'Dropdown menu component',
  '@radix-ui/react-dialog': 'Dialog component',
  '@radix-ui/react-select': 'Select component',
  '@radix-ui/react-label': 'Label component',
  '@radix-ui/react-slot': 'Slot component',
  'class-variance-authority': 'CSS utilities'
};

try {
  // Read package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  console.log('\n📋 Dependency Check Results:');
  console.log('📋 نتائج فحص التبعيات:');
  console.log('='.repeat(50));
  
  let missingCount = 0;
  let foundCount = 0;
  
  for (const [pkg, description] of Object.entries(requiredDependencies)) {
    if (dependencies[pkg]) {
      console.log(`✅ ${pkg} (${dependencies[pkg]}) - ${description}`);
      foundCount++;
    } else {
      console.log(`❌ ${pkg} - MISSING - ${description}`);
      missingCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`✅ Found: ${foundCount}`);
  console.log(`❌ Missing: ${missingCount}`);
  console.log(`📦 Total dependencies: ${Object.keys(dependencies).length}`);
  
  if (missingCount > 0) {
    console.log('\n💡 To install missing dependencies:');
    console.log('💡 لتثبيت التبعيات المفقودة:');
    
    const missingPackages = Object.keys(requiredDependencies).filter(pkg => !dependencies[pkg]);
    console.log(`npm install ${missingPackages.join(' ')}`);
    
    process.exit(1);
  } else {
    console.log('\n🎉 All required dependencies are installed!');
    console.log('🎉 جميع التبعيات المطلوبة مثبتة!');
  }
  
} catch (error) {
  console.error('❌ Error checking dependencies:', error.message);
  process.exit(1);
}

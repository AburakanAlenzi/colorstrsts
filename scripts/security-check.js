#!/usr/bin/env node

/**
 * Security Check Script
 * سكريبت فحص الأمان
 * 
 * This script performs security checks on the application
 * يقوم هذا السكريبت بفحص أمان التطبيق
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Security Check / فحص الأمان');
console.log('=' .repeat(50));

let securityScore = 0;
let totalChecks = 0;
const issues = [];
const recommendations = [];

// Check 1: Environment file security
console.log('📋 Checking Environment File Security...');
console.log('📋 فحص أمان ملفات البيئة...');
console.log('-'.repeat(30));

totalChecks++;
const envLocalExists = fs.existsSync('.env.local');
if (envLocalExists) {
  console.log('✅ .env.local file exists');
  securityScore++;
} else {
  console.log('❌ .env.local file missing');
  issues.push('.env.local file is missing');
  recommendations.push('Create .env.local file with proper Firebase configuration');
}

totalChecks++;
const envExampleExists = fs.existsSync('.env.local.example');
if (envExampleExists) {
  console.log('✅ .env.local.example file exists');
  securityScore++;
} else {
  console.log('❌ .env.local.example file missing');
  issues.push('.env.local.example file is missing');
}

// Check 2: GitIgnore configuration
console.log('\n📋 Checking GitIgnore Configuration...');
console.log('📋 فحص إعداد GitIgnore...');
console.log('-'.repeat(30));

totalChecks++;
const gitignoreExists = fs.existsSync('.gitignore');
if (gitignoreExists) {
  const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
  const hasEnvIgnore = gitignoreContent.includes('.env.local') || gitignoreContent.includes('.env*.local');
  
  if (hasEnvIgnore) {
    console.log('✅ Environment files are ignored in .gitignore');
    securityScore++;
  } else {
    console.log('❌ Environment files not properly ignored');
    issues.push('Environment files not ignored in .gitignore');
    recommendations.push('Add .env.local and .env*.local to .gitignore');
  }
} else {
  console.log('❌ .gitignore file missing');
  issues.push('.gitignore file is missing');
}

// Check 3: Firebase configuration security
console.log('\n📋 Checking Firebase Configuration...');
console.log('📋 فحص إعداد Firebase...');
console.log('-'.repeat(30));

totalChecks++;
const firebaseConfigPath = path.join('src', 'lib', 'firebase.ts');
if (fs.existsSync(firebaseConfigPath)) {
  const firebaseContent = fs.readFileSync(firebaseConfigPath, 'utf8');
  
  // Check if hardcoded values exist
  const hasHardcodedValues = firebaseContent.includes('AIzaSy') || 
                            firebaseContent.includes('.firebaseapp.com') ||
                            firebaseContent.includes('.firebaseio.com');
  
  const usesEnvVars = firebaseContent.includes('process.env.NEXT_PUBLIC_FIREBASE');
  
  if (usesEnvVars && !hasHardcodedValues) {
    console.log('✅ Firebase uses environment variables');
    securityScore++;
  } else if (hasHardcodedValues) {
    console.log('❌ Firebase has hardcoded configuration values');
    issues.push('Firebase configuration contains hardcoded values');
    recommendations.push('Move all Firebase configuration to environment variables');
  } else {
    console.log('⚠️ Firebase configuration unclear');
  }
} else {
  console.log('❌ Firebase configuration file not found');
  issues.push('Firebase configuration file missing');
}

// Check 4: Package vulnerabilities
console.log('\n📋 Checking Package Security...');
console.log('📋 فحص أمان الحزم...');
console.log('-'.repeat(30));

totalChecks++;
const packageJsonExists = fs.existsSync('package.json');
if (packageJsonExists) {
  console.log('✅ package.json exists');
  securityScore++;
  
  // Check for security script
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.scripts && packageJson.scripts['security-check']) {
    console.log('✅ Security check script available');
  } else {
    recommendations.push('Add security-check script to package.json');
  }
} else {
  console.log('❌ package.json missing');
  issues.push('package.json file is missing');
}

// Check 5: Sensitive files
console.log('\n📋 Checking for Sensitive Files...');
console.log('📋 فحص الملفات الحساسة...');
console.log('-'.repeat(30));

const sensitiveFiles = [
  '.env',
  'firebase-adminsdk.json',
  'service-account.json',
  'private-key.pem',
  '.firebase/hosting.json'
];

totalChecks++;
let sensitiveFIlesFound = false;
sensitiveFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`❌ Sensitive file found: ${file}`);
    issues.push(`Sensitive file found: ${file}`);
    sensitiveFIlesFound = true;
  }
});

if (!sensitiveFIlesFound) {
  console.log('✅ No sensitive files found in root directory');
  securityScore++;
}

// Check 6: Firebase Security Rules files
console.log('\n📋 Checking Firebase Security Rules...');
console.log('📋 فحص قواعد أمان Firebase...');
console.log('-'.repeat(30));

totalChecks++;
const firestoreRulesExist = fs.existsSync('firestore.rules');
const databaseRulesExist = fs.existsSync('database.rules.json');

if (firestoreRulesExist || databaseRulesExist) {
  console.log('✅ Firebase security rules files found');
  securityScore++;
  
  if (firestoreRulesExist) {
    console.log('  - Firestore rules: ✅');
  }
  if (databaseRulesExist) {
    console.log('  - Database rules: ✅');
  }
} else {
  console.log('⚠️ No Firebase security rules files found');
  recommendations.push('Create firestore.rules and database.rules.json files');
  recommendations.push('Deploy security rules to Firebase');
}

// Calculate security score
const securityPercentage = Math.round((securityScore / totalChecks) * 100);

// Display results
console.log('\n' + '='.repeat(50));
console.log('📊 Security Check Results / نتائج فحص الأمان');
console.log('='.repeat(50));

console.log(`🎯 Security Score: ${securityScore}/${totalChecks} (${securityPercentage}%)`);
console.log(`🎯 نقاط الأمان: ${securityScore}/${totalChecks} (${securityPercentage}%)`);

if (securityPercentage >= 80) {
  console.log('🟢 Security Status: GOOD / حالة الأمان: جيدة');
} else if (securityPercentage >= 60) {
  console.log('🟡 Security Status: MODERATE / حالة الأمان: متوسطة');
} else {
  console.log('🔴 Security Status: NEEDS IMPROVEMENT / حالة الأمان: تحتاج تحسين');
}

// Display issues
if (issues.length > 0) {
  console.log('\n❌ Security Issues Found:');
  console.log('❌ مشاكل أمنية تم العثور عليها:');
  issues.forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue}`);
  });
}

// Display recommendations
if (recommendations.length > 0) {
  console.log('\n💡 Security Recommendations:');
  console.log('💡 توصيات أمنية:');
  recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
}

// Additional security tips
console.log('\n🔒 Additional Security Tips:');
console.log('🔒 نصائح أمنية إضافية:');
console.log('  1. Regularly update dependencies: npm audit fix');
console.log('  1. حدث التبعيات بانتظام: npm audit fix');
console.log('  2. Use HTTPS in production');
console.log('  2. استخدم HTTPS في الإنتاج');
console.log('  3. Enable Firebase App Check');
console.log('  3. فعل Firebase App Check');
console.log('  4. Monitor Firebase usage and logs');
console.log('  4. راقب استخدام Firebase والسجلات');
console.log('  5. Implement proper error handling');
console.log('  5. طبق معالجة أخطاء مناسبة');

// Exit with appropriate code
if (securityPercentage < 60) {
  console.log('\n⚠️ Security check failed. Please address the issues above.');
  console.log('⚠️ فشل فحص الأمان. يرجى معالجة المشاكل أعلاه.');
  process.exit(1);
} else {
  console.log('\n✅ Security check passed!');
  console.log('✅ نجح فحص الأمان!');
  process.exit(0);
}

#!/usr/bin/env node

/**
 * Deploy Firestore Rules Script
 * سكريبت نشر قواعد Firestore
 * 
 * This script helps deploy Firestore security rules
 * هذا السكريبت يساعد في نشر قواعد أمان Firestore
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Firestore Rules Deployment');
console.log('نشر قواعد Firebase Firestore 🔥');
console.log('=====================================\n');

// Check if Firebase CLI is installed
// فحص ما إذا كان Firebase CLI مثبت
try {
  execSync('firebase --version', { stdio: 'ignore' });
  console.log('✅ Firebase CLI is installed');
  console.log('✅ Firebase CLI مثبت');
} catch (error) {
  console.error('❌ Firebase CLI is not installed');
  console.error('❌ Firebase CLI غير مثبت');
  console.error('Please install it with: npm install -g firebase-tools');
  console.error('يرجى تثبيته باستخدام: npm install -g firebase-tools');
  process.exit(1);
}

// Check if user is logged in
// فحص ما إذا كان المستخدم مسجل الدخول
try {
  execSync('firebase projects:list', { stdio: 'ignore' });
  console.log('✅ User is logged in to Firebase');
  console.log('✅ المستخدم مسجل الدخول إلى Firebase');
} catch (error) {
  console.error('❌ User is not logged in to Firebase');
  console.error('❌ المستخدم غير مسجل الدخول إلى Firebase');
  console.error('Please login with: firebase login');
  console.error('يرجى تسجيل الدخول باستخدام: firebase login');
  process.exit(1);
}

// Get environment argument
// الحصول على معامل البيئة
const environment = process.argv[2] || 'dev';

let rulesFile;
if (environment === 'prod' || environment === 'production') {
  rulesFile = 'firestore.rules';
  console.log('🚀 Deploying PRODUCTION rules');
  console.log('🚀 نشر قواعد الإنتاج');
} else {
  rulesFile = 'firestore.rules.dev';
  console.log('🛠️  Deploying DEVELOPMENT rules');
  console.log('🛠️  نشر قواعد التطوير');
}

// Check if rules file exists
// فحص ما إذا كان ملف القواعد موجود
if (!fs.existsSync(rulesFile)) {
  console.error(`❌ Rules file not found: ${rulesFile}`);
  console.error(`❌ ملف القواعد غير موجود: ${rulesFile}`);
  process.exit(1);
}

console.log(`📄 Using rules file: ${rulesFile}`);
console.log(`📄 استخدام ملف القواعد: ${rulesFile}`);

// Copy the appropriate rules file to firestore.rules for deployment
// نسخ ملف القواعد المناسب إلى firestore.rules للنشر
if (rulesFile !== 'firestore.rules') {
  fs.copyFileSync(rulesFile, 'firestore.rules');
  console.log('📋 Copied rules file for deployment');
  console.log('📋 تم نسخ ملف القواعد للنشر');
}

try {
  console.log('\n🚀 Deploying Firestore rules...');
  console.log('🚀 نشر قواعد Firestore...');
  
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  
  console.log('\n✅ Firestore rules deployed successfully!');
  console.log('✅ تم نشر قواعد Firestore بنجاح!');
  
  if (environment === 'dev') {
    console.log('\n⚠️  WARNING: Development rules are permissive!');
    console.log('⚠️  تحذير: قواعد التطوير متساهلة!');
    console.log('Make sure to use production rules in production environment');
    console.log('تأكد من استخدام قواعد الإنتاج في بيئة الإنتاج');
  }
  
} catch (error) {
  console.error('\n❌ Failed to deploy Firestore rules');
  console.error('❌ فشل في نشر قواعد Firestore');
  console.error(error.message);
  process.exit(1);
}

console.log('\n🎉 Deployment completed!');
console.log('🎉 اكتمل النشر!');

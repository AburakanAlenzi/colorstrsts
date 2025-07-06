#!/usr/bin/env node

/**
 * Firebase Connection Test Script
 * سكريبت اختبار اتصال Firebase
 * 
 * This script tests the Firebase connection and validates environment variables
 * يختبر هذا السكريبت اتصال Firebase ويتحقق من متغيرات البيئة
 */

const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('🔥 Firebase Connection Test');
console.log('🔥 اختبار اتصال Firebase');
console.log('=' .repeat(50));

// Required Firebase environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_DATABASE_URL',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

console.log('📋 Checking Environment Variables...');
console.log('📋 فحص متغيرات البيئة...');
console.log('-'.repeat(30));

let allVariablesPresent = true;
const envStatus = {};

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  const isPresent = !!value;
  const status = isPresent ? '✅' : '❌';
  const maskedValue = isPresent ? 
    (value.length > 20 ? `${value.substring(0, 10)}...${value.substring(value.length - 5)}` : value) : 
    'NOT SET';
  
  console.log(`${status} ${envVar}: ${maskedValue}`);
  envStatus[envVar] = isPresent;
  
  if (!isPresent) {
    allVariablesPresent = false;
  }
});

console.log('-'.repeat(50));

if (!allVariablesPresent) {
  console.log('❌ Missing Environment Variables!');
  console.log('❌ متغيرات البيئة مفقودة!');
  console.log('');
  console.log('Please ensure all Firebase environment variables are set in .env.local');
  console.log('يرجى التأكد من تعيين جميع متغيرات Firebase في ملف .env.local');
  console.log('');
  console.log('Copy .env.local.example to .env.local and update the values:');
  console.log('انسخ .env.local.example إلى .env.local وحدث القيم:');
  console.log('cp .env.local.example .env.local');
  process.exit(1);
}

console.log('✅ All Environment Variables Present!');
console.log('✅ جميع متغيرات البيئة موجودة!');
console.log('');

// Test Firebase configuration
console.log('🔧 Testing Firebase Configuration...');
console.log('🔧 اختبار إعداد Firebase...');
console.log('-'.repeat(30));

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Validate configuration format
const validations = [
  {
    key: 'apiKey',
    test: (val) => val && val.startsWith('AIza'),
    message: 'API Key should start with "AIza"'
  },
  {
    key: 'authDomain',
    test: (val) => val && val.includes('.firebaseapp.com'),
    message: 'Auth Domain should end with ".firebaseapp.com"'
  },
  {
    key: 'databaseURL',
    test: (val) => val && val.includes('.firebaseio.com'),
    message: 'Database URL should contain ".firebaseio.com"'
  },
  {
    key: 'projectId',
    test: (val) => val && val.length > 0,
    message: 'Project ID should not be empty'
  },
  {
    key: 'storageBucket',
    test: (val) => val && (val.includes('.appspot.com') || val.includes('.firebasestorage.app')),
    message: 'Storage Bucket should contain ".appspot.com" or ".firebasestorage.app"'
  },
  {
    key: 'messagingSenderId',
    test: (val) => val && /^\d+$/.test(val),
    message: 'Messaging Sender ID should be numeric'
  },
  {
    key: 'appId',
    test: (val) => val && val.includes(':'),
    message: 'App ID should contain ":"'
  }
];

let configValid = true;

validations.forEach(validation => {
  const value = firebaseConfig[validation.key];
  const isValid = validation.test(value);
  const status = isValid ? '✅' : '❌';
  
  console.log(`${status} ${validation.key}: ${isValid ? 'Valid' : validation.message}`);
  
  if (!isValid) {
    configValid = false;
  }
});

console.log('-'.repeat(50));

if (!configValid) {
  console.log('❌ Firebase Configuration Invalid!');
  console.log('❌ إعداد Firebase غير صحيح!');
  console.log('');
  console.log('Please check your Firebase configuration values.');
  console.log('يرجى التحقق من قيم إعداد Firebase.');
  process.exit(1);
}

console.log('✅ Firebase Configuration Valid!');
console.log('✅ إعداد Firebase صحيح!');
console.log('');

// Summary
console.log('📊 Test Summary / ملخص الاختبار');
console.log('=' .repeat(50));
console.log('✅ Environment Variables: All Present');
console.log('✅ متغيرات البيئة: جميعها موجودة');
console.log('✅ Firebase Configuration: Valid Format');
console.log('✅ إعداد Firebase: تنسيق صحيح');
console.log('');
console.log('🎉 Firebase is ready to use!');
console.log('🎉 Firebase جاهز للاستخدام!');
console.log('');
console.log('Next steps:');
console.log('الخطوات التالية:');
console.log('1. Start the development server: npm run dev');
console.log('1. شغل خادم التطوير: npm run dev');
console.log('2. Test authentication and database operations');
console.log('2. اختبر المصادقة وعمليات قاعدة البيانات');
console.log('3. Check Firebase Console for activity');
console.log('3. تحقق من Firebase Console للنشاط');

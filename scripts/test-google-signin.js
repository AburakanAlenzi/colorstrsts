#!/usr/bin/env node

/**
 * Google Sign-In Test Script
 * سكريبت اختبار تسجيل الدخول بـ Google
 */

const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('🔍 Google Sign-In Configuration Test');
console.log('🔍 اختبار إعداد تسجيل الدخول بـ Google');
console.log('=' .repeat(50));

// Test Firebase configuration
console.log('📋 Checking Firebase Configuration...');
console.log('📋 فحص إعداد Firebase...');
console.log('-'.repeat(30));

const firebaseVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
];

let configValid = true;

firebaseVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: Missing`);
    configValid = false;
  }
});

if (!configValid) {
  console.log('\n❌ Firebase configuration incomplete!');
  console.log('❌ إعداد Firebase غير مكتمل!');
  process.exit(1);
}

// Validate auth domain
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
if (authDomain && !authDomain.includes('.firebaseapp.com')) {
  console.log('⚠️ Auth domain should end with .firebaseapp.com');
  console.log('⚠️ نطاق المصادقة يجب أن ينتهي بـ .firebaseapp.com');
}

console.log('\n🔧 Google Sign-In Requirements Check...');
console.log('🔧 فحص متطلبات تسجيل الدخول بـ Google...');
console.log('-'.repeat(30));

// Check if running on localhost
const isLocalhost = process.env.NEXT_PUBLIC_APP_URL?.includes('localhost') || 
                   process.env.NODE_ENV === 'development';

if (isLocalhost) {
  console.log('✅ Running on localhost - OK for development');
  console.log('✅ يعمل على localhost - مناسب للتطوير');
} else {
  console.log('ℹ️ Running on production domain');
  console.log('ℹ️ يعمل على نطاق الإنتاج');
}

// Firebase Console checklist
console.log('\n📝 Firebase Console Checklist:');
console.log('📝 قائمة التحقق من Firebase Console:');
console.log('-'.repeat(30));

console.log('🔲 1. Go to Firebase Console > Authentication > Sign-in method');
console.log('🔲 1. انتقل إلى Firebase Console > Authentication > Sign-in method');

console.log('🔲 2. Enable Google as a sign-in provider');
console.log('🔲 2. فعّل Google كطريقة تسجيل دخول');

console.log('🔲 3. Set project support email');
console.log('🔲 3. اضبط إيميل دعم المشروع');

console.log('🔲 4. Go to Authentication > Settings > Authorized domains');
console.log('🔲 4. انتقل إلى Authentication > Settings > Authorized domains');

console.log('🔲 5. Add these domains:');
console.log('🔲 5. أضف هذه النطاقات:');
console.log('   - localhost');
console.log('   - 127.0.0.1');
if (process.env.NEXT_PUBLIC_APP_URL) {
  const url = new URL(process.env.NEXT_PUBLIC_APP_URL);
  console.log(`   - ${url.hostname}`);
}

// Common issues and solutions
console.log('\n🚨 Common Issues and Solutions:');
console.log('🚨 المشاكل الشائعة والحلول:');
console.log('-'.repeat(30));

console.log('❌ "auth/unauthorized-domain"');
console.log('   ➤ Add your domain to Firebase Console > Authorized domains');
console.log('   ➤ أضف نطاقك إلى Firebase Console > Authorized domains');

console.log('\n❌ "auth/operation-not-allowed"');
console.log('   ➤ Enable Google sign-in in Firebase Console');
console.log('   ➤ فعّل تسجيل الدخول بـ Google في Firebase Console');

console.log('\n❌ "auth/popup-blocked"');
console.log('   ➤ Allow popups in browser or use redirect method');
console.log('   ➤ اسمح بالنوافذ المنبثقة أو استخدم طريقة التوجيه');

console.log('\n❌ "auth/popup-closed-by-user"');
console.log('   ➤ User closed the popup - normal behavior');
console.log('   ➤ المستخدم أغلق النافذة - سلوك طبيعي');

// Test URLs
console.log('\n🌐 Test URLs:');
console.log('🌐 روابط الاختبار:');
console.log('-'.repeat(30));

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
console.log(`📱 App URL: ${appUrl}`);
console.log(`🔐 Auth URL: ${appUrl}/auth`);
console.log(`🔗 Firebase Console: https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);

// Browser testing instructions
console.log('\n🧪 Browser Testing Instructions:');
console.log('🧪 تعليمات اختبار المتصفح:');
console.log('-'.repeat(30));

console.log('1. Open browser and navigate to your app');
console.log('1. افتح المتصفح وانتقل إلى تطبيقك');

console.log('2. Open Developer Tools (F12)');
console.log('2. افتح أدوات المطور (F12)');

console.log('3. Go to Console tab');
console.log('3. انتقل إلى تبويب Console');

console.log('4. Try Google Sign-In and check for errors');
console.log('4. جرب تسجيل الدخول بـ Google وتحقق من الأخطاء');

console.log('5. Check Network tab for failed requests');
console.log('5. تحقق من تبويب Network للطلبات الفاشلة');

// Debug commands
console.log('\n🔧 Debug Commands:');
console.log('🔧 أوامر التصحيح:');
console.log('-'.repeat(30));

console.log('# Test Firebase connection');
console.log('npm run test-firebase');

console.log('\n# Check security settings');
console.log('npm run security-check');

console.log('\n# Start development server');
console.log('npm run dev');

// Final recommendations
console.log('\n💡 Recommendations:');
console.log('💡 التوصيات:');
console.log('-'.repeat(30));

console.log('✅ Use HTTPS in production');
console.log('✅ استخدم HTTPS في الإنتاج');

console.log('✅ Test with different browsers');
console.log('✅ اختبر مع متصفحات مختلفة');

console.log('✅ Disable ad blockers during testing');
console.log('✅ عطّل حاجبات الإعلانات أثناء الاختبار');

console.log('✅ Check Firebase Console logs');
console.log('✅ تحقق من سجلات Firebase Console');

console.log('\n🎉 Google Sign-In test completed!');
console.log('🎉 اكتمل اختبار تسجيل الدخول بـ Google!');

console.log('\nFor detailed troubleshooting, see: GOOGLE_SIGNIN_TROUBLESHOOTING.md');
console.log('للحصول على دليل استكشاف الأخطاء المفصل، راجع: GOOGLE_SIGNIN_TROUBLESHOOTING.md');

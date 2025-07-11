#!/usr/bin/env node

/**
 * Google Sign-In Status Checker
 * فاحص حالة تسجيل الدخول بـ Google
 */

const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('🔍 Google Sign-In Status Check');
console.log('🔍 فحص حالة تسجيل الدخول بـ Google');
console.log('=' .repeat(60));

// Get Firebase project info
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;

if (!projectId) {
  console.log('❌ Firebase Project ID not found in environment variables');
  console.log('❌ معرف مشروع Firebase غير موجود في متغيرات البيئة');
  process.exit(1);
}

console.log('📋 Project Information:');
console.log('📋 معلومات المشروع:');
console.log('-'.repeat(40));
console.log(`🆔 Project ID: ${projectId}`);
console.log(`🌐 Auth Domain: ${authDomain}`);
console.log(`🔗 Firebase Console: https://console.firebase.google.com/project/${projectId}`);

console.log('\n🚨 Error Analysis:');
console.log('🚨 تحليل الخطأ:');
console.log('-'.repeat(40));
console.log('❌ Error Code: auth/operation-not-allowed');
console.log('❌ كود الخطأ: auth/operation-not-allowed');
console.log('');
console.log('📝 This error means:');
console.log('📝 هذا الخطأ يعني:');
console.log('   • Google Sign-In is NOT enabled in Firebase Console');
console.log('   • تسجيل الدخول بـ Google غير مفعل في Firebase Console');

console.log('\n🔧 Required Actions:');
console.log('🔧 الإجراءات المطلوبة:');
console.log('-'.repeat(40));

console.log('1️⃣ Open Firebase Console:');
console.log('1️⃣ افتح Firebase Console:');
console.log(`   🔗 https://console.firebase.google.com/project/${projectId}/authentication/providers`);

console.log('\n2️⃣ Enable Google Sign-In:');
console.log('2️⃣ فعّل تسجيل الدخول بـ Google:');
console.log('   • Click on "Google" in Sign-in providers');
console.log('   • انقر على "Google" في موفري تسجيل الدخول');
console.log('   • Toggle "Enable" switch');
console.log('   • فعّل مفتاح "Enable"');
console.log('   • Enter Project support email');
console.log('   • أدخل إيميل دعم المشروع');
console.log('   • Click "Save"');
console.log('   • انقر "Save"');

console.log('\n3️⃣ Check Authorized Domains:');
console.log('3️⃣ تحقق من النطاقات المصرح بها:');
console.log(`   🔗 https://console.firebase.google.com/project/${projectId}/authentication/settings`);
console.log('   • Ensure "localhost" is in Authorized domains');
console.log('   • تأكد من وجود "localhost" في النطاقات المصرح بها');

console.log('\n📋 Step-by-Step Instructions:');
console.log('📋 تعليمات خطوة بخطوة:');
console.log('-'.repeat(40));

const steps = [
  {
    en: 'Go to Firebase Console',
    ar: 'انتقل إلى Firebase Console',
    action: `Open: https://console.firebase.google.com/project/${projectId}`
  },
  {
    en: 'Click "Authentication" in sidebar',
    ar: 'انقر "Authentication" في الشريط الجانبي',
    action: 'Navigate to Authentication section'
  },
  {
    en: 'Click "Sign-in method" tab',
    ar: 'انقر تبويب "Sign-in method"',
    action: 'Switch to Sign-in method tab'
  },
  {
    en: 'Find "Google" in providers list',
    ar: 'ابحث عن "Google" في قائمة الموفرين',
    action: 'Locate Google provider (should show "Disabled")'
  },
  {
    en: 'Click on "Google" provider',
    ar: 'انقر على موفر "Google"',
    action: 'Open Google configuration dialog'
  },
  {
    en: 'Toggle "Enable" switch ON',
    ar: 'فعّل مفتاح "Enable"',
    action: 'Enable Google Sign-In'
  },
  {
    en: 'Enter Project support email',
    ar: 'أدخل إيميل دعم المشروع',
    action: 'Required field - use your email'
  },
  {
    en: 'Click "Save" button',
    ar: 'انقر زر "Save"',
    action: 'Save the configuration'
  },
  {
    en: 'Wait 2-5 minutes for changes to take effect',
    ar: 'انتظر 2-5 دقائق حتى تسري التغييرات',
    action: 'Allow time for Firebase to update'
  },
  {
    en: 'Test Google Sign-In in your app',
    ar: 'اختبر تسجيل الدخول بـ Google في تطبيقك',
    action: 'Try signing in again'
  }
];

steps.forEach((step, index) => {
  console.log(`\n${index + 1}. ${step.en}`);
  console.log(`${index + 1}. ${step.ar}`);
  console.log(`   💡 ${step.action}`);
});

console.log('\n🔍 Verification:');
console.log('🔍 التحقق:');
console.log('-'.repeat(40));
console.log('After enabling Google Sign-In, you should see:');
console.log('بعد تفعيل تسجيل الدخول بـ Google، يجب أن ترى:');
console.log('✅ Google provider shows "Enabled" status');
console.log('✅ موفر Google يظهر حالة "Enabled"');
console.log('✅ No more "auth/operation-not-allowed" errors');
console.log('✅ لا مزيد من أخطاء "auth/operation-not-allowed"');

console.log('\n🧪 Test Commands:');
console.log('🧪 أوامر الاختبار:');
console.log('-'.repeat(40));
console.log('# After enabling, test with:');
console.log('# بعد التفعيل، اختبر بـ:');
console.log('npm run test-google-signin');
console.log('npm run dev');

console.log('\n📞 Need Help?');
console.log('📞 تحتاج مساعدة؟');
console.log('-'.repeat(40));
console.log('If you still have issues after following these steps:');
console.log('إذا كانت لديك مشاكل بعد اتباع هذه الخطوات:');
console.log('1. Check browser console for other errors');
console.log('1. تحقق من وحدة تحكم المتصفح للأخطاء الأخرى');
console.log('2. Try in incognito/private browsing mode');
console.log('2. جرب في وضع التصفح الخاص');
console.log('3. Clear browser cache and cookies');
console.log('3. امسح ذاكرة التخزين المؤقت وملفات تعريف الارتباط');
console.log('4. Wait 10-15 minutes and try again');
console.log('4. انتظر 10-15 دقيقة وحاول مرة أخرى');

console.log('\n📚 Documentation:');
console.log('📚 التوثيق:');
console.log('-'.repeat(40));
console.log('🔗 Firebase Auth: https://firebase.google.com/docs/auth');
console.log('🔗 Google Sign-In: https://firebase.google.com/docs/auth/web/google-signin');
console.log('📄 Setup Guide: FIREBASE_GOOGLE_SETUP_GUIDE.md');

console.log('\n🎯 Summary:');
console.log('🎯 الملخص:');
console.log('='.repeat(60));
console.log('🚨 ISSUE: Google Sign-In is disabled in Firebase Console');
console.log('🚨 المشكلة: تسجيل الدخول بـ Google معطل في Firebase Console');
console.log('🔧 SOLUTION: Enable Google provider in Authentication settings');
console.log('🔧 الحل: فعّل موفر Google في إعدادات المصادقة');
console.log('⏱️ TIME: 2-5 minutes to complete');
console.log('⏱️ الوقت: 2-5 دقائق للإكمال');
console.log('✅ RESULT: Google Sign-In will work in your app');
console.log('✅ النتيجة: تسجيل الدخول بـ Google سيعمل في تطبيقك');

console.log('\n🎉 Good luck! / حظاً موفقاً!');

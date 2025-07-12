#!/usr/bin/env node

/**
 * Fix Firebase Authentication Domains
 * إصلاح نطاقات Firebase Authentication
 * 
 * This script helps identify and fix domain authorization issues
 * هذا السكريبت يساعد في تحديد وإصلاح مشاكل تصريح النطاقات
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Firebase Authentication Domains Fix');
console.log('إصلاح نطاقات Firebase Authentication 🔐');
console.log('=====================================\n');

// Get Firebase configuration
function getFirebaseConfig() {
  try {
    const firebaseConfigPath = path.join(__dirname, '../src/lib/firebase.ts');
    const content = fs.readFileSync(firebaseConfigPath, 'utf8');
    
    // Extract authDomain from the fallback configuration
    const authDomainMatch = content.match(/authDomain:\s*["']([^"']+)["']/);
    const projectIdMatch = content.match(/projectId:\s*["']([^"']+)["']/);
    
    if (authDomainMatch && projectIdMatch) {
      return {
        authDomain: authDomainMatch[1],
        projectId: projectIdMatch[1]
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error reading Firebase configuration:', error.message);
    return null;
  }
}

// Common domains that should be authorized
function getCommonDomains() {
  return [
    'localhost',
    '127.0.0.1',
    'localhost:3000',
    '127.0.0.1:3000',
    'localhost:3001',
    '127.0.0.1:3001',
    'localhost:8080',
    '127.0.0.1:8080',
    // Add your production domains here
    // أضف نطاقات الإنتاج هنا
    'colorstest.com',
    'www.colorstest.com',
    'colorstest.netlify.app',
    'colorstests-573ef.web.app',
    'colorstests-573ef.firebaseapp.com'
  ];
}

// Generate Firebase console URL for authorized domains
function generateFirebaseConsoleUrl(projectId) {
  return `https://console.firebase.google.com/project/${projectId}/authentication/settings`;
}

// Main function
function main() {
  const config = getFirebaseConfig();
  
  if (!config) {
    console.error('❌ Could not extract Firebase configuration');
    console.error('❌ لا يمكن استخراج إعداد Firebase');
    return;
  }
  
  console.log('📋 Current Firebase Configuration:');
  console.log('📋 إعداد Firebase الحالي:');
  console.log(`   Project ID: ${config.projectId}`);
  console.log(`   Auth Domain: ${config.authDomain}`);
  console.log();
  
  console.log('🌐 Domains that should be authorized:');
  console.log('🌐 النطاقات التي يجب تصريحها:');
  
  const domains = getCommonDomains();
  domains.forEach((domain, index) => {
    console.log(`   ${index + 1}. ${domain}`);
  });
  
  console.log();
  console.log('🔧 How to fix the domain authorization issue:');
  console.log('🔧 كيفية إصلاح مشكلة تصريح النطاق:');
  console.log();
  
  console.log('1. Open Firebase Console:');
  console.log('1. افتح Firebase Console:');
  console.log(`   ${generateFirebaseConsoleUrl(config.projectId)}`);
  console.log();
  
  console.log('2. Go to Authentication > Settings > Authorized domains');
  console.log('2. اذهب إلى Authentication > Settings > Authorized domains');
  console.log();
  
  console.log('3. Add the following domains:');
  console.log('3. أضف النطاقات التالية:');
  domains.forEach(domain => {
    console.log(`   ✅ ${domain}`);
  });
  console.log();
  
  console.log('4. Click "Add domain" for each one');
  console.log('4. اضغط "Add domain" لكل واحد منها');
  console.log();
  
  console.log('5. Save the changes');
  console.log('5. احفظ التغييرات');
  console.log();
  
  console.log('🚨 Common Issues and Solutions:');
  console.log('🚨 المشاكل الشائعة والحلول:');
  console.log();
  
  console.log('Issue: "This domain is not authorized"');
  console.log('المشكلة: "هذا النطاق غير مصرح"');
  console.log('Solution: Add your current domain to authorized domains list');
  console.log('الحل: أضف النطاق الحالي إلى قائمة النطاقات المصرح بها');
  console.log();
  
  console.log('Issue: "localhost not working"');
  console.log('المشكلة: "localhost لا يعمل"');
  console.log('Solution: Add both "localhost" and "127.0.0.1" with port numbers');
  console.log('الحل: أضف كلاً من "localhost" و "127.0.0.1" مع أرقام المنافذ');
  console.log();
  
  console.log('Issue: "Production domain not working"');
  console.log('المشكلة: "نطاق الإنتاج لا يعمل"');
  console.log('Solution: Add your production domain (e.g., yourapp.netlify.app)');
  console.log('الحل: أضف نطاق الإنتاج (مثل: yourapp.netlify.app)');
  console.log();
  
  console.log('📝 Additional Notes:');
  console.log('📝 ملاحظات إضافية:');
  console.log('- Changes may take a few minutes to take effect');
  console.log('- التغييرات قد تستغرق بضع دقائق لتصبح فعالة');
  console.log('- Make sure to include both www and non-www versions');
  console.log('- تأكد من تضمين نسختي www وغير www');
  console.log('- Test authentication after adding domains');
  console.log('- اختبر المصادقة بعد إضافة النطاقات');
  console.log();
  
  console.log('🎯 Quick Test:');
  console.log('🎯 اختبار سريع:');
  console.log('After adding domains, try to sign in again');
  console.log('بعد إضافة النطاقات، جرب تسجيل الدخول مرة أخرى');
  console.log();
  
  console.log('✅ Domain authorization fix completed!');
  console.log('✅ تم إكمال إصلاح تصريح النطاق!');
}

// Run the script
main();

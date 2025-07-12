#!/usr/bin/env node

/**
 * Migrate Chemical Tests Data to Firebase Realtime Database
 * نقل بيانات الاختبارات الكيميائية إلى Firebase Realtime Database
 */

const fs = require('fs');
const path = require('path');

// Import Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = {
  "type": "service_account",
  "project_id": "colorstests-573ef",
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

console.log('🔥 Firebase Realtime Database Migration Tool');
console.log('أداة نقل البيانات إلى Firebase Realtime Database 🔥');
console.log('================================================\n');

async function migrateData() {
  try {
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://colorstests-573ef-default-rtdb.firebaseio.com/'
      });
    }

    const db = admin.database();

    console.log('📖 Reading local JSON data...');
    console.log('قراءة البيانات المحلية...');

    // Read chemical tests data
    const testsPath = path.join(__dirname, '../src/data/chemical-tests.json');
    const testsData = JSON.parse(fs.readFileSync(testsPath, 'utf8'));

    console.log(`✅ Found ${testsData.length} chemical tests`);
    console.log(`✅ تم العثور على ${testsData.length} اختبار كيميائي\n`);

    // Migrate chemical tests
    console.log('🔄 Migrating chemical tests to Firebase...');
    console.log('نقل الاختبارات الكيميائية إلى Firebase...');

    const testsRef = db.ref('chemical_tests');
    await testsRef.set(testsData);

    console.log('✅ Chemical tests migrated successfully!');
    console.log('✅ تم نقل الاختبارات الكيميائية بنجاح!\n');

    // Set default subscription settings
    console.log('🔄 Setting default subscription settings...');
    console.log('تعيين إعدادات الاشتراك الافتراضية...');

    const defaultSettings = {
      freeTestsEnabled: true,
      freeTestsCount: 5,
      premiumRequired: true,
      globalFreeAccess: false,
      specificPremiumTests: [],
      lastUpdated: new Date().toISOString(),
      updatedBy: 'migration-script'
    };

    const settingsRef = db.ref('subscription_settings');
    await settingsRef.set(defaultSettings);

    console.log('✅ Subscription settings set successfully!');
    console.log('✅ تم تعيين إعدادات الاشتراك بنجاح!\n');

    // Verify data
    console.log('🔍 Verifying migrated data...');
    console.log('التحقق من البيانات المنقولة...');

    const verifyTests = await testsRef.once('value');
    const verifySettings = await settingsRef.once('value');

    console.log(`✅ Verified: ${verifyTests.val().length} tests in Firebase`);
    console.log(`✅ تم التحقق: ${verifyTests.val().length} اختبار في Firebase`);
    
    console.log(`✅ Verified: Settings in Firebase`);
    console.log(`✅ تم التحقق: الإعدادات في Firebase`);
    console.log('Settings:', JSON.stringify(verifySettings.val(), null, 2));

    console.log('\n🎉 Migration completed successfully!');
    console.log('🎉 تم إكمال النقل بنجاح!');
    
    console.log('\n📍 Firebase Realtime Database URL:');
    console.log('https://colorstests-573ef-default-rtdb.firebaseio.com/');
    
    console.log('\n📋 Next Steps / الخطوات التالية:');
    console.log('1. Update application to read from Firebase instead of JSON');
    console.log('1. تحديث التطبيق ليقرأ من Firebase بدلاً من JSON');
    console.log('2. Test the admin panel with Firebase data');
    console.log('2. اختبار لوحة الإدارة مع بيانات Firebase');
    console.log('3. Enable global free access from admin settings');
    console.log('3. تفعيل الوصول المجاني العام من إعدادات المدير');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('❌ فشل النقل:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();

#!/usr/bin/env node

/**
 * Simple Migration Script: Colors.json to Firestore
 * سكريپت نقل بسيط: من colors.json إلى Firestore
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, Timestamp } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('🔄 Simple Chemical Tests Migration Script');
console.log('🔄 سكريپت نقل بيانات الاختبارات الكيميائية البسيط');
console.log('=' .repeat(60));

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('🔧 Firebase Config:');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Auth Domain:', firebaseConfig.authDomain);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to generate test ID
function generateTestId(methodName, testNumber) {
  const cleanMethodName = methodName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim();
  
  const cleanTestNumber = testNumber.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return `${cleanMethodName}-${cleanTestNumber}`;
}

// Main migration function
async function migrateTests() {
  try {
    console.log('\n📋 Step 1: Loading colors.json data...');
    console.log('📋 الخطوة 1: تحميل بيانات colors.json...');
    
    // Load colors.json
    const colorsPath = path.join(process.cwd(), 'colors.json');
    if (!fs.existsSync(colorsPath)) {
      throw new Error('colors.json file not found');
    }
    
    const colorsData = JSON.parse(fs.readFileSync(colorsPath, 'utf8'));
    console.log(`✅ Loaded ${colorsData.length} tests from colors.json`);
    console.log(`✅ تم تحميل ${colorsData.length} اختبار من colors.json`);
    
    console.log('\n📋 Step 2: Testing Firestore connection...');
    console.log('📋 الخطوة 2: اختبار اتصال Firestore...');
    
    // Test connection by trying to read from a test collection
    try {
      const testRef = collection(db, 'connection_test');
      await getDocs(testRef);
      console.log('✅ Firestore connection successful');
      console.log('✅ اتصال Firestore ناجح');
    } catch (error) {
      console.log('❌ Firestore connection failed:', error.message);
      console.log('❌ فشل اتصال Firestore:', error.message);
      
      if (error.code === 'permission-denied') {
        console.log('\n💡 Solution: Update Firestore rules to allow access');
        console.log('💡 الحل: تحديث قواعد Firestore للسماح بالوصول');
        console.log('\nAdd this rule temporarily:');
        console.log('أضف هذه القاعدة مؤقتاً:');
        console.log('allow read, write: if true;');
        return;
      }
      throw error;
    }
    
    console.log('\n📋 Step 3: Migrating tests to Firestore...');
    console.log('📋 الخطوة 3: نقل الاختبارات إلى Firestore...');
    
    const now = Timestamp.now();
    const adminId = 'migration-script';
    const adminEmail = 'migration@system.local';
    
    let migrated = 0;
    let errors = 0;
    
    for (const test of colorsData) {
      try {
        // Generate ID for the test
        const testId = test.id || generateTestId(test.method_name, test.test_number);
        
        // Prepare test data for Firestore
        const testData = {
          method_name: test.method_name || '',
          method_name_ar: test.method_name_ar || '',
          color_result: test.color_result || '',
          color_result_ar: test.color_result_ar || '',
          possible_substance: test.possible_substance || '',
          possible_substance_ar: test.possible_substance_ar || '',
          prepare: test.prepare || '',
          prepare_ar: test.prepare_ar || '',
          test_type: test.test_type || 'F/L',
          test_number: test.test_number || '',
          reference: test.reference || '',
          created_at: now,
          updated_at: now,
          created_by: adminId,
          updated_by: adminId
        };
        
        // Validate required fields
        if (!testData.method_name || !testData.test_number) {
          console.log(`❌ Skipping invalid test (missing name or number): ${JSON.stringify(test)}`);
          errors++;
          continue;
        }
        
        // Save to Firestore
        const testRef = doc(db, 'chemical_tests', testId);
        await setDoc(testRef, testData);
        
        console.log(`✅ Migrated: ${testData.method_name} (${testId})`);
        migrated++;
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error migrating test ${test.method_name}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary / ملخص النقل');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${migrated} tests`);
    console.log(`✅ تم نقل بنجاح: ${migrated} اختبار`);
    console.log(`❌ Errors: ${errors} tests`);
    console.log(`❌ أخطاء: ${errors} اختبار`);
    console.log(`📊 Total processed: ${colorsData.length} tests`);
    console.log(`📊 إجمالي المعالج: ${colorsData.length} اختبار`);
    
    if (migrated > 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('🎉 اكتمل النقل بنجاح!');
      console.log('\n💡 Next steps:');
      console.log('💡 الخطوات التالية:');
      console.log('1. Test the admin panel at /admin/tests');
      console.log('1. اختبر لوحة المدير في /admin/tests');
      console.log('2. Update Firestore rules for security');
      console.log('2. حدث قواعد Firestore للأمان');
    } else {
      console.log('\n⚠️ No tests were migrated');
      console.log('⚠️ لم يتم نقل أي اختبارات');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('❌ فشل النقل:', error);
    
    if (error.code === 'permission-denied') {
      console.log('\n💡 This is likely a Firestore rules issue.');
      console.log('💡 هذه على الأرجح مشكلة في قواعد Firestore.');
      console.log('\nPlease update your Firestore rules to:');
      console.log('يرجى تحديث قواعد Firestore إلى:');
      console.log('\nallow read, write: if true;');
    }
    
    process.exit(1);
  }
}

// Run the script
migrateTests();

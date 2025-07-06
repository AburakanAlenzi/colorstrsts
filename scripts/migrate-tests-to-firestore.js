#!/usr/bin/env node

/**
 * Migration Script: Colors.json to Firestore
 * سكريپت نقل البيانات: من colors.json إلى Firestore
 * 
 * This script migrates chemical test data from colors.json to Firebase Firestore
 * يقوم هذا السكريپت بنقل بيانات الاختبارات الكيميائية من colors.json إلى Firebase Firestore
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, Timestamp } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('🔄 Chemical Tests Migration Script');
console.log('🔄 سكريپت نقل بيانات الاختبارات الكيميائية');
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

// Validate Firebase configuration
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing Firebase environment variables:', missingVars);
  console.error('❌ متغيرات Firebase البيئية مفقودة:', missingVars);
  process.exit(1);
}

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
    console.log('📋 Step 1: Loading colors.json data...');
    console.log('📋 الخطوة 1: تحميل بيانات colors.json...');
    
    // Load colors.json
    const colorsPath = path.join(process.cwd(), 'colors.json');
    if (!fs.existsSync(colorsPath)) {
      throw new Error('colors.json file not found');
    }
    
    const colorsData = JSON.parse(fs.readFileSync(colorsPath, 'utf8'));
    console.log(`✅ Loaded ${colorsData.length} tests from colors.json`);
    console.log(`✅ تم تحميل ${colorsData.length} اختبار من colors.json`);
    
    console.log('\n📋 Step 2: Checking existing data in Firestore...');
    console.log('📋 الخطوة 2: فحص البيانات الموجودة في Firestore...');
    
    // Check existing tests in Firestore
    const testsRef = collection(db, 'chemical_tests');
    const existingSnapshot = await getDocs(testsRef);
    const existingTests = existingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`📊 Found ${existingTests.length} existing tests in Firestore`);
    console.log(`📊 تم العثور على ${existingTests.length} اختبار موجود في Firestore`);
    
    if (existingTests.length > 0) {
      console.log('\n⚠️ Warning: Firestore already contains test data');
      console.log('⚠️ تحذير: Firestore يحتوي بالفعل على بيانات اختبارات');
      console.log('This migration will skip existing tests and only add new ones.');
      console.log('هذا النقل سيتجاهل الاختبارات الموجودة ويضيف الجديدة فقط.');
    }
    
    console.log('\n📋 Step 3: Processing and migrating tests...');
    console.log('📋 الخطوة 3: معالجة ونقل الاختبارات...');
    
    const now = Timestamp.now();
    const adminId = 'migration-script';
    const adminEmail = 'migration@system.local';
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const test of colorsData) {
      try {
        // Generate ID for the test
        const testId = test.id || generateTestId(test.method_name, test.test_number);
        
        // Check if test already exists
        const existingTest = existingTests.find(t => t.id === testId);
        if (existingTest) {
          console.log(`⏭️ Skipping existing test: ${test.method_name}`);
          skipped++;
          continue;
        }
        
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
    console.log(`⏭️ Skipped (already exist): ${skipped} tests`);
    console.log(`⏭️ تم تجاهل (موجود مسبقاً): ${skipped} اختبار`);
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
      console.log('2. Verify all tests are displayed correctly');
      console.log('2. تحقق من عرض جميع الاختبارات بشكل صحيح');
      console.log('3. Test CRUD operations');
      console.log('3. اختبر عمليات الإنشاء والقراءة والتحديث والحذف');
    } else {
      console.log('\n⚠️ No new tests were migrated');
      console.log('⚠️ لم يتم نقل اختبارات جديدة');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('❌ فشل النقل:', error);
    process.exit(1);
  }
}

// Backup function
async function createBackup() {
  try {
    console.log('💾 Creating backup of existing Firestore data...');
    console.log('💾 إنشاء نسخة احتياطية من بيانات Firestore الموجودة...');
    
    const testsRef = collection(db, 'chemical_tests');
    const snapshot = await getDocs(testsRef);
    
    if (snapshot.empty) {
      console.log('📝 No existing data to backup');
      console.log('📝 لا توجد بيانات موجودة للنسخ الاحتياطي');
      return;
    }
    
    const backupData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const backupPath = path.join(process.cwd(), `firestore-backup-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Backup created: ${backupPath}`);
    console.log(`✅ تم إنشاء النسخة الاحتياطية: ${backupPath}`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    console.error('❌ فشل النسخ الاحتياطي:', error);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const shouldBackup = !args.includes('--no-backup');
  const forceOverwrite = args.includes('--force');
  
  try {
    if (shouldBackup) {
      await createBackup();
      console.log('');
    }
    
    if (!forceOverwrite) {
      console.log('⚠️ This will migrate data from colors.json to Firestore');
      console.log('⚠️ سيتم نقل البيانات من colors.json إلى Firestore');
      console.log('Use --force flag to skip this confirmation');
      console.log('استخدم --force لتجاهل هذا التأكيد');
      console.log('');
    }
    
    await migrateTests();
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    console.error('❌ فشل السكريپت:', error);
    process.exit(1);
  }
}

// Run the script
main();

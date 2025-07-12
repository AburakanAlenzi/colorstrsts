#!/usr/bin/env node

/**
 * Simple Migration Script for Firebase Realtime Database
 * سكريبت نقل مبسط لـ Firebase Realtime Database
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 Simple Firebase Migration Tool');
console.log('أداة نقل Firebase المبسطة 🔥');
console.log('================================\n');

// Default chemical tests data
const defaultChemicalTests = [
  {
    id: 'marquis-test',
    method_name: 'Marquis Test',
    method_name_ar: 'اختبار ماركيز',
    color_result: 'Purple/Black',
    color_result_ar: 'بنفسجي/أسود',
    possible_substance: 'MDMA/Amphetamines',
    possible_substance_ar: 'إم دي إم إيه/أمفيتامينات',
    prepare: 'Add 2-3 drops of reagent to sample',
    prepare_ar: 'أضف 2-3 قطرات من الكاشف إلى العينة',
    description: 'Primary screening test for MDMA and amphetamines',
    description_ar: 'اختبار فحص أولي للإم دي إم إيه والأمفيتامينات',
    test_type: 'Presumptive',
    test_number: '1',
    reference: 'DEA Guidelines',
    category: 'basic',
    safety_level: 'medium',
    reagents: ['Marquis Reagent'],
    expected_time: '2-3 minutes'
  },
  {
    id: 'mecke-test',
    method_name: 'Mecke Test',
    method_name_ar: 'اختبار ميك',
    color_result: 'Blue/Green',
    color_result_ar: 'أزرق/أخضر',
    possible_substance: 'Opiates',
    possible_substance_ar: 'مواد أفيونية',
    prepare: 'Add 2-3 drops of reagent to sample',
    prepare_ar: 'أضف 2-3 قطرات من الكاشف إلى العينة',
    description: 'Screening test for opiates and related compounds',
    description_ar: 'اختبار فحص للمواد الأفيونية والمركبات ذات الصلة',
    test_type: 'Presumptive',
    test_number: '2',
    reference: 'UNODC Manual',
    category: 'basic',
    safety_level: 'medium',
    reagents: ['Mecke Reagent'],
    expected_time: '2-3 minutes'
  },
  {
    id: 'mandelin-test',
    method_name: 'Mandelin Test',
    method_name_ar: 'اختبار مانديلين',
    color_result: 'Orange/Brown',
    color_result_ar: 'برتقالي/بني',
    possible_substance: 'MDMA/Ketamine',
    possible_substance_ar: 'إم دي إم إيه/كيتامين',
    prepare: 'Add 2-3 drops of reagent to sample',
    prepare_ar: 'أضف 2-3 قطرات من الكاشف إلى العينة',
    description: 'Secondary test for MDMA and ketamine identification',
    description_ar: 'اختبار ثانوي لتحديد الإم دي إم إيه والكيتامين',
    test_type: 'Confirmatory',
    test_number: '3',
    reference: 'Forensic Guidelines',
    category: 'intermediate',
    safety_level: 'medium',
    reagents: ['Mandelin Reagent'],
    expected_time: '3-5 minutes'
  },
  {
    id: 'ehrlich-test',
    method_name: 'Ehrlich Test',
    method_name_ar: 'اختبار إيرليش',
    color_result: 'Purple/Pink',
    color_result_ar: 'بنفسجي/وردي',
    possible_substance: 'LSD/Indoles',
    possible_substance_ar: 'إل إس دي/إندولات',
    prepare: 'Add reagent and observe color change',
    prepare_ar: 'أضف الكاشف ولاحظ تغير اللون',
    description: 'Specific test for LSD and indole compounds',
    description_ar: 'اختبار محدد لمركبات الإل إس دي والإندول',
    test_type: 'Specific',
    test_number: '4',
    reference: 'Analytical Chemistry',
    category: 'advanced',
    safety_level: 'high',
    reagents: ['Ehrlich Reagent'],
    expected_time: '5-10 minutes'
  },
  {
    id: 'fast-blue-b-test',
    method_name: 'Fast Blue B Salt Test',
    method_name_ar: 'اختبار الأزرق السريع ب',
    color_result: 'Orange/Red',
    color_result_ar: 'برتقالي/أحمر',
    possible_substance: 'THC/Cannabis',
    possible_substance_ar: 'تي إتش سي/حشيش',
    prepare: 'Mix sample with Fast Blue B salt solution',
    prepare_ar: 'اخلط العينة مع محلول ملح الأزرق السريع ب',
    description: 'Specific test for THC and cannabis compounds',
    description_ar: 'اختبار محدد لمركبات التي إتش سي والحشيش',
    test_type: 'Confirmatory',
    test_number: '13',
    reference: 'Scientific Literature',
    category: 'advanced',
    safety_level: 'high',
    reagents: ['Fast Blue B Salt', 'Sodium Hydroxide'],
    expected_time: '5-10 minutes'
  }
];

// Default subscription settings
const defaultSubscriptionSettings = {
  freeTestsEnabled: true,
  freeTestsCount: 5,
  premiumRequired: true,
  globalFreeAccess: false,
  specificPremiumTests: [],
  lastUpdated: new Date().toISOString()
};

async function migrateData() {
  try {
    console.log('📦 Preparing data for Firebase migration...');
    console.log('تحضير البيانات للنقل إلى Firebase...\n');

    // Try to load existing data from JSON files
    let chemicalTests = defaultChemicalTests;
    
    const jsonPath = path.join(__dirname, '..', 'src', 'data', 'chemical-tests.json');
    if (fs.existsSync(jsonPath)) {
      try {
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          chemicalTests = jsonData;
          console.log(`✅ Loaded ${jsonData.length} tests from chemical-tests.json`);
        }
      } catch (error) {
        console.log('⚠️ Could not load from JSON, using default data');
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`ملخص النقل:\n`);
    console.log(`- Chemical Tests: ${chemicalTests.length} items`);
    console.log(`- الاختبارات الكيميائية: ${chemicalTests.length} عنصر`);
    console.log(`- Subscription Settings: 1 configuration`);
    console.log(`- إعدادات الاشتراكات: 1 تكوين\n`);

    // Save data to a temporary file for manual upload
    const outputData = {
      chemical_tests: chemicalTests,
      subscription_settings: defaultSubscriptionSettings,
      migration_info: {
        migrated_at: new Date().toISOString(),
        version: '1.0.0',
        source: 'chemical-tests.json + defaults'
      }
    };

    const outputPath = path.join(__dirname, 'firebase-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

    console.log('✅ Migration data prepared successfully!');
    console.log('تم تحضير بيانات النقل بنجاح!');
    console.log(`📁 Data saved to: ${outputPath}`);
    console.log(`البيانات محفوظة في: ${outputPath}\n`);

    console.log('🔥 Next Steps / الخطوات التالية:');
    console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
    console.log('2. Select your project: colorstests-573ef');
    console.log('3. Go to Realtime Database');
    console.log('4. Import the generated firebase-data.json file');
    console.log('5. Or manually copy the data structure\n');

    console.log('🎯 Firebase Database Structure:');
    console.log('هيكل قاعدة بيانات Firebase:');
    console.log(JSON.stringify({
      chemical_tests: `[${chemicalTests.length} items]`,
      subscription_settings: defaultSubscriptionSettings
    }, null, 2));

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('فشل النقل:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();

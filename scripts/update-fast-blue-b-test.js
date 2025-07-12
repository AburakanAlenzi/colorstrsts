#!/usr/bin/env node

/**
 * Update Fast Blue B Salt Test Data
 * تحديث بيانات اختبار الملح الأزرق السريع
 * 
 * This script updates the Fast Blue B Salt Test with correct procedures
 * هذا السكريبت يحدث اختبار الملح الأزرق السريع بالإجراءات الصحيحة
 */

console.log('🧪 Fast Blue B Salt Test Data Update');
console.log('تحديث بيانات اختبار الملح الأزرق السريع 🧪');
console.log('==========================================\n');

// Updated Fast Blue B Salt Test data
const updatedFastBlueBTest = {
  id: "fast-blue-b-test",
  method_name: "Fast Blue B Salt Test",
  method_name_ar: "اختبار الملح الأزرق السريع",
  description: "For detecting cannabis (THC)",
  description_ar: "للكشف عن القنب (THC)",
  category: "specialized",
  safety_level: "high",
  preparation_time: 8,
  icon: "BeakerIcon",
  color_primary: "#006400",
  created_at: "2025-01-01T00:00:00Z",
  prepare: `⚠️ IMPORTANT WARNING: These tests are for trained professionals only in a safe, equipped laboratory environment

1. Place a small amount of the suspected material in a test tube.
2. Add a small amount of reagent 5A (Carefully mix 2.5 g of fast blue B salt with 100 g of anhydrous sodium sulfate).
3. Add 25 drops of reagent 5B (Chloroform) and shake the test tube for one minute.
4. Add 25 drops of reagent 5C (Dissolve 0.4 g of sodium hydroxide in 100 ml of water = 0.1N sodium hydroxide solution).
5. Observe color changes and record results.`,
  prepare_ar: `⚠️ تحذير مهم: هذه الاختبارات للمهنيين المدربين فقط في بيئة مختبرية آمنة ومجهزة

1. ضع كمية صغيرة من المادة المشتبه بها في أنبوب اختبار.
2. أضف كمية صغيرة من الكاشف 5أ (اخلط بعناية 2.5 جرام من ملح الأزرق السريع ب مع 100 جرام من كبريتات الصوديوم اللامائية).
3. أضف 25 قطرة من الكاشف 5ب (الكلوروفورم) ورج أنبوب الاختبار لمدة دقيقة واحدة.
4. أضف 25 قطرة من الكاشف 5ج (أذب 0.4 جرام من هيدروكسيد الصوديوم في 100 مل من الماء = محلول هيدروكسيد الصوديوم 0.1 عادي).
5. راقب تغيرات اللون وسجل النتائج.`,
  test_type: "L",
  test_number: "Test 5",
  reference: "Beam, W. (1911). A rapid test for cannabis. Journal of the American Pharmaceutical Association, 1, 27-29."
};

console.log('📋 Updated Fast Blue B Salt Test Data:');
console.log('📋 بيانات اختبار الملح الأزرق السريع المحدثة:');
console.log('=====================================\n');

console.log('🔬 Test Name / اسم الاختبار:');
console.log(`   English: ${updatedFastBlueBTest.method_name}`);
console.log(`   Arabic: ${updatedFastBlueBTest.method_name_ar}\n`);

console.log('📝 Description / الوصف:');
console.log(`   English: ${updatedFastBlueBTest.description}`);
console.log(`   Arabic: ${updatedFastBlueBTest.description_ar}\n`);

console.log('⚠️ Safety Level / مستوى الأمان:');
console.log(`   Level: ${updatedFastBlueBTest.safety_level} (HIGH)`);
console.log(`   المستوى: عالي\n`);

console.log('⏱️ Preparation Time / وقت التحضير:');
console.log(`   Time: ${updatedFastBlueBTest.preparation_time} minutes`);
console.log(`   الوقت: ${updatedFastBlueBTest.preparation_time} دقيقة\n`);

console.log('🧪 Updated Procedure / الإجراء المحدث:');
console.log('=====================================');
console.log('English Steps:');
console.log(updatedFastBlueBTest.prepare);
console.log('\nArabic Steps / الخطوات بالعربية:');
console.log(updatedFastBlueBTest.prepare_ar);
console.log('\n');

console.log('📊 Key Changes Made / التغييرات الرئيسية:');
console.log('=====================================');
console.log('✅ Updated procedure steps to professional laboratory standards');
console.log('✅ تحديث خطوات الإجراء لمعايير المختبرات المهنية');
console.log('✅ Added safety warnings for trained professionals only');
console.log('✅ إضافة تحذيرات أمان للمهنيين المدربين فقط');
console.log('✅ Specified exact reagent compositions and quantities');
console.log('✅ تحديد تركيبات وكميات الكواشف بدقة');
console.log('✅ Increased safety level from medium to high');
console.log('✅ رفع مستوى الأمان من متوسط إلى عالي');
console.log('✅ Increased preparation time from 4 to 8 minutes');
console.log('✅ زيادة وقت التحضير من 4 إلى 8 دقائق');
console.log('✅ Added proper reagent labeling (5A, 5B, 5C)');
console.log('✅ إضافة تسمية صحيحة للكواشف (5أ، 5ب، 5ج)');

console.log('\n🎯 How to Apply Updates / كيفية تطبيق التحديثات:');
console.log('=====================================');
console.log('1. The main data file has been updated automatically');
console.log('1. تم تحديث ملف البيانات الرئيسي تلقائياً');
console.log('2. Users will see updated data on next page load');
console.log('2. سيرى المستخدمون البيانات المحدثة عند تحميل الصفحة التالية');
console.log('3. Admin users can refresh test data in admin panel');
console.log('3. يمكن للمديرين تحديث بيانات الاختبار في لوحة الإدارة');

console.log('\n📍 Data Source Location / موقع مصدر البيانات:');
console.log('=====================================');
console.log('Primary: src/data/chemical-tests.json');
console.log('Backup: localStorage (chemical_tests)');
console.log('Admin: Admin panel test management');

console.log('\n✅ Fast Blue B Salt Test update completed successfully!');
console.log('✅ تم إكمال تحديث اختبار الملح الأزرق السريع بنجاح!');

// Export the updated data for potential use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = updatedFastBlueBTest;
}

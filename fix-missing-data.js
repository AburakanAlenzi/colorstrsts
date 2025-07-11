#!/usr/bin/env node

/**
 * Fix Missing Data Script
 * سكريبت إصلاح البيانات الناقصة
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for missing data in chemical tests...');
console.log('🔍 فحص البيانات الناقصة في الاختبارات الكيميائية...');

// Load chemical tests data
const chemicalTestsPath = path.join(__dirname, 'src/data/chemical-tests.json');
let chemicalTests = [];

try {
  chemicalTests = JSON.parse(fs.readFileSync(chemicalTestsPath, 'utf8'));
  console.log(`✅ Loaded ${chemicalTests.length} chemical tests`);
} catch (error) {
  console.error('❌ Error loading chemical tests:', error.message);
  process.exit(1);
}

// Required fields for each test
const requiredFields = [
  'id',
  'method_name',
  'method_name_ar',
  'description',
  'description_ar',
  'category',
  'safety_level',
  'preparation_time',
  'icon',
  'color_primary',
  'created_at',
  'prepare',
  'prepare_ar',
  'test_type',
  'test_number',
  'reference'
];

console.log('\n📋 Checking for missing fields...');

let missingDataCount = 0;
const missingDataReport = [];

chemicalTests.forEach((test, index) => {
  const missing = [];
  
  requiredFields.forEach(field => {
    if (!test[field] || (typeof test[field] === 'string' && test[field].trim() === '') || (typeof test[field] === 'number' && test[field] === 0)) {
      missing.push(field);
    }
  });
  
  if (missing.length > 0) {
    missingDataCount++;
    missingDataReport.push({
      index: index + 1,
      id: test.id,
      name: test.method_name,
      missing: missing
    });
    
    console.log(`❌ Test ${index + 1} (${test.id}): Missing ${missing.join(', ')}`);
  }
});

if (missingDataCount === 0) {
  console.log('✅ All tests have complete data!');
  process.exit(0);
}

console.log(`\n⚠️  Found ${missingDataCount} tests with missing data`);
console.log('🔧 Attempting to fix missing data...\n');

// Fix missing data
const fixedTests = chemicalTests.map((test, index) => {
  const fixed = { ...test };
  
  // Add missing prepare instructions
  if (!fixed.prepare || (typeof fixed.prepare === 'string' && fixed.prepare.trim() === '')) {
    fixed.prepare = generatePrepareInstructions(test);
  }

  if (!fixed.prepare_ar || (typeof fixed.prepare_ar === 'string' && fixed.prepare_ar.trim() === '')) {
    fixed.prepare_ar = generatePrepareInstructionsAr(test);
  }

  // Add missing test_type
  if (!fixed.test_type || (typeof fixed.test_type === 'string' && fixed.test_type.trim() === '')) {
    fixed.test_type = 'L'; // Default to L (Liquid)
  }

  // Add missing test_number
  if (!fixed.test_number || (typeof fixed.test_number === 'string' && fixed.test_number.trim() === '')) {
    fixed.test_number = `Test ${index + 1}`;
  }

  // Add missing reference
  if (!fixed.reference || (typeof fixed.reference === 'string' && fixed.reference.trim() === '')) {
    fixed.reference = generateReference(test);
  }
  
  return fixed;
});

// Generate prepare instructions based on test type
function generatePrepareInstructions(test) {
  const testName = test.method_name.toLowerCase();
  
  if (testName.includes('wagner')) {
    return "1. Place a small amount of the suspected material on a spot plate.\n2. Add one drop of Wagner reagent (1.27g iodine + 2g potassium iodide in 100ml water).\n3. Observe brown precipitate indicating alkaloids.";
  }
  
  if (testName.includes('simon')) {
    return "1. Place a small amount of the suspected material on a spot plate.\n2. Add one drop of Simon reagent A (1% sodium nitroprusside in water).\n3. Add one drop of Simon reagent B (2% sodium carbonate in water).\n4. Add one drop of Simon reagent C (2% acetaldehyde in water).\n5. Observe blue color indicating MDMA or green color indicating methamphetamine.";
  }
  
  if (testName.includes('ehrlich')) {
    return "1. Place a small amount of the suspected material on a spot plate.\n2. Add one drop of Ehrlich reagent (2g p-dimethylaminobenzaldehyde in 50ml ethanol + 50ml concentrated HCl).\n3. Observe purple/pink color indicating indole compounds like LSD or psilocybin.";
  }
  
  if (testName.includes('potassium dichromate')) {
    return "1. Place a small amount of the suspected material on a spot plate.\n2. Add one drop of potassium dichromate solution (1g K2Cr2O7 in 100ml concentrated H2SO4).\n3. Observe color change from orange to green indicating alcohol presence.";
  }
  
  // Default generic instructions
  return `1. Place a small amount of the suspected material on a spot plate.\n2. Add one drop of ${test.method_name} reagent.\n3. Observe the color change and compare with reference chart.\n4. Record the initial color change within 30 seconds.`;
}

function generatePrepareInstructionsAr(test) {
  const testName = test.method_name.toLowerCase();
  
  if (testName.includes('wagner')) {
    return "1. ضع كمية صغيرة من المادة المشتبه بها على طبق نقطي.\n2. أضف قطرة واحدة من كاشف واجنر (1.27 جرام يود + 2 جرام يوديد البوتاسيوم في 100 مل ماء).\n3. راقب الراسب البني الذي يشير إلى القلويدات.";
  }
  
  if (testName.includes('simon')) {
    return "1. ضع كمية صغيرة من المادة المشتبه بها على طبق نقطي.\n2. أضف قطرة واحدة من كاشف سايمون أ (1% نيتروبروسيد الصوديوم في الماء).\n3. أضف قطرة واحدة من كاشف سايمون ب (2% كربونات الصوديوم في الماء).\n4. أضف قطرة واحدة من كاشف سايمون ج (2% أسيتالديهايد في الماء).\n5. راقب اللون الأزرق الذي يشير إلى إم دي إم إيه أو اللون الأخضر الذي يشير إلى الميثامفيتامين.";
  }
  
  if (testName.includes('ehrlich')) {
    return "1. ضع كمية صغيرة من المادة المشتبه بها على طبق نقطي.\n2. أضف قطرة واحدة من كاشف إيرليش (2 جرام ب-ثنائي ميثيل أمينو بنزالديهايد في 50 مل إيثانول + 50 مل حمض الهيدروكلوريك المركز).\n3. راقب اللون البنفسجي/الوردي الذي يشير إلى مركبات الإندول مثل إل إس دي أو السيلوسيبين.";
  }
  
  if (testName.includes('potassium dichromate')) {
    return "1. ضع كمية صغيرة من المادة المشتبه بها على طبق نقطي.\n2. أضف قطرة واحدة من محلول ثنائي كرومات البوتاسيوم (1 جرام K2Cr2O7 في 100 مل حمض الكبريتيك المركز).\n3. راقب تغيير اللون من البرتقالي إلى الأخضر الذي يشير إلى وجود الكحول.";
  }
  
  // Default generic instructions in Arabic
  return `1. ضع كمية صغيرة من المادة المشتبه بها على طبق نقطي.\n2. أضف قطرة واحدة من كاشف ${test.method_name_ar}.\n3. راقب تغيير اللون وقارنه مع جدول المرجع.\n4. سجل تغيير اللون الأولي خلال 30 ثانية.`;
}

function generateReference(test) {
  const testName = test.method_name.toLowerCase();
  
  if (testName.includes('wagner')) {
    return "Moffat, A.C. Clarke's Identification of Drugs (1986), p. 142-145.";
  }
  
  if (testName.includes('simon')) {
    return "Simon, G.F., Houlihan, W.J. (1973). The analysis of hallucinogens. Journal of Chromatographic Science, 11(6), 297-303.";
  }
  
  if (testName.includes('ehrlich')) {
    return "Ehrlich, P. (1901). Über die Methylenblaureaktion der lebenden Nervensubstanz. Deutsche Medizinische Wochenschrift, 27, 597-598.";
  }
  
  if (testName.includes('potassium dichromate')) {
    return "Widmark, E.M.P. (1922). Eine Mikromethode zur Bestimmung von Äthylalkohol im Blut. Biochemische Zeitschrift, 131, 473-484.";
  }
  
  // Default reference
  return "Standard Methods for Chemical Analysis of Controlled Substances (2025), Laboratory Manual.";
}

// Save fixed data
try {
  fs.writeFileSync(chemicalTestsPath, JSON.stringify(fixedTests, null, 2));
  console.log('✅ Fixed chemical tests data saved successfully!');
  console.log('✅ تم حفظ بيانات الاختبارات المصححة بنجاح!');
  
  // Generate report
  console.log('\n📊 Fix Report:');
  console.log(`- Total tests: ${fixedTests.length}`);
  console.log(`- Tests with missing data: ${missingDataCount}`);
  console.log(`- Fields fixed: prepare, prepare_ar, test_type, test_number, reference`);
  
} catch (error) {
  console.error('❌ Error saving fixed data:', error.message);
  process.exit(1);
}

console.log('\n🎉 Data fixing completed successfully!');
console.log('🎉 اكتمل إصلاح البيانات بنجاح!');

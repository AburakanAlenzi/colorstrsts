#!/usr/bin/env node

/**
 * Validate Tests Data Script
 * سكريبت التحقق من بيانات الاختبارات
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating chemical tests data...');
console.log('🔍 التحقق من بيانات الاختبارات الكيميائية...');

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

console.log('\n📋 Validating all tests...');

let validTests = 0;
let invalidTests = 0;
const validationReport = [];

chemicalTests.forEach((test, index) => {
  const missing = [];
  const issues = [];
  
  // Check required fields
  requiredFields.forEach(field => {
    if (!test[field]) {
      missing.push(field);
    } else if (typeof test[field] === 'string' && test[field].trim() === '') {
      missing.push(field);
    }
  });
  
  // Additional validations
  if (test.color_primary && !/^#[0-9A-Fa-f]{6}$/.test(test.color_primary)) {
    issues.push('Invalid color_primary format (should be #RRGGBB)');
  }
  
  if (test.preparation_time && (typeof test.preparation_time !== 'number' || test.preparation_time <= 0)) {
    issues.push('Invalid preparation_time (should be positive number)');
  }
  
  if (test.safety_level && !['low', 'medium', 'high', 'extreme'].includes(test.safety_level)) {
    issues.push('Invalid safety_level (should be: low, medium, high, extreme)');
  }
  
  if (test.category && !['basic', 'advanced', 'specialized'].includes(test.category)) {
    issues.push('Invalid category (should be: basic, advanced, specialized)');
  }
  
  if (missing.length === 0 && issues.length === 0) {
    validTests++;
    console.log(`✅ Test ${index + 1} (${test.id}): Valid`);
  } else {
    invalidTests++;
    console.log(`❌ Test ${index + 1} (${test.id}): Issues found`);
    if (missing.length > 0) {
      console.log(`   Missing: ${missing.join(', ')}`);
    }
    if (issues.length > 0) {
      console.log(`   Issues: ${issues.join(', ')}`);
    }
    
    validationReport.push({
      index: index + 1,
      id: test.id,
      name: test.method_name,
      missing: missing,
      issues: issues
    });
  }
});

console.log('\n📊 Validation Summary:');
console.log(`✅ Valid tests: ${validTests}`);
console.log(`❌ Invalid tests: ${invalidTests}`);
console.log(`📈 Completion rate: ${Math.round((validTests / chemicalTests.length) * 100)}%`);

if (invalidTests === 0) {
  console.log('\n🎉 All tests have complete and valid data!');
  console.log('🎉 جميع الاختبارات تحتوي على بيانات كاملة وصحيحة!');
} else {
  console.log('\n⚠️ Some tests need attention:');
  validationReport.forEach(report => {
    console.log(`\n📝 ${report.name} (${report.id}):`);
    if (report.missing.length > 0) {
      console.log(`   Missing fields: ${report.missing.join(', ')}`);
    }
    if (report.issues.length > 0) {
      console.log(`   Issues: ${report.issues.join(', ')}`);
    }
  });
}

// Check for duplicate IDs
console.log('\n🔍 Checking for duplicate IDs...');
const ids = chemicalTests.map(test => test.id);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

if (duplicateIds.length > 0) {
  console.log(`❌ Found duplicate IDs: ${duplicateIds.join(', ')}`);
} else {
  console.log('✅ No duplicate IDs found');
}

// Check for duplicate test numbers
console.log('\n🔍 Checking for duplicate test numbers...');
const testNumbers = chemicalTests.map(test => test.test_number).filter(Boolean);
const duplicateNumbers = testNumbers.filter((num, index) => testNumbers.indexOf(num) !== index);

if (duplicateNumbers.length > 0) {
  console.log(`❌ Found duplicate test numbers: ${duplicateNumbers.join(', ')}`);
} else {
  console.log('✅ No duplicate test numbers found');
}

// Generate statistics
console.log('\n📊 Data Statistics:');
console.log(`Total tests: ${chemicalTests.length}`);
console.log(`Categories: ${[...new Set(chemicalTests.map(t => t.category))].join(', ')}`);
console.log(`Safety levels: ${[...new Set(chemicalTests.map(t => t.safety_level))].join(', ')}`);
console.log(`Average preparation time: ${Math.round(chemicalTests.reduce((sum, t) => sum + (t.preparation_time || 0), 0) / chemicalTests.length)} minutes`);

console.log('\n✨ Validation completed!');
console.log('✨ اكتمل التحقق من البيانات!');

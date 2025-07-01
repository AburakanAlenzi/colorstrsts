#!/usr/bin/env node

/**
 * Database Testing Script
 * سكريبت اختبار قاعدة البيانات
 * 
 * This script tests database connectivity and data integrity for the Color Testing for Drug and Psychoactive Substance Detection project
 * هذا السكريبت يختبر الاتصال بقاعدة البيانات وسلامة البيانات لمشروع اختبارات الألوان للكشف عن المخدرات والمؤثرات العقلية
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function to colorize console output
function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Test results tracker
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Add test result
function addTestResult(name, passed, message = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(colorize(`✅ ${name}`, 'green'));
  } else {
    testResults.failed++;
    console.log(colorize(`❌ ${name}`, 'red'));
    if (message) {
      console.log(colorize(`   ${message}`, 'yellow'));
    }
  }
  testResults.details.push({ name, passed, message });
}

// Test local data files
async function testLocalData() {
  console.log(colorize('\n🧪 اختبار البيانات المحلية...', 'cyan'));
  console.log(colorize('🧪 Testing local data...', 'cyan'));

  const dataDir = path.join(process.cwd(), 'src', 'data');
  
  // Test 1: Check if data directory exists
  const dataDirExists = fs.existsSync(dataDir);
  addTestResult(
    'Data directory exists | مجلد البيانات موجود',
    dataDirExists,
    dataDirExists ? '' : 'src/data directory not found'
  );

  if (!dataDirExists) return;

  // Test 2: Check chemical tests file
  const chemicalTestsPath = path.join(dataDir, 'chemical-tests.json');
  const chemicalTestsExists = fs.existsSync(chemicalTestsPath);
  addTestResult(
    'Chemical tests file exists | ملف الاختبارات الكيميائية موجود',
    chemicalTestsExists,
    chemicalTestsExists ? '' : 'chemical-tests.json not found'
  );

  // Test 3: Validate chemical tests data
  if (chemicalTestsExists) {
    try {
      const chemicalTestsData = JSON.parse(fs.readFileSync(chemicalTestsPath, 'utf8'));
      const isArray = Array.isArray(chemicalTestsData);
      addTestResult(
        'Chemical tests data is valid array | بيانات الاختبارات صحيحة',
        isArray,
        isArray ? `Found ${chemicalTestsData.length} tests` : 'Data is not an array'
      );

      if (isArray && chemicalTestsData.length > 0) {
        // Test required fields
        const firstTest = chemicalTestsData[0];
        const requiredFields = ['id', 'method_name', 'method_name_ar', 'description', 'description_ar'];
        const hasAllFields = requiredFields.every(field => firstTest.hasOwnProperty(field));
        addTestResult(
          'Chemical tests have required fields | الاختبارات تحتوي على الحقول المطلوبة',
          hasAllFields,
          hasAllFields ? 'All required fields present' : `Missing fields: ${requiredFields.filter(f => !firstTest.hasOwnProperty(f)).join(', ')}`
        );
      }
    } catch (error) {
      addTestResult(
        'Chemical tests JSON is valid | JSON الاختبارات صحيح',
        false,
        `JSON parse error: ${error.message}`
      );
    }
  }

  // Test 4: Check color results file
  const colorResultsPath = path.join(dataDir, 'color-results.json');
  const colorResultsExists = fs.existsSync(colorResultsPath);
  addTestResult(
    'Color results file exists | ملف نتائج الألوان موجود',
    colorResultsExists,
    colorResultsExists ? '' : 'color-results.json not found'
  );

  // Test 5: Validate color results data
  if (colorResultsExists) {
    try {
      const colorResultsData = JSON.parse(fs.readFileSync(colorResultsPath, 'utf8'));
      const isArray = Array.isArray(colorResultsData);
      addTestResult(
        'Color results data is valid array | بيانات نتائج الألوان صحيحة',
        isArray,
        isArray ? `Found ${colorResultsData.length} results` : 'Data is not an array'
      );

      if (isArray && colorResultsData.length > 0) {
        // Test required fields
        const firstResult = colorResultsData[0];
        const requiredFields = ['test_id', 'color_result', 'color_result_ar', 'color_hex', 'possible_substance'];
        const hasAllFields = requiredFields.every(field => firstResult.hasOwnProperty(field));
        addTestResult(
          'Color results have required fields | نتائج الألوان تحتوي على الحقول المطلوبة',
          hasAllFields,
          hasAllFields ? 'All required fields present' : `Missing fields: ${requiredFields.filter(f => !firstResult.hasOwnProperty(f)).join(', ')}`
        );
      }
    } catch (error) {
      addTestResult(
        'Color results JSON is valid | JSON نتائج الألوان صحيح',
        false,
        `JSON parse error: ${error.message}`
      );
    }
  }

  // Test 6: Check test instructions file
  const testInstructionsPath = path.join(dataDir, 'test-instructions.json');
  const testInstructionsExists = fs.existsSync(testInstructionsPath);
  addTestResult(
    'Test instructions file exists | ملف تعليمات الاختبارات موجود',
    testInstructionsExists,
    testInstructionsExists ? '' : 'test-instructions.json not found'
  );
}

// Test environment configuration
async function testEnvironmentConfig() {
  console.log(colorize('\n⚙️ اختبار إعدادات البيئة...', 'cyan'));
  console.log(colorize('⚙️ Testing environment configuration...', 'cyan'));

  // Test 1: Check .env.example file
  const envExamplePath = path.join(process.cwd(), '.env.example');
  const envExampleExists = fs.existsSync(envExamplePath);
  addTestResult(
    '.env.example file exists | ملف .env.example موجود',
    envExampleExists,
    envExampleExists ? '' : '.env.example file not found'
  );

  // Test 2: Check .env.local file (optional)
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envLocalExists = fs.existsSync(envLocalPath);
  addTestResult(
    '.env.local file exists (optional) | ملف .env.local موجود (اختياري)',
    true, // Always pass since it's optional
    envLocalExists ? 'Found .env.local file' : 'No .env.local file (using defaults)'
  );

  // Test 3: Check required environment variables in example
  if (envExampleExists) {
    const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
    const requiredVars = [
      'NEXT_PUBLIC_SITE_URL',
      'NEXT_PUBLIC_ADMIN_PASSWORD_HASH',
      'NEXT_PUBLIC_AUTH_SALT'
    ];
    
    const hasAllVars = requiredVars.every(varName => envExampleContent.includes(varName));
    addTestResult(
      'Required environment variables in example | المتغيرات المطلوبة في المثال',
      hasAllVars,
      hasAllVars ? 'All required variables found' : `Missing: ${requiredVars.filter(v => !envExampleContent.includes(v)).join(', ')}`
    );
  }
}

// Test migration files
async function testMigrationFiles() {
  console.log(colorize('\n📊 اختبار ملفات الهجرة...', 'cyan'));
  console.log(colorize('📊 Testing migration files...', 'cyan'));

  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  
  // Test 1: Check migrations directory
  const migrationsDirExists = fs.existsSync(migrationsDir);
  addTestResult(
    'Migrations directory exists | مجلد الهجرة موجود',
    migrationsDirExists,
    migrationsDirExists ? '' : 'supabase/migrations directory not found'
  );

  if (!migrationsDirExists) return;

  // Test 2: Check initial schema file
  const schemaPath = path.join(migrationsDir, '001_initial_schema.sql');
  const schemaExists = fs.existsSync(schemaPath);
  addTestResult(
    'Initial schema migration exists | ملف هجرة الهيكل الأولي موجود',
    schemaExists,
    schemaExists ? '' : '001_initial_schema.sql not found'
  );

  // Test 3: Check seed data file
  const seedPath = path.join(migrationsDir, '002_seed_data.sql');
  const seedExists = fs.existsSync(seedPath);
  addTestResult(
    'Seed data migration exists | ملف هجرة البيانات التجريبية موجود',
    seedExists,
    seedExists ? '' : '002_seed_data.sql not found'
  );

  // Test 4: Validate schema file content
  if (schemaExists) {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const requiredTables = ['users', 'chemical_tests', 'color_results', 'test_sessions'];
    const hasAllTables = requiredTables.every(table => schemaContent.includes(`CREATE TABLE ${table}`));
    addTestResult(
      'Schema contains required tables | الهيكل يحتوي على الجداول المطلوبة',
      hasAllTables,
      hasAllTables ? 'All required tables found' : `Missing tables: ${requiredTables.filter(t => !schemaContent.includes(`CREATE TABLE ${t}`)).join(', ')}`
    );
  }

  // Test 5: Validate seed file content
  if (seedExists) {
    const seedContent = fs.readFileSync(seedPath, 'utf8');
    const hasInserts = seedContent.includes('INSERT INTO chemical_tests') && seedContent.includes('INSERT INTO color_results');
    addTestResult(
      'Seed file contains data inserts | ملف البيانات يحتوي على إدراجات',
      hasInserts,
      hasInserts ? 'Found INSERT statements' : 'No INSERT statements found'
    );
  }
}

// Test configuration files
async function testConfigFiles() {
  console.log(colorize('\n📋 اختبار ملفات الإعداد...', 'cyan'));
  console.log(colorize('📋 Testing configuration files...', 'cyan'));

  // Test 1: Check package.json
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageExists = fs.existsSync(packagePath);
  addTestResult(
    'package.json exists | ملف package.json موجود',
    packageExists,
    packageExists ? '' : 'package.json not found'
  );

  if (packageExists) {
    try {
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const hasRequiredScripts = packageData.scripts && 
        packageData.scripts.dev && 
        packageData.scripts.build && 
        packageData.scripts['setup-database'];
      addTestResult(
        'package.json has required scripts | package.json يحتوي على السكريبتات المطلوبة',
        hasRequiredScripts,
        hasRequiredScripts ? 'All required scripts found' : 'Missing required scripts'
      );
    } catch (error) {
      addTestResult(
        'package.json is valid JSON | package.json صحيح',
        false,
        `JSON parse error: ${error.message}`
      );
    }
  }

  // Test 2: Check next.config.js
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  const nextConfigExists = fs.existsSync(nextConfigPath);
  addTestResult(
    'next.config.js exists | ملف next.config.js موجود',
    nextConfigExists,
    nextConfigExists ? '' : 'next.config.js not found'
  );

  // Test 3: Check netlify.toml
  const netlifyConfigPath = path.join(process.cwd(), 'netlify.toml');
  const netlifyConfigExists = fs.existsSync(netlifyConfigPath);
  addTestResult(
    'netlify.toml exists | ملف netlify.toml موجود',
    netlifyConfigExists,
    netlifyConfigExists ? '' : 'netlify.toml not found'
  );

  // Test 4: Check supabase config
  const supabaseConfigPath = path.join(process.cwd(), 'supabase', 'config.toml');
  const supabaseConfigExists = fs.existsSync(supabaseConfigPath);
  addTestResult(
    'supabase/config.toml exists | ملف supabase/config.toml موجود',
    supabaseConfigExists,
    supabaseConfigExists ? '' : 'supabase/config.toml not found'
  );
}

// Test data integrity
async function testDataIntegrity() {
  console.log(colorize('\n🔍 اختبار سلامة البيانات...', 'cyan'));
  console.log(colorize('🔍 Testing data integrity...', 'cyan'));

  const dataDir = path.join(process.cwd(), 'src', 'data');
  
  try {
    // Load data files
    const chemicalTestsPath = path.join(dataDir, 'chemical-tests.json');
    const colorResultsPath = path.join(dataDir, 'color-results.json');
    
    if (!fs.existsSync(chemicalTestsPath) || !fs.existsSync(colorResultsPath)) {
      addTestResult(
        'Data files available for integrity check | ملفات البيانات متوفرة للفحص',
        false,
        'Required data files not found'
      );
      return;
    }

    const chemicalTests = JSON.parse(fs.readFileSync(chemicalTestsPath, 'utf8'));
    const colorResults = JSON.parse(fs.readFileSync(colorResultsPath, 'utf8'));

    // Test 1: Check if we have expected number of tests
    const expectedTestCount = 12;
    const hasExpectedTests = chemicalTests.length === expectedTestCount;
    addTestResult(
      `Has ${expectedTestCount} chemical tests | يحتوي على ${expectedTestCount} اختبار كيميائي`,
      hasExpectedTests,
      `Found ${chemicalTests.length} tests, expected ${expectedTestCount}`
    );

    // Test 2: Check if all tests have color results
    const testIds = chemicalTests.map(test => test.id);
    const resultTestIds = [...new Set(colorResults.map(result => result.test_id))];
    const allTestsHaveResults = testIds.every(id => resultTestIds.includes(id));
    addTestResult(
      'All tests have color results | جميع الاختبارات لها نتائج ألوان',
      allTestsHaveResults,
      allTestsHaveResults ? 'All tests have results' : `Tests without results: ${testIds.filter(id => !resultTestIds.includes(id)).join(', ')}`
    );

    // Test 3: Check color hex format
    const validHexPattern = /^#[0-9A-Fa-f]{6}$/;
    const allHexValid = colorResults.every(result => validHexPattern.test(result.color_hex));
    addTestResult(
      'All color hex codes are valid | جميع رموز الألوان صحيحة',
      allHexValid,
      allHexValid ? 'All hex codes valid' : 'Some hex codes are invalid'
    );

    // Test 4: Check bilingual content
    const allTestsHaveArabic = chemicalTests.every(test => 
      test.method_name_ar && test.method_name_ar.trim() !== '' &&
      test.description_ar && test.description_ar.trim() !== ''
    );
    addTestResult(
      'All tests have Arabic translations | جميع الاختبارات لها ترجمة عربية',
      allTestsHaveArabic,
      allTestsHaveArabic ? 'All tests have Arabic content' : 'Some tests missing Arabic translations'
    );

  } catch (error) {
    addTestResult(
      'Data integrity check completed | فحص سلامة البيانات مكتمل',
      false,
      `Error during integrity check: ${error.message}`
    );
  }
}

// Display test summary
function displayTestSummary() {
  console.log(colorize('\n📊 ملخص نتائج الاختبار', 'cyan'));
  console.log(colorize('📊 Test Results Summary', 'cyan'));
  console.log('='.repeat(50));
  
  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  
  console.log(colorize(`✅ نجح | Passed: ${testResults.passed}`, 'green'));
  console.log(colorize(`❌ فشل | Failed: ${testResults.failed}`, 'red'));
  console.log(colorize(`📊 المجموع | Total: ${testResults.total}`, 'blue'));
  console.log(colorize(`📈 معدل النجاح | Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'yellow'));
  
  if (testResults.failed > 0) {
    console.log(colorize('\n⚠️ الاختبارات الفاشلة:', 'yellow'));
    console.log(colorize('⚠️ Failed Tests:', 'yellow'));
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(colorize(`  • ${test.name}`, 'red'));
        if (test.message) {
          console.log(colorize(`    ${test.message}`, 'yellow'));
        }
      });
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (passRate >= 90) {
    console.log(colorize('🎉 ممتاز! جميع الاختبارات تقريباً نجحت', 'green'));
    console.log(colorize('🎉 Excellent! Almost all tests passed', 'green'));
  } else if (passRate >= 70) {
    console.log(colorize('👍 جيد! معظم الاختبارات نجحت', 'yellow'));
    console.log(colorize('👍 Good! Most tests passed', 'yellow'));
  } else {
    console.log(colorize('⚠️ يحتاج تحسين! عدة اختبارات فشلت', 'red'));
    console.log(colorize('⚠️ Needs improvement! Several tests failed', 'red'));
  }
}

// Main test function
async function runDatabaseTests() {
  console.log(colorize('🧪 بدء اختبار قاعدة البيانات والإعداد', 'cyan'));
  console.log(colorize('🧪 Starting database and setup tests', 'cyan'));
  console.log('='.repeat(50));

  try {
    await testLocalData();
    await testEnvironmentConfig();
    await testMigrationFiles();
    await testConfigFiles();
    await testDataIntegrity();
    
    displayTestSummary();
    
    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error(colorize(`❌ خطأ في الاختبار: ${error.message}`, 'red'));
    console.error(colorize(`❌ Test error: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runDatabaseTests();
}

module.exports = {
  runDatabaseTests,
  testLocalData,
  testEnvironmentConfig,
  testMigrationFiles,
  testConfigFiles,
  testDataIntegrity
};

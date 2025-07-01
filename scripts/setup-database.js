#!/usr/bin/env node

/**
 * Database Setup Script
 * سكريبت إعداد قاعدة البيانات
 * 
 * This script helps set up the database for the Color Testing for Drug and Psychoactive Substance Detection project
 * هذا السكريبت يساعد في إعداد قاعدة البيانات لمشروع اختبارات الألوان للكشف عن المخدرات والمؤثرات العقلية
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Main setup function
async function setupDatabase() {
  console.log(colorize('\n🗄️ مرحباً بك في معالج إعداد قاعدة البيانات', 'cyan'));
  console.log(colorize('🗄️ Welcome to Database Setup Wizard\n', 'cyan'));

  try {
    // Step 1: Choose setup type
    console.log(colorize('الخطوة 1: اختيار نوع الإعداد', 'yellow'));
    console.log(colorize('Step 1: Choose Setup Type', 'yellow'));
    console.log('1. البيانات المحلية (Local Data) - موصى به للتطوير');
    console.log('2. Supabase - للإنتاج والاستخدام الحقيقي');
    
    const setupType = await question('\nاختر نوع الإعداد (1 أو 2) | Choose setup type (1 or 2): ');
    
    if (setupType === '1') {
      await setupLocalData();
    } else if (setupType === '2') {
      await setupSupabase();
    } else {
      console.log(colorize('❌ اختيار غير صحيح | Invalid choice', 'red'));
      process.exit(1);
    }

  } catch (error) {
    console.error(colorize(`❌ خطأ: ${error.message}`, 'red'));
    console.error(colorize(`❌ Error: ${error.message}`, 'red'));
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Setup local data
async function setupLocalData() {
  console.log(colorize('\n📁 إعداد البيانات المحلية...', 'green'));
  console.log(colorize('📁 Setting up local data...', 'green'));

  // Check if data files exist
  const dataDir = path.join(process.cwd(), 'src', 'data');
  const requiredFiles = [
    'chemical-tests.json',
    'color-results.json',
    'test-instructions.json'
  ];

  let allFilesExist = true;
  for (const file of requiredFiles) {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(colorize(`❌ ملف مفقود | Missing file: ${file}`, 'red'));
      allFilesExist = false;
    } else {
      console.log(colorize(`✅ موجود | Found: ${file}`, 'green'));
    }
  }

  if (allFilesExist) {
    console.log(colorize('\n🎉 جميع ملفات البيانات المحلية موجودة!', 'green'));
    console.log(colorize('🎉 All local data files are present!', 'green'));
    
    // Display data statistics
    await displayDataStatistics();
    
    console.log(colorize('\n📋 الخطوات التالية:', 'cyan'));
    console.log(colorize('📋 Next steps:', 'cyan'));
    console.log('1. npm run dev - لتشغيل الخادم المحلي');
    console.log('2. http://localhost:3000 - لفتح التطبيق');
    console.log('3. http://localhost:3000/ar/admin - للوصول لوحة الإدارة');
  } else {
    console.log(colorize('\n❌ بعض ملفات البيانات مفقودة', 'red'));
    console.log(colorize('❌ Some data files are missing', 'red'));
    console.log(colorize('يرجى التأكد من وجود جميع الملفات في مجلد src/data/', 'yellow'));
    console.log(colorize('Please ensure all files exist in src/data/ directory', 'yellow'));
  }
}

// Setup Supabase
async function setupSupabase() {
  console.log(colorize('\n🚀 إعداد Supabase...', 'green'));
  console.log(colorize('🚀 Setting up Supabase...', 'green'));

  // Get Supabase credentials
  console.log(colorize('\nيرجى إدخال بيانات Supabase الخاصة بك:', 'yellow'));
  console.log(colorize('Please enter your Supabase credentials:', 'yellow'));

  const supabaseUrl = await question('Supabase URL (https://your-project.supabase.co): ');
  const supabaseAnonKey = await question('Supabase Anon Key: ');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log(colorize('❌ يجب إدخال جميع البيانات المطلوبة', 'red'));
    console.log(colorize('❌ All credentials are required', 'red'));
    return;
  }

  // Validate URL format
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.log(colorize('❌ رابط Supabase غير صحيح', 'red'));
    console.log(colorize('❌ Invalid Supabase URL format', 'red'));
    return;
  }

  // Create or update .env.local file
  await createEnvFile(supabaseUrl, supabaseAnonKey);

  // Display migration instructions
  await displayMigrationInstructions();

  console.log(colorize('\n🎉 تم إعداد Supabase بنجاح!', 'green'));
  console.log(colorize('🎉 Supabase setup completed successfully!', 'green'));
}

// Create .env.local file
async function createEnvFile(supabaseUrl, supabaseAnonKey) {
  const envPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  let envContent = '';

  // Read .env.example if it exists
  if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf8');
  }

  // Update Supabase settings
  envContent = envContent.replace(
    'NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co',
    `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`
  );
  envContent = envContent.replace(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here',
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}`
  );

  // Write to .env.local
  fs.writeFileSync(envPath, envContent);

  console.log(colorize('✅ تم إنشاء ملف .env.local', 'green'));
  console.log(colorize('✅ Created .env.local file', 'green'));
}

// Display data statistics
async function displayDataStatistics() {
  try {
    const dataDir = path.join(process.cwd(), 'src', 'data');
    
    // Read chemical tests
    const chemicalTestsPath = path.join(dataDir, 'chemical-tests.json');
    const chemicalTests = JSON.parse(fs.readFileSync(chemicalTestsPath, 'utf8'));
    
    // Read color results
    const colorResultsPath = path.join(dataDir, 'color-results.json');
    const colorResults = JSON.parse(fs.readFileSync(colorResultsPath, 'utf8'));

    console.log(colorize('\n📊 إحصائيات البيانات:', 'cyan'));
    console.log(colorize('📊 Data Statistics:', 'cyan'));
    console.log(`🧪 الاختبارات الكيميائية | Chemical Tests: ${chemicalTests.length}`);
    console.log(`🎨 نتائج الألوان | Color Results: ${colorResults.length}`);

    // Count by category
    const categories = {};
    chemicalTests.forEach(test => {
      categories[test.category] = (categories[test.category] || 0) + 1;
    });

    console.log(colorize('\n📋 التصنيفات | Categories:', 'cyan'));
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });

  } catch (error) {
    console.log(colorize('⚠️ لا يمكن قراءة إحصائيات البيانات', 'yellow'));
    console.log(colorize('⚠️ Cannot read data statistics', 'yellow'));
  }
}

// Display migration instructions
async function displayMigrationInstructions() {
  console.log(colorize('\n📋 تعليمات تشغيل Migrations:', 'cyan'));
  console.log(colorize('📋 Migration Instructions:', 'cyan'));
  
  console.log(colorize('\n1. افتح لوحة تحكم Supabase | Open Supabase Dashboard', 'yellow'));
  console.log('   https://app.supabase.com/');
  
  console.log(colorize('\n2. اذهب إلى SQL Editor | Go to SQL Editor', 'yellow'));
  
  console.log(colorize('\n3. قم بتشغيل الملفات بالترتيب | Run files in order:', 'yellow'));
  console.log('   a) supabase/migrations/001_initial_schema.sql');
  console.log('   b) supabase/migrations/002_seed_data.sql');
  
  console.log(colorize('\n4. تحقق من إنشاء الجداول | Verify tables creation:', 'yellow'));
  console.log('   SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\';');

  const migrationPath1 = path.join(process.cwd(), 'supabase', 'migrations', '001_initial_schema.sql');
  const migrationPath2 = path.join(process.cwd(), 'supabase', 'migrations', '002_seed_data.sql');

  if (fs.existsSync(migrationPath1) && fs.existsSync(migrationPath2)) {
    console.log(colorize('\n✅ ملفات Migration موجودة في:', 'green'));
    console.log(colorize('✅ Migration files found at:', 'green'));
    console.log(`   ${migrationPath1}`);
    console.log(`   ${migrationPath2}`);
  } else {
    console.log(colorize('\n❌ ملفات Migration مفقودة', 'red'));
    console.log(colorize('❌ Migration files not found', 'red'));
  }
}

// Display help information
function displayHelp() {
  console.log(colorize('\n📖 مساعدة إعداد قاعدة البيانات', 'cyan'));
  console.log(colorize('📖 Database Setup Help', 'cyan'));
  
  console.log(colorize('\nالاستخدام | Usage:', 'yellow'));
  console.log('node scripts/setup-database.js');
  
  console.log(colorize('\nالخيارات | Options:', 'yellow'));
  console.log('--help, -h    عرض هذه المساعدة | Show this help');
  
  console.log(colorize('\nأمثلة | Examples:', 'yellow'));
  console.log('npm run setup-database');
  console.log('node scripts/setup-database.js');
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  displayHelp();
  process.exit(0);
}

// Run the setup
if (require.main === module) {
  setupDatabase().catch(error => {
    console.error(colorize(`❌ خطأ في الإعداد: ${error.message}`, 'red'));
    console.error(colorize(`❌ Setup error: ${error.message}`, 'red'));
    process.exit(1);
  });
}

module.exports = {
  setupDatabase,
  setupLocalData,
  setupSupabase
};

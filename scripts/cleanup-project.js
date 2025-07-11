#!/usr/bin/env node

/**
 * Project Cleanup Script
 * سكريبت تنظيف المشروع
 * 
 * This script automatically cleans up temporary and unnecessary files
 * يقوم هذا السكريبت بتنظيف الملفات المؤقتة وغير الضرورية تلقائياً
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Project Cleanup Script');
console.log('🧹 سكريبت تنظيف المشروع');
console.log('=' .repeat(50));

// Files and directories to clean
const cleanupTargets = [
  // Build outputs
  'out',
  '.next',
  'dist',
  'build',
  
  // Temporary files
  '*.tmp',
  '*.temp',
  '*.bak',
  '*.backup',
  '*.patch',
  '*.orig',
  
  // Cache directories
  '.cache',
  '.parcel-cache',
  
  // Log files
  '*.log',
  'logs',
  
  // Coverage reports
  'coverage',
  '.nyc_output',
  
  // API backups
  'api_backup',
  'backup',
  'temp',
  
  // Development configs
  'next.config.dev.js',
  'next.config.temp.js',
  
  // Firebase cache
  '.firebase',
  
  // Testing
  '.jest',
  'test-results'
];

// Safe files that should never be deleted
const protectedFiles = [
  'package.json',
  'package-lock.json',
  'next.config.js',
  'tailwind.config.js',
  'tsconfig.json',
  'firebase.json',
  'firestore.rules',
  'database.rules.json',
  '.env.local',
  '.env.local.example',
  'README.md',
  'src',
  'public',
  'scripts',
  'node_modules'
];

let cleanedFiles = [];
let cleanedSize = 0;

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getDirectorySize(dirPath) {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        size += stats.size;
      }
    });
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  return size;
}

function deleteFileOrDirectory(target) {
  try {
    if (fs.existsSync(target)) {
      const stats = fs.statSync(target);
      const size = stats.isDirectory() ? getDirectorySize(target) : stats.size;
      
      if (stats.isDirectory()) {
        fs.rmSync(target, { recursive: true, force: true });
        console.log(`✅ Deleted directory: ${target} (${formatBytes(size)})`);
      } else {
        fs.unlinkSync(target);
        console.log(`✅ Deleted file: ${target} (${formatBytes(size)})`);
      }
      
      cleanedFiles.push(target);
      cleanedSize += size;
      return true;
    }
  } catch (error) {
    console.log(`❌ Failed to delete ${target}: ${error.message}`);
    return false;
  }
  return false;
}

// Main cleanup function
function cleanup() {
  console.log('🔍 Scanning for files to clean...');
  console.log('🔍 البحث عن الملفات للتنظيف...');
  console.log('-'.repeat(30));
  
  let foundFiles = 0;
  
  cleanupTargets.forEach(target => {
    // Check if it's a glob pattern
    if (target.includes('*')) {
      // Handle glob patterns (simplified)
      const extension = target.replace('*', '');
      const files = fs.readdirSync('.').filter(file => file.endsWith(extension));
      files.forEach(file => {
        if (!protectedFiles.includes(file)) {
          if (deleteFileOrDirectory(file)) {
            foundFiles++;
          }
        }
      });
    } else {
      // Handle direct file/directory names
      if (!protectedFiles.includes(target)) {
        if (deleteFileOrDirectory(target)) {
          foundFiles++;
        }
      }
    }
  });
  
  console.log('-'.repeat(30));
  console.log(`📊 Cleanup Summary / ملخص التنظيف:`);
  console.log(`📁 Files/Directories cleaned: ${foundFiles}`);
  console.log(`📁 الملفات/المجلدات المنظفة: ${foundFiles}`);
  console.log(`💾 Total space freed: ${formatBytes(cleanedSize)}`);
  console.log(`💾 إجمالي المساحة المحررة: ${formatBytes(cleanedSize)}`);
  
  if (foundFiles === 0) {
    console.log('✨ Project is already clean!');
    console.log('✨ المشروع نظيف بالفعل!');
  } else {
    console.log('🎉 Cleanup completed successfully!');
    console.log('🎉 اكتمل التنظيف بنجاح!');
  }
}

// Security check function
function securityCheck() {
  console.log('\n🔒 Running security check...');
  console.log('🔒 تشغيل فحص الأمان...');
  
  const sensitiveFiles = [
    '.env',
    '.env.local',
    'firebase-adminsdk.json',
    'service-account.json',
    'private-key.pem'
  ];
  
  let foundSensitive = false;
  sensitiveFiles.forEach(file => {
    if (fs.existsSync(file) && file !== '.env.local') {
      console.log(`⚠️ Sensitive file found: ${file}`);
      foundSensitive = true;
    }
  });
  
  if (!foundSensitive) {
    console.log('✅ No sensitive files found in root directory');
    console.log('✅ لم يتم العثور على ملفات حساسة في المجلد الجذر');
  }
}

// NPM cleanup function
function npmCleanup() {
  console.log('\n📦 Cleaning npm cache...');
  console.log('📦 تنظيف ذاكرة npm التخزين المؤقت...');
  
  try {
    execSync('npm cache clean --force', { stdio: 'inherit' });
    console.log('✅ NPM cache cleaned');
    console.log('✅ تم تنظيف ذاكرة npm التخزين المؤقت');
  } catch (error) {
    console.log('❌ Failed to clean npm cache');
    console.log('❌ فشل في تنظيف ذاكرة npm التخزين المؤقت');
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const options = {
    deep: args.includes('--deep'),
    npm: args.includes('--npm'),
    security: args.includes('--security'),
    all: args.includes('--all')
  };
  
  if (options.all) {
    options.deep = true;
    options.npm = true;
    options.security = true;
  }
  
  // Basic cleanup
  cleanup();
  
  // Security check
  if (options.security || options.all) {
    securityCheck();
  }
  
  // NPM cleanup
  if (options.npm || options.all) {
    npmCleanup();
  }
  
  console.log('\n💡 Usage / الاستخدام:');
  console.log('node scripts/cleanup-project.js [options]');
  console.log('');
  console.log('Options / الخيارات:');
  console.log('  --security    Run security check / تشغيل فحص الأمان');
  console.log('  --npm         Clean npm cache / تنظيف ذاكرة npm التخزين المؤقت');
  console.log('  --all         Run all cleanup options / تشغيل جميع خيارات التنظيف');
  console.log('');
  console.log('Examples / أمثلة:');
  console.log('  npm run cleanup');
  console.log('  npm run cleanup:all');
  console.log('  node scripts/cleanup-project.js --security --npm');
}

// Run the script
main();

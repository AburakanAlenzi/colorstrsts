#!/usr/bin/env node

/**
 * Syntax Check Script
 * سكريبت فحص بناء الجملة
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking syntax of critical files...');
console.log('🔍 فحص بناء الجملة للملفات المهمة...');

const filesToCheck = [
  'src/components/admin/admin-dashboard.tsx',
  'src/components/admin/UsageChart.tsx',
  'src/components/admin/TestsManagementNew.tsx',
  'src/app/[lang]/admin/page.tsx',
  'src/app/layout.tsx'
];

let hasErrors = false;

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`\n📝 Checking ${file}...`);
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Basic syntax checks
      const lines = content.split('\n');
      let braceCount = 0;
      let parenCount = 0;
      let bracketCount = 0;
      let inJSXComment = false;
      
      lines.forEach((line, index) => {
        const lineNum = index + 1;
        
        // Count braces, parentheses, and brackets
        for (let char of line) {
          switch (char) {
            case '{': braceCount++; break;
            case '}': braceCount--; break;
            case '(': parenCount++; break;
            case ')': parenCount--; break;
            case '[': bracketCount++; break;
            case ']': bracketCount--; break;
          }
        }
        
        // Check for JSX comments outside elements
        if (line.trim().startsWith('{/*') && line.trim().endsWith('*/}')) {
          // This is a standalone JSX comment - might be problematic
          const prevLine = lines[index - 1] || '';
          const nextLine = lines[index + 1] || '';
          
          if (!prevLine.trim().includes('<') && !nextLine.trim().includes('<')) {
            console.log(`⚠️  Line ${lineNum}: Standalone JSX comment might cause issues`);
            console.log(`    ${line.trim()}`);
          }
        }
        
        // Check for common syntax issues
        if (line.includes('}{') && !line.includes('${}')) {
          console.log(`⚠️  Line ${lineNum}: Possible missing comma or operator`);
          console.log(`    ${line.trim()}`);
        }
      });
      
      // Check final counts
      if (braceCount !== 0) {
        console.log(`❌ Unmatched braces: ${braceCount > 0 ? 'missing' : 'extra'} ${Math.abs(braceCount)} closing brace(s)`);
        hasErrors = true;
      }
      
      if (parenCount !== 0) {
        console.log(`❌ Unmatched parentheses: ${parenCount > 0 ? 'missing' : 'extra'} ${Math.abs(parenCount)} closing parenthesis(es)`);
        hasErrors = true;
      }
      
      if (bracketCount !== 0) {
        console.log(`❌ Unmatched brackets: ${bracketCount > 0 ? 'missing' : 'extra'} ${Math.abs(bracketCount)} closing bracket(s)`);
        hasErrors = true;
      }
      
      if (braceCount === 0 && parenCount === 0 && bracketCount === 0) {
        console.log(`✅ Syntax looks good`);
      }
      
    } catch (error) {
      console.log(`❌ Error reading file: ${error.message}`);
      hasErrors = true;
    }
  } else {
    console.log(`❌ File not found: ${file}`);
    hasErrors = true;
  }
});

console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Syntax check completed with errors');
  console.log('❌ اكتمل فحص بناء الجملة مع وجود أخطاء');
  process.exit(1);
} else {
  console.log('✅ All syntax checks passed!');
  console.log('✅ نجح فحص بناء الجملة لجميع الملفات!');
}

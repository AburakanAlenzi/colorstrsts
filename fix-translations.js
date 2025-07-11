#!/usr/bin/env node

/**
 * Fix translations usage in TestsManagementNew.tsx
 */

const fs = require('fs');
const path = require('path');

const filePath = 'src/components/admin/TestsManagementNew.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix all translations usage
  const fixes = [
    { from: 'translations.stats.testTypes', to: 'translations?.stats?.testTypes || "Test Types"' },
    { from: 'translations.stats.recentTests', to: 'translations?.stats?.recentTests || "Recent Tests"' },
    { from: 'translations.stats.byType', to: 'translations?.stats?.byType || "By Type"' },
    { from: 'translations.delete.title', to: 'translations?.delete?.title || "Delete Test"' },
    { from: 'translations.delete.message', to: 'translations?.delete?.message || "Are you sure you want to delete this test?"' },
    { from: 'translations.delete.testName', to: 'translations?.delete?.testName || "Test Name"' },
    { from: 'translations.delete.warning', to: 'translations?.delete?.warning || "This action cannot be undone."' },
    { from: 'translations.delete.cancel', to: 'translations?.delete?.cancel || "Cancel"' },
    { from: 'translations.delete.confirm', to: 'translations?.delete?.confirm || "Delete"' },
    { from: 'translations.messages.updateSuccess', to: 'translations?.messages?.updateSuccess || "Test updated successfully"' },
    { from: 'translations.messages.updateError', to: 'translations?.messages?.updateError || "Failed to update test"' },
    { from: 'translations.messages.deleteSuccess', to: 'translations?.messages?.deleteSuccess || "Test deleted successfully"' },
    { from: 'translations.messages.deleteError', to: 'translations?.messages?.deleteError || "Failed to delete test"' },
    { from: 'translations.messages.exportSuccess', to: 'translations?.messages?.exportSuccess || "Export completed successfully"' },
    { from: 'translations.messages.importSuccess', to: 'translations?.messages?.importSuccess || "Import completed successfully"' },
    { from: 'translations.messages.importError', to: 'translations?.messages?.importError || "Import failed"' }
  ];
  
  fixes.forEach(fix => {
    content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed translations usage in TestsManagementNew.tsx');
  
} catch (error) {
  console.error('❌ Error fixing translations:', error.message);
  process.exit(1);
}

#!/usr/bin/env node

/**
 * Secure Admin Setup Script
 * Generates secure admin credentials for the Color Testing application
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Security configuration
const SECURITY_CONFIG = {
  passwordLength: 16,
  saltLength: 32,
  hashAlgorithm: 'sha256',
};

// Generate secure random password
function generateSecurePassword(length = SECURITY_CONFIG.passwordLength) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each category
  const categories = [
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'abcdefghijklmnopqrstuvwxyz',
    '0123456789',
    '!@#$%^&*'
  ];
  
  // Add one character from each category
  categories.forEach(category => {
    password += category.charAt(Math.floor(Math.random() * category.length));
  });
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Generate secure salt
function generateSalt(length = SECURITY_CONFIG.saltLength) {
  return crypto.randomBytes(length).toString('hex');
}

// Hash password with salt
function hashPassword(password, salt) {
  return crypto
    .createHash(SECURITY_CONFIG.hashAlgorithm)
    .update(password + salt)
    .digest('hex');
}

// Generate admin credentials
function generateAdminCredentials() {
  const password = generateSecurePassword();
  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  
  return {
    password,
    salt,
    passwordHash,
    email: 'admin@colortest.local',
    sessionDuration: 3600000, // 1 hour
    maxLoginAttempts: 5,
    lockoutDuration: 900000, // 15 minutes
  };
}

// Create .env.local file
function createEnvFile(credentials) {
  const envContent = `# Color Testing Application - Secure Configuration
# Generated on: ${new Date().toISOString()}
# 
# IMPORTANT: Keep this file secure and never commit it to version control!

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Admin Security Configuration
NEXT_PUBLIC_ADMIN_PASSWORD_HASH=${credentials.passwordHash}
NEXT_PUBLIC_ADMIN_EMAIL=${credentials.email}
NEXT_PUBLIC_ADMIN_SESSION_DURATION=${credentials.sessionDuration}
NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS=${credentials.maxLoginAttempts}
NEXT_PUBLIC_LOCKOUT_DURATION=${credentials.lockoutDuration}
NEXT_PUBLIC_AUTH_SALT=${credentials.salt}

# Optional: Google Analytics
# NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Optional: Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS=true

# Development Settings
NODE_ENV=development
LOG_LEVEL=info

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
`;

  const envPath = path.join(process.cwd(), '.env.local');
  fs.writeFileSync(envPath, envContent);
  
  return envPath;
}

// Create admin credentials file (temporary)
function createCredentialsFile(credentials) {
  const credentialsContent = `# ADMIN CREDENTIALS - DELETE THIS FILE AFTER SETUP
# Generated on: ${new Date().toISOString()}

========================================
  COLOR TESTING ADMIN CREDENTIALS
========================================

Email: ${credentials.email}
Password: ${credentials.password}

IMPORTANT SECURITY NOTES:
1. Store this password in a secure password manager
2. Delete this file immediately after setup
3. Never share these credentials
4. Change the password regularly

========================================
  ENVIRONMENT CONFIGURATION
========================================

The following environment variables have been set in .env.local:

NEXT_PUBLIC_ADMIN_PASSWORD_HASH=${credentials.passwordHash}
NEXT_PUBLIC_AUTH_SALT=${credentials.salt}

========================================
  ADMIN ACCESS INSTRUCTIONS
========================================

1. Start the application: npm run dev
2. Navigate to: http://localhost:3000/ar/admin
3. Enter the password above
4. Delete this file immediately!

========================================
  SECURITY FEATURES ENABLED
========================================

✅ Secure password hashing with salt
✅ Session timeout (${credentials.sessionDuration / 60000} minutes)
✅ Login attempt limiting (${credentials.maxLoginAttempts} attempts)
✅ Account lockout (${credentials.lockoutDuration / 60000} minutes)
✅ Security event logging
✅ Rate limiting protection

========================================
`;

  const credentialsPath = path.join(process.cwd(), 'ADMIN_CREDENTIALS.txt');
  fs.writeFileSync(credentialsPath, credentialsContent);
  
  return credentialsPath;
}

// Main setup function
function setupAdmin() {
  console.log('🔒 Setting up secure admin credentials...\n');
  
  try {
    // Generate credentials
    const credentials = generateAdminCredentials();
    
    // Create environment file
    const envPath = createEnvFile(credentials);
    console.log(`✅ Environment file created: ${envPath}`);
    
    // Create temporary credentials file
    const credentialsPath = createCredentialsFile(credentials);
    console.log(`✅ Credentials file created: ${credentialsPath}`);
    
    console.log('\n🎉 Admin setup completed successfully!\n');
    console.log('📋 Next steps:');
    console.log('1. Read the ADMIN_CREDENTIALS.txt file');
    console.log('2. Store the password securely');
    console.log('3. Delete the ADMIN_CREDENTIALS.txt file');
    console.log('4. Start the application: npm run dev');
    console.log('5. Access admin panel: http://localhost:3000/ar/admin\n');
    
    console.log('⚠️  SECURITY WARNING:');
    console.log('   - Never commit .env.local to version control');
    console.log('   - Delete ADMIN_CREDENTIALS.txt after reading');
    console.log('   - Keep your admin password secure\n');
    
  } catch (error) {
    console.error('❌ Error setting up admin credentials:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupAdmin();
}

module.exports = {
  generateAdminCredentials,
  generateSecurePassword,
  generateSalt,
  hashPassword,
  setupAdmin,
};

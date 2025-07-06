#!/usr/bin/env node

/**
 * Production Environment Setup Script
 * Generates environment variables for Vercel deployment
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Import setup functions
const { generateAdminCredentials, hashPassword } = require('./setup-admin.js');

console.log('🚀 Setting up production environment for Vercel deployment...\n');

// Generate production credentials
const credentials = generateAdminCredentials();

// Create production environment variables
const productionEnvVars = {
  // Required security variables
  NEXT_PUBLIC_ADMIN_PASSWORD_HASH: credentials.passwordHash,
  NEXT_PUBLIC_AUTH_SALT: credentials.salt,
  
  // Optional security settings
  NEXT_PUBLIC_ADMIN_EMAIL: credentials.email,
  NEXT_PUBLIC_ADMIN_SESSION_DURATION: credentials.sessionDuration.toString(),
  NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS: credentials.maxLoginAttempts.toString(),
  NEXT_PUBLIC_LOCKOUT_DURATION: credentials.lockoutDuration.toString(),
  
  // Site configuration
  NEXT_PUBLIC_SITE_URL: 'https://your-app.vercel.app',
  
  // Analytics (optional)
  NEXT_PUBLIC_VERCEL_ANALYTICS: 'true',
  NEXT_PUBLIC_ENABLE_ANALYTICS: 'true',
  
  // Feature flags
  NEXT_PUBLIC_ENABLE_PWA: 'true',
  NEXT_PUBLIC_ENABLE_OFFLINE_MODE: 'true',
  
  // Production settings
  NODE_ENV: 'production',
  LOG_LEVEL: 'warn'
};

// Create Vercel environment variables file
function createVercelEnvFile() {
  const envContent = `# Vercel Environment Variables
# Copy these to your Vercel project dashboard under Settings → Environment Variables
# Generated on: ${new Date().toISOString()}

# REQUIRED SECURITY VARIABLES (COPY THESE TO VERCEL)
NEXT_PUBLIC_ADMIN_PASSWORD_HASH=${productionEnvVars.NEXT_PUBLIC_ADMIN_PASSWORD_HASH}
NEXT_PUBLIC_AUTH_SALT=${productionEnvVars.NEXT_PUBLIC_AUTH_SALT}

# OPTIONAL SECURITY SETTINGS
NEXT_PUBLIC_ADMIN_EMAIL=${productionEnvVars.NEXT_PUBLIC_ADMIN_EMAIL}
NEXT_PUBLIC_ADMIN_SESSION_DURATION=${productionEnvVars.NEXT_PUBLIC_ADMIN_SESSION_DURATION}
NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS=${productionEnvVars.NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS}
NEXT_PUBLIC_LOCKOUT_DURATION=${productionEnvVars.NEXT_PUBLIC_LOCKOUT_DURATION}

# SITE CONFIGURATION
NEXT_PUBLIC_SITE_URL=${productionEnvVars.NEXT_PUBLIC_SITE_URL}

# ANALYTICS (OPTIONAL)
NEXT_PUBLIC_VERCEL_ANALYTICS=${productionEnvVars.NEXT_PUBLIC_VERCEL_ANALYTICS}
NEXT_PUBLIC_ENABLE_ANALYTICS=${productionEnvVars.NEXT_PUBLIC_ENABLE_ANALYTICS}

# FEATURE FLAGS
NEXT_PUBLIC_ENABLE_PWA=${productionEnvVars.NEXT_PUBLIC_ENABLE_PWA}
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=${productionEnvVars.NEXT_PUBLIC_ENABLE_OFFLINE_MODE}

# PRODUCTION SETTINGS
NODE_ENV=${productionEnvVars.NODE_ENV}
LOG_LEVEL=${productionEnvVars.LOG_LEVEL}
`;

  const envPath = path.join(process.cwd(), 'VERCEL_ENV_VARS.txt');
  fs.writeFileSync(envPath, envContent);
  return envPath;
}

// Create production deployment instructions
function createDeploymentInstructions() {
  const instructions = `# 🚀 PRODUCTION DEPLOYMENT INSTRUCTIONS
# Generated on: ${new Date().toISOString()}

========================================
  VERCEL DEPLOYMENT STEPS
========================================

1. PUSH TO GITHUB:
   git add .
   git commit -m "🚀 DEPLOY: Ready for production"
   git push origin main

2. DEPLOY TO VERCEL:
   - Go to vercel.com
   - Import GitHub repository: color-testing-drug-detection
   - Configure as Next.js project

3. SET ENVIRONMENT VARIABLES:
   Copy variables from VERCEL_ENV_VARS.txt to:
   Vercel Dashboard → Settings → Environment Variables

4. REDEPLOY:
   After adding environment variables, redeploy the project

========================================
  ADMIN CREDENTIALS
========================================

Email: ${credentials.email}
Password: ${credentials.password}

⚠️  IMPORTANT: Store this password securely and delete this file!

========================================
  ADMIN ACCESS URLS
========================================

Production Admin Panel:
https://your-app.vercel.app/ar/admin

Local Development:
http://localhost:3000/ar/admin

========================================
  SECURITY FEATURES ENABLED
========================================

✅ Secure password hashing (SHA-256 + salt)
✅ Session timeout (${credentials.sessionDuration / 60000} minutes)
✅ Login attempt limiting (${credentials.maxLoginAttempts} attempts)
✅ Account lockout (${credentials.lockoutDuration / 60000} minutes)
✅ Security event logging
✅ Rate limiting protection
✅ Development shortcuts disabled in production

========================================
  POST-DEPLOYMENT CHECKLIST
========================================

□ Test admin login with generated password
□ Verify all 15 chemical tests work
□ Check bilingual support (Arabic/English)
□ Test print functionality
□ Verify mobile responsiveness
□ Check security features (login limits, lockout)
□ Monitor application performance
□ Delete this file after setup

========================================
`;

  const instructionsPath = path.join(process.cwd(), 'PRODUCTION_DEPLOYMENT.txt');
  fs.writeFileSync(instructionsPath, instructions);
  return instructionsPath;
}

// Create Vercel CLI deployment script
function createVercelScript() {
  const script = `#!/bin/bash

# Vercel CLI Deployment Script
# Run this script to deploy via Vercel CLI

echo "🚀 Deploying Color Testing Application to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "Please login to Vercel if prompted..."
vercel login

# Deploy to production
echo "Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo "📋 Next steps:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Copy variables from VERCEL_ENV_VARS.txt"
echo "3. Redeploy after adding environment variables"
echo "4. Test admin access with generated credentials"
`;

  const scriptPath = path.join(process.cwd(), 'deploy-vercel.sh');
  fs.writeFileSync(scriptPath, script);
  
  // Make script executable (Unix systems)
  try {
    fs.chmodSync(scriptPath, '755');
  } catch (error) {
    // Ignore on Windows
  }
  
  return scriptPath;
}

// Main setup function
function setupProduction() {
  try {
    console.log('📋 Generating production environment variables...');
    const envPath = createVercelEnvFile();
    console.log(`✅ Environment variables file created: ${envPath}`);
    
    console.log('📝 Creating deployment instructions...');
    const instructionsPath = createDeploymentInstructions();
    console.log(`✅ Deployment instructions created: ${instructionsPath}`);
    
    console.log('🔧 Creating Vercel CLI script...');
    const scriptPath = createVercelScript();
    console.log(`✅ Deployment script created: ${scriptPath}`);
    
    console.log('\n🎉 Production setup completed successfully!\n');
    
    console.log('📋 Next steps:');
    console.log('1. Read PRODUCTION_DEPLOYMENT.txt for detailed instructions');
    console.log('2. Copy environment variables from VERCEL_ENV_VARS.txt');
    console.log('3. Deploy to Vercel using GitHub or CLI');
    console.log('4. Set environment variables in Vercel dashboard');
    console.log('5. Test the deployed application\n');
    
    console.log('🔐 Admin Credentials:');
    console.log(`   Email: ${credentials.email}`);
    console.log(`   Password: ${credentials.password}`);
    console.log('   ⚠️  Store securely and delete instruction files!\n');
    
    console.log('🌐 Deployment URLs:');
    console.log('   Production: https://your-app.vercel.app');
    console.log('   Admin Panel: https://your-app.vercel.app/ar/admin\n');
    
  } catch (error) {
    console.error('❌ Error setting up production environment:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupProduction();
}

module.exports = {
  setupProduction,
  createVercelEnvFile,
  createDeploymentInstructions,
  productionEnvVars
};

// Secure authentication utilities
// Browser-compatible crypto functions

// Security configuration
const SECURITY_CONFIG = {
  // Session duration from environment (default 1 hour)
  sessionDuration: parseInt(process.env.NEXT_PUBLIC_ADMIN_SESSION_DURATION || '3600000'),
  // Maximum login attempts
  maxLoginAttempts: parseInt(process.env.NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS || '5'),
  // Lockout duration after max attempts (default 15 minutes)
  lockoutDuration: parseInt(process.env.NEXT_PUBLIC_LOCKOUT_DURATION || '900000'),
  // Salt for password hashing
  salt: process.env.NEXT_PUBLIC_AUTH_SALT || 'color_testing_salt_2025',
};

// Storage keys
const STORAGE_KEYS = {
  ADMIN_SESSION: 'ct_admin_session',
  LOGIN_ATTEMPTS: 'ct_login_attempts',
  LOCKOUT_TIME: 'ct_lockout_time',
} as const;

// Browser-compatible hash function
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Hash password with salt
export async function hashPassword(password: string): Promise<string> {
  if (typeof window === 'undefined') {
    // Server-side fallback (for setup script)
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(password + SECURITY_CONFIG.salt).digest('hex');
  }
  return await sha256(password + SECURITY_CONFIG.salt);
}

// Generate secure session token
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Check if account is locked out
export function isAccountLocked(): boolean {
  const lockoutTime = localStorage.getItem(STORAGE_KEYS.LOCKOUT_TIME);
  if (!lockoutTime) return false;
  
  const lockoutTimestamp = parseInt(lockoutTime);
  const now = Date.now();
  
  if (now < lockoutTimestamp) {
    return true;
  } else {
    // Lockout expired, clear it
    localStorage.removeItem(STORAGE_KEYS.LOCKOUT_TIME);
    localStorage.removeItem(STORAGE_KEYS.LOGIN_ATTEMPTS);
    return false;
  }
}

// Get remaining lockout time in minutes
export function getRemainingLockoutTime(): number {
  const lockoutTime = localStorage.getItem(STORAGE_KEYS.LOCKOUT_TIME);
  if (!lockoutTime) return 0;
  
  const lockoutTimestamp = parseInt(lockoutTime);
  const now = Date.now();
  const remaining = Math.max(0, lockoutTimestamp - now);
  
  return Math.ceil(remaining / 60000); // Convert to minutes
}

// Record failed login attempt
export function recordFailedAttempt(): void {
  const attempts = getLoginAttempts() + 1;
  localStorage.setItem(STORAGE_KEYS.LOGIN_ATTEMPTS, attempts.toString());
  
  if (attempts >= SECURITY_CONFIG.maxLoginAttempts) {
    const lockoutUntil = Date.now() + SECURITY_CONFIG.lockoutDuration;
    localStorage.setItem(STORAGE_KEYS.LOCKOUT_TIME, lockoutUntil.toString());
  }
}

// Get current login attempts
export function getLoginAttempts(): number {
  const attempts = localStorage.getItem(STORAGE_KEYS.LOGIN_ATTEMPTS);
  return attempts ? parseInt(attempts) : 0;
}

// Clear login attempts (on successful login)
export function clearLoginAttempts(): void {
  localStorage.removeItem(STORAGE_KEYS.LOGIN_ATTEMPTS);
  localStorage.removeItem(STORAGE_KEYS.LOCKOUT_TIME);
}

// Validate admin password
export async function validateAdminPassword(password: string): Promise<boolean> {
  // Get password hash from environment
  const expectedHash = process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH;

  if (!expectedHash) {
    // Fallback to default password for development
    const defaultPassword = 'ColorTest2025!Admin';
    const defaultHash = await hashPassword(defaultPassword);
    const inputHash = await hashPassword(password);
    return inputHash === defaultHash;
  }

  const inputHash = await hashPassword(password);
  return inputHash === expectedHash;
}

// Create secure admin session
export function createAdminSession(): string {
  const sessionToken = generateSessionToken();
  const session = {
    token: sessionToken,
    authenticated: true,
    expires: Date.now() + SECURITY_CONFIG.sessionDuration,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
  };
  
  localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
  clearLoginAttempts();
  
  return sessionToken;
}

// Validate admin session
export function validateAdminSession(): boolean {
  try {
    const sessionData = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    if (!sessionData) return false;
    
    const session = JSON.parse(sessionData);
    const now = Date.now();
    
    // Check if session is expired
    if (session.expires < now) {
      clearAdminSession();
      return false;
    }
    
    // Check if user agent matches (basic security check)
    if (session.userAgent !== navigator.userAgent) {
      clearAdminSession();
      return false;
    }
    
    return session.authenticated === true;
  } catch (error) {
    clearAdminSession();
    return false;
  }
}

// Clear admin session
export function clearAdminSession(): void {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
}

// Get session info
export function getSessionInfo(): { expires: number; remaining: number } | null {
  try {
    const sessionData = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    const now = Date.now();
    const remaining = Math.max(0, session.expires - now);
    
    return {
      expires: session.expires,
      remaining: Math.ceil(remaining / 60000), // Minutes remaining
    };
  } catch (error) {
    return null;
  }
}

// Extend session (refresh)
export function extendSession(): boolean {
  try {
    const sessionData = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    if (!sessionData) return false;
    
    const session = JSON.parse(sessionData);
    session.expires = Date.now() + SECURITY_CONFIG.sessionDuration;
    
    localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
    return true;
  } catch (error) {
    return false;
  }
}

// Security audit log (for development/debugging)
export function logSecurityEvent(event: string, details?: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Security] ${event}`, details);
  }
}

// Generate secure admin setup instructions
export function generateSecureSetupInstructions(): string {
  const randomPassword = generateSecurePassword();
  const passwordHash = hashPassword(randomPassword);
  
  return `
# Secure Admin Setup Instructions

1. Set environment variable:
   NEXT_PUBLIC_ADMIN_PASSWORD_HASH="${passwordHash}"

2. Your secure admin password is:
   ${randomPassword}

3. Store this password securely and delete this message.

4. Optional environment variables:
   NEXT_PUBLIC_ADMIN_SESSION_DURATION=3600000  # 1 hour
   NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS=5
   NEXT_PUBLIC_LOCKOUT_DURATION=900000         # 15 minutes
   NEXT_PUBLIC_AUTH_SALT=your_custom_salt_here
`;
}

// Generate secure password
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return password;
}

// Rate limiting for API calls
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const key = identifier;
  
  const current = rateLimitMap.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

// Clean up expired rate limit entries
export function cleanupRateLimit(): void {
  const now = Date.now();
  rateLimitMap.forEach((value, key) => {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  });
}

// Initialize security utilities
export function initializeSecurity(): void {
  // Clean up expired sessions on load
  if (typeof window !== 'undefined') {
    const sessionData = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        if (session.expires < Date.now()) {
          clearAdminSession();
        }
      } catch (error) {
        clearAdminSession();
      }
    }
    
    // Clean up rate limiting periodically
    setInterval(cleanupRateLimit, 300000); // Every 5 minutes
  }
}

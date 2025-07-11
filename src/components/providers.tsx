'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Language } from '@/types';
import { ThemeProvider } from 'next-themes';
import { DataService } from '@/lib/data-service';

// Simple User type for local auth
interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'user' | 'admin' | 'super_admin';
  preferred_language: Language;
  created_at: string;
}

// Auth Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Language Context
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  direction: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Simple local authentication
const STORAGE_KEY_USER = 'color_testing_user';
const STORAGE_KEY_USERS = 'color_testing_users';

// Default admin credentials
const DEFAULT_ADMIN = {
  email: 'admin@colortest.com',
  password: 'admin123',
  role: 'admin' as const,
};

// Auth Provider
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }
    setLoading(false);
  }, []);

  const generateUserId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const getUsers = (): Array<{email: string, password: string, user: User}> => {
    const users = localStorage.getItem(STORAGE_KEY_USERS);
    return users ? JSON.parse(users) : [];
  };

  const saveUsers = (users: Array<{email: string, password: string, user: User}>) => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    try {
      // Check default admin
      if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
        const adminUser: User = {
          id: 'admin-001',
          email: DEFAULT_ADMIN.email,
          full_name: 'System Administrator',
          role: 'admin',
          preferred_language: 'ar',
          created_at: new Date().toISOString(),
        };

        setUser(adminUser);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(adminUser));
        setLoading(false);
        return;
      }

      // Check registered users
      const users = getUsers();
      const foundUser = users.find(u => u.email === email && u.password === password);

      if (foundUser) {
        setUser(foundUser.user);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(foundUser.user));
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);

    try {
      const users = getUsers();

      // Check if user already exists
      if (users.find(u => u.email === email)) {
        throw new Error('User already exists');
      }

      const newUser: User = {
        id: generateUserId(),
        email,
        full_name: fullName,
        role: 'user',
        preferred_language: 'ar',
        created_at: new Date().toISOString(),
      };

      users.push({ email, password, user: newUser });
      saveUsers(users);

      setUser(newUser);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  const refreshUser = async () => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const value = {
    user,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Language Provider
function LanguageProvider({ 
  children, 
  initialLanguage = 'ar' 
}: { 
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    
    // Update document attributes
    document.documentElement.lang = newLanguage;
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    
    // Update body class for font
    document.body.className = document.body.className.replace(
      /font-(arabic|english)/g,
      `font-${newLanguage === 'ar' ? 'arabic' : 'english'}`
    );
    
    // Store preference
    localStorage.setItem('preferred-language', newLanguage);
  };

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && ['ar', 'en'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const direction: 'rtl' | 'ltr' = language === 'ar' ? 'rtl' : 'ltr';

  const value: LanguageContextType = {
    language,
    setLanguage,
    direction,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Main Providers Component
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

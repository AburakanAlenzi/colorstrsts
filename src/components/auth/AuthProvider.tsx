'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createOrUpdateUserProfile, getUserProfile, UserProfile } from '@/lib/subscription-service';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // تحديث ملف المستخدم
  const refreshUserProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    }
  };

  // تسجيل الدخول بالإيميل وكلمة المرور
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // إنشاء حساب جديد
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && userCredential.user) {
        // يمكن إضافة تحديث الاسم هنا إذا لزم الأمر
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  // تسجيل الدخول بـ Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();

      // إعداد إضافي لـ Google Provider
      provider.addScope('email');
      provider.addScope('profile');

      // إعداد معاملات مخصصة
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);

      // التحقق من نجاح العملية
      if (result.user) {
        console.log('Google sign in successful:', result.user.email);
        return result;
      } else {
        throw new Error('No user returned from Google sign in');
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);

      // معالجة أخطاء محددة
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('تم إغلاق نافذة تسجيل الدخول');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('تم حجب النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('تم إلغاء طلب تسجيل الدخول');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('تسجيل الدخول بـ Google غير مفعل');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('النطاق غير مصرح له');
      } else {
        throw new Error(error.message || 'خطأ في تسجيل الدخول بـ Google');
      }
    }
  };

  // تسجيل الخروج
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // إعادة تعيين كلمة المرور
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // مراقبة حالة المصادقة
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // إنشاء أو تحديث ملف المستخدم
        try {
          const profile = await createOrUpdateUserProfile(user);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error creating/updating user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

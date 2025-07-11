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
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  updateProfile
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
  checkEmailExists: (email: string) => Promise<boolean>;
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
      console.log('🔄 Starting email/password sign in...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Email/password sign in successful:', result.user.email);
      return result;
    } catch (error: any) {
      console.error('❌ Sign in error:', error);

      // معالجة أخطاء محددة
      if (error.code === 'auth/user-not-found') {
        throw new Error('لا يوجد حساب بهذا البريد الإلكتروني');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('كلمة المرور غير صحيحة');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('البريد الإلكتروني غير صالح');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('تم تعطيل هذا الحساب');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('تم تجاوز عدد المحاولات المسموح. حاول مرة أخرى لاحقاً');
      } else {
        throw new Error(error.message || 'خطأ في تسجيل الدخول');
      }
    }
  };

  // إنشاء حساب جديد
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      console.log('🔄 Starting sign up...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName && userCredential.user) {
        // تحديث اسم المستخدم
        try {
          await updateProfile(userCredential.user, {
            displayName: displayName
          });
          console.log('✅ Display name updated:', displayName);
        } catch (updateError) {
          console.warn('⚠️ Failed to update display name:', updateError);
        }
      }

      console.log('✅ Sign up successful:', userCredential.user.email);
      return userCredential;
    } catch (error: any) {
      console.error('❌ Sign up error:', error);

      // معالجة أخطاء محددة
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('هذا البريد الإلكتروني مستخدم بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('كلمة المرور ضعيفة. يجب أن تكون 6 أحرف على الأقل');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('البريد الإلكتروني غير صالح');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('إنشاء الحسابات غير مفعل حالياً');
      } else {
        throw new Error(error.message || 'حدث خطأ أثناء إنشاء الحساب');
      }
    }
  };

  // تسجيل الدخول بـ Google
  const signInWithGoogle = async () => {
    try {
      console.log('🔄 Starting Google Sign-In...');

      // التحقق من إعدادات Firebase
      if (!auth.app.options.apiKey) {
        throw new Error('Firebase API Key is missing');
      }

      const provider = new GoogleAuthProvider();

      // إعداد إضافي لـ Google Provider
      provider.addScope('email');
      provider.addScope('profile');

      // إعداد معاملات مخصصة
      provider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'offline'
      });

      console.log('🔄 Attempting popup sign-in...');
      console.log('Firebase Auth instance:', auth);
      console.log('Google Provider:', provider);

      // محاولة استخدام popup أولاً، ثم redirect كـ fallback
      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError: any) {
        console.warn('⚠️ Popup failed, trying redirect...', popupError);

        if (popupError.code === 'auth/popup-blocked' ||
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code === 'auth/cancelled-popup-request') {
          // استخدام redirect كبديل
          const { signInWithRedirect } = await import('firebase/auth');
          await signInWithRedirect(auth, provider);
          return; // سيتم إعادة التوجيه
        } else {
          throw popupError;
        }
      }

      // التحقق من نجاح العملية
      if (result.user) {
        console.log('✅ Google sign in successful:', result.user.email);
        console.log('User details:', {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        });
        return result;
      } else {
        throw new Error('No user returned from Google sign in');
      }
    } catch (error: any) {
      console.error('❌ Google sign in error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });

      // معالجة أخطاء محددة
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('تم إغلاق نافذة تسجيل الدخول');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('تم حجب النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة في متصفحك');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('تم إلغاء طلب تسجيل الدخول');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('تسجيل الدخول بـ Google غير مفعل في إعدادات Firebase');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('النطاق الحالي غير مصرح له في إعدادات Firebase');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('خطأ في الاتصال بالشبكة. تحقق من اتصالك بالإنترنت');
      } else if (error.code === 'auth/internal-error') {
        throw new Error('خطأ داخلي في Firebase. حاول مرة أخرى');
      } else {
        throw new Error(error.message || 'خطأ غير متوقع في تسجيل الدخول بـ Google');
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
    // فحص نتيجة redirect عند تحميل الصفحة
    const checkRedirectResult = async () => {
      try {
        const { getRedirectResult } = await import('firebase/auth');
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('✅ Redirect sign-in successful:', result.user.email);
        }
      } catch (error) {
        console.error('❌ Redirect result error:', error);
      }
    };

    checkRedirectResult();

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

  // فحص وجود البريد الإلكتروني
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    refreshUserProfile,
    checkEmailExists
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

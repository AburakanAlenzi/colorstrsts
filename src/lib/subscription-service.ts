import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from './firebase';

// تأجيل استيراد الأنواع لتجنب مشاكل البناء
let subscriptionTypes: any = null;

async function getSubscriptionTypes() {
  if (!subscriptionTypes && typeof window !== 'undefined') {
    const typesModule = await import('@/types/subscription');
    subscriptionTypes = typesModule;
  }
  return subscriptionTypes;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: any;
  subscription?: {
    status: 'active' | 'inactive' | 'canceled' | 'past_due';
    plan: 'free' | 'premium';
    tapCustomerId?: string;
    tapSubscriptionId?: string;
    currentPeriodStart?: any;
    currentPeriodEnd?: any;
  };
  usage: {
    freeTestsUsed: number;
    totalTestsUsed: number;
    lastTestDate?: any;
  };
}

export interface TestUsage {
  uid: string;
  testId: string;
  testName: string;
  timestamp: any;
  isFree: boolean;
}

// إنشاء أو تحديث ملف المستخدم
export async function createOrUpdateUserProfile(user: User): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  } else {
    const newUserProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      createdAt: serverTimestamp(),
      subscription: {
        status: 'inactive',
        plan: 'free'
      },
      usage: {
        freeTestsUsed: 0,
        totalTestsUsed: 0
      }
    };

    await setDoc(userRef, newUserProfile);
    return newUserProfile;
  }
}

// الحصول على ملف المستخدم
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
}

// تحديث حالة الاشتراك
export async function updateSubscriptionStatus(
  uid: string, 
  subscriptionData: Partial<UserProfile['subscription']>
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    subscription: subscriptionData
  });
}

// تسجيل استخدام اختبار
export async function recordTestUsage(
  uid: string, 
  testId: string, 
  testName: string, 
  isFree: boolean = false
): Promise<void> {
  // إضافة سجل الاستخدام
  const usageRef = collection(db, 'testUsage');
  await addDoc(usageRef, {
    uid,
    testId,
    testName,
    timestamp: serverTimestamp(),
    isFree
  });

  // تحديث إحصائيات المستخدم
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data() as UserProfile;
    const updates: any = {
      'usage.totalTestsUsed': userData.usage.totalTestsUsed + 1,
      'usage.lastTestDate': serverTimestamp()
    };

    if (isFree) {
      updates['usage.freeTestsUsed'] = userData.usage.freeTestsUsed + 1;
    }

    await updateDoc(userRef, updates);
  }
}

// Get admin subscription settings
async function getSubscriptionSettingsAsync() {
  try {
    // Check global settings first for immediate access
    if (typeof window !== 'undefined' && (window as any).subscriptionSettings) {
      return (window as any).subscriptionSettings;
    }

    // Import Firebase function dynamically to avoid SSR issues
    const { getSubscriptionSettings: getFirebaseSettings } = await import('@/lib/firebase-realtime');
    const firebaseSettings = await getFirebaseSettings();

    // Cache in global settings for immediate access
    if (typeof window !== 'undefined') {
      (window as any).subscriptionSettings = firebaseSettings;
    }

    return firebaseSettings;
  } catch (error) {
    console.error('Error loading subscription settings from Firebase:', error);

    // Fallback to default settings
    return {
      freeTestsEnabled: true,
      freeTestsCount: 5,
      premiumRequired: true,
      globalFreeAccess: false,
      specificPremiumTests: []
    };
  }
}

// التحقق من إمكانية الوصول للاختبار
export async function canAccessTest(uid: string, testIndex: number): Promise<{
  canAccess: boolean;
  reason?: string;
  requiresSubscription?: boolean;
}> {
  // Get admin settings from Firebase
  const settings = await getSubscriptionSettingsAsync();

  // If global free access is enabled, allow all tests
  if (settings.globalFreeAccess) {
    return { canAccess: true };
  }

  let userProfile = await getUserProfile(uid);

  // If user profile doesn't exist, create it first
  if (!userProfile) {
    try {
      // Create a basic user profile for new users
      const userRef = doc(db, 'users', uid);
      const newUserProfile: UserProfile = {
        uid: uid,
        email: '', // Will be updated when available
        displayName: '',
        subscription: null,
        testUsage: [],
        createdAt: new Date(),
        lastLoginAt: new Date()
      };

      await setDoc(userRef, newUserProfile);
      userProfile = newUserProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      // Even if profile creation fails, still check global settings
      if (settings.globalFreeAccess) {
        return { canAccess: true };
      }
      return { canAccess: false, reason: 'User profile not found and could not be created' };
    }
  }

  // Check if this specific test requires premium
  if (settings.specificPremiumTests && settings.specificPremiumTests.includes(testIndex + 1)) {
    // This test specifically requires premium
    if (userProfile.subscription?.status === 'active' && userProfile.subscription?.plan === 'premium') {
      return { canAccess: true };
    }
    return {
      canAccess: false,
      reason: 'Premium subscription required for this test',
      requiresSubscription: true
    };
  }

  // Check free tests limit
  if (settings.freeTestsEnabled && testIndex < settings.freeTestsCount) {
    return { canAccess: true };
  }

  // If premium is required for advanced tests and user doesn't have premium
  if (settings.premiumRequired && testIndex >= settings.freeTestsCount) {
    if (userProfile.subscription?.status === 'active' && userProfile.subscription?.plan === 'premium') {
      return { canAccess: true };
    }
    return {
      canAccess: false,
      reason: 'Premium subscription required',
      requiresSubscription: true
    };
  }

  // Default allow access
  return { canAccess: true };
}

// الحصول على إحصائيات الاستخدام
export async function getUserUsageStats(uid: string): Promise<{
  freeTestsUsed: number;
  totalTestsUsed: number;
  freeTestsRemaining: number;
  recentTests: TestUsage[];
}> {
  const userProfile = await getUserProfile(uid);
  
  if (!userProfile) {
    return {
      freeTestsUsed: 0,
      totalTestsUsed: 0,
      freeTestsRemaining: 5,
      recentTests: []
    };
  }

  // الحصول على آخر 10 اختبارات
  const usageQuery = query(
    collection(db, 'testUsage'),
    where('uid', '==', uid)
  );
  
  const usageSnap = await getDocs(usageQuery);
  const recentTests: TestUsage[] = usageSnap.docs
    .map(doc => doc.data() as TestUsage)
    .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)
    .slice(0, 10);

  return {
    freeTestsUsed: userProfile.usage.freeTestsUsed,
    totalTestsUsed: userProfile.usage.totalTestsUsed,
    freeTestsRemaining: Math.max(0, 5 - userProfile.usage.freeTestsUsed),
    recentTests
  };
}

// تحديث اشتراك المستخدم (للاستخدام مع Tap Webhooks)
export async function updateUserSubscription(
  userId: string,
  subscriptionData: {
    status: 'active' | 'inactive' | 'canceled' | 'past_due';
    plan: 'free' | 'premium';
    tapCustomerId?: string;
    tapSubscriptionId?: string;
    currentPeriodStart?: any;
    currentPeriodEnd?: any;
  }
): Promise<void> {
  const userRef = doc(db, 'users', userId);

  await updateDoc(userRef, {
    subscription: subscriptionData,
    updatedAt: serverTimestamp()
  });
}

// ===== STC Pay Integration Functions =====

/**
 * إنشاء اشتراك جديد مع STC Pay
 */
export async function createSTCSubscription(subscription: any): Promise<string> {
  try {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const subscriptionData = {
      ...subscription,
      id: subscriptionId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'stc_subscriptions', subscriptionId), {
      ...subscriptionData,
      startDate: Timestamp.fromDate(subscriptionData.startDate),
      endDate: Timestamp.fromDate(subscriptionData.endDate),
      createdAt: Timestamp.fromDate(subscriptionData.createdAt),
      updatedAt: Timestamp.fromDate(subscriptionData.updatedAt)
    });

    // تهيئة استخدام المستخدم
    await initializeSTCUsage(subscription.userId, subscription.planId);

    return subscriptionId;
  } catch (error) {
    console.error('Error creating STC subscription:', error);
    throw new Error('Failed to create subscription');
  }
}

/**
 * الحصول على اشتراك المستخدم الحالي مع STC Pay
 */
export async function getUserSTCSubscription(userId: string): Promise<any | null> {
  try {
    const q = query(
      collection(db, 'stc_subscriptions'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docData = querySnapshot.docs[0];
    const data = docData.data();

    return {
      ...data,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    };
  } catch (error) {
    console.error('Error getting user STC subscription:', error);
    return null;
  }
}

/**
 * تحديث حالة اشتراك STC Pay
 */
export async function updateSTCSubscriptionStatus(
  subscriptionId: string,
  status: string,
  transactionId?: string
): Promise<void> {
  try {
    const updateData: any = {
      status,
      updatedAt: Timestamp.fromDate(new Date())
    };

    if (transactionId) {
      updateData.transactionId = transactionId;
    }

    await updateDoc(doc(db, 'stc_subscriptions', subscriptionId), updateData);
  } catch (error) {
    console.error('Error updating STC subscription status:', error);
    throw new Error('Failed to update subscription status');
  }
}

/**
 * التحقق من صحة اشتراك STC Pay
 */
export async function isSTCSubscriptionValid(userId: string): Promise<boolean> {
  try {
    const subscription = await getUserSTCSubscription(userId);

    if (!subscription) {
      return false;
    }

    if (subscription.status !== 'active') {
      return false;
    }

    const now = new Date();
    if (now > subscription.endDate) {
      // انتهت صلاحية الاشتراك، تحديث الحالة
      await updateSTCSubscriptionStatus(subscription.id, 'expired');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking STC subscription validity:', error);
    return false;
  }
}

/**
 * إضافة سجل دفع STC Pay
 */
export async function addSTCPaymentHistory(payment: any): Promise<void> {
  try {
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await setDoc(doc(db, 'stc_payment_history', paymentId), {
      ...payment,
      id: paymentId,
      paidAt: Timestamp.fromDate(payment.paidAt)
    });
  } catch (error) {
    console.error('Error adding STC payment history:', error);
    throw new Error('Failed to add payment history');
  }
}

/**
 * الحصول على تاريخ مدفوعات STC Pay
 */
export async function getSTCPaymentHistory(userId: string): Promise<any[]> {
  try {
    const q = query(
      collection(db, 'stc_payment_history'),
      where('userId', '==', userId),
      orderBy('paidAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        paidAt: data.paidAt.toDate()
      };
    });
  } catch (error) {
    console.error('Error getting STC payment history:', error);
    return [];
  }
}

/**
 * تهيئة استخدام المستخدم لـ STC Pay
 */
async function initializeSTCUsage(userId: string, planId: string): Promise<void> {
  try {
    // استخدام خطط افتراضية بدلاً من الاستيراد
    const defaultPlans = [
      { id: 'free', testLimit: 5 },
      { id: 'monthly', testLimit: -1 },
      { id: 'yearly', testLimit: -1 }
    ];

    const plan = defaultPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid plan ID');
    }

    const now = new Date();
    const resetDate = new Date(now);
    resetDate.setMonth(resetDate.getMonth() + 1);

    const usage = {
      userId,
      planId,
      testsUsed: 0,
      testsLimit: plan.testLimit,
      resetDate
    };

    await setDoc(doc(db, 'stc_subscription_usage', userId), {
      ...usage,
      resetDate: Timestamp.fromDate(usage.resetDate)
    });
  } catch (error) {
    console.error('Error initializing STC usage:', error);
    throw new Error('Failed to initialize usage');
  }
}

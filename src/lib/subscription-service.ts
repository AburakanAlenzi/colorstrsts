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
  serverTimestamp 
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from './firebase';

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

// التحقق من إمكانية الوصول للاختبار
export async function canAccessTest(uid: string, testIndex: number): Promise<{
  canAccess: boolean;
  reason?: string;
  requiresSubscription?: boolean;
}> {
  const userProfile = await getUserProfile(uid);
  
  if (!userProfile) {
    return { canAccess: false, reason: 'User profile not found' };
  }

  // أول 5 اختبارات مجانية (indices 0-4)
  if (testIndex < 5) {
    return { canAccess: true };
  }

  // باقي الاختبارات تتطلب اشتراك نشط
  if (userProfile.subscription?.status === 'active' && userProfile.subscription?.plan === 'premium') {
    return { canAccess: true };
  }

  return { 
    canAccess: false, 
    reason: 'Premium subscription required',
    requiresSubscription: true 
  };
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

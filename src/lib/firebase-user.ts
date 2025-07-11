import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db } from './firebase';

// Types for User Profile
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  occupation?: string;
  bio?: string;
  avatar?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  isActive: boolean;
  preferences: {
    language: 'ar' | 'en';
    theme: 'light' | 'dark';
    notifications: boolean;
    emailUpdates: boolean;
  };
}

// Types for Test History
export interface TestHistoryEntry {
  id?: string;
  userId: string;
  testId: string;
  testName: string;
  testNameAr: string;
  visitedAt: Timestamp;
  visitCount: number;
  lastVisitDuration?: number; // in seconds
  testType: string;
  possibleSubstance: string;
  possibleSubstanceAr: string;
}

export interface UserTestHistory {
  userId: string;
  totalTests: number;
  totalVisits: number;
  lastVisitAt: Timestamp;
  favoriteTestType?: string;
  tests: TestHistoryEntry[];
}

// Collection references
const USER_PROFILES_COLLECTION = 'user_profiles';
const USER_TEST_HISTORY_COLLECTION = 'user_test_history';

// User Profile Functions
export async function createUserProfile(
  uid: string,
  email: string,
  additionalData: Partial<UserProfile> = {}
): Promise<void> {
  try {
    const now = Timestamp.now();
    const userProfile: UserProfile = {
      uid,
      email,
      displayName: additionalData.displayName || email.split('@')[0],
      firstName: additionalData.firstName || '',
      lastName: additionalData.lastName || '',
      phoneNumber: additionalData.phoneNumber || '',
      dateOfBirth: additionalData.dateOfBirth || '',
      country: additionalData.country || '',
      city: additionalData.city || '',
      occupation: additionalData.occupation || '',
      bio: additionalData.bio || '',
      avatar: additionalData.avatar || '',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      isActive: true,
      preferences: {
        language: additionalData.preferences?.language || 'ar',
        theme: additionalData.preferences?.theme || 'light',
        notifications: additionalData.preferences?.notifications ?? true,
        emailUpdates: additionalData.preferences?.emailUpdates ?? true,
      },
      ...additionalData
    };

    const userRef = doc(db, USER_PROFILES_COLLECTION, uid);
    await setDoc(userRef, userProfile);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, USER_PROFILES_COLLECTION, uid);
    const snapshot = await getDoc(userRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, USER_PROFILES_COLLECTION, uid);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
}

export async function updateLastLogin(uid: string): Promise<void> {
  try {
    const userRef = doc(db, USER_PROFILES_COLLECTION, uid);
    await updateDoc(userRef, {
      lastLoginAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    // Don't throw error for this non-critical operation
  }
}

// Test History Functions
export async function recordTestVisit(
  userId: string,
  testId: string,
  testName: string,
  testNameAr: string,
  testType: string,
  possibleSubstance: string,
  possibleSubstanceAr: string,
  visitDuration?: number
): Promise<void> {
  try {
    const historyRef = doc(db, USER_TEST_HISTORY_COLLECTION, userId);
    const testRef = doc(historyRef, 'tests', testId);
    
    // Check if test entry already exists
    const existingTest = await getDoc(testRef);
    const now = Timestamp.now();
    
    if (existingTest.exists()) {
      // Update existing entry
      await updateDoc(testRef, {
        visitedAt: now,
        visitCount: increment(1),
        lastVisitDuration: visitDuration || 0
      });
    } else {
      // Create new entry
      const newEntry: TestHistoryEntry = {
        userId,
        testId,
        testName,
        testNameAr,
        visitedAt: now,
        visitCount: 1,
        lastVisitDuration: visitDuration || 0,
        testType,
        possibleSubstance,
        possibleSubstanceAr
      };
      
      await setDoc(testRef, newEntry);
    }
    
    // Update user's overall test history summary
    const userHistorySnapshot = await getDoc(historyRef);
    if (userHistorySnapshot.exists()) {
      await updateDoc(historyRef, {
        totalVisits: increment(1),
        lastVisitAt: now
      });
    } else {
      // Create user history document
      const userHistory: Partial<UserTestHistory> = {
        userId,
        totalTests: 1,
        totalVisits: 1,
        lastVisitAt: now
      };
      
      await setDoc(historyRef, userHistory);
    }
  } catch (error) {
    console.error('Error recording test visit:', error);
    throw new Error('Failed to record test visit');
  }
}

export async function getUserTestHistory(
  userId: string,
  limitCount: number = 10
): Promise<TestHistoryEntry[]> {
  try {
    const historyRef = doc(db, USER_TEST_HISTORY_COLLECTION, userId);
    const testsRef = collection(historyRef, 'tests');
    
    const q = query(
      testsRef,
      orderBy('visitedAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const history: TestHistoryEntry[] = [];
    
    snapshot.docs.forEach(doc => {
      history.push({
        id: doc.id,
        ...doc.data()
      } as TestHistoryEntry);
    });
    
    return history;
  } catch (error) {
    console.error('Error getting user test history:', error);
    throw new Error('Failed to fetch test history');
  }
}

export async function getUserTestStats(userId: string): Promise<{
  totalTests: number;
  totalVisits: number;
  lastVisitAt?: Timestamp;
  favoriteTestType?: string;
  mostVisitedTest?: TestHistoryEntry;
}> {
  try {
    const historyRef = doc(db, USER_TEST_HISTORY_COLLECTION, userId);
    const userHistorySnapshot = await getDoc(historyRef);
    
    if (!userHistorySnapshot.exists()) {
      return {
        totalTests: 0,
        totalVisits: 0
      };
    }
    
    const userHistory = userHistorySnapshot.data() as UserTestHistory;
    
    // Get most visited test
    const testsRef = collection(historyRef, 'tests');
    const mostVisitedQuery = query(
      testsRef,
      orderBy('visitCount', 'desc'),
      limit(1)
    );
    
    const mostVisitedSnapshot = await getDocs(mostVisitedQuery);
    let mostVisitedTest: TestHistoryEntry | undefined;
    
    if (!mostVisitedSnapshot.empty) {
      const doc = mostVisitedSnapshot.docs[0];
      mostVisitedTest = {
        id: doc.id,
        ...doc.data()
      } as TestHistoryEntry;
    }
    
    return {
      totalTests: userHistory.totalTests || 0,
      totalVisits: userHistory.totalVisits || 0,
      lastVisitAt: userHistory.lastVisitAt,
      favoriteTestType: userHistory.favoriteTestType,
      mostVisitedTest
    };
  } catch (error) {
    console.error('Error getting user test stats:', error);
    throw new Error('Failed to fetch test statistics');
  }
}

export async function clearUserTestHistory(userId: string): Promise<void> {
  try {
    const historyRef = doc(db, USER_TEST_HISTORY_COLLECTION, userId);
    const testsRef = collection(historyRef, 'tests');
    
    // Get all test documents
    const snapshot = await getDocs(testsRef);
    
    // Delete all test documents
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Reset user history summary
    await updateDoc(historyRef, {
      totalTests: 0,
      totalVisits: 0,
      lastVisitAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error clearing user test history:', error);
    throw new Error('Failed to clear test history');
  }
}

// Helper function to format timestamps
export function formatTimestamp(timestamp: Timestamp, locale: string = 'ar-SA'): string {
  try {
    const date = timestamp.toDate();
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid date';
  }
}

// Helper function to calculate time ago
export function getTimeAgo(timestamp: Timestamp, locale: string = 'ar'): string {
  try {
    const now = new Date();
    const date = timestamp.toDate();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (locale === 'ar') {
      if (diffInSeconds < 60) return 'منذ لحظات';
      if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
      if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
      if (diffInSeconds < 2592000) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
      return `منذ ${Math.floor(diffInSeconds / 2592000)} شهر`;
    } else {
      if (diffInSeconds < 60) return 'moments ago';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    }
  } catch (error) {
    return locale === 'ar' ? 'غير محدد' : 'Unknown';
  }
}

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration from environment variables
// إعداد Firebase من متغيرات البيئة

// Get Firebase configuration from environment variables or fallback to defaults
// الحصول على إعداد Firebase من متغيرات البيئة أو استخدام القيم الافتراضية
const getFirebaseConfig = () => {
  // Check if we're in development mode and have environment variables
  const isDevelopment = process.env.NODE_ENV === 'development';
  const hasEnvVars = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (isDevelopment && hasEnvVars) {
    // Use environment variables in development
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };
  } else {
    // Fallback configuration for static export or when env vars are not available
    // إعداد احتياطي للتصدير الثابت أو عندما متغيرات البيئة غير متاحة
    return {
      apiKey: "AIzaSyBCTEmastiOgvmTDu1EHxA0bkDAws00bIU",
      authDomain: "colorstests-573ef.firebaseapp.com",
      databaseURL: "https://colorstests-573ef-default-rtdb.firebaseio.com",
      projectId: "colorstests-573ef",
      storageBucket: "colorstests-573ef.firebasestorage.app",
      messagingSenderId: "94361461929",
      appId: "1:94361461929:web:b34ad287c782710415f5b8"
    };
  }
};

const firebaseConfig = getFirebaseConfig();

// Validate Firebase configuration
// التحقق من صحة إعداد Firebase
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration is incomplete');
  console.error('Please check your Firebase configuration');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

// Initialize Analytics (optional, only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;

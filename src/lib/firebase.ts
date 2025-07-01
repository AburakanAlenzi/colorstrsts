// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBCTEmastiOgvmTDu1EHxA0bkDAws00bIU",
  authDomain: "colorstests-573ef.firebaseapp.com",
  projectId: "colorstests-573ef",
  storageBucket: "colorstests-573ef.firebasestorage.app",
  messagingSenderId: "94361461929",
  appId: "1:94361461929:web:b34ad287c782710415f5b8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional, only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;

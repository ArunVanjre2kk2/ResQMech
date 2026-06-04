// firebase/firebaseConfig.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// NOTE: For production, move these to environment variables
// For now, keeping them here but with better error handling
const firebaseConfig = {
  apiKey: "AIzaSyBxc0i07WYno9r4id6oVQWNb0RXEthNYhY",
  authDomain: "resqmech-131a2.firebaseapp.com",
  projectId: "resqmech-131a2",
  storageBucket: "resqmech-131a2.appspot.com",
  messagingSenderId: "853452936422",
  appId: "1:853452936422:web:e62967787c5a5ba8ac5727"
};

// Validate configuration
const requiredKeys: (keyof typeof firebaseConfig)[] = [
  'apiKey',
  'authDomain', 
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
];

const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error('❌ Missing Firebase configuration keys:', missingKeys);
  throw new Error('Firebase configuration is incomplete');
}

// Initialize Firebase (singleton pattern)
let app;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Log initialization success (remove in production)
if (__DEV__) {
  console.log('✅ Firebase initialized successfully');
}
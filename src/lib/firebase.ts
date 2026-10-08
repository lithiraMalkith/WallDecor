// ============================================================================
// Ceylon Wall Decor — Firebase Client & Firestore Configuration
// ============================================================================

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  type Auth,
  type User as FirebaseUser,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Check if valid Firebase credentials are provided in environment
export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "your-api-key-here" &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "AIzaSyPlaceholderKeyForBuildTimeOnly1234"
);

// Lazy/singleton initialization
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (typeof window !== "undefined" || isFirebaseConfigured) {
  try {
    if (!getApps().length) {
      app = initializeApp(
        isFirebaseConfigured
          ? firebaseConfig
          : {
              apiKey: "AIzaSyPlaceholderKeyForBuildTimeOnly1234",
              projectId: "ceylon-wall-decor-dev",
              authDomain: "ceylon-wall-decor-dev.firebaseapp.com",
            }
      );
    } else {
      app = getApp();
    }

    auth = getAuth(app);
    db = getFirestore(app);

    googleProvider = new GoogleAuthProvider();
    // Enforce Google account selection dialog and permission consent every time
    googleProvider.setCustomParameters({
      prompt: "select_account",
    });
    googleProvider.addScope("profile");
    googleProvider.addScope("email");
  } catch (err) {
    console.warn("Firebase initialization notice:", err);
  }
}

export { app, auth, db, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult, firebaseSignOut };
export type { FirebaseUser };

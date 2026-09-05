import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyCmLPvdXGtXUHyBggvAxYzL9P5Syoiw0Jw",
  authDomain: "tradestory-42192.firebaseapp.com",
  projectId: "tradestory-42192",
  storageBucket: "tradestory-42192.firebasestorage.app",
  messagingSenderId: "524763624071",
  appId: "1:524763624071:web:a1840ebf8561b1d64c7e22",
  measurementId: "G-CKLH08E18Z"
};

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize analytics safely
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Ignore environments where analytics is blocked or unsupported
  });
}

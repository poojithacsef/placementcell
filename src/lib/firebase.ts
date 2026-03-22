import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB8uNN8GI1_h-tmScVaSnosQCnceKoOn_4",
  authDomain: "placementsp-cab11.firebaseapp.com",
  projectId: "placementsp-cab11",
  storageBucket: "placementsp-cab11.firebasestorage.app",
  messagingSenderId: "111496312735",
  appId: "1:111496312735:web:cf928ef1801ed8d7e96faa",
  measurementId: "G-6YBKNYDZ19"
};

export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

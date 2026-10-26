import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCOLyBnVy8YLnSXjXu1rZsc-rF09Nis_sI",
  authDomain: "shweywethla-49cb4.firebaseapp.com",
  databaseURL: "https://shweywethla-49cb4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "shweywethla-49cb4",
  storageBucket: "shweywethla-49cb4.firebasestorage.app",
  messagingSenderId: "594546464212",
  appId: "1:594546464212:web:97389851dba108344bf241",
  measurementId: "G-6F9283EEQZ"
};

// Initialize Firebase (singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

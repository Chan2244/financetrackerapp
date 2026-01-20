import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

console.log("=== Firebase Configuration Check ===");
console.log("API Key exists:", !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log("Auth Domain:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log("Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate configuration
const missingVars = [];
if (!firebaseConfig.apiKey) missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
if (!firebaseConfig.authDomain) missingVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
if (!firebaseConfig.projectId) missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");

if (missingVars.length > 0) {
  console.error("❌ Missing Firebase environment variables:", missingVars);
  throw new Error(`Missing Firebase config: ${missingVars.join(", ")}`);
}

console.log("✅ Firebase config validated");

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase app initialized");
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  throw error;
}

let db;
try {
  db = getFirestore(app);
  console.log("✅ Firestore initialized");
} catch (error) {
  console.error("❌ Firestore initialization error:", error);
  throw error;
}

let auth;
try {
  auth = getAuth(app);
  console.log("✅ Firebase Auth initialized");
} catch (error) {
  console.error("❌ Auth initialization error:", error);
  throw error;
}

export { app, db, auth };
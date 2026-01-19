// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_JkZn_b6HHf2-uJPgNds3GfR0_S2Adlw",
  authDomain: "hcongame.firebaseapp.com",
  databaseURL: "https://hcongame-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hcongame",
  storageBucket: "hcongame.firebasestorage.app",
  messagingSenderId: "829949342689",
  appId: "1:829949342689:web:755e90fd716ae3c6a7d8a0",
  measurementId: "G-8ET4X61V69"
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Realtime Database
const database: Database = getDatabase(app);

export { app, database };

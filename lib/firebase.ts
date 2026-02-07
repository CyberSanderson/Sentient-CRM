// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // 👈 Added this for Database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAL2wA0-Gu25c8rGZfCb-IXk2WWbdA27_E",
  authDomain: "sentient-crm-a1a3e.firebaseapp.com",
  projectId: "sentient-crm-a1a3e",
  storageBucket: "sentient-crm-a1a3e.firebasestorage.app",
  messagingSenderId: "940516968398",
  appId: "1:940516968398:web:e34fabf0504825d59d8d9f",
  measurementId: "G-BGGEHFFMNR"
};

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Initialize and EXPORT the Database
// ⚠️ This is the critical part your app was missing!
export const db = getFirestore(app);
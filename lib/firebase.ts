import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// PASTE YOUR KEYS FROM FIREBASE CONSOLE HERE
const firebaseConfig = {
  apiKey: "AIzaSy...", 
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);

// We ONLY export the database (db), not auth, because Clerk handles auth!
export const db = getFirestore(app);
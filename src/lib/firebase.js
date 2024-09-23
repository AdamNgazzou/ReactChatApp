import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: "reactchat-3c870.firebaseapp.com",
    projectId: "reactchat-3c870",
    storageBucket: "reactchat-3c870.appspot.com",
    messagingSenderId: "363534437355",
    appId: "1:363534437355:web:3ef6abe3414264e6d2a7ae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()
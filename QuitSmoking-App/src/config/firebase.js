// src/config/firebase.js
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIza....",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcd1234"
};

export const firebaseApp = initializeApp(firebaseConfig);

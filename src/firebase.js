// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyARiqtsVR7cmX6iU3cD0P7LvvWfp4zv4To",
  authDomain: "prenotazione-arco.firebaseapp.com",
  projectId: "prenotazione-arco",
  storageBucket: "prenotazione-arco.firebasestorage.app",
  messagingSenderId: "308635909661",
  appId: "1:308635909661:web:ea5396b2903d880f30d0f4"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(firebaseApp);

export { db };

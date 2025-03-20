// lib/firebase.ts

// import { initializeApp, getApp, getApps } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
// };

// const firebaseConfig = {
//   apiKey: "AIzaSyB1iCe_RPqST1lfDIqoXNeaYurZZz-wjIk",
//   authDomain: "pharmacymanagementsystem-8c166.firebaseapp.com",
//   projectId: "pharmacymanagementsystem-8c166",
//   storageBucket: "pharmacymanagementsystem-8c166.firebasestorage.app",
//   messagingSenderId: "775613059675",
//   appId: "1:775613059675:web:db4bd10fe229faa41ea57e",
//   measurementId: "G-E0PMDQZJ0X"
// };



// Initialize Firebase
// const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// // Initialize services
// const db = getFirestore(app);
// const auth = getAuth(app);

// export { app, db, auth, };
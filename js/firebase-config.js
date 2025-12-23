// Firebase Configuration
// REPLACE THESE VALUES WITH YOUR OWN FROM THE FIREBASE CONSOLE
// 1. Go to console.firebase.google.com
// 2. Create a new project
// 3. Go to Project Settings -> General -> "Your apps" -> Web App
// 4. Copy the "firebaseConfig" object values here
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};

// Initialize Firebase
let db = null;
let firebaseApp = null;

if (typeof firebase !== 'undefined') {
    try {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        console.log("Firebase initialized successfully");
    } catch (e) {
        console.warn("Firebase initialization failed (likely due to invalid config). App running in offline mode.", e);
    }
} else {
    console.error("Firebase SDK not loaded.");
}

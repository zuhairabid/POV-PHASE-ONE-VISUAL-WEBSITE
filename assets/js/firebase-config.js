// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBG5IqXi9ds5GAn0gOEB2xFIsQuUFivLYM",
    authDomain: "phase-one-visual-web.firebaseapp.com",
    projectId: "phase-one-visual-web",
    storageBucket: "phase-one-visual-web.firebasestorage.app",
    messagingSenderId: "984292050024",
    appId: "1:984292050024:web:aa655e3f005b4cd857e7dd",
    measurementId: "G-X16X214VFG"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

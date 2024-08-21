import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBA0JA17KQ1jSyC43DQYZSDM8-cWC05PoY",
    authDomain: "eternal-quill-89b0b.firebaseapp.com",
    projectId: "eternal-quill-89b0b",
    storageBucket: "eternal-quill-89b0b.appspot.com",
    messagingSenderId: "953679935338",
    appId: "1:953679935338:web:193094487cc0bc9ffb9713",
    measurementId: "G-SELBT4SVVR"
};
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence); // Ensure persistence

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.REACT_APP_FIREBASE_API_KEY,
    authDomain: "eternal-quill-89b0b.firebaseapp.com",
    projectId: "eternal-quill-89b0b",
    storageBucket: "eternal-quill-89b0b.appspot.com",
    messagingSenderId: "953679935338",
    appId: "1:953679935338:web:193094487cc0bc9ffb9713",
    measurementId: "G-SELBT4SVVR"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

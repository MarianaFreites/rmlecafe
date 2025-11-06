import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAj_au6j9BN6Wg1jIVbGgEvQFvecNspND8",
  authDomain: "fir-app-7879e.firebaseapp.com",
  projectId: "fir-app-7879e",
  storageBucket: "fir-app-7879e.appspot.com",
  messagingSenderId: "306274573389",
  appId: "1:306274573389:web:18be157bbd91718a399004",
  measurementId: "G-F2CHN4P537"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
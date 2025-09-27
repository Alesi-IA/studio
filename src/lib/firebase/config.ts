// @ts-nocheck
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "studio-7324678641-463b8",
  appId: "1:1058142614465:web:6edbac373376b420cdf540",
  apiKey: "AIzaSyC635786zZMQLcPywoEeCsS78DAhX0t_S4",
  authDomain: "studio-7324678641-463b8.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "1058142614465"
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

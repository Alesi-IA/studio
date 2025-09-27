
// @ts-nocheck
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "studio-7324678641-463b8",
  appId: "1:1058142614465:web:6edbac373376b420cdf540",
  apiKey: "AIzaSyC635786zZMQLcPywoEeCsS78DAhX0t_S4",
  authDomain: "studio-7324678641-463b8.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "1058142614465",
  storageBucket: "studio-7324678641-463b8.appspot.com",
};


// The app will now work without a real Firebase connection.
// The following initialization is for compatibility but won't be used
// by the mock authentication and data system.
let app, auth, db, storage;

try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
} catch (e) {
    console.warn("Firebase initialization skipped for mock mode. App will use temporary local data.");
    app = null;
    auth = null;
    db = null;
    storage = null;
}


export { app, auth, db, storage };

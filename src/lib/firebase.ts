
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// This is the single source of truth for the Firebase configuration.
// It is hardcoded to ensure the application always connects to the correct project,
// bypassing any potentially incorrect environment variables on the build server.
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyD6nuiR8vuIPd9NBH5twO1jVQZNceSP7Ns",
  authDomain: "ai-architect-app.firebaseapp.com",
  projectId: "ai-architect-app",
  storageBucket: "ai-architect-app.appspot.com",
  messagingSenderId: "74443902983",
  appId: "1:74443902983:web:12e8e48934c724d752daa2"
};

// Initialize Firebase, creating a new app instance if one doesn't already exist.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };

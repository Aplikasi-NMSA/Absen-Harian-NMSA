import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, getDocs } from "firebase/firestore";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut
} from "firebase/auth";
import firebaseConfigJson from "../../firebase-applet-config.json";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1UBvFkyi6vHG9BOiFq2wTMTtkhoYRmMg",
  authDomain: "data-um-nmsa.firebaseapp.com",
  projectId: "data-um-nmsa",
  storageBucket: "data-um-nmsa.firebasestorage.app",
  messagingSenderId: "158324818996",
  appId: "1:158324818996:web:7c58b367b07b255eb8b661"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Setup Google Auth Provider
export const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/drive.file");
provider.addScope("https://www.googleapis.com/auth/spreadsheets");

// Flag to track signing in
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const persistedToken = localStorage.getItem("g_access_token");
      if (persistedToken) {
        cachedAccessToken = persistedToken;
        if (onAuthSuccess) onAuthSuccess(user, persistedToken);
      } else if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      localStorage.removeItem("g_access_token");
      localStorage.removeItem("g_user_email");
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const savedEmail = localStorage.getItem("g_user_email");
    if (savedEmail) {
      provider.setCustomParameters({ login_hint: savedEmail });
    }
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to get Google Access Token from authentication result.");
    }
    cachedAccessToken = credential.accessToken;
    localStorage.setItem("g_access_token", cachedAccessToken);
    if (result.user.email) {
      localStorage.setItem("g_user_email", result.user.email);
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Firebase Sign In with Google failed:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async (): Promise<void> => {
  try {
    await signOut(auth);
    cachedAccessToken = null;
    localStorage.removeItem("g_access_token");
    localStorage.removeItem("g_user_email");
  } catch (error) {
    console.error("Sign out failed:", error);
    throw error;
  }
};

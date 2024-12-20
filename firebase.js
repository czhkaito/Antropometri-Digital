import { initializeApp } from 'firebase/app';
import { 
  initializeAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  getReactNativePersistence 
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, onValue, set, get } from 'firebase/database';

// Firebase config
const firebaseConfig = {
  // Add your own config
};

// Pastikan hanya menginisialisasi aplikasi jika belum ada
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.log("Firebase app sudah terinisialisasi");
}

// Inisialisasi auth dengan persistent storage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Ambil instance database
const db = getDatabase(app);

// Anonymous Authentication Function
const signInAnonymousUser = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    throw error;
  }
};

// Logout function for anonymous user
const logoutAnonymousUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

// Authentication State Listener
const handleAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { 
  db, 
  ref, 
  onValue, 
  set, 
  get, 
  auth,
  signInAnonymousUser,
  logoutAnonymousUser,
  handleAuthStateChange 
};
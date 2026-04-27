// Auth Context — provides authentication state throughout the app
// Wraps Firebase Auth with React Context

import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// Create the context
const AuthContext = createContext(null);

/**
 * Hook to consume the AuthContext.
 * Must be used inside <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/**
 * AuthProvider — wraps the app and exposes auth state + methods.
 */
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while Firebase checks session

  // Subscribe to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe; // cleanup on unmount
  }, []);

  /**
   * Sign up with email/password and create a Firestore user document.
   */
  async function signup(name, email, password) {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);

    // Set the display name on the Auth profile
    await updateProfile(newUser, { displayName: name });

    // Create user document in Firestore `users` collection
    await setDoc(doc(db, 'users', newUser.uid), {
      uid:       newUser.uid,
      name,
      email,
      createdAt: serverTimestamp(),
    });

    return newUser;
  }

  /**
   * Sign in with email/password.
   */
  async function login(email, password) {
    const { user: loggedInUser } = await signInWithEmailAndPassword(auth, email, password);
    return loggedInUser;
  }

  /**
   * Sign out the current user.
   */
  async function logout() {
    await signOut(auth);
  }

  const value = {
    user,       // Firebase User object or null
    loading,    // true during initial session check
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

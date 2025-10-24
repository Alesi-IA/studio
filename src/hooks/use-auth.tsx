
// @ts-nocheck
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useToast } from './use-toast';
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import { FirestorePermissionError, errorEmitter } from '@/firebase';

type UserRole = 'owner' | 'co-owner' | 'moderator' | 'user';

// This will be the user profile fetched from Firestore
interface CannaGrowUser extends User {
  role: UserRole;
  displayName: string;
  bio: string;
}

interface AuthContextType {
  user: User | null; // Keep it simple: just the Firebase user
  loading: boolean;
  // We'll fetch role and other profile data separately where needed
  // This simplifies the core auth logic and avoids race conditions
  signUp: (displayName: string, email: string, pass: string) => Promise<void>;
  logIn: (email: string, pass: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore, areServicesAvailable } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!areServicesAvailable || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, areServicesAvailable]);

  const signUp = useCallback(async (displayName: string, email: string, password: string): Promise<void> => {
    if (!auth || !firestore) throw new Error("Auth services not available");
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, {
      displayName: displayName,
      photoURL: `https://picsum.photos/seed/${firebaseUser.uid}/128/128`,
    });
    
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    const newUserProfile = {
      uid: firebaseUser.uid,
      email: email.toLowerCase(),
      displayName: displayName,
      role: 'user',
      photoURL: `https://picsum.photos/seed/${firebaseUser.uid}/128/128`,
      bio: 'Entusiasta del cultivo, aprendiendo y compartiendo mi viaje en CannaGrow.',
      createdAt: new Date().toISOString(),
    };
    
    await setDoc(userDocRef, newUserProfile);
  }, [auth, firestore]);

  const logIn = useCallback(async (email: string, password: string): Promise<void> => {
    if (!auth) throw new Error("Auth service not available");
    await signInWithEmailAndPassword(auth, email, password);
  }, [auth]);

  const logOut = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
  }, [auth]);

  const value = {
    user,
    loading,
    signUp,
    logIn,
    logOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

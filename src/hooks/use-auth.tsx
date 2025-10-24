

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
import { doc, setDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (displayName: string, email: string, pass: string) => Promise<void>;
  logIn: (email: string, pass: string) => Promise<void>;
  logOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<{displayName: string, photoURL: string, bio: string}>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = pathname === '/login' || pathname === '/register';

    if (user && isPublicRoute) {
      router.push('/');
    }
    
    if (!user && !isPublicRoute) {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  const signUp = useCallback(async (displayName: string, email: string, password: string): Promise<void> => {
    if (!auth || !firestore) throw new Error("Auth services not available");
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    const photoURL = `https://picsum.photos/seed/${firebaseUser.uid}/128/128`;

    await updateProfile(firebaseUser, {
      displayName: displayName,
      photoURL: photoURL,
    });
    
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    const newUserProfile = {
      uid: firebaseUser.uid,
      email: email.toLowerCase(),
      displayName: displayName,
      role: 'user', // All new users are 'user' role by default
      photoURL: photoURL,
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

  const updateUserProfile = useCallback(async (updates: Partial<{displayName: string, photoURL: string, bio: string}>) => {
    if (!user || !firestore || !auth.currentUser) return;
    
    try {
      await updateProfile(auth.currentUser, updates);
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, updates, { merge: true });
      
      const refreshedUser = { ...auth.currentUser };
      setUser(refreshedUser as User);

    } catch (error) {
      console.error("Error updating profile:", error);
    }
  }, [user, firestore, auth]);


  const value = {
    user,
    loading,
    signUp,
    logIn,
    logOut,
    updateUserProfile,
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

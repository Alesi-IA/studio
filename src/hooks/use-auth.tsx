
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useToast } from './use-toast';
import {
  type User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import { usePathname, useRouter } from 'next/navigation';
import type { CannaGrowUser } from '@/types';

interface AuthContextType {
  user: CannaGrowUser | null;
  loading: boolean;
  isOwner: boolean;
  isModerator: boolean;
  signUp: (displayName: string, email: string, pass: string) => Promise<void>;
  logIn: (email: string, pass: string) => Promise<void>;
  logOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<CannaGrowUser>) => Promise<void>;
  _injectUser: (user: CannaGrowUser) => void; // For admin impersonation
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore, isUserLoading: isFirebaseUserLoading } = useFirebase();
  const [user, setUser] = useState<CannaGrowUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<CannaGrowUser> => {
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data() as CannaGrowUser;
    } else {
      // This is a fallback for users that might exist in Auth but not in Firestore
      // (e.g., if Firestore document creation failed during signup)
      const newUserProfile: CannaGrowUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || 'Cultivador Anónimo',
        role: 'user',
        photoURL: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/128/128`,
        bio: 'Entusiasta del cultivo.',
        createdAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, newUserProfile);
      return newUserProfile;
    }
  }, [firestore]);
  

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setAuthLoading(true);
        try {
          const userProfile = await fetchUserProfile(firebaseUser);
          setUser(userProfile);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          setUser(null); // Log out user if profile fetch fails
        } finally {
          setAuthLoading(false);
        }
      } else {
        setUser(null);
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, fetchUserProfile]);
  
  // Redirection logic
  useEffect(() => {
    const loading = authLoading || isFirebaseUserLoading;
    if (loading) return;

    const isPublicRoute = pathname === '/login' || pathname === '/register';

    if (user && isPublicRoute) {
      router.push('/');
    }
    
    if (!user && !isPublicRoute) {
      router.push('/login');
    }
  }, [user, authLoading, isFirebaseUserLoading, pathname, router]);


  const signUp = useCallback(async (displayName: string, email: string, password: string): Promise<void> => {
    if (!auth || !firestore) throw new Error("Auth services not available");
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    const photoURL = `https://picsum.photos/seed/${firebaseUser.uid}/128/128`;

    await updateProfile(firebaseUser, {
      displayName,
      photoURL,
    });
    
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    const newUserProfile: CannaGrowUser = {
      uid: firebaseUser.uid,
      email: email.toLowerCase(),
      displayName,
      role: 'user',
      photoURL,
      bio: 'Entusiasta del cultivo, aprendiendo y compartiendo mi viaje en CannaGrow.',
      createdAt: new Date().toISOString(),
    };
    
    await setDoc(userDocRef, newUserProfile);
    setUser(newUserProfile);

  }, [auth, firestore]);

  const logIn = useCallback(async (email: string, password: string): Promise<void> => {
    if (!auth) throw new Error("Auth service not available");
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle setting the user state
  }, [auth]);

  const logOut = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
  }, [auth]);

  const updateUserProfile = useCallback(async (updates: Partial<CannaGrowUser>) => {
    if (!user || !firestore || !auth.currentUser) {
       toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para actualizar tu perfil.' });
       return;
    };
    
    setAuthLoading(true);
    try {
      // 1. Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: updates.displayName,
        photoURL: updates.photoURL,
      });

      // 2. Update Firestore document
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, updates, { merge: true });
      
      // 3. Create the new user state by merging previous state with updates
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      toast({ title: '¡Éxito!', description: 'Tu perfil ha sido actualizado.' });

    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar tu perfil.' });
    } finally {
      setAuthLoading(false);
    }
  }, [user, firestore, auth, toast]);

  const _injectUser = useCallback((injectedUser: CannaGrowUser) => {
    if (user?.role === 'owner') {
      setUser(injectedUser);
    } else {
       toast({ variant: 'destructive', title: 'No autorizado', description: 'Solo los dueños pueden suplantar a otros usuarios.' });
    }
  }, [user, toast]);

  const value = {
    user,
    loading: authLoading || isFirebaseUserLoading,
    isOwner: user?.role === 'owner',
    isModerator: user?.role === 'moderator' || user?.role === 'co-owner' || user?.role === 'owner',
    signUp,
    logIn,
    logOut,
    updateUserProfile,
    _injectUser,
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

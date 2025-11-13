
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useToast } from './use-toast';
import {
  type User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  signInAnonymously,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, runTransaction, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp, getDocs, query, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import type { CannaGrowUser } from '@/types';
import { FirebaseError } from 'firebase/app';

interface AuthContextType {
  user: CannaGrowUser | null;
  loading: boolean;
  isOwner: boolean;
  isModerator: boolean;
  signUp: (displayName: string, email: string, pass: string) => Promise<void>;
  logIn: (email: string, pass: string) => Promise<void>;
  logInAsGuest: () => Promise<void>;
  logOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<CannaGrowUser>) => Promise<void>;
  createPost: (description: string, imageUri: string) => Promise<void>;
  followUser: (targetUserId: string) => Promise<void>;
  unfollowUser: (targetUserId: string) => Promise<void>;
  addExperience: (userId: string, amount: number) => Promise<void>;
  _injectUser: (user: CannaGrowUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const prototypeUser: CannaGrowUser = {
  uid: 'prototype-user-001',
  email: 'demo@cannagrow.app',
  displayName: 'Canna-Demo',
  role: 'owner',
  photoURL: 'https://picsum.photos/seed/prototype/128/128',
  bio: 'Navegando en modo prototipo. ¡Explorando el futuro del cultivo!',
  createdAt: new Date().toISOString(),
  experiencePoints: 550,
  followerIds: [],
  followingIds: [],
  followerCount: 138,
  followingCount: 42,
  savedPostIds: [],
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore, storage, user: firebaseUser, isUserLoading: isAuthServiceLoading } = useFirebase();
  
  const [localUser, setLocalUser] = useState<CannaGrowUser | null>(null);
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const user = localUser;
  const isOwner = user?.role === 'owner';
  const isModerator = user?.role === 'moderator' || user?.role === 'co-owner' || isOwner;

  useEffect(() => {
    // --- MODO PROTOTIPO ---
    // En lugar de esperar a Firebase Auth, inyectamos un usuario falso.
    if (!user) {
      setLocalUser(prototypeUser);
    }
    setLoading(false);
    // --- FIN MODO PROTOTIPO ---
    
    /*
    // --- Lógica de Firebase Auth (desactivada) ---
    const finalLoadingState = isAuthServiceLoading || (firebaseUser != null && isProfileLoading);
    setLoading(finalLoadingState);

    if (finalLoadingState) return;

    const isPublicRoute = pathname === '/login' || pathname === '/register';

    if (user && isPublicRoute) {
      router.push('/');
    } else if (!user && !isPublicRoute) {
      router.push('/login');
    }
    */
  }, [user, pathname, router]);

  const addExperience = useCallback(async (userId: string, amount: number): Promise<void> => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);
    try {
      await updateDoc(userDocRef, {
        experiencePoints: increment(amount)
      });
    } catch (error) {
       console.warn(`Could not add ${amount}XP to user ${userId}. This likely failed due to security rules if trying to update another user.`);
    }
  }, [firestore]);
  
  const logInAsGuest = useCallback(async (): Promise<void> => {
    toast({ variant: 'destructive', title: 'Función Deshabilitada', description: 'El inicio de sesión real está desactivado en este modo prototipo.' });
  }, [toast]);

  const signUp = useCallback(async (displayName: string, email: string, password: string): Promise<void> => {
     toast({ variant: 'destructive', title: 'Función Deshabilitada', description: 'El registro real está desactivado en este modo prototipo.' });
  }, [toast]);

  const logIn = useCallback(async (email: string, password: string): Promise<void> => {
    toast({ variant: 'destructive', title: 'Función Deshabilitada', description: 'El inicio de sesión real está desactivado en este modo prototipo.' });
  }, [toast]);

  const logOut = useCallback(async () => {
    setLocalUser(null); // En modo prototipo, solo borramos el usuario local
    toast({ title: 'Cerraste Sesión (Modo Prototipo)', description: 'Recarga la página para volver a iniciar sesión automáticamente.' });
    router.push('/login');
  }, [router, toast]);
  
  const updateUserProfile = useCallback(async (updates: Partial<CannaGrowUser>): Promise<void> => {
    if (!user) return;
    setLocalUser(prev => ({...prev!, ...updates}));
    toast({ title: '¡Éxito!', description: 'Tu perfil ha sido actualizado (en modo prototipo).' });
  }, [user, toast]);

  const createPost = useCallback(async (description: string, imageUri: string) => {
    if (!user) return;
    console.log('Post Creado (Modo Prototipo):', { description, imageUri });
    toast({ title: '¡Publicación Creada!', description: 'Tu post se ha creado en modo prototipo.' });
  }, [user, toast]);

  const followUser = useCallback(async (targetUserId: string) => {
    if (!user) return;
     toast({ title: 'Siguiendo (Modo Prototipo)', description: `Ahora sigues al usuario ${targetUserId}.`});
  }, [user, toast]);

  const unfollowUser = useCallback(async (targetUserId: string) => {
    if (!user) return;
    toast({ title: 'Dejaste de Seguir (Modo Prototipo)', description: `Ya no sigues a ${targetUserId}.`});
  }, [user, toast]);

  const _injectUser = useCallback((injectedUser: CannaGrowUser) => {
      setLocalUser(injectedUser);
  }, []);
  

  const value = {
    user,
    loading,
    isOwner,
    isModerator,
    signUp,
    logIn,
    logInAsGuest,
    logOut,
    updateUserProfile,
    createPost,
    followUser,
    unfollowUser,
    addExperience,
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

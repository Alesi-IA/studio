
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
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
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
  _injectUser: (user: CannaGrowUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore, isUserLoading } = useFirebase();
  const [user, setUser] = useState<CannaGrowUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<CannaGrowUser | null> => {
    try {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const firestoreData = userDoc.data();
            return {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                displayName: firestoreData.displayName || firebaseUser.displayName,
                photoURL: firestoreData.photoURL || firebaseUser.photoURL,
                role: firestoreData.role || 'user',
                bio: firestoreData.bio || '',
                createdAt: firestoreData.createdAt,
            };
        } else {
            console.warn(`No profile found in Firestore for user ${firebaseUser.uid}. Attempting to create one.`);
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
    } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
            variant: 'destructive',
            title: 'Error de Perfil',
            description: 'No se pudo cargar tu perfil de usuario desde la base de datos.',
        });
        return null;
    }
  }, [firestore, toast]);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await fetchUserProfile(firebaseUser);
        setUser(userProfile);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth, fetchUserProfile]);
  
  useEffect(() => {
    if (isUserLoading) return;

    const isPublicRoute = pathname === '/login' || pathname === '/register';

    if (user && isPublicRoute) {
      router.push('/');
    }
    
    if (!user && !isPublicRoute) {
      router.push('/login');
    }
  }, [user, isUserLoading, pathname, router]);


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
  }, [auth]);

  const logOut = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    router.push('/login');
  }, [auth, router]);

  const updateUserProfile = useCallback(async (updates: Partial<CannaGrowUser>): Promise<void> => {
    if (!user || !firestore || !auth.currentUser) {
       toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para actualizar tu perfil.' });
       return;
    };
    
    try {
      const authUpdates: { displayName?: string; photoURL?: string } = {};
      if (updates.displayName && updates.displayName !== user.displayName) {
        authUpdates.displayName = updates.displayName;
      }
      if (updates.photoURL && updates.photoURL !== user.photoURL) {
        authUpdates.photoURL = updates.photoURL;
      }

      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(auth.currentUser, authUpdates);
      }

      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, updates);
      
      // Force a re-fetch of the user profile to ensure all data is in sync
      const updatedUser = await fetchUserProfile(auth.currentUser);
      setUser(updatedUser);

      toast({ title: '¡Éxito!', description: 'Tu perfil ha sido actualizado.' });

    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar tu perfil.' });
    }
  }, [user, firestore, auth, toast, fetchUserProfile]);

  const _injectUser = useCallback((injectedUser: CannaGrowUser) => {
    if (user?.role === 'owner') {
      setUser(injectedUser);
    } else {
       toast({ variant: 'destructive', title: 'No autorizado', description: 'Solo los dueños pueden suplantar a otros usuarios.' });
    }
  }, [user, toast]);

  const value = {
    user,
    loading: isUserLoading,
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

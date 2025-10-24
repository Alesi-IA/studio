
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
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import { FirestorePermissionError, errorEmitter } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';

type UserRole = 'owner' | 'co-owner' | 'moderator' | 'user';

interface CannaGrowUser extends User {
  role: UserRole;
  displayName: string;
  bio: string;
}

interface AuthContextType {
  user: CannaGrowUser | null;
  loading: boolean;
  role: UserRole | null;
  isOwner: boolean;
  isCoOwner: boolean;
  isModerator: boolean;
  signUp: (displayName: string, email: string, pass: string) => Promise<void>;
  logIn: (email: string, pass: string) => Promise<void>;
  logOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<Pick<CannaGrowUser, 'displayName' | 'bio' | 'photoURL'>>) => Promise<void>;
  _injectUser: (user: CannaGrowUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderContent({ children }: { children: ReactNode }) {
  const { auth, firestore, isUserLoading, user: firebaseUser, areServicesAvailable } = useFirebase();
  const [cannaUser, setCannaUser] = useState<CannaGrowUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Overall loading state depends on both Firebase auth check and our profile fetch
    const loading = isUserLoading || !areServicesAvailable;
    setAuthLoading(loading);

    if (loading) {
      return;
    }

    const fetchUserRole = async (user: User) => {
      if (!firestore) return;

      const userDocRef = doc(firestore, 'users', user.uid);
      try {
        const userDoc = await getDoc(userDocRef);
        let userData;
        let dbRole: UserRole = 'user';

        if (userDoc.exists()) {
          userData = userDoc.data();
          dbRole = userData.role || 'user';
        } else {
          console.warn(`User document for ${user.uid} not found. Creating with default 'user' role.`);
          const newUserProfile = {
            uid: user.uid,
            email: user.email?.toLowerCase(),
            displayName: user.displayName,
            role: 'user',
            photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/128/128`,
            bio: 'Entusiasta del cultivo, aprendiendo y compartiendo mi viaje en CannaGrow.',
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, newUserProfile);
          userData = newUserProfile;
        }

        let effectiveRole: UserRole = dbRole;
        if (user.email?.toLowerCase() === 'alexisgrow@cannagrow.com') {
          effectiveRole = 'owner';
          if (dbRole !== 'owner') {
            await updateDoc(userDocRef, { role: 'owner' });
          }
        }

        const finalUserData = { ...user, ...userData, role: effectiveRole } as CannaGrowUser;
        setCannaUser(finalUserData);
      } catch (error) {
        console.error("Error fetching user role:", error);
        const fallbackUser = { ...user, role: 'user', displayName: user.displayName, bio: '' } as CannaGrowUser;
        if (user.email?.toLowerCase() === 'alexisgrow@cannagrow.com') {
            fallbackUser.role = 'owner';
        }
        setCannaUser(fallbackUser);
      }
    };

    if (firebaseUser) {
      fetchUserRole(firebaseUser);
    } else {
      setCannaUser(null);
      // If no user and not on an auth page, redirect to login
      const isAuthPage = pathname === '/login' || pathname === '/register';
      if (!isAuthPage) {
        router.push('/login');
      }
    }
  }, [firebaseUser, isUserLoading, firestore, areServicesAvailable, pathname, router]);

  const role = cannaUser?.role || null;
  const isOwner = role === 'owner';
  const isCoOwner = role === 'co-owner';
  const isModerator = role === 'moderator' || role === 'co-owner' || role === 'owner';

  const signUp = useCallback(async (displayName: string, email: string, password: string): Promise<void> => {
    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Servicios de autenticación no disponibles.' });
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      await updateProfile(user, {
        displayName: displayName,
        photoURL: `https://picsum.photos/seed/${user.uid}/128/128`,
      });
      
      const normalizedEmail = email.toLowerCase();
      const userRole: UserRole = 'user';
  
      const userDocRef = doc(firestore, 'users', user.uid);

      const newUserProfile = {
        uid: user.uid,
        email: normalizedEmail,
        displayName: displayName,
        role: userRole,
        photoURL: `https://picsum.photos/seed/${user.uid}/128/128`,
        bio: 'Entusiasta del cultivo, aprendiendo y compartiendo mi viaje en CannaGrow.',
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(userDocRef, newUserProfile).catch((error) => {
          if (error.code === 'permission-denied') {
            const contextualError = new FirestorePermissionError({ operation: 'create', path: userDocRef.path, requestResourceData: newUserProfile });
            errorEmitter.emit('permission-error', contextualError);
          } else {
            throw error;
          }
      });
  
      toast({ title: "¡Cuenta Creada!", description: "Has sido registrado exitosamente." });
  
    } catch (error: any) {
      console.error('Sign up error', error);
      toast({ variant: "destructive", title: "Error de Registro", description: "No se pudo crear la cuenta. El email puede estar ya en uso." });
      throw error;
    }
  }, [auth, firestore, toast]);

  const logIn = useCallback(async (email: string, password: string): Promise<void> => {
    if (!auth) {
        toast({ variant: "destructive", title: "Error", description: "Servicios de autenticación no disponibles." });
        return Promise.reject(new Error("Auth service not available"));
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Inicio de Sesión Exitoso" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error de Inicio de Sesión", description: "Las credenciales son incorrectas." });
      throw error;
    }
}, [auth, toast]);

  const logOut = useCallback(async () => {
    if (!auth) return;
    try {
        await signOut(auth);
        setCannaUser(null);
    } catch (error) {
         toast({ variant: "destructive", title: "Error", description: "No se pudo cerrar la sesión." });
    }
  }, [auth, toast]);
  
  const updateUserProfile = useCallback(async (updates: Partial<Pick<CannaGrowUser, 'displayName' | 'bio' | 'photoURL'>>) => {
    if (!cannaUser || !firestore || !auth.currentUser) return;
    
    const userDocRef = doc(firestore, 'users', cannaUser.uid);
    
    try {
        await updateDoc(userDocRef, updates);
        if (updates.displayName || updates.photoURL) {
            await updateProfile(auth.currentUser, {
                displayName: updates.displayName,
                photoURL: updates.photoURL,
            });
        }
        
        setCannaUser(prev => prev ? ({...prev, ...updates}) : null);
        toast({ title: '¡Éxito!', description: 'Tu perfil ha sido actualizado.' });

    } catch (error: any) {
        if (error.code === 'permission-denied') {
          const contextualError = new FirestorePermissionError({ operation: 'update', path: userDocRef.path, requestResourceData: updates });
          errorEmitter.emit('permission-error', contextualError);
        } else {
            console.error('Error al actualizar el perfil:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar tu perfil.' });
        }
    }
  
  }, [cannaUser, firestore, auth, toast]);

  const _injectUser = (userToImpersonate: CannaGrowUser) => {
     if (isOwner) {
        const fullUser = {
            ...firebaseUser,
            ...userToImpersonate
        }
        setCannaUser(fullUser as CannaGrowUser);
     }
  };

  const value = {
    user: cannaUser,
    loading: authLoading,
    role,
    isOwner,
    isCoOwner,
    isModerator,
    signUp,
    logIn,
    logOut,
    updateUserProfile,
    _injectUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { areServicesAvailable } = useFirebase();

    // Render nothing until Firebase is ready, to prevent hooks from running prematurely.
    if (!areServicesAvailable) {
        return null; 
    }

    return <AuthProviderContent>{children}</AuthProviderContent>;
};


export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

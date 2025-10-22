// @ts-nocheck
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useToast } from './use-toast';
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import { FirestorePermissionError, errorEmitter } from '@/firebase';

type UserRole = 'owner' | 'co-owner' | 'moderator' | 'user';

interface CannaGrowUser extends User {
  role: UserRole;
  displayName: string;
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
  _injectUser: (user: CannaGrowUser) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  isOwner: false,
  isCoOwner: false,
  isModerator: false,
  signUp: async () => {},
  logIn: async () => {},
  logOut: async () => {},
  _injectUser: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { auth, firestore, isUserLoading, user: firebaseUser } = useFirebase();
  const [cannaUser, setCannaUser] = useState<CannaGrowUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUserRole = async (user: User) => {
      if (!firestore) return;
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCannaUser({ ...user, ...userData } as CannaGrowUser);
      } else {
         setCannaUser({ ...user, role: 'user', displayName: user.displayName } as CannaGrowUser);
      }
       setLoading(false);
    };

    if (isUserLoading) {
      setLoading(true);
    } else if (firebaseUser) {
      fetchUserRole(firebaseUser);
    } else {
      setCannaUser(null);
      setLoading(false);
    }
  }, [firebaseUser, isUserLoading, firestore]);

  const role = cannaUser?.role || null;
  const isOwner = role === 'owner';
  const isCoOwner = role === 'co-owner';
  const isModerator = role === 'moderator' || role === 'co-owner' || role === 'owner';

  const signUp = async (displayName, email, password) => {
    if (!auth || !firestore) {
        toast({ variant: "destructive", title: "Error", description: "Servicios de autenticación no disponibles." });
        return;
    }
    setLoading(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, {
            displayName: displayName,
            photoURL: `https://picsum.photos/seed/${user.uid}/128/128`,
        });
        
        const userRole: UserRole = email.toLowerCase() === 'alexisgrow@cannagrow.com' ? 'owner' : 'user';

        const userDocRef = doc(firestore, 'users', user.uid);
        const newUserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            role: userRole,
            photoURL: `https://picsum.photos/seed/${user.uid}/128/128`,
            bio: userRole === 'owner' 
                 ? 'Dueño y fundador de CannaGrow. ¡Cultivando la mejor comunidad!'
                 : 'Entusiasta del cultivo, aprendiendo y compartiendo mi viaje en CannaGrow.',
            createdAt: new Date().toISOString(),
        };

        setDoc(userDocRef, newUserProfile)
          .then(() => {
            toast({
                title: "¡Cuenta Creada!",
                description: "Has sido registrado exitosamente."
            });
          })
          .catch((error) => {
             const contextualError = new FirestorePermissionError({
                operation: 'create',
                path: userDocRef.path,
                requestResourceData: newUserProfile
            });
            errorEmitter.emit('permission-error', contextualError);
          });
    } catch (error: any) {
        console.error('Sign up error', error);
        toast({ variant: "destructive", title: "Error de Registro", description: error.message || "No se pudo crear la cuenta." });
    } finally {
        setLoading(false);
    }
  };

  const logIn = async (email, password) => {
    if (!auth) {
        toast({ variant: "destructive", title: "Error", description: "Servicios de autenticación no disponibles." });
        return;
    }
    setLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Inicio de Sesión Exitoso" });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error de Inicio de Sesión", description: "Las credenciales son incorrectas." });
    } finally {
        setLoading(false);
    }
  };

  const logOut = async () => {
    if (!auth) return;
    setLoading(true);
    try {
        await signOut(auth);
    } catch (error) {
         toast({ variant: "destructive", title: "Error", description: "No se pudo cerrar la sesión." });
    } finally {
        setCannaUser(null);
        setLoading(false);
    }
  };
  
  const _injectUser = (userToImpersonate: CannaGrowUser) => {
     if (isOwner) {
        const fullUser = {
            ...firebaseUser,
            ...userToImpersonate
        }
        setCannaUser(fullUser as CannaGrowUser);
     }
  }

  const value = {
    user: cannaUser,
    loading,
    role,
    isOwner,
    isCoOwner,
    isModerator,
    signUp,
    logIn,
    logOut,
    _injectUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider -> FirebaseClientProvider');
  }
  return context;
};

// @ts-nocheck
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  type User
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (displayName: string, email: string, pass: string) => Promise<any>;
  logIn: (email: string, pass: string) => Promise<any>;
  logOut: () => Promise<any>;
  isOwner: (ownerId: string) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => {},
  logIn: async () => {},
  logOut: async () => {},
  isOwner: () => false,
  isAdmin: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user role from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
        setUser(user);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (displayName, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });

      // Create a user document in Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        displayName,
        email,
        role: 'user', // Default role for new users
        createdAt: new Date(),
      });
      
      setUser(userCredential.user);
      // No need to fetch role here, it's 'user' by default
      setIsAdmin(false);
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Error de Registro',
        description: `No se pudo crear la cuenta. Por favor, revisa que las reglas de Firestore permitan la escritura en la colección 'users'. (${error.code})`,
      });
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const logIn = async (email, password) => {
     try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Error de Inicio de Sesión',
        description: "Email o contraseña incorrectos.",
      });
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al Cerrar Sesión',
        description: error.message,
      });
      console.error("Error signing out:", error);
      throw error;
    }
  };
  
  const isOwner = (ownerId) => {
    return user?.uid === ownerId;
  };

  const value = {
    user,
    loading,
    signUp,
    logIn,
    logOut,
    isOwner,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

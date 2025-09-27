
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
        const user = userCredential.user;
        
        await updateProfile(user, { displayName });

        // Crear documento de usuario en Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            uid: user.uid,
            displayName: displayName,
            email: user.email,
            role: 'user' // Por defecto, todos son usuarios normales
        });
        
        setUser({ ...user, displayName });

    } catch (error) {
        console.error("Error al registrarse:", error.message);
        toast({
            variant: "destructive",
            title: "Error de Registro",
            description: "No se pudo crear la cuenta. Es posible que el email ya esté en uso."
        })
        throw error;
    }
  };

  const logIn = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Error al iniciar sesión:", error.message);
        toast({
            variant: "destructive",
            title: "Error de Inicio de Sesión",
            description: "Las credenciales son incorrectas. Por favor, inténtalo de nuevo."
        })
        throw error;
    }
  };

  const logOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error al cerrar sesión:", error.message);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo cerrar la sesión."
        })
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

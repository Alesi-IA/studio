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
  // ---- CAMBIO TEMPORAL PARA VISTA PREVIA ----
  const mockUser = {
    uid: 'admin_user_id',
    displayName: 'Admin',
    email: 'admin@cannaconnect.com',
    photoURL: '',
  } as User;

  const [user, setUser] = useState<User | null>(mockUser);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // La lógica real de Firebase está comentada temporalmente para la vista previa
    // const unsubscribe = onAuthStateChanged(auth, async (user) => {
    //   if (user) {
    //     // Fetch user role from Firestore
    //     const userDocRef = doc(db, 'users', user.uid);
    //     const userDoc = await getDoc(userDocRef);
    //     if (userDoc.exists() && userDoc.data().role === 'admin') {
    //         setIsAdmin(true);
    //     } else {
    //         setIsAdmin(false);
    //     }
    //     setUser(user);
    //   } else {
    //     setUser(null);
    //     setIsAdmin(false);
    //   }
    //   setLoading(false);
    // });
    // return () => unsubscribe();
  }, []);

  const signUp = async (displayName, email, password) => {
    console.log("Registro deshabilitado en modo vista previa.");
    toast({ title: "Vista Previa", description: "El registro está deshabilitado en este modo."})
  };

  const logIn = async (email, password) => {
    console.log("Inicio de sesión deshabilitado en modo vista previa.");
    toast({ title: "Vista Previa", description: "El inicio de sesión está deshabilitado en este modo."})
  };

  const logOut = async () => {
    console.log("Cierre de sesión deshabilitado en modo vista previa.");
    toast({ title: "Vista Previa", description: "El cierre de sesión está deshabilitado en este modo."})
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

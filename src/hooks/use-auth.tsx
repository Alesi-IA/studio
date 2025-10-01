// @ts-nocheck
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from './use-toast';
import type { User } from 'firebase/auth';

// --- MOCK USER DATA ---
const MOCK_ADMIN_USER = {
  uid: 'admin-uid',
  email: 'admin@cannaconnect.com',
  displayName: 'Admin Canna',
  role: 'admin',
  photoURL: `https://picsum.photos/seed/admin-uid/128/128`
};

const MOCK_NORMAL_USER = {
  uid: 'user-uid-123',
  email: 'test@test.com',
  displayName: 'Test User',
  role: 'user',
  photoURL: `https://picsum.photos/seed/user-uid-123/128/128`
}
// --- END MOCK USER DATA ---


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
    // Simulate checking for a logged in user in session storage
    const storedUser = sessionStorage.getItem('mockUser');
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAdmin(parsedUser.role === 'admin');
    }
    setLoading(false);
  }, []);

  const signUp = async (displayName, email, password) => {
    setLoading(true);
    try {
        // Simulate creating a new user
        const newUser = {
            uid: `mock-uid-${Date.now()}`,
            email,
            displayName,
            role: 'user', // All new signups are users
            photoURL: `https://picsum.photos/seed/mock-uid-${Date.now()}/128/128`
        };
        sessionStorage.setItem('mockUser', JSON.stringify(newUser));
        setUser(newUser);
        setIsAdmin(false);
        toast({
            title: "¡Cuenta Creada! (Simulado)",
            description: "Has sido registrado exitosamente."
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error de Registro (Simulado)",
            description: "No se pudo crear la cuenta."
        });
        throw error;
    } finally {
        setLoading(false);
    }
  };

  const logIn = async (email, password) => {
    setLoading(true);
    try {
        // Simulate logging in
        let userToLogin = MOCK_NORMAL_USER;
        if (email.toLowerCase().includes('admin')) {
            userToLogin = MOCK_ADMIN_USER;
        }
        
        sessionStorage.setItem('mockUser', JSON.stringify(userToLogin));
        setUser(userToLogin);
        setIsAdmin(userToLogin.role === 'admin');
        
        toast({
            title: "Inicio de Sesión Exitoso (Simulado)"
        });

    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error de Inicio de Sesión (Simulado)",
            description: "Las credenciales son incorrectas."
        })
        throw error;
    } finally {
        setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
        // For preview, just clear the user and session storage
        sessionStorage.removeItem('mockUser');
        setUser(null);
        setIsAdmin(false);
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo cerrar la sesión."
        })
    } finally {
        setLoading(false);
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

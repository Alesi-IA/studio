
// @ts-nocheck
'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  _injectUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => {},
  logIn: async () => {},
  logOut: async () => {},
  isOwner: () => false,
  isAdmin: false,
  _injectUser: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    // This effect now simulates checking for a logged-in user in sessionStorage
    setLoading(true);
    try {
      const storedUser = sessionStorage.getItem('mockUser');
      if (storedUser) {
        const currentUser = JSON.parse(storedUser);
        setUser(currentUser);
        setIsAdmin(currentUser.role === 'admin');
      } else {
        // If no user is stored, default to admin for easy debugging
        sessionStorage.setItem('mockUser', JSON.stringify(MOCK_ADMIN_USER));
        setUser(MOCK_ADMIN_USER);
        setIsAdmin(true);
      }
    } catch (e) {
      console.error("Failed to parse mock user from session storage", e);
      sessionStorage.removeItem('mockUser');
    }
    setLoading(false);
  }, []);

  const _injectUser = useCallback((mockUser: any) => {
      setUser(mockUser);
      setIsAdmin(mockUser.role === 'admin');
      sessionStorage.setItem('mockUser', JSON.stringify(mockUser));
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
        sessionStorage.removeItem('mockUser');
        setUser(null);
        setIsAdmin(false);
        router.push('/login');
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
    _injectUser,
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

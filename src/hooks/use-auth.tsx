// @ts-nocheck
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useToast } from './use-toast';
import type { User } from 'firebase/auth';

type UserRole = 'owner' | 'moderator' | 'user';

interface CannaGrowUser extends User {
  role: UserRole;
}

const MOCK_USERS = {
  owner: {
    uid: 'owner-uid',
    email: 'owner@cannagrow.com',
    displayName: 'CannaOwner',
    role: 'owner',
    photoURL: 'https://picsum.photos/seed/owner-uid/128/128'
  },
  moderator: {
    uid: 'moderator-uid',
    email: 'mod@cannagrow.com',
    displayName: 'CannaMod',
    role: 'moderator',
    photoURL: 'https://picsum.photos/seed/moderator-uid/128/128'
  },
  user: {
    uid: 'user-uid-123',
    email: 'test@test.com',
    displayName: 'Test User',
    role: 'user',
    photoURL: 'https://picsum.photos/seed/user-uid-123/128/128'
  }
};


interface AuthContextType {
  user: CannaGrowUser | null;
  loading: boolean;
  role: UserRole | null;
  isOwner: boolean;
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
  isModerator: false,
  signUp: async () => {},
  logIn: async () => {},
  logOut: async () => {},
  _injectUser: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<CannaGrowUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const role = user?.role || null;
  const isOwner = role === 'owner';
  const isModerator = role === 'moderator' || role === 'owner';

  const checkUser = useCallback(() => {
    setLoading(true);
    try {
      const storedUser = sessionStorage.getItem('mockUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Set default user (owner) for initial setup
        const defaultUser = MOCK_USERS.owner;
        setUser(defaultUser);
        sessionStorage.setItem('mockUser', JSON.stringify(defaultUser));
      }
    } catch (e) {
      console.error("Failed to parse mock user from session storage", e);
      sessionStorage.removeItem('mockUser');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkUser();
    window.addEventListener('user-change', checkUser);
    return () => window.removeEventListener('user-change', checkUser);
  }, [checkUser]);

  const _injectUser = useCallback((mockUser: CannaGrowUser) => {
      setUser(mockUser);
      sessionStorage.setItem('mockUser', JSON.stringify(mockUser));
      window.dispatchEvent(new Event('user-change'));
  }, []);

  const signUp = async (displayName, email, password) => {
    setLoading(true);
    try {
        const newUser: CannaGrowUser = {
            uid: `mock-uid-${Date.now()}`,
            email,
            displayName,
            role: 'user', // All new signups are users
            photoURL: `https://picsum.photos/seed/mock-uid-${Date.now()}/128/128`
        };
        sessionStorage.setItem('mockUser', JSON.stringify(newUser));
        setUser(newUser);
        window.dispatchEvent(new Event('user-change'));
        toast({
            title: "¡Cuenta Creada!",
            description: "Has sido registrado exitosamente."
        });
    } catch (error) {
        toast({ variant: "destructive", title: "Error de Registro", description: "No se pudo crear la cuenta." });
        throw error;
    } finally {
        setLoading(false);
    }
  };

  const logIn = async (email, password) => {
    setLoading(true);
    try {
        let userToLogin: CannaGrowUser;
        if (email.toLowerCase() === MOCK_USERS.owner.email) {
            userToLogin = MOCK_USERS.owner;
        } else if (email.toLowerCase() === MOCK_USERS.moderator.email) {
            userToLogin = MOCK_USERS.moderator;
        } else {
            userToLogin = MOCK_USERS.user;
        }
        
        sessionStorage.setItem('mockUser', JSON.stringify(userToLogin));
        setUser(userToLogin);
        window.dispatchEvent(new Event('user-change'));
        
        toast({ title: "Inicio de Sesión Exitoso" });
    } catch (error) {
        toast({ variant: "destructive", title: "Error de Inicio de Sesión", description: "Las credenciales son incorrectas." });
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
        window.dispatchEvent(new Event('user-change'));
    } catch (error) {
         toast({ variant: "destructive", title: "Error", description: "No se pudo cerrar la sesión." });
    } finally {
        setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    role,
    isOwner,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

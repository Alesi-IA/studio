
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useToast } from './use-toast';
import type { CannaGrowUser } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: CannaGrowUser | null;
  prototypeUser: CannaGrowUser;
  loading: boolean;
  isOwner: boolean;
  isModerator: boolean;
  logOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<CannaGrowUser>) => Promise<void>;
  createPost: (description: string, imageUri: string) => Promise<void>;
  followUser: (targetUserId: string) => Promise<void>;
  unfollowUser: (targetUserId: string) => Promise<void>;
  addExperience: (userId: string, amount: number) => Promise<void>;
  _injectUser: (user: CannaGrowUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The one and only prototype user. This will be our "logged in" user.
const prototypeUser: CannaGrowUser = {
  uid: 'prototype-user-001',
  email: 'owner@cannaconnect.app',
  displayName: 'CannaOwner',
  role: 'owner',
  photoURL: 'https://picsum.photos/seed/prototype-user-001/128/128',
  bio: 'Explorando CannaConnect en modo prototipo. Todas las funcionalidades están activas para demostración.',
  createdAt: new Date().toISOString(),
  experiencePoints: 1337,
  followerIds: ['user-2', 'user-3'],
  followingIds: ['user-2', 'user-3', 'user-4'],
  followerCount: 1200,
  followingCount: 88,
  savedPostIds: [],
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [localUser, setLocalUser] = useState<CannaGrowUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // This is the core of the prototype mode.
  // On mount, we immediately "log in" our prototype user and stop loading.
  useEffect(() => {
    setLocalUser(prototypeUser);
    setLoading(false);
  }, []);

  const isOwner = localUser?.role === 'owner';
  const isModerator = localUser?.role === 'moderator' || localUser?.role === 'co-owner' || isOwner;

  const logOut = async () => {
    setLoading(true);
    setLocalUser(null);
    toast({ title: "Sesión Cerrada" });
    // In a real app, we'd redirect. Here, we can just clear the user.
    // To simulate a full logout, we can reload the page which will re-inject the user.
    window.location.reload();
  };

  const addExperience = useCallback(async (userId: string, amount: number): Promise<void> => {
    if (userId === localUser?.uid) {
        setLocalUser(prev => prev ? ({ ...prev, experiencePoints: (prev.experiencePoints || 0) + amount }) : null);
    }
    console.log(`Simulating adding ${amount}XP to ${userId}`);
    toast({ title: `+${amount} XP`, description: `Experiencia añadida (simulado).` });
  }, [localUser, toast]);

  const updateUserProfile = useCallback(async (updates: Partial<CannaGrowUser>): Promise<void> => {
    if (!localUser) return;
    setLocalUser(prev => prev ? ({ ...prev, ...updates }) : null);
    toast({ title: '¡Éxito!', description: 'Tu perfil ha sido actualizado (simulado).' });
  }, [localUser, toast]);
  
  const createPost = useCallback(async (description: string, imageUri: string) => {
    if (!localUser) throw new Error("User not available");

    toast({
      title: 'Creando publicación (simulado)...',
      description: 'En una app real, esto se subiría a la base de datos.',
    });
    console.log('Simulating post creation:', { description, imageUri });
    addExperience(localUser.uid, 10);
  }, [localUser, addExperience, toast]);

  const followUser = useCallback(async (targetUserId: string) => {
      setLocalUser(prev => {
        if (!prev) return null;
        const newFollowingIds = [...(prev.followingIds || []), targetUserId];
        return { ...prev, followingIds: newFollowingIds, followingCount: (prev.followingCount || 0) + 1 };
      });
      toast({ title: "Ahora sigues a este usuario (simulado)." });
  }, [toast]);

  const unfollowUser = useCallback(async (targetUserId: string) => {
      setLocalUser(prev => {
        if (!prev) return null;
        const newFollowingIds = (prev.followingIds || []).filter(id => id !== targetUserId);
        return { ...prev, followingIds: newFollowingIds, followingCount: Math.max(0, (prev.followingCount || 0) - 1) };
      });
      toast({ title: "Has dejado de seguir a este usuario (simulado)." });
  }, [toast]);
  
  const _injectUser = (userToInject: CannaGrowUser) => {
      setLocalUser(userToInject);
  };

  const value = {
    user: localUser,
    prototypeUser,
    loading,
    isOwner,
    isModerator,
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

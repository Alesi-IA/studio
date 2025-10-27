
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
import { doc, setDoc, getDoc, updateDoc, increment, runTransaction, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
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
  followUser: (targetUserId: string) => Promise<void>;
  unfollowUser: (targetUserId: string) => Promise<void>;
  addExperience: (userId: string, amount: number) => Promise<void>;
  _injectUser: (user: CannaGrowUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore, storage, user: firebaseUser, isUserLoading: isAuthServiceLoading } = useFirebase();
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !firebaseUser?.uid) return null;
    return doc(firestore, 'users', firebaseUser.uid);
  }, [firestore, firebaseUser?.uid]);
  
  const { data: user, isLoading: isProfileLoading, mutate: refreshUserData } = useDoc<CannaGrowUser>(userDocRef);
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const finalLoadingState = isAuthServiceLoading || (firebaseUser != null && isProfileLoading);
    setLoading(finalLoadingState);

    if (finalLoadingState) return;

    const isPublicRoute = pathname === '/login' || pathname === '/register';

    if (user && isPublicRoute) {
      router.push('/');
    } else if (!user && !isPublicRoute) {
      router.push('/login');
    }
  }, [user, isAuthServiceLoading, isProfileLoading, pathname, router, firebaseUser]);

  const addExperience = useCallback(async (userId: string, amount: number): Promise<void> => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);
    try {
      await updateDoc(userDocRef, {
        experiencePoints: increment(amount)
      });
    } catch (error) {
      console.error(`Failed to add ${amount}XP to user ${userId}:`, error);
    }
  }, [firestore]);

  const signUp = useCallback(async (displayName: string, email: string, password: string): Promise<void> => {
    if (!auth || !firestore) throw new Error("Auth services not available");
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const createdFbUser = userCredential.user;
    
    const photoURL = `https://picsum.photos/seed/${createdFbUser.uid}/128/128`;

    await updateProfile(createdFbUser, {
      displayName,
      photoURL,
    });
    
    const userDocRef = doc(firestore, 'users', createdFbUser.uid);
    const newUserProfile: CannaGrowUser = {
      uid: createdFbUser.uid,
      email: email.toLowerCase(),
      displayName,
      role: 'user',
      photoURL,
      bio: 'Entusiasta del cultivo, aprendiendo y compartiendo mi viaje en CannaGrow.',
      createdAt: new Date().toISOString(),
      experiencePoints: 0,
      followerIds: [],
      followingIds: [],
      followerCount: 0,
      followingCount: 0,
      savedPostIds: [],
    };
    
    await setDoc(userDocRef, newUserProfile);
    await addExperience(createdFbUser.uid, 5);
  }, [auth, firestore, addExperience]);

  const logIn = useCallback(async (email: string, password: string): Promise<void> => {
    if (!auth) throw new Error("Auth service not available");
    await signInWithEmailAndPassword(auth, email, password);
  }, [auth]);

  const logOut = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    if(typeof window !== 'undefined') {
      sessionStorage.clear();
    }
    router.push('/login');
  }, [auth, router]);
  
  const updateUserProfile = useCallback(async (updates: Partial<CannaGrowUser>): Promise<void> => {
    if (!user || !firestore || !auth.currentUser) {
       toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para actualizar tu perfil.' });
       return;
    };
    
    try {
      const authUpdates: { displayName?: string; photoURL?: string } = {};
      if (updates.displayName && updates.displayName !== auth.currentUser.displayName) {
        authUpdates.displayName = updates.displayName;
      }
      if (updates.photoURL && updates.photoURL !== auth.currentUser.photoURL) {
        authUpdates.photoURL = updates.photoURL;
      }

      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(auth.currentUser, authUpdates);
      }

      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, updates);
      
      // Do not toast for silent updates like saving a post
      if(!updates.savedPostIds){
          toast({ title: '¡Éxito!', description: 'Tu perfil ha sido actualizado.' });
      }
      // Force a refresh of user data after update
      refreshUserData();

    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar tu perfil.' });
    }
  }, [user, firestore, auth, toast, refreshUserData]);

  const followUser = useCallback(async (targetUserId: string) => {
    if (!user || !firestore) return;

    const currentUserRef = doc(firestore, 'users', user.uid);
    const targetUserRef = doc(firestore, 'users', targetUserId);

    try {
        await runTransaction(firestore, async (transaction) => {
            const [currentUserDoc, targetUserDoc] = await Promise.all([
                transaction.get(currentUserRef),
                transaction.get(targetUserRef)
            ]);

            if (!currentUserDoc.exists() || !targetUserDoc.exists()) {
                throw "User document does not exist!";
            }
            
            // Explicitly calculate new counts
            const newFollowingCount = (currentUserDoc.data().followingCount || 0) + 1;
            const newFollowerCount = (targetUserDoc.data().followerCount || 0) + 1;

            transaction.update(currentUserRef, {
                followingIds: arrayUnion(targetUserId),
                followingCount: newFollowingCount
            });
            transaction.update(targetUserRef, {
                followerIds: arrayUnion(user.uid),
                followerCount: newFollowerCount
            });
        });
        refreshUserData(); // Refresh local user state after successful transaction
    } catch (error) {
      console.error("Error following user:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo seguir al usuario.' });
    }
  }, [user, firestore, toast, refreshUserData]);

  const unfollowUser = useCallback(async (targetUserId: string) => {
    if (!user || !firestore) return;
    
    const currentUserRef = doc(firestore, 'users', user.uid);
    const targetUserRef = doc(firestore, 'users', targetUserId);
    
    try {
        await runTransaction(firestore, async (transaction) => {
             const [currentUserDoc, targetUserDoc] = await Promise.all([
                transaction.get(currentUserRef),
                transaction.get(targetUserRef)
            ]);

            if (!currentUserDoc.exists() || !targetUserDoc.exists()) {
                throw "User document does not exist!";
            }

            const newFollowingCount = Math.max(0, (currentUserDoc.data().followingCount || 0) - 1);
            const newFollowerCount = Math.max(0, (targetUserDoc.data().followerCount || 0) - 1);

            transaction.update(currentUserRef, {
                followingIds: arrayRemove(targetUserId),
                followingCount: newFollowingCount
            });
            transaction.update(targetUserRef, {
                followerIds: arrayRemove(user.uid),
                followerCount: newFollowerCount
            });
        });
        refreshUserData(); // Refresh local user state after successful transaction
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo dejar de seguir al usuario.' });
    }
  }, [user, firestore, toast, refreshUserData]);

  const _injectUser = useCallback((injectedUser: CannaGrowUser) => {
      // This is a mock implementation for admin impersonation.
      // It will not persist across page reloads.
      // A more robust solution would involve custom tokens.
      toast({ title: 'Función de administrador', description: 'Suplantación no implementada en este prototipo.' });
  }, [toast]);
  

  const value = {
    user,
    loading,
    isOwner: user?.role === 'owner',
    isModerator: user?.role === 'moderator' || user?.role === 'co-owner' || user?.role === 'owner',
    signUp,
    logIn,
    logOut,
    updateUserProfile,
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

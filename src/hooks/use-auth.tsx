
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
import { doc, setDoc, getDoc, updateDoc, increment, runTransaction, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
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
  updateUserProfile: (updates: Partial<CannaGrowUser>) => Promise<CannaGrowUser | null>;
  followUser: (targetUserId: string) => Promise<void>;
  unfollowUser: (targetUserId: string) => Promise<void>;
  _injectUser: (user: CannaGrowUser) => void;
  addExperience: (userId: string, amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore, isUserLoading } = useFirebase();
  const [user, setUser] = useState<CannaGrowUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<CannaGrowUser | null> => {
    if (!firestore) return null;
    try {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const firestoreData = userDoc.data();
            return {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                displayName: firestoreData.displayName || firebaseUser.displayName,
                photoURL: firestoreData.photoURL || firebaseUser.photoURL,
                role: firestoreData.role || 'user',
                bio: firestoreData.bio || '',
                createdAt: firestoreData.createdAt,
                experiencePoints: firestoreData.experiencePoints || 0,
                followerIds: firestoreData.followerIds || [],
                followingIds: firestoreData.followingIds || [],
                followerCount: firestoreData.followerCount || 0,
                followingCount: firestoreData.followingCount || 0,
                savedPostIds: firestoreData.savedPostIds || [],
            };
        } else {
            console.warn(`No profile found in Firestore for user ${firebaseUser.uid}. Attempting to create one.`);
            const newUserProfile: CannaGrowUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                displayName: firebaseUser.displayName || 'Cultivador Anónimo',
                role: 'user',
                photoURL: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/128/128`,
                bio: 'Entusiasta del cultivo.',
                createdAt: new Date().toISOString(),
                experiencePoints: 0,
                followerIds: [],
                followingIds: [],
                followerCount: 0,
                followingCount: 0,
                savedPostIds: [],
            };
            await setDoc(userDocRef, newUserProfile);
            return newUserProfile;
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
            variant: 'destructive',
            title: 'Error de Perfil',
            description: 'No se pudo cargar tu perfil de usuario desde la base de datos.',
        });
        return null;
    }
  }, [firestore, toast]);


  useEffect(() => {
    setLoading(isUserLoading);
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await fetchUserProfile(firebaseUser);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
        unsubscribe();
        setLoading(true);
    }
  }, [auth, fetchUserProfile, isUserLoading]);
  
  useEffect(() => {
    if (loading) return;

    const isPublicRoute = pathname === '/login' || pathname === '/register';

    if (user && isPublicRoute) {
      router.push('/');
    }
    
    if (!user && !isPublicRoute) {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);


  const signUp = useCallback(async (displayName: string, email: string, password: string): Promise<void> => {
    if (!auth || !firestore) throw new Error("Auth services not available");
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    const photoURL = `https://picsum.photos/seed/${firebaseUser.uid}/128/128`;

    await updateProfile(firebaseUser, {
      displayName,
      photoURL,
    });
    
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    const newUserProfile: CannaGrowUser = {
      uid: firebaseUser.uid,
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
    setUser(newUserProfile);

  }, [auth, firestore]);

  const logIn = useCallback(async (email: string, password: string): Promise<void> => {
    if (!auth) throw new Error("Auth service not available");
    await signInWithEmailAndPassword(auth, email, password);
  }, [auth]);

  const logOut = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    if(typeof window !== 'undefined') {
      sessionStorage.clear();
    }
    router.push('/login');
  }, [auth, router]);

  const updateUserProfile = useCallback(async (updates: Partial<CannaGrowUser>): Promise<CannaGrowUser | null> => {
    if (!user || !firestore || !auth.currentUser) {
       toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para actualizar tu perfil.' });
       return null;
    };
    
    try {
      const authUpdates: { displayName?: string; photoURL?: string } = {};
      if (updates.displayName && updates.displayName !== user.displayName) {
        authUpdates.displayName = updates.displayName;
      }
      if (updates.photoURL && updates.photoURL !== user.photoURL) {
        authUpdates.photoURL = updates.photoURL;
      }

      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(auth.currentUser, authUpdates);
      }

      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, updates);
      
      const updatedUser = await fetchUserProfile(auth.currentUser);
      setUser(updatedUser);

      if(!updates.savedPostIds){
          toast({ title: '¡Éxito!', description: 'Tu perfil ha sido actualizado.' });
      }
      return updatedUser;

    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar tu perfil.' });
      return null;
    }
  }, [user, firestore, auth, toast, fetchUserProfile]);
  
  const addExperience = useCallback(async (userId: string, amount: number) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);
    try {
      await updateDoc(userDocRef, {
        experiencePoints: increment(amount)
      });
      // If the updated user is the current user, refresh their data
      if (user && user.uid === userId && auth.currentUser) {
        const updatedUser = await fetchUserProfile(auth.currentUser);
        setUser(updatedUser);
      }
    } catch (error) {
      console.error(`Failed to add ${amount}XP to user ${userId}:`, error);
    }
  }, [firestore, user, auth, fetchUserProfile]);

  const followUser = useCallback(async (targetUserId: string) => {
    if (!user || !firestore || !auth.currentUser) return;
    const currentUserRef = doc(firestore, 'users', user.uid);
    const targetUserRef = doc(firestore, 'users', targetUserId);

    try {
        await runTransaction(firestore, async (transaction) => {
            const targetDoc = await transaction.get(targetUserRef);
            if (!targetDoc.exists()) {
                throw "Document does not exist!";
            }
            
            const targetFollowers = targetDoc.data().followerIds || [];
            // Only update if the user is not already following
            if (!targetFollowers.includes(user.uid)) {
                // Add target to current user's following list
                transaction.update(currentUserRef, {
                    followingIds: arrayUnion(targetUserId),
                    followingCount: increment(1)
                });
                // Add current user to target's followers list
                transaction.update(targetUserRef, {
                    followerIds: arrayUnion(user.uid),
                    followerCount: increment(1)
                });
            }
        });

        const updatedUser = await fetchUserProfile(auth.currentUser);
        setUser(updatedUser);

    } catch (error) {
      console.error("Error following user:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo seguir al usuario.' });
    }
  }, [user, firestore, toast, auth, fetchUserProfile]);

  const unfollowUser = useCallback(async (targetUserId: string) => {
    if (!user || !firestore || !auth.currentUser) return;
    const currentUserRef = doc(firestore, 'users', user.uid);
    const targetUserRef = doc(firestore, 'users', targetUserId);
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const targetDoc = await transaction.get(targetUserRef);
            if (!targetDoc.exists()) {
                throw "Document does not exist!";
            }

            const targetFollowers = targetDoc.data().followerIds || [];
            // Only update if the user is currently following
            if (targetFollowers.includes(user.uid)) {
                // Remove target from current user's following list
                transaction.update(currentUserRef, {
                    followingIds: arrayRemove(targetUserId),
                    followingCount: increment(-1)
                });
                // Remove current user from target's followers list
                transaction.update(targetUserRef, {
                    followerIds: arrayRemove(user.uid),
                    followerCount: increment(-1)
                });
            }
        });
        
        const updatedUser = await fetchUserProfile(auth.currentUser);
        setUser(updatedUser);

    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo dejar de seguir al usuario.' });
    }
  }, [user, firestore, toast, auth, fetchUserProfile]);

  const _injectUser = useCallback((injectedUser: CannaGrowUser) => {
    if (user?.role === 'owner') {
      setUser(injectedUser);
    } else {
       toast({ variant: 'destructive', title: 'No autorizado', description: 'Solo los dueños pueden suplantar a otros usuarios.' });
    }
  }, [user, toast]);

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
    _injectUser,
    addExperience,
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


'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode, useMemo } from 'react';
import { useToast } from './use-toast';
import {
  type User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, runTransaction, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase, useDoc } from '@/firebase';
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
  createPost: (postData: { description: string, imageUrl: string, width?: number, height?: number, imageHint?: string, strain?: string }) => Promise<void>;
  updateUserProfile: (updates: Partial<CannaGrowUser>) => Promise<CannaGrowUser | null>;
  followUser: (targetUserId: string) => Promise<void>;
  unfollowUser: (targetUserId: string) => Promise<void>;
  _injectUser: (user: CannaGrowUser) => void;
  addExperience: (userId: string, amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore, isUserLoading: isAuthServiceLoading } = useFirebase();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(auth.currentUser);
  
  const userDocRef = useMemo(() => {
    if (!firestore || !firebaseUser?.uid) return null;
    return doc(firestore, 'users', firebaseUser.uid);
  }, [firestore, firebaseUser?.uid]);
  
  const { data: user, isLoading: isProfileLoading } = useDoc<CannaGrowUser>(userDocRef);
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

   useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((fbUser) => {
      setFirebaseUser(fbUser);
      setLoading(false); // Auth state is now determined
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (loading) return; // Wait until auth state is resolved

    const isPublicRoute = pathname === '/login' || pathname === '/register';

    if (user && isPublicRoute) {
      router.push('/');
    } else if (!user && !isPublicRoute) {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

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
    await addExperience(createdFbUser.uid, 5); // Grant initial XP
    setFirebaseUser(createdFbUser); // Trigger profile fetch via useDoc

  }, [auth, firestore, addExperience]);

  const logIn = useCallback(async (email: string, password: string): Promise<void> => {
    if (!auth) throw new Error("Auth service not available");
    await signInWithEmailAndPassword(auth, email, password);
  }, [auth]);

  const logOut = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    setFirebaseUser(null);
    if(typeof window !== 'undefined') {
      sessionStorage.clear();
    }
    router.push('/login');
  }, [auth, router]);

  const createPost = useCallback(async (postData: { description: string, imageUrl: string }) => {
    if (!user || !firestore) {
      throw new Error('User not authenticated or Firestore not available');
    }
    const postsCollectionRef = collection(firestore, 'posts');
    await addDoc(postsCollectionRef, {
        authorId: user.uid,
        authorName: user.displayName,
        authorAvatar: user.photoURL,
        ...postData,
        createdAt: serverTimestamp(),
        likes: 0,
        awards: 0,
        comments: [],
    });
    
    await addExperience(user.uid, 10); // +10 XP for creating a post

  }, [user, firestore, addExperience]);

  const updateUserProfile = useCallback(async (updates: Partial<CannaGrowUser>): Promise<CannaGrowUser | null> => {
    if (!user || !firestore || !firebaseUser) {
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
        await updateProfile(firebaseUser, authUpdates);
      }

      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, updates);
      
      if(!updates.savedPostIds){
          toast({ title: '¡Éxito!', description: 'Tu perfil ha sido actualizado.' });
      }
      return { ...user, ...updates }; 

    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar tu perfil.' });
      return null;
    }
  }, [user, firestore, firebaseUser, toast]);

  const followUser = useCallback(async (targetUserId: string) => {
    if (!user || !firestore) return;
    
    const currentUserRef = doc(firestore, 'users', user.uid);
    const targetUserRef = doc(firestore, 'users', targetUserId);

    try {
        await runTransaction(firestore, async (transaction) => {
            const targetDoc = await transaction.get(targetUserRef);
            if (!targetDoc.exists()) {
                throw "Document does not exist!";
            }
            
            const targetData = targetDoc.data();
            if (!targetData.followerIds?.includes(user.uid)) {
                transaction.update(currentUserRef, {
                    followingIds: arrayUnion(targetUserId),
                    followingCount: increment(1)
                });
                transaction.update(targetUserRef, {
                    followerIds: arrayUnion(user.uid),
                    followerCount: increment(1)
                });
            }
        });
    } catch (error) {
      console.error("Error following user:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo seguir al usuario.' });
    }
  }, [user, firestore, toast]);

  const unfollowUser = useCallback(async (targetUserId: string) => {
    if (!user || !firestore) return;
    
    const currentUserRef = doc(firestore, 'users', user.uid);
    const targetUserRef = doc(firestore, 'users', targetUserId);
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const targetDoc = await transaction.get(targetUserRef);
            if (!targetDoc.exists()) throw "Document does not exist!";

            const targetData = targetDoc.data();
            if (targetData.followerIds?.includes(user.uid)) {
                transaction.update(currentUserRef, {
                    followingIds: arrayRemove(targetUserId),
                    followingCount: increment(-1)
                });
                transaction.update(targetUserRef, {
                    followerIds: arrayRemove(user.uid),
                    followerCount: increment(-1)
                });
            }
        });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo dejar de seguir al usuario.' });
    }
  }, [user, firestore, toast]);

  const _injectUser = useCallback((injectedUser: CannaGrowUser) => {
    if (user?.role === 'owner') {
      const tempUser = { ...injectedUser, uid: injectedUser.uid } as CannaGrowUser;
      
      const mockFirebaseUser = { 
        ...auth.currentUser, 
        uid: tempUser.uid,
        email: tempUser.email,
        displayName: tempUser.displayName,
        photoURL: tempUser.photoURL,
      } as FirebaseUser;
      
      setFirebaseUser(mockFirebaseUser);

    } else {
       toast({ variant: 'destructive', title: 'No autorizado', description: 'Solo los dueños pueden suplantar a otros usuarios.' });
    }
  }, [user, toast, auth]);
  

  const value = {
    user,
    loading: loading || isProfileLoading,
    isOwner: user?.role === 'owner',
    isModerator: user?.role === 'moderator' || user?.role === 'co-owner' || user?.role === 'owner',
    signUp,
    logIn,
    logOut,
    createPost,
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

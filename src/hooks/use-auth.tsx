
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useToast } from './use-toast';
import {
  type User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  signInAnonymously,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, runTransaction, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp, getDocs, query, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import type { CannaGrowUser } from '@/types';
import { FirebaseError } from 'firebase/app';

interface AuthContextType {
  user: CannaGrowUser | null;
  loading: boolean;
  isOwner: boolean;
  isModerator: boolean;
  signUp: (displayName: string, email: string, pass: string) => Promise<void>;
  logIn: (email: string, pass: string) => Promise<void>;
  logInAsGuest: () => Promise<void>;
  logOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<CannaGrowUser>) => Promise<void>;
  createPost: (description: string, imageUri: string) => Promise<void>;
  followUser: (targetUserId: string) => Promise<void>;
  unfollowUser: (targetUserId: string) => Promise<void>;
  addExperience: (userId: string, amount: number) => Promise<void>;
  _injectUser: (user: CannaGrowUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore, storage, user: firebaseUser, isUserLoading: isAuthServiceLoading } = useFirebase();
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !firebaseUser) return null;
    return doc(firestore, 'users', firebaseUser.uid);
  }, [firestore, firebaseUser]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<CannaGrowUser>(userDocRef);
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const user = profile;
  const isOwner = user?.role === 'owner';
  const isModerator = user?.role === 'moderator' || user?.role === 'co-owner' || isOwner;

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
  }, [user, firebaseUser, isAuthServiceLoading, isProfileLoading, pathname, router]);

  const addExperience = useCallback(async (userId: string, amount: number): Promise<void> => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);
    try {
      await updateDoc(userDocRef, {
        experiencePoints: increment(amount)
      });
    } catch (error) {
       console.warn(`Could not add ${amount}XP to user ${userId}. This likely failed due to security rules if trying to update another user.`);
    }
  }, [firestore]);
  
  const logInAsGuest = useCallback(async (): Promise<void> => {
    if (!auth || !firestore) throw new Error("Auth services not available");

    const userCredential = await signInAnonymously(auth);
    const createdFbUser = userCredential.user;
    
    const userDocRef = doc(firestore, 'users', createdFbUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const photoURL = `https://picsum.photos/seed/${createdFbUser.uid}/128/128`;
      const newUser: CannaGrowUser = {
        uid: createdFbUser.uid,
        email: createdFbUser.email || `guest_${createdFbUser.uid}@example.com`,
        displayName: `Invitado_${createdFbUser.uid.substring(0, 5)}`,
        role: 'user',
        photoURL,
        bio: 'Explorando CannaConnect como invitado.',
        createdAt: new Date().toISOString(),
        experiencePoints: 0,
        followerIds: [],
        followingIds: [],
        followerCount: 0,
        followingCount: 0,
        savedPostIds: [],
      };
      await setDoc(userDocRef, newUser);
    }
  }, [auth, firestore]);

  const signUp = useCallback(async (displayName: string, email: string, password: string): Promise<void> => {
    if (!auth || !firestore) {
      throw new Error("Servicios de autenticación no disponibles.");
    }

    const usersRef = collection(firestore, 'users');
    let role: CannaGrowUser['role'] = 'user';

    try {
      const q = query(usersRef, limit(1));
      const existingUsersSnapshot = await getDocs(q);
      
      if (existingUsersSnapshot.empty) {
        role = 'owner';
      }
    } catch (error) {
      console.warn("Could not query users to determine role, defaulting to 'user'. This is expected on first signup due to security rules.", error);
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const createdFbUser = userCredential.user;
    
    const photoURL = `https://picsum.photos/seed/${createdFbUser.uid}/128/128`;
    await updateProfile(createdFbUser, { displayName, photoURL });
    
    const newUser: CannaGrowUser = {
      uid: createdFbUser.uid,
      email: createdFbUser.email!,
      displayName: displayName,
      role: role,
      photoURL: photoURL,
      bio: '',
      createdAt: new Date().toISOString(),
      experiencePoints: 0,
      followerIds: [],
      followingIds: [],
      followerCount: 0,
      followingCount: 0,
      savedPostIds: [],
    };
    
    await setDoc(doc(firestore, 'users', createdFbUser.uid), newUser);
    
    if (role === 'owner') {
        toast({ title: "¡Bienvenido, Dueño!", description: "Tu cuenta de administrador ha sido creada." });
    }

  }, [auth, firestore, toast]);

  const logIn = useCallback(async (email: string, password: string): Promise<void> => {
    if (!auth) throw new Error("Auth service not available.");
    await signInWithEmailAndPassword(auth, email, password);
  }, [auth]);

  const logOut = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  }, [auth, router]);
  
  const updateUserProfile = useCallback(async (updates: Partial<CannaGrowUser>): Promise<void> => {
    if (!user || !firestore) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    await updateDoc(userDocRef, updates);
    toast({ title: '¡Éxito!', description: 'Tu perfil ha sido actualizado.' });
  }, [user, firestore, toast]);

  const createPost = useCallback(async (description: string, imageUri: string) => {
    if (!user || !storage || !firestore) throw new Error("User or services not available");

    const fetchRes = await fetch(imageUri);
    const blob = await fetchRes.blob();
    const file = new File([blob], `post-${Date.now()}.jpg`, { type: blob.type });

    const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${file.name}`);
    const uploadResult = await uploadBytes(storageRef, file);
    const permanentImageUrl = await getDownloadURL(uploadResult.ref);

    const postsCollectionRef = collection(firestore, 'posts');
    await addDoc(postsCollectionRef, {
        authorId: user.uid,
        authorName: user.displayName,
        authorAvatar: user.photoURL,
        description: description,
        imageUrl: permanentImageUrl,
        createdAt: serverTimestamp(),
        likes: 0,
        awards: 0,
        comments: [],
    });
    
    addExperience(user.uid, 10);
  }, [user, storage, firestore, addExperience]);

  const followUser = useCallback(async (targetUserId: string) => {
    if (!user || !firestore || user.uid === targetUserId) return;

    const currentUserRef = doc(firestore, 'users', user.uid);
    const targetUserRef = doc(firestore, 'users', targetUserId);

    await runTransaction(firestore, async (transaction) => {
      transaction.update(currentUserRef, { 
        followingIds: arrayUnion(targetUserId),
        followingCount: increment(1)
      });
      transaction.update(targetUserRef, { 
        followerIds: arrayUnion(user.uid),
        followerCount: increment(1)
      });
    });

  }, [user, firestore]);

  const unfollowUser = useCallback(async (targetUserId: string) => {
    if (!user || !firestore) return;

    const currentUserRef = doc(firestore, 'users', user.uid);
    const targetUserRef = doc(firestore, 'users', targetUserId);

    await runTransaction(firestore, async (transaction) => {
      transaction.update(currentUserRef, { 
        followingIds: arrayRemove(targetUserId),
        followingCount: increment(-1)
      });
      transaction.update(targetUserRef, { 
        followerIds: arrayRemove(user.uid),
        followerCount: increment(-1)
      });
    });

  }, [user, firestore]);

  const _injectUser = useCallback((injectedUser: CannaGrowUser) => {
      // This function is for admin impersonation and should be used with care.
      // For now, it will just log a warning in production environments.
      if (process.env.NODE_ENV === 'production') {
        console.warn("User injection is an admin-only feature and is disabled in production.");
        return;
      }
      // This part of the logic is complex and would require a significant change
      // to the auth state management, so it's stubbed out for now.
      console.log("Injecting user:", injectedUser.displayName);
  }, []);
  

  const value = {
    user,
    loading,
    isOwner,
    isModerator,
    signUp,
    logIn,
    logInAsGuest,
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

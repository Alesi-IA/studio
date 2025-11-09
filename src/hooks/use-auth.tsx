
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
import { doc, setDoc, getDoc, updateDoc, increment, runTransaction, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp, getDocs, query, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
    if (!firestore || !firebaseUser?.uid) return null;
    return doc(firestore, 'users', firebaseUser.uid);
  }, [firestore, firebaseUser?.uid]);
  
  const { data: user, isLoading: isProfileLoading, mutate: refreshUserData } = useDoc<CannaGrowUser>(userDocRef);
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

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
  }, [user, isAuthServiceLoading, isProfileLoading, pathname, router, firebaseUser]);

  const addExperience = useCallback(async (userId: string, amount: number): Promise<void> => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);
    try {
      // This is an insecure operation if rules only allow users to write to their own doc.
      // For this to work, we'd need a Cloud Function or more complex rules.
      // For now, we attempt it and let rules decide.
      await updateDoc(userDocRef, {
        experiencePoints: increment(amount)
      });
    } catch (error) {
      console.warn(`Could not add ${amount}XP to user ${userId}. This might be due to security rules.`, error);
    }
  }, [firestore]);

  const signUp = useCallback(async (displayName: string, email: string, password: string): Promise<void> => {
    if (!auth || !firestore) throw new Error("Auth services not available");
    
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, limit(1));
    const existingUsersSnapshot = await getDocs(q);
    const isFirstUser = existingUsersSnapshot.empty;

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
      role: isFirstUser ? 'owner' : 'user',
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
    // Grant initial XP, but this might fail if rules are strict.
    await addExperience(createdFbUser.uid, 5);

    if (isFirstUser) {
        toast({
            title: '¡Bienvenido, Dueño!',
            description: 'Tu cuenta ha sido creada con privilegios de administrador.'
        })
    }

  }, [auth, firestore, addExperience, toast]);

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
      
      if(!updates.savedPostIds){
          toast({ title: '¡Éxito!', description: 'Tu perfil ha sido actualizado.' });
      }
      refreshUserData();

    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar tu perfil.' });
    }
  }, [user, firestore, auth, toast, refreshUserData]);

  const createPost = useCallback(async (description: string, imageUri: string) => {
    if (!user || !storage || !firestore) {
      throw new Error("User not logged in or Firebase services unavailable.");
    }
    
    // 1. Convert Data URI to Blob for upload
    const fetchRes = await fetch(imageUri);
    const blob = await fetchRes.blob();
    const file = new File([blob], `post-${Date.now()}.jpg`, { type: blob.type });

    // 2. Upload image to Firebase Storage
    const storageRef = ref(storage, `posts/${user.uid}/${file.name}`);
    const uploadResult = await uploadBytes(storageRef, file);
    const permanentImageUrl = await getDownloadURL(uploadResult.ref);

    // 3. Create post document in Firestore
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

    await addExperience(user.uid, 10);
  }, [user, storage, firestore, addExperience]);

  const followUser = useCallback(async (targetUserId: string) => {
    if (!user || !firestore) return;

    const currentUserRef = doc(firestore, 'users', user.uid);
    const targetUserRef = doc(firestore, 'users', targetUserId);

    try {
        await runTransaction(firestore, async (transaction) => {
            const targetUserDoc = await transaction.get(targetUserRef);
            if (!targetUserDoc.exists()) {
                throw "Document does not exist!";
            }
            // Update current user's following list
            transaction.update(currentUserRef, {
                followingIds: arrayUnion(targetUserId),
                followingCount: increment(1)
            });
            // Update target user's followers list
            transaction.update(targetUserRef, {
                followerIds: arrayUnion(user.uid),
                followerCount: increment(1)
            });
        });
        refreshUserData();
        // Since we cannot update the other user's doc, we need to refresh their data if we view their profile
    } catch (error) {
      console.error("Error following user:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo seguir al usuario. Puede que sea por las reglas de seguridad.' });
    }
  }, [user, firestore, toast, refreshUserData]);

  const unfollowUser = useCallback(async (targetUserId: string) => {
    if (!user || !firestore) return;
    
    const currentUserRef = doc(firestore, 'users', user.uid);
    const targetUserRef = doc(firestore, 'users', targetUserId);
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const targetUserDoc = await transaction.get(targetUserRef);
            if (!targetUserDoc.exists()) {
                throw "Document does not exist!";
            }
            // Update current user's following list
            transaction.update(currentUserRef, {
                followingIds: arrayRemove(targetUserId),
                followingCount: increment(-1)
            });
            // Update target user's followers list
            transaction.update(targetUserRef, {
                followerIds: arrayRemove(user.uid),
                followerCount: increment(-1)
            });
        });
        refreshUserData();
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo dejar de seguir al usuario. Puede que sea por las reglas de seguridad.' });
    }
  }, [user, firestore, toast, refreshUserData]);

  const _injectUser = useCallback((injectedUser: CannaGrowUser) => {
      console.warn("User impersonation is a prototype feature and not secure.");
      
      const isPublicRoute = pathname === '/login' || pathname === '/register';
      router.push('/');
      
      toast({
        title: 'Suplantación Exitosa (Prototipo)',
        description: `Navegando como ${injectedUser.displayName}. Recarga la página si es necesario.`,
      });

  }, [toast, router, pathname]);
  

  const value = {
    user,
    loading,
    isOwner,
    isModerator,
    signUp,
    logIn,
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

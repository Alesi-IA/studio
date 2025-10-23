// @ts-nocheck
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useToast } from './use-toast';
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import { FirestorePermissionError, errorEmitter } from '@/firebase';

type UserRole = 'owner' | 'co-owner' | 'moderator' | 'user';

interface CannaGrowUser extends User {
  role: UserRole;
  displayName: string;
}

interface AuthContextType {
  user: CannaGrowUser | null;
  loading: boolean;
  role: UserRole | null;
  isOwner: boolean;
  isCoOwner: boolean;
  isModerator: boolean;
  signUp: (displayName: string, email: string, pass: string) => Promise<void>;
  logIn: (email: string, pass: string) => Promise<void>;
  logOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<CannaGrowUser>) => Promise<void>;
  _injectUser: (user: CannaGrowUser) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  isOwner: false,
  isCoOwner: false,
  isModerator: false,
  signUp: async () => {},
  logIn: async () => {},
  logOut: async () => {},
  updateUserProfile: async () => {},
  _injectUser: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { auth, firestore, isUserLoading, user: firebaseUser } = useFirebase();
  const [cannaUser, setCannaUser] = useState<CannaGrowUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUserRole = async (user: User) => {
      if (!firestore) return;
      
      // Force refresh the token to get custom claims
      const idTokenResult = await user.getIdTokenResult(true);
      const claims = idTokenResult.claims;
      
      const userDocRef = doc(firestore, 'users', user.uid);
      try {
        const userDoc = await getDoc(userDocRef);
        let userData;
        let dbRole: UserRole = 'user';

        if (userDoc.exists()) {
          userData = userDoc.data();
          dbRole = userData.role || 'user';
        } else {
           console.warn(`User document for ${user.uid} not found. Creating with default 'user' role.`);
           const newUserProfile = {
             uid: user.uid,
             email: user.email?.toLowerCase(),
             displayName: user.displayName,
             role: 'user',
             photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/128/128`,
             bio: 'Entusiasta del cultivo, aprendiendo y compartiendo mi viaje en CannaGrow.',
             createdAt: new Date().toISOString(),
           };
           await setDoc(userDocRef, newUserProfile);
           userData = newUserProfile;
        }

        let effectiveRole: UserRole = claims.role || dbRole;
        
        // This is a critical security check and elevation for the owner.
        if (user.email?.toLowerCase() === 'alexisgrow@cannagrow.com') {
            effectiveRole = 'owner';
            // If the claim is not set, this would be the place to call a cloud function to set it.
            // For now, we elevate in the client, and rules will use the claim when available.
        }

        const finalUserData = { ...user, ...userData, role: effectiveRole } as CannaGrowUser;
        
        setCannaUser(finalUserData);

      } catch (error) {
        console.error("Error fetching user role:", error);
        const fallbackUser = { ...user, role: claims.role || 'user', displayName: user.displayName } as CannaGrowUser;
        if (user.email?.toLowerCase() === 'alexisgrow@cannagrow.com') {
            fallbackUser.role = 'owner';
        }
        setCannaUser(fallbackUser);
      } finally {
        setLoading(false);
      }
    };

    if (isUserLoading) {
      setLoading(true);
    } else if (firebaseUser) {
      fetchUserRole(firebaseUser);
    } else {
      setCannaUser(null);
      setLoading(false);
    }
  }, [firebaseUser, isUserLoading, firestore]);

  const role = cannaUser?.role || null;
  const isOwner = role === 'owner';
  const isCoOwner = role === 'co-owner';
  const isModerator = role === 'moderator' || role === 'co-owner' || role === 'owner';

  const signUp = useCallback(async (displayName: string, email: string, password: string): Promise<void> => {
    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Servicios de autenticación no disponibles.' });
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      await updateProfile(user, {
        displayName: displayName,
        photoURL: `https://picsum.photos/seed/${user.uid}/128/128`,
      });
      
      const normalizedEmail = email.toLowerCase();
      const userRole: UserRole = 'user'; // All new signups are users
  
      const userDocRef = doc(firestore, 'users', user.uid);
      const roleDocRef = doc(firestore, 'roles', user.uid);

      const newUserProfile = {
        uid: user.uid,
        email: normalizedEmail,
        displayName: displayName,
        role: userRole,
        photoURL: `https://picsum.photos/seed/${user.uid}/128/128`,
        bio: 'Entusiasta del cultivo, aprendiendo y compartiendo mi viaje en CannaGrow.',
        createdAt: new Date().toISOString(),
      };
      
      // Create user profile document
      await setDoc(userDocRef, newUserProfile).catch((error) => {
          if (error.code === 'permission-denied') {
            const contextualError = new FirestorePermissionError({ operation: 'create', path: userDocRef.path, requestResourceData: newUserProfile });
            errorEmitter.emit('permission-error', contextualError);
          } else {
            throw error; // Rethrow other errors
          }
      });

      // Create role document
      await setDoc(roleDocRef, { role: userRole }).catch((error) => {
          if (error.code === 'permission-denied') {
            const contextualError = new FirestorePermissionError({ operation: 'create', path: roleDocRef.path, requestResourceData: { role: userRole } });
            errorEmitter.emit('permission-error', contextualError);
          } else {
            throw error;
          }
      });
  
      toast({ title: "¡Cuenta Creada!", description: "Has sido registrado exitosamente." });
  
    } catch (error: any) {
      console.error('Sign up error', error);
      toast({ variant: "destructive", title: "Error de Registro", description: "No se pudo crear la cuenta. El email puede estar ya en uso." });
    } finally {
      setLoading(false);
    }
  }, [auth, firestore, toast]);

  const logIn = useCallback(async (email: string, password: string): Promise<void> => {
    if (!auth) {
        toast({ variant: "destructive", title: "Error", description: "Servicios de autenticación no disponibles." });
        return Promise.reject(new Error("Auth service not available"));
    }
    setLoading(true);
    return new Promise((resolve, reject) => {
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                toast({ title: "Inicio de Sesión Exitoso" });
                resolve();
            })
            .catch((error: any) => {
                toast({ variant: "destructive", title: "Error de Inicio de Sesión", description: "Las credenciales son incorrectas." });
                reject(error);
            })
            .finally(() => {
                setLoading(false);
            });
    });
}, [auth, toast]);

  const logOut = useCallback(async () => {
    if (!auth) return;
    setLoading(true);
    try {
        await signOut(auth);
        setCannaUser(null);
    } catch (error) {
         toast({ variant: "destructive", title: "Error", description: "No se pudo cerrar la sesión." });
    } finally {
        setLoading(false);
    }
  }, [auth, toast]);
  
  const updateUserProfile = useCallback(async (updates: Partial<CannaGrowUser>) => {
    if (!cannaUser || !firestore) return;
    setLoading(true);
    const userDocRef = doc(firestore, 'users', cannaUser.uid);
    const roleDocRef = doc(firestore, 'roles', cannaUser.uid);

    const userUpdates: Partial<CannaGrowUser> = { ...updates };
    const roleUpdates: Partial<{role: UserRole}> = {};

    if (updates.role) {
      roleUpdates.role = updates.role;
    }

    try {
        // Here you would ideally call a Cloud Function to update the role and set a custom claim
        if (Object.keys(roleUpdates).length > 0) {
            await setDoc(roleDocRef, roleUpdates, { merge: true });
        }
        await updateDoc(userDocRef, userUpdates);
        // After updating the role in DB, force a token refresh to get the new claim on the client
        await cannaUser.getIdTokenResult(true);
        // Update local state
        setCannaUser(prev => prev ? ({...prev, ...userUpdates, ...roleUpdates}) : null)

    } catch (error) {
        if (error.code === 'permission-denied') {
          const contextualError = new FirestorePermissionError({ operation: 'update', path: userDocRef.path, requestResourceData: updates });
          errorEmitter.emit('permission-error', contextualError);
        } else {
            console.error('Error al actualizar el perfil:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar tu perfil.' });
        }
    } finally {
        setLoading(false);
    }
  
  }, [cannaUser, firestore, toast]);


  const _injectUser = (userToImpersonate: CannaGrowUser) => {
     if (isOwner) {
        const fullUser = {
            ...firebaseUser,
            ...userToImpersonate
        }
        setCannaUser(fullUser as CannaGrowUser);
     }
  };

  const value = {
    user: cannaUser,
    loading,
    role,
    isOwner,
    isCoOwner,
    isModerator,
    signUp,
    logIn,
    logOut,
    updateUserProfile,
    _injectUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider -> FirebaseClientProvider');
  }
  return context;
};

    
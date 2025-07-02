'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      console.error("Full error object from Google Sign-In:", error);
      const authError = error as AuthError;
      
      let description = `An unexpected error occurred. Code: ${authError.code}. Please check the console for more details.`;
      
      if (authError.code === 'auth/unauthorized-domain') {
        description = "This domain is not authorized. Please double-check your settings in the Google Cloud Console for your project's OAuth 2.0 Client ID. Ensure 'http://localhost' AND 'http://localhost:9002' are both listed under 'Authorized JavaScript origins'. These changes can take a few minutes to apply.";
      } else if (authError.code === 'auth/popup-closed-by-user') {
        description = "The sign-in popup was closed before completing. Please try again.";
      }

      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: description,
        duration: 15000,
      });
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      setUser(userCredential.user);
      router.push('/dashboard');
    } catch (error) {
      console.error("Error signing up", error);
      const authError = error as AuthError;
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: authError.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error) {
      console.error("Error signing in", error);
      const authError = error as AuthError;
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: authError.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out", error);
      const authError = error as AuthError;
       toast({
        variant: "destructive",
        title: "Logout Failed",
        description: authError.message,
      });
    }
  };

  const updateUserName = async (name: string) => {
    if (!auth.currentUser) {
      toast({
        variant: 'destructive',
        title: 'Not authenticated',
        description: 'You must be logged in to update your profile.',
      });
      return;
    }
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      // Manually update the user state because onAuthStateChanged doesn't fire on profile updates.
      // Creating a new object from the updated currentUser forces a re-render.
      setUser({ ...auth.currentUser } as User);

      toast({
        title: 'Profile Updated',
        description: 'Your display name has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating profile', error);
      const authError = error as AuthError;
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: authError.message,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, logout, updateUserName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

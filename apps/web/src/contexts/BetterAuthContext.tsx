'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authClient, useSession as useAuthSession } from '@/lib/auth-client';

interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  image?: string | null;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function BetterAuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useAuthSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(isPending);
  }, [isPending]);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        return { error: result.error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Failed to sign in' };
    }
  };

  const handleSignUp = async (email: string, password: string, name?: string) => {
    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name: name || email.split('@')[0],
      });

      if (result.error) {
        return { error: result.error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Failed to create account' };
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch {
      // Sign out error
    }
  };

  const refreshSession = async () => {
    // Re-fetch session from Quickdash
    try {
      await authClient.getSession();
    } catch {
      // Session refresh failed
    }
  };

  // Map Quickdash user to local User type
  const user: User | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        emailVerified: true, // Quickdash doesn't track this yet
      }
    : null;

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!session?.user,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useBetterAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useBetterAuth must be used within a BetterAuthProvider');
  }
  return context;
}

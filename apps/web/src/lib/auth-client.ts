/**
 * Auth client for Quickdash Storefront API
 * Handles customer authentication via JWT
 */

import { store } from './store';

// Session state
let currentSession: {
  user: {
    id: string;
    email: string;
    name: string;
    image: string | null;
  } | null;
  token: string | null;
} = {
  user: null,
  token: null,
};

// Session change listeners
type SessionListener = (session: typeof currentSession) => void;
const listeners: Set<SessionListener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener(currentSession));
}

// Initialize from localStorage on client
if (typeof window !== 'undefined') {
  const savedToken = localStorage.getItem('customerToken');
  const savedUser = localStorage.getItem('customerUser');
  if (savedToken && savedUser) {
    try {
      currentSession = {
        token: savedToken,
        user: JSON.parse(savedUser),
      };
      store.setCustomerToken(savedToken);
    } catch {
      // Invalid saved data, clear it
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerUser');
    }
  }
}

function saveSession(user: typeof currentSession.user, token: string | null) {
  currentSession = { user, token };
  if (typeof window !== 'undefined') {
    if (token && user) {
      localStorage.setItem('customerToken', token);
      localStorage.setItem('customerUser', JSON.stringify(user));
      store.setCustomerToken(token);
    } else {
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerUser');
      store.setCustomerToken(null);
    }
  }
  notifyListeners();
}

// Sign up
export const signUp = {
  email: async (data: { email: string; password: string; name: string }) => {
    try {
      const response = await store.auth.register({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      saveSession(
        {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          image: response.user.image,
        },
        response.token
      );

      return { data: response, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create account';
      return { data: null, error: { message } };
    }
  },
};

// Sign in
export const signIn = {
  email: async (data: { email: string; password: string }) => {
    try {
      const response = await store.auth.login({
        email: data.email,
        password: data.password,
      });

      saveSession(
        {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          image: response.user.image,
        },
        response.token
      );

      return { data: response, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid email or password';
      return { data: null, error: { message } };
    }
  },
};

// Sign out
export const signOut = async () => {
  store.auth.logout();
  saveSession(null, null);
  return { error: null };
};

// Get current session
export const getSession = async () => {
  if (!currentSession.token) {
    return { data: null };
  }

  try {
    // Verify token is still valid by fetching profile
    const { user } = await store.auth.getProfile();
    saveSession(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      currentSession.token
    );
    return { data: { session: currentSession, user: currentSession.user } };
  } catch {
    // Token invalid, clear session
    saveSession(null, null);
    return { data: null };
  }
};

// React hook for session
export function useSession() {
  // This is a simplified version - in production you'd use React state
  const [session, setSession] = useState(currentSession);

  useEffect(() => {
    const listener = (newSession: typeof currentSession) => {
      setSession(newSession);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    data: session.user ? { session, user: session.user } : null,
    isPending: false,
    error: null,
  };
}

// Need to import React hooks
import { useState, useEffect } from 'react';

// Legacy export for compatibility
export const authClient = {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
};

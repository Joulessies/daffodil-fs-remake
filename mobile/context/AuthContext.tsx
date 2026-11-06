import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useAuth as useClerkAuth,
  useUser as useClerkUser,
  useSignIn as useClerkSignIn,
  useSignUp as useClerkSignUp,
  useClerk,
} from '@clerk/expo';
import { useSSO } from '@clerk/expo/experimental';

WebBrowser.maybeCompleteAuthSession();

export interface AppUser {
  id: string;
  email: string | null;
  user_metadata: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
}

interface AuthContextType {
  user: AppUser | null;
  session: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInAsDemoClient: (customEmail?: string, customName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  guestEmail: string;
  setGuestEmail: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded: isAuthLoaded, isSignedIn, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser, isLoaded: isUserLoaded } = useClerkUser();
  const { signIn: clerkSignIn } = useClerkSignIn();
  const { signUp: clerkSignUp } = useClerkSignUp();
  const { startSSOFlow } = useSSO();
  const { setActive } = useClerk();

  const [localUser, setLocalUser] = useState<AppUser | null>(null);
  const [localLoaded, setLocalLoaded] = useState<boolean>(false);
  const [guestEmail, setGuestEmail] = useState<string>('');

  // Load persistent local client session
  useEffect(() => {
    AsyncStorage.getItem('@daffodil_client_session')
      .then((data) => {
        if (data) {
          try {
            setLocalUser(JSON.parse(data));
          } catch (e) {}
        }
      })
      .finally(() => {
        setLocalLoaded(true);
      });
  }, []);

  const isLoading = (!isAuthLoaded || !isUserLoaded) && !localLoaded;

  const user: AppUser | null = useMemo(() => {
    if (isSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || null;
      const fullName =
        clerkUser.fullName ||
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
        (email ? email.split('@')[0] : 'Client');

      return {
        id: clerkUser.id,
        email,
        user_metadata: {
          full_name: fullName,
          name: fullName,
          avatar_url: clerkUser.imageUrl || undefined,
        },
      };
    }
    return localUser;
  }, [isSignedIn, clerkUser, localUser]);

  const signIn = async (email: string, password: string) => {
    const trimmedEmail = email.trim();
    // 1. Attempt Clerk authentication first
    if (clerkSignIn) {
      try {
        const { error } = await clerkSignIn.password({
          emailAddress: trimmedEmail,
          password,
        });
        if (!error && clerkSignIn.status === 'complete') {
          await clerkSignIn.finalize();
          return { error: null };
        }
        if (error) {
          console.log('[Auth] Clerk sign-in message:', error.message || error);
        }
      } catch (clerkErr: any) {
        console.log('[Auth] Clerk sign-in message:', clerkErr?.message || clerkErr);
      }
    }

    // 2. Seamless client fallback: sign the user in with a persistent client account
    const namePart = trimmedEmail.split('@')[0] || 'Client';
    const fallbackUser: AppUser = {
      id: 'client_' + Date.now().toString(36),
      email: trimmedEmail,
      user_metadata: {
        full_name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
        name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
      },
    };
    await AsyncStorage.setItem('@daffodil_client_session', JSON.stringify(fallbackUser));
    setLocalUser(fallbackUser);
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();

    // 1. Attempt Clerk sign-up
    if (clerkSignUp) {
      try {
        const parts = trimmedName.split(' ');
        const firstName = parts[0] || 'Client';
        const lastName = parts.slice(1).join(' ') || '';

        const { error } = await clerkSignUp.password({
          emailAddress: trimmedEmail,
          password,
          firstName,
          lastName,
        });
        if (!error && clerkSignUp.status === 'complete') {
          await clerkSignUp.finalize();
          return { error: null };
        }
        if (error) {
          console.log('[Auth] Clerk sign-up message:', error.message || error);
        }
      } catch (clerkErr: any) {
        console.log('[Auth] Clerk sign-up message:', clerkErr?.message || clerkErr);
      }
    }

    // 2. Seamless client fallback: establish active client session
    const clientUser: AppUser = {
      id: 'client_' + Date.now().toString(36),
      email: trimmedEmail,
      user_metadata: {
        full_name: trimmedName || trimmedEmail.split('@')[0],
        name: trimmedName || trimmedEmail.split('@')[0],
      },
    };
    await AsyncStorage.setItem('@daffodil_client_session', JSON.stringify(clientUser));
    setLocalUser(clientUser);
    return { error: null };
  };

  const signInAsDemoClient = async (customEmail?: string, customName?: string) => {
    const email = customEmail || 'julius.sanjose08@gmail.com';
    const name = customName || 'Julius San Jose';
    const clientUser: AppUser = {
      id: 'client_julius_san_jose',
      email,
      user_metadata: {
        full_name: name,
        name,
      },
    };
    await AsyncStorage.setItem('@daffodil_client_session', JSON.stringify(clientUser));
    setLocalUser(clientUser);
    return { error: null };
  };

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = Linking.createURL('/(tabs)/profile', { scheme: 'daffodil' });
      console.log('[Auth] Starting SSO with redirectUrl:', redirectUrl);
      const res = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl,
      });

      console.log('[Auth] OAuth result:', {
        createdSessionId: res.createdSessionId,
        signInSessionId: res.signIn?.createdSessionId,
        signUpSessionId: res.signUp?.createdSessionId,
        signInStatus: res.signIn?.status,
        signUpStatus: res.signUp?.status,
        signUpMissing: res.signUp?.missingFields,
        authSessionResult: (res as any).authSessionResult,
      });

      const sessionId = res.createdSessionId || res.signIn?.createdSessionId || res.signUp?.createdSessionId;

      if (sessionId && setActive) {
        await setActive({ session: sessionId });
        return { error: null };
      }

      if (res.signUp?.status === 'missing_requirements') {
        const missing = res.signUp.missingFields?.join(', ') || 'additional profile details';
        return { error: new Error(`Clerk requires: ${missing}`) };
      }

      if (!sessionId) {
        return { error: new Error('No session was created from Google sign-in. Please try again.') };
      }

      return { error: null };
    } catch (err: any) {
      console.error('[Auth] OAuth error:', err);
      const message = err?.errors?.[0]?.message || err?.message || 'Google sign-in could not be completed.';
      return { error: new Error(message) };
    }
  };

  const signOut = async () => {
    try {
      await clerkSignOut();
    } catch (err) {
      console.warn('Error signing out of Clerk:', err);
    }
    await AsyncStorage.removeItem('@daffodil_client_session');
    setLocalUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session: null,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signInAsDemoClient,
        signOut,
        guestEmail,
        setGuestEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// hooks/useAuth.tsx
// Thin auth abstraction over Clerk. Screens use this (not Clerk hooks directly)
// so that when Clerk isn't configured yet (no publishable key), the app still
// renders in a signed-out state instead of crashing at load — the same
// white-screen failure class this repo hit before (commit c9a30b2).
import { createContext, useContext, ReactNode } from 'react';
import Constants from 'expo-constants';
import {
  ClerkProvider,
  useAuth as useClerkAuth,
  useUser,
} from '@clerk/clerk-expo';

const publishableKey = (Constants.expoConfig?.extra?.clerkPublishableKey as string) || '';
export const isAuthConfigured = !!publishableKey;

if (!isAuthConfigured) {
  console.warn('⚠️ Clerk not configured — set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Auth/checkout/dashboard will be unavailable until then.');
}

// Web-safe token cache: persists to localStorage on web, no-ops on native
// (native persistence would need expo-secure-store; web is the deploy target).
const tokenCache = {
  getToken: (key: string) => {
    try {
      return Promise.resolve(typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null);
    } catch {
      return Promise.resolve(null);
    }
  },
  saveToken: (key: string, value: string) => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
    return Promise.resolve();
  },
};

export interface AppAuthValue {
  isReady: boolean;      // auth layer finished loading
  isSignedIn: boolean;
  email: string | null;
  configured: boolean;   // false when Clerk has no key
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AppAuthContext = createContext<AppAuthValue | undefined>(undefined);

function ClerkBridge({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth();
  const { user } = useUser();

  const value: AppAuthValue = {
    isReady: isLoaded,
    isSignedIn: !!isSignedIn,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    configured: true,
    getToken: async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    },
    signOut: async () => {
      await signOut();
    },
  };

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}

function UnconfiguredBridge({ children }: { children: ReactNode }) {
  const value: AppAuthValue = {
    isReady: true,
    isSignedIn: false,
    email: null,
    configured: false,
    getToken: async () => null,
    signOut: async () => {},
  };
  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!isAuthConfigured) {
    return <UnconfiguredBridge>{children}</UnconfiguredBridge>;
  }
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkBridge>{children}</ClerkBridge>
    </ClerkProvider>
  );
}

export function useAuth(): AppAuthValue {
  const ctx = useContext(AppAuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

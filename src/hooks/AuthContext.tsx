import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getRayfinClient } from '../services/rayfinClient';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithFabric: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

let globalSessionExpiredHandler: (() => void) | null = null;
export function getGlobalSessionExpiredHandler() {
  return globalSessionExpiredHandler;
}

function readSession(): AuthUser | null {
  const session = getRayfinClient().auth.getSession();
  if (!session.isAuthenticated || !session.user) return null;
  return {
    id: session.user.id,
    email: (session.user as { email?: string }).email ?? '',
    displayName: (session.user as { displayName?: string }).displayName,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<number | null>(null);

  const refresh = useCallback(() => setUser(readSession()), []);

  useEffect(() => {
    refresh();
    setLoading(false);
    pollRef.current = window.setInterval(refresh, 30_000);
    globalSessionExpiredHandler = () => setUser(null);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      globalSessionExpiredHandler = null;
    };
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: async (email, password) => {
        await getRayfinClient().auth.signIn({ email, password });
        refresh();
      },
      signUp: async (email, password) => {
        const auth = getRayfinClient().auth;
        await auth.signUp({ email, password });
        await auth.signIn({ email, password });
        refresh();
      },
      signInWithFabric: async () => {
        const { ensureSignedInWithFabric } = await import(
          '@microsoft/rayfin-auth-provider-fabric'
        );
        await ensureSignedInWithFabric(getRayfinClient().auth, {
          workspaceId: import.meta.env.VITE_FABRIC_WORKSPACE_ID ?? '',
          projectId: import.meta.env.VITE_FABRIC_ITEM_ID ?? '',
          fabricPortalUrl: import.meta.env.VITE_FABRIC_PORTAL_URL ?? '',
          returnOrigin: window.location.origin,
        });
        refresh();
      },
      signOut: async () => {
        await getRayfinClient().auth.signOut();
        setUser(null);
      },
    }),
    [user, loading, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

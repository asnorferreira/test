'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../lib/api';

type UserProfile = {
  id: string;
  email: string;
  displayName?: string | null;
  role: string;
  tenantId: string;
};

type AuthContextValue = {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  login: (params: { email: string; password: string; tenantSlug: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const STORAGE_KEY = 'intermedius::token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadProfile = useCallback(
    async (nextToken: string | null = null) => {
      try {
        const profile = await apiFetch<UserProfile>('/users/me', {
          skipAuth: false,
          headers: nextToken
            ? { Authorization: `Bearer ${nextToken}` }
            : undefined,
        });
        setUser(profile);
      } catch (error) {
        console.error('Failed to load profile', error);
        setUser(null);
        setToken(null);
        localStorage.removeItem(STORAGE_KEY);
        throw error;
      }
    },
    [],
  );

  useEffect(() => {
    const storedToken =
      typeof window !== 'undefined'
        ? localStorage.getItem(STORAGE_KEY)
        : null;
    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);
    loadProfile(storedToken)
      .catch(() => {
        // handled inside loadProfile
      })
      .finally(() => setLoading(false));
  }, [loadProfile]);

  const login = useCallback(
    async ({ email, password, tenantSlug }: { email: string; password: string; tenantSlug: string }) => {
      setLoading(true);
      try {
        const result = await apiFetch<{ access_token: string }>('/auth/login', {
          method: 'POST',
          skipAuth: true,
          body: { email, password, tenantSlug },
        });
        const accessToken = result.access_token;
        localStorage.setItem(STORAGE_KEY, accessToken);
        setToken(accessToken);
        await loadProfile(accessToken);
        router.replace('/');
      } finally {
        setLoading(false);
      }
    },
    [loadProfile, router],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
    router.replace('/login');
  }, [router]);

  const refreshProfile = useCallback(async () => {
    await loadProfile(token);
  }, [loadProfile, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      loading,
      login,
      logout,
      refreshProfile,
    }),
    [token, user, loading, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}





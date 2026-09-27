'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Role } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, passwordPlain: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasRole: (roles: Role | Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check session on load
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(data.token);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch {
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = async (email: string, passwordPlain: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: passwordPlain }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Invalid credentials' };
      }

      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUser(null);
    setToken(null);
    router.push('/admin/login');
  };

  const hasRole = (roles: Role | Role[]): boolean => {
    if (!user) return false;
    const allowed = Array.isArray(roles) ? roles : [roles];
    if (user.role === 'ADMIN') return true;
    if (user.role === 'MANAGER' && !allowed.includes('ADMIN')) return true;
    return allowed.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

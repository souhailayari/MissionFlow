"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ApiError, apiRequest } from "@/lib/api/client";
import { login as loginRequest, logout as logoutRequest } from "@/lib/api/auth";
import {
  clearSession,
  getRefreshToken,
  getStoredUser,
  readSession,
  saveSession,
  setSessionExpiredListener,
} from "@/lib/auth/token-storage";
import type { AuthResponse, AuthStatus, User } from "@/types/auth";

type SessionContextValue = {
  status: AuthStatus;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);
let restorePromise: Promise<AuthResponse> | null = null;

const refreshStoredSession = (refreshToken: string): Promise<AuthResponse> => {
  if (!restorePromise) {
    restorePromise = apiRequest<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
      skipRefresh: true,
    }).finally(() => {
      restorePromise = null;
    });
  }
  return restorePromise;
};

export function SessionProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let active = true;
    setSessionExpiredListener(() => {
      if (!active) return;
      setUser(null);
      setStatus("unauthenticated");
    });
    const restore = async () => {
      const stored = readSession();
      if (!stored?.refreshToken) {
        if (active) setStatus("unauthenticated");
        return;
      }

      try {
        const refreshed = await refreshStoredSession(stored.refreshToken);
        saveSession(refreshed);
        if (active) {
          setUser(refreshed.user);
          setStatus("authenticated");
        }
      } catch (error) {
        if (!active) return;
        if (error instanceof ApiError && (error.status === 0 || error.status === 429 || error.status >= 500)) {
          setUser(stored.user);
          setStatus("authenticated");
          return;
        }
        clearSession();
        setStatus("unauthenticated");
      }
    };
    void restore();
    return () => {
      active = false;
      setSessionExpiredListener(null);
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const session = await loginRequest({ email, password });
    saveSession(session);
    setUser(session.user);
    setStatus("authenticated");
  };

  const logout = async (): Promise<void> => {
    const refreshToken = getRefreshToken();
    clearSession();
    setUser(null);
    setStatus("unauthenticated");
    if (refreshToken) await logoutRequest(refreshToken).catch(() => undefined);
  };

  const value: SessionContextValue = { status, user: user ?? getStoredUser(), login, logout };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = (): SessionContextValue => {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession doit être utilisé dans SessionProvider");
  return context;
};

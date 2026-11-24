"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiRequest } from "@/lib/api/client";
import { logoutWebSession } from "@/lib/api/auth";
import {
  clearSession,
  getStoredUser,
  saveSession,
  setSessionExpiredListener,
} from "@/lib/auth/token-storage";
import type { AuthResponse, AuthStatus, User } from "@/types/auth";

type SessionContextValue = {
  status: AuthStatus;
  user: User | null;
  loginWithSession: (session: AuthResponse) => void;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);
let restorePromise: Promise<AuthResponse> | null = null;

const refreshWebSession = (): Promise<AuthResponse> => {
  if (!restorePromise) {
    restorePromise = apiRequest<AuthResponse>("/auth/web-refresh", {
      method: "POST",
      skipRefresh: true,
      credentials: "include",
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
      try {
        const refreshed = await refreshWebSession();
        saveSession(refreshed);
        if (active) {
          setUser(refreshed.user);
          setStatus("authenticated");
        }
      } catch {
        if (!active) return;
        clearSession();
        setUser(null);
        setStatus("unauthenticated");
      }
    };
    void restore();
    return () => {
      active = false;
      setSessionExpiredListener(null);
    };
  }, []);

  const loginWithSession = useCallback((session: AuthResponse): void => {
    saveSession(session);
    setUser(session.user);
    setStatus("authenticated");
  }, []);

  const logout = async (): Promise<void> => {
    clearSession();
    setUser(null);
    setStatus("unauthenticated");
    await logoutWebSession().catch(() => undefined);
  };

  const value: SessionContextValue = { status, user: user ?? getStoredUser(), loginWithSession, logout };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = (): SessionContextValue => {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession doit être utilisé dans SessionProvider");
  return context;
};

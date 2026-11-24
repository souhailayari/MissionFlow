import type { AuthTokens, User } from "@/types/auth";

const storageKey = "missionflow.auth";
type StoredSession = AuthTokens;

let browserSession: StoredSession | null = null;
let legacyStorageCleared = false;
let sessionExpiredListener: (() => void) | null = null;

const clearLegacyStoredSession = (): void => {
  if (typeof window === "undefined" || legacyStorageCleared) return;
  legacyStorageCleared = true;
  for (const storageName of ["sessionStorage", "localStorage"] as const) {
    try {
      window[storageName].removeItem(storageKey);
    } catch {
      // Browser storage may be unavailable in restricted contexts.
    }
  }
};

export const readSession = (): StoredSession | null => {
  clearLegacyStoredSession();
  return typeof window === "undefined" ? null : browserSession;
};

export const saveSession = (session: AuthTokens): void => {
  clearLegacyStoredSession();
  browserSession = session;
};

export const updateAccessToken = (accessToken: string): AuthTokens | null => {
  const session = readSession();
  if (!session) return null;
  const updated = { ...session, accessToken };
  saveSession(updated);
  return updated;
};

export const clearSession = (): void => {
  browserSession = null;
  clearLegacyStoredSession();
};

export const setSessionExpiredListener = (listener: (() => void) | null): void => {
  sessionExpiredListener = listener;
};

export const expireSession = (): void => {
  clearSession();
  sessionExpiredListener?.();
};

export const getAccessToken = (): string | null => readSession()?.accessToken ?? null;

export const getStoredUser = (): User | null => readSession()?.user ?? null;

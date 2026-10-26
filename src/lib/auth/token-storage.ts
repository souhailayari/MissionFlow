import type { AuthTokens, User } from "@/types/auth";

const storageKey = "missionflow.auth";

type StoredSession = AuthTokens;

const canUseStorage = (): boolean => typeof window !== "undefined";
let browserSession: StoredSession | null = null;
let sessionLoaded = false;
let legacyStorageCleared = false;
let sessionExpiredListener: (() => void) | null = null;

const isStoredSession = (value: unknown): value is StoredSession => {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const user = candidate.user;
  return typeof candidate.accessToken === "string"
    && typeof candidate.refreshToken === "string"
    && typeof user === "object"
    && user !== null
    && typeof (user as Record<string, unknown>).id === "string";
};

const clearLegacyStoredSession = (): void => {
  if (!canUseStorage() || legacyStorageCleared) return;
  legacyStorageCleared = true;

  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Browser storage can be unavailable in restricted contexts.
  }
};

export const readSession = (): StoredSession | null => {
  if (!canUseStorage()) return null;
  clearLegacyStoredSession();
  if (!sessionLoaded) {
    sessionLoaded = true;
    try {
      const serialized = window.sessionStorage.getItem(storageKey);
      if (serialized) {
        const parsed: unknown = JSON.parse(serialized);
        if (isStoredSession(parsed)) browserSession = parsed;
        else window.sessionStorage.removeItem(storageKey);
      }
    } catch {
      browserSession = null;
    }
  }
  return browserSession;
};

export const saveSession = (session: AuthTokens): void => {
  browserSession = session;
  sessionLoaded = true;
  if (!canUseStorage()) return;
  clearLegacyStoredSession();
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(session));
  } catch {
    // Keep the active session in memory when browser storage is unavailable.
  }
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
  sessionLoaded = true;
  if (!canUseStorage()) return;
  try {
    window.sessionStorage.removeItem(storageKey);
  } catch {
    // Browser storage can be unavailable in restricted contexts.
  }
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

export const getRefreshToken = (): string | null => readSession()?.refreshToken ?? null;

export const getStoredUser = (): User | null => readSession()?.user ?? null;

import {
  expireSession,
  getAccessToken,
  getRefreshToken,
  saveSession,
} from "@/lib/auth/token-storage";
import type { AuthResponse } from "@/types/auth";

const environmentApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
if (process.env.NODE_ENV === "production") {
  let usesHttps = false;
  try {
    const parsed = new URL(environmentApiUrl ?? "");
    usesHttps = parsed.protocol === "https:" && Boolean(parsed.host) && !parsed.username && !parsed.password;
  } catch {
    usesHttps = false;
  }
  if (!usesHttps) throw new Error("Production builds require an HTTPS NEXT_PUBLIC_API_URL.");
}
const configuredApiBaseUrl = (environmentApiUrl || "http://localhost:3001/api").replace(/\/$/, "");

const isPrivateIPv4 = (hostname: string): boolean => {
  const octets = hostname.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return false;
  const [first, second] = octets;
  return first === 10 || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168);
};

const apiBaseUrl = (): string => {
  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined" && window.location.protocol === "http:") {
    const { hostname, protocol } = window.location;
    const isLoopback = hostname === "localhost" || hostname === "127.0.0.1";
    if (isLoopback || isPrivateIPv4(hostname)) return `${protocol}//${hostname}:3001/api`;
  }
  return configuredApiBaseUrl;
};

export class ApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(
    status: number,
    message: string,
    details: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  responseType?: "json" | "blob";
  skipRefresh?: boolean;
};

type RefreshResult = "refreshed" | "invalid" | "unavailable";

let refreshPromise: Promise<RefreshResult> | null = null;

const getErrorMessage = (
  payload: unknown,
  status: number,
): string => {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (
    typeof payload === "object" &&
    payload !== null
  ) {
    if ("message" in payload) {
      const message = payload.message;

      if (
        typeof message === "string" &&
        message.trim()
      ) {
        return message;
      }

      if (
        Array.isArray(message) &&
        message.every(
          (item) => typeof item === "string",
        )
      ) {
        return message.join(" ");
      }
    }

    if ("error" in payload) {
      const error = payload.error;

      if (
        typeof error === "string" &&
        error.trim()
      ) {
        return error;
      }
    }
  }

  if (status === 0) {
    return "Le serveur est inaccessible.";
  }

  return `Erreur HTTP ${status}.`;
};

const refreshSession = async (): Promise<RefreshResult> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return "invalid";
  }

  if (!refreshPromise) {
    refreshPromise = fetch(
      `${apiBaseUrl()}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      },
    )
      .then(async (response) => {
        if (!response.ok) {
          return response.status === 400 || response.status === 401 || response.status === 403
            ? "invalid"
            : "unavailable";
        }

        const session =
          (await response.json()) as AuthResponse;

        saveSession(session);

        return "refreshed";
      })
      .catch(() => "unavailable" as const)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    skipRefresh = false,
    responseType = "json",
    body,
    headers,
    ...requestInit
  } = options;

  const accessToken = getAccessToken();

  const requestHeaders = new Headers(headers);

  if (
    body !== undefined &&
    !(body instanceof FormData)
  ) {
    requestHeaders.set(
      "Content-Type",
      "application/json",
    );
  }

  if (accessToken) {
    requestHeaders.set(
      "Authorization",
      `Bearer ${accessToken}`,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${apiBaseUrl()}${path}`,
      {
        ...requestInit,
        headers: requestHeaders,
        body:
          body instanceof FormData
            ? body
            : body === undefined
              ? undefined
              : JSON.stringify(body),
      },
    );
  } catch {
    throw new ApiError(
      0,
      "Le serveur est inaccessible.",
      null,
    );
  }

  if (
    response.status === 401 &&
    !skipRefresh &&
    path !== "/auth/refresh"
  ) {
    const refreshed = await refreshSession();

    if (refreshed === "refreshed") {
      return apiRequest<T>(path, {
        ...options,
        skipRefresh: true,
      });
    }

    if (refreshed === "invalid") expireSession();
  }

  if (!response.ok) {
    const contentType =
      response.headers.get("content-type") ?? "";
    let payload: unknown;

    try {
      if (contentType.includes("application/json")) {
        payload = await response.json();
      } else {
        payload = await response.text();
      }
    } catch {
      payload = null;
    }

    throw new ApiError(
      response.status,
      getErrorMessage(
        payload,
        response.status,
      ),
      payload,
    );
  }

  if (responseType === "blob") {
    return await response.blob() as T;
  }

  const contentType =
    response.headers.get("content-type") ?? "";

  let payload: unknown;

  try {
    if (
      contentType.includes("application/json")
    ) {
      payload = await response.json();
    } else {
      payload = await response.text();
    }
  } catch {
    payload = null;
  }

  return payload as T;
}

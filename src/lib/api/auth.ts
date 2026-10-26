import { apiRequest } from "@/lib/api/client";
import type { AuthResponse, SuccessResponse } from "@/types/auth";

export type LoginPayload = {
  email: string;
  password: string;
};

export const login = (payload: LoginPayload): Promise<AuthResponse> =>
  apiRequest<AuthResponse>("/auth/login", { method: "POST", body: payload, skipRefresh: true });

export const logout = (refreshToken: string): Promise<SuccessResponse> =>
  apiRequest<SuccessResponse>("/auth/logout", { method: "POST", body: { refreshToken }, skipRefresh: true });
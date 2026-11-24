import { apiRequest } from "@/lib/api/client";
import type { AuthResponse, SuccessResponse } from "@/types/auth";

export type TwoFactorChallenge = { requiresTwoFactor: true; challengeToken: string; expiresAt: string };

export type LoginPayload = {
  email: string;
  password: string;
};

export const webLogin = (payload: LoginPayload & { verificationToken: string }): Promise<AuthResponse | TwoFactorChallenge> =>
  apiRequest<AuthResponse | TwoFactorChallenge>("/auth/web-login", { method: "POST", body: payload, skipRefresh: true, credentials: "include" });

export const completeTwoFactorLogin = (challengeToken: string, code: string): Promise<AuthResponse> =>
  apiRequest<AuthResponse>("/auth/two-factor/login", { method: "POST", body: { challengeToken, code }, skipRefresh: true, credentials: "include" });

export type TwoFactorStatus = { data: { enabled: boolean; recoveryCodesRemaining: number } };
export type TwoFactorSetup = { data: { secret: string; provisioningUri: string; qrCodeDataUrl: string; expiresAt: string } };
export const getTwoFactorStatus = () => apiRequest<TwoFactorStatus>("/auth/two-factor/status");
export const startTwoFactorSetup = (currentPassword: string) => apiRequest<TwoFactorSetup>("/auth/two-factor/setup", { method: "POST", body: { currentPassword } });
export const enableTwoFactor = (code: string) => apiRequest<{ data: { enabled: true; recoveryCodes: string[] } }>("/auth/two-factor/enable", { method: "POST", body: { code } });
export const disableTwoFactor = (currentPassword: string, code: string) => apiRequest<{ data: { success: true } }>("/auth/two-factor/disable", { method: "POST", body: { currentPassword, code } });
export const regenerateTwoFactorRecoveryCodes = (currentPassword: string, code: string) => apiRequest<{ data: { recoveryCodes: string[] } }>("/auth/two-factor/recovery-codes/regenerate", { method: "POST", body: { currentPassword, code } });

export type LoginVerificationChallenge = { challenge: string; difficultyBits: number; expiresAt: string };
export type LoginVerificationStartResponse = { data: LoginVerificationChallenge };
export type LoginVerificationResponse = { data: { verificationToken: string } };

export const startLoginVerification = (email: string): Promise<LoginVerificationStartResponse> =>
  apiRequest<LoginVerificationStartResponse>("/auth/login-verification/start", { method: "POST", body: { email }, skipRefresh: true });

export const verifyLoginVerification = (email: string, challenge: string, nonce: string): Promise<LoginVerificationResponse> =>
  apiRequest<LoginVerificationResponse>("/auth/login-verification/verify", { method: "POST", body: { email, challenge, nonce }, skipRefresh: true });

export type QrLoginStart = {
  challengeId: string;
  browserToken: string;
  qrCodeDataUrl: string;
  matchNumber: string;
  expiresAt: string;
};
export type QrLoginState = "PENDING" | "SCANNED" | "APPROVED" | "REJECTED" | "CANCELLED" | "EXPIRED" | "CONSUMED";
export type QrLoginStatus = { status: QrLoginState; session?: AuthResponse };

export const startQrLogin = (): Promise<QrLoginStart> =>
  apiRequest<QrLoginStart>("/auth/qr-login/start", { method: "POST", skipRefresh: true });
export const getQrLoginStatus = (challengeId: string, browserToken: string): Promise<QrLoginStatus> =>
  apiRequest<QrLoginStatus>("/auth/qr-login/status", { method: "POST", body: { challengeId, browserToken }, skipRefresh: true, credentials: "include" });
export const cancelQrLogin = (challengeId: string, browserToken: string): Promise<SuccessResponse> =>
  apiRequest<SuccessResponse>("/auth/qr-login/cancel", { method: "POST", body: { challengeId, browserToken }, skipRefresh: true });

export const logoutWebSession = (): Promise<SuccessResponse> =>
  apiRequest<SuccessResponse>("/auth/web-logout", { method: "POST", skipRefresh: true, credentials: "include" });

export type PasswordResetRequestResponse = { data: { message: string } };
export type PasswordRecoveryOptions = { data: { email: boolean; whatsapp: boolean } };
export type PasswordResetChannel = "EMAIL" | "WHATSAPP";

export const getPasswordRecoveryOptions = (): Promise<PasswordRecoveryOptions> =>
  apiRequest<PasswordRecoveryOptions>("/auth/recovery-options", { method: "GET", skipRefresh: true });

export const requestPasswordReset = (email: string, channel: PasswordResetChannel = "EMAIL"): Promise<PasswordResetRequestResponse> =>
  apiRequest<PasswordResetRequestResponse>("/auth/forgot-password", { method: "POST", body: { email, channel }, skipRefresh: true });

export const resetPassword = (token: string, newPassword: string): Promise<SuccessResponse> =>
  apiRequest<SuccessResponse>("/auth/reset-password", { method: "POST", body: { token, newPassword }, skipRefresh: true });

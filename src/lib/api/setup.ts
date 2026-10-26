import { apiRequest } from "@/lib/api/client";

export type SetupAdminPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

export type SetupAdminResponse = {
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    globalRole: "ADMIN";
    isActive: boolean;
    createdAt: string;
  };
};

export type SetupStatusResponse = {
  configured: boolean;
};

export const getSetupStatus = (): Promise<SetupStatusResponse> =>
  apiRequest<SetupStatusResponse>("/setup/status", { skipRefresh: true });

export const createInitialAdmin = (payload: SetupAdminPayload, setupToken: string): Promise<SetupAdminResponse> =>
  apiRequest<SetupAdminResponse>("/setup/admin", {
    method: "POST",
    body: payload,
    headers: { "x-setup-token": setupToken },
    skipRefresh: true,
  });

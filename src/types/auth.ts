export type GlobalRole = "ADMIN" | "RH" | "DIRECTION";

export type DepartmentRole =
  | "DIRECTEUR_DEPARTEMENT"
  | "CHEF_EQUIPE"
  | "EMPLOYE";

export type User = {
  id: string;
  email: string;
  globalRole: GlobalRole | null;
  departmentRole: DepartmentRole | null;
  departmentId: string | null;
  teamId: string | null;
  firstName: string;
  lastName: string;
  isActive: boolean;
  matricule: string | null;
  function: string | null;
  team?: { id: string; name: string } | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type AuthResponse = AuthTokens;

export type SuccessResponse = {
  data: { success: true };
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
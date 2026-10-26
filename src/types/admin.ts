import type { DepartmentRole, GlobalRole, User } from "@/types/auth";
import type { CompanySite, CompanySitePayload } from "@/types/company-site";

export type AdminUser = User & { createdAt: string };
export type AdminDepartment = { id: string; name: string; teams: AdminTeam[]; createdAt: string; updatedAt: string };
export type AdminTeam = { id: string; name: string; departmentId: string; leaderId: string | null; department?: { id: string; name: string }; leader?: AdminUser | null; members?: AdminUser[]; createdAt: string; updatedAt: string };
export type CreateAdminUserPayload = { firstName: string; lastName: string; email: string; password: string; globalRole?: GlobalRole; departmentRole?: DepartmentRole; matricule?: string; function?: string; departmentId?: string; teamId?: string };
export type UpdateAdminUserPayload = Partial<CreateAdminUserPayload>;
export type UserFormMode = "create" | "edit";
export type DepartmentPayload = { name: string };
export type TeamPayload = { name: string; departmentId: string };
export type UpdateTeamPayload = { name?: string; departmentId?: string; leaderId?: string };
export type AdminCompanySite = CompanySite;
export type CompanySiteStatusPayload = { isActive: boolean };
export type { CompanySitePayload };

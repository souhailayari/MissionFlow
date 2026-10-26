import { apiRequest } from "@/lib/api/client";
import type { CompanySite, CompanySitePayload } from "@/types/company-site";
import type { AdminDepartment, AdminTeam, AdminUser, CreateAdminUserPayload, DepartmentPayload, TeamPayload, UpdateAdminUserPayload, UpdateTeamPayload } from "@/types/admin";

export const listAdminUsers = (): Promise<AdminUser[]> => apiRequest<AdminUser[]>("/users");
export const createAdminUser = (payload: CreateAdminUserPayload) => apiRequest<{ data: AdminUser }>("/users", { method: "POST", body: payload });
export const updateAdminUser = (id: string, payload: UpdateAdminUserPayload) => apiRequest<{ data: AdminUser }>(`/users/${id}`, { method: "PATCH", body: payload });
export const updateAdminUserStatus = (id: string, isActive: boolean) => apiRequest<{ data: AdminUser }>(`/users/${id}/status`, { method: "PATCH", body: { isActive } });
export const listAdminDepartments = (): Promise<AdminDepartment[]> => apiRequest<AdminDepartment[]>("/departments");
export const createAdminDepartment = (payload: DepartmentPayload) => apiRequest<{ data: AdminDepartment }>("/departments", { method: "POST", body: payload });
export const updateAdminDepartment = (id: string, payload: DepartmentPayload) => apiRequest<{ data: AdminDepartment }>(`/departments/${id}`, { method: "PATCH", body: payload });
export const listAdminTeams = (): Promise<AdminTeam[]> => apiRequest<AdminTeam[]>("/teams");
export const createAdminTeam = (payload: TeamPayload) => apiRequest<{ data: AdminTeam }>("/teams", { method: "POST", body: payload });
export const updateAdminTeam = (id: string, payload: UpdateTeamPayload) => apiRequest<{ data: AdminTeam }>(`/teams/${id}`, { method: "PATCH", body: payload });
export const assignTeamMember = (teamId: string, userId: string) => apiRequest<{ data: AdminUser }>(`/teams/${teamId}/members`, { method: "POST", body: { userId } });
export const assignTeamLeader = (teamId: string, userId: string) => apiRequest<{ data: AdminTeam }>(`/teams/${teamId}/leader`, { method: "PATCH", body: { userId } });
export const listAdminCompanySites = (): Promise<CompanySite[]> => apiRequest<CompanySite[]>("/company-sites");
export const createAdminCompanySite = (payload: CompanySitePayload) => apiRequest<{ data: CompanySite }>("/company-sites", { method: "POST", body: payload });
export const updateAdminCompanySite = (id: string, payload: CompanySitePayload) => apiRequest<{ data: CompanySite }>(`/company-sites/${id}`, { method: "PATCH", body: payload });
export const updateAdminCompanySiteStatus = (id: string, isActive: boolean) => apiRequest<{ data: CompanySite }>(`/company-sites/${id}/status`, { method: "PATCH", body: { isActive } });

export type MissionReportFilters = { status?: string; departmentId?: string; teamId?: string; from?: string; to?: string };
export type UserReportFilters = { departmentId?: string; teamId?: string; role?: string; active?: boolean };
export type ResourceReportStatistics = {
  resourceMissions: number;
  fuelCards: number;
  fuelAmount: number;
  pluxeeTicketCount: number;
  pluxeeAmount: number;
  monthlyTrend: Array<{ month: string; fuelAmount: number; pluxeeAmount: number; pluxeeTicketCount: number }>;
  dailyTrend: Array<{ date: string; fuelAmount: number; pluxeeAmount: number; pluxeeTicketCount: number }>;
};
const query = (values: Record<string, string | boolean | undefined>) => { const params = new URLSearchParams(); Object.entries(values).forEach(([key, value]) => { if (value !== undefined && value !== "") params.set(key, String(value)); }); const result = params.toString(); return result ? `?${result}` : ""; };
export const getResourceReportStatistics = (): Promise<{ data: ResourceReportStatistics }> => apiRequest<{ data: ResourceReportStatistics }>("/reports/resources/statistics");
export const exportMissionReport = (filters: MissionReportFilters) => apiRequest<string>(`/reports/missions/export${query(filters)}`);
export const exportUserReport = (filters: UserReportFilters) => apiRequest<string>(`/reports/users/export${query(filters)}`);

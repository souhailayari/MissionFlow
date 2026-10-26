import { apiRequest } from "@/lib/api/client";
import type {
  CreateMissionPayload,
  CalculateRoutePayload,
  CalculateRouteResponse,
  DepartmentDirectorOption,
  DirectionResourcesPayload,
  DirectionResourceHistoryFilters,
  DirectionResourceHistoryResponse,
  DirectionMonthlyBudgetResponse,
  AddDirectionMonthlyBudgetPayload,
  DirectionResourcesResponse,
  MissionActionResponse,
  MissionDashboardStats,
  MissionDetailResponse,
  MissionFilters,
  MissionListResponse,
  MissionResponse,
  RejectMissionPayload,
  UpdateMissionPayload,
} from "@/types/missions";

const toQueryString = (filters: MissionFilters): string => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
};

export const listMissions = (filters: MissionFilters = {}): Promise<MissionListResponse> =>
  apiRequest<MissionListResponse>(`/missions${toQueryString(filters)}`);

export const getMissionDashboardStats = (): Promise<{ data: MissionDashboardStats }> =>
  apiRequest<{ data: MissionDashboardStats }>("/missions/dashboard-stats");

export const listDepartmentDirectors = (): Promise<{ data: DepartmentDirectorOption[] }> =>
  apiRequest<{ data: DepartmentDirectorOption[] }>("/missions/department-directors");

export const getMission = (id: string): Promise<MissionDetailResponse> =>
  apiRequest<MissionDetailResponse>(`/missions/${id}`);

export const getMissionPdf = (missionId: string): Promise<Blob> =>
  apiRequest<Blob>(`/missions/${encodeURIComponent(missionId)}/pdf`, {
    responseType: "blob",
  });

export const createMission = (payload: CreateMissionPayload): Promise<MissionResponse> =>
  apiRequest<MissionResponse>("/missions", { method: "POST", body: payload });

export const updateMission = (id: string, payload: UpdateMissionPayload): Promise<MissionResponse> =>
  apiRequest<MissionResponse>(`/missions/${id}`, { method: "PATCH", body: payload });

export const submitMission = (id: string): Promise<MissionActionResponse> =>
  apiRequest<MissionActionResponse>(`/missions/${id}/submit`, { method: "POST" });

export const approveAsTeamLeader = (id: string): Promise<MissionActionResponse> =>
  apiRequest<MissionActionResponse>(`/missions/${id}/team-leader/approve`, { method: "POST" });

export const rejectAsTeamLeader = (id: string, payload: RejectMissionPayload): Promise<MissionActionResponse> =>
  apiRequest<MissionActionResponse>(`/missions/${id}/team-leader/reject`, { method: "POST", body: payload });

export const approveAsDepartmentDirector = (id: string): Promise<MissionActionResponse> =>
  apiRequest<MissionActionResponse>(`/missions/${id}/department-director/approve`, { method: "POST" });

export const rejectAsDepartmentDirector = (id: string, payload: RejectMissionPayload): Promise<MissionActionResponse> =>
  apiRequest<MissionActionResponse>(`/missions/${id}/department-director/reject`, { method: "POST", body: payload });

export const updateDirectionResources = (id: string, payload: DirectionResourcesPayload): Promise<DirectionResourcesResponse> =>
  apiRequest<DirectionResourcesResponse>(`/missions/${id}/direction/resources`, { method: "PATCH", body: payload });

export const getDirectionResourceHistory = (filters: DirectionResourceHistoryFilters = {}): Promise<DirectionResourceHistoryResponse> =>
  apiRequest<DirectionResourceHistoryResponse>(`/missions/direction/history${toQueryString(filters)}`);

export const exportDirectionResourceReport = (filters: Pick<DirectionResourceHistoryFilters, "search" | "from" | "to">) =>
  apiRequest<string>(`/reports/direction/resources/export${toQueryString(filters)}`);

export const getDirectionMonthlyBudget = (): Promise<DirectionMonthlyBudgetResponse> =>
  apiRequest<DirectionMonthlyBudgetResponse>("/missions/direction/budget");

export const addDirectionMonthlyBudget = (payload: AddDirectionMonthlyBudgetPayload): Promise<DirectionMonthlyBudgetResponse> =>
  apiRequest<DirectionMonthlyBudgetResponse>("/missions/direction/budget/deposits", { method: "POST", body: payload });

export const calculateMissionRoute = (payload: CalculateRoutePayload): Promise<CalculateRouteResponse> =>
  apiRequest<CalculateRouteResponse>("/routing/calculate", { method: "POST", body: payload });

export const listApprovedMissionsForHr = (filters: MissionFilters = {}): Promise<MissionListResponse> =>
  apiRequest<MissionListResponse>(`/missions/rh/approved${toQueryString(filters)}`);

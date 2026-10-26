import type { DepartmentRole, GlobalRole, User } from "@/types/auth";

export type MissionStatus =
  | "DRAFT"
  | "PENDING_TEAM_LEADER"
  | "PENDING_DEPARTMENT_DIRECTOR"
  | "PENDING_DIRECTION"
  | "APPROVED"
  | "REJECTED";

export type ApprovalStep = "TEAM_LEADER" | "DEPARTMENT_DIRECTOR" | "DIRECTION";
export type InitialApprovalStep = "TEAM_LEADER" | "DEPARTMENT_DIRECTOR";
export type Decision = "APPROVED" | "REJECTED";
export type DecimalValue = string;
export type RouteGeometry = {
  type: "LineString";
  coordinates: Array<[number, number]>;
};

export type MissionDestination = {
  id: string;
  sequence: number;
  name: string;
  latitude: DecimalValue | null;
  longitude: DecimalValue | null;
  accommodationLocation?: string | null;
};

export type MissionEmployeeSummary = Pick<User, "id" | "firstName" | "lastName" | "matricule" | "function">;
export type MissionCreatorSummary = Pick<User, "id" | "firstName" | "lastName">;
export type DepartmentDirectorOption = Pick<User, "id" | "firstName" | "lastName" | "matricule" | "function">;

export type Department = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Team = {
  id: string;
  name: string;
  departmentId: string;
  leaderId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MissionResource = {
  id: string;
  missionId: string;
  fuelCardNumber: string | null;
  fuelAmount: DecimalValue | null;
  accommodation: boolean;
  accommodationLocation: string | null;
  pluxeeTicketCount: number | null;
  pluxeeAmount: DecimalValue | null;
  notes: string | null;
  providedById: string | null;
  providedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MissionApproval = {
  id: string;
  missionId: string;
  validatorId: string;
  step: ApprovalStep;
  decision: Decision;
  comment: string | null;
  decidedAt: string;
  validator?: Pick<User, "firstName" | "lastName" | "departmentRole" | "globalRole">;
};

export type MissionStatusHistory = {
  id: string;
  missionId: string;
  fromStatus: MissionStatus | null;
  toStatus: MissionStatus;
  changedById: string | null;
  changedBy?: Pick<User, "firstName" | "lastName"> | null;
  comment: string | null;
  createdAt: string;
};

export type MissionDocument = {
  id: string;
  missionId: string;
  fileName: string;
  mimeType: string;
  documentType: string;
  uploadedById: string;
  createdAt: string;
};

export type Mission = {
  id: string;
  reference: string;
  employeeId: string;
  createdById: string;
  departmentId: string;
  teamId: string | null;
  title: string;
  interventionNumber: string | null;
  interventionDate: string | null;
  location: string;
  destination: string | null;
  client: string | null;
  purpose: string | null;
  orderGiver: string | null;
  companion: string | null;
  vehicleRegistration: string | null;
  transportType: string | null;
  departureDate: string;
  returnDate: string;
  numberOfDays: number;
  accommodationRequested: boolean;
  status: MissionStatus;
  currentStep: ApprovalStep | null;
  rejectionReason: string | null;
  rejectedAt: string | null;
  rejectedById: string | null;
  initialApprovalStep: InitialApprovalStep;
  departureLatitude: DecimalValue | null;
  departureLongitude: DecimalValue | null;
  departureCompanySiteId: string | null;
  departureSiteName: string | null;
  destinationLatitude: DecimalValue | null;
  destinationLongitude: DecimalValue | null;
  destinations?: MissionDestination[];
  routeDistanceKm: DecimalValue | null;
  routeDurationMinutes: number | null;
  routeCalculatedAt: string | null;
  routeProvider: string | null;
  routeGeometry: RouteGeometry | null;
  createdAt: string;
  updatedAt: string;
  employee?: MissionEmployeeSummary | User;
  createdBy?: MissionCreatorSummary | User;
  rejectedBy?: Pick<User, "firstName" | "lastName" | "departmentRole" | "globalRole"> | null;
  department?: Department;
  team?: Team | null;
  resources?: MissionResource | null;
  approvals?: MissionApproval[];
  statusHistory?: MissionStatusHistory[];
  documents?: MissionDocument[];
};

export type DirectionHistoryMission = Omit<Mission, "resources"> & {
  resources: (MissionResource & { providedBy: MissionCreatorSummary | null }) | null;
};

export type DirectionResourceHistoryFilters = Pick<MissionFilters, "page" | "limit" | "search" | "from" | "to">;

export type DirectionResourceHistoryResponse = {
  data: DirectionHistoryMission[];
  summary: {
    missions: number;
    fuelCards: number;
    fuelAmount: DecimalValue;
    pluxeeTicketCount: number;
    pluxeeAmount: DecimalValue;
    accommodations: number;
  };
  meta: MissionListResponse["meta"];
};

export type DirectionMonthlyBudget = {
  year: number;
  month: number;
  fuelLimit: DecimalValue;
  fuelUsed: DecimalValue;
  fuelRemaining: DecimalValue;
  pluxeeTicketLimit: number;
  pluxeeTicketUsed: number;
  pluxeeTicketRemaining: number;
  deposits: Array<{
    id: string;
    createdAt: string;
    fuelAmount: number;
    pluxeeTicketCount: number;
  }>;
};

export type DirectionMonthlyBudgetResponse = { data: DirectionMonthlyBudget };
export type AddDirectionMonthlyBudgetPayload = { fuelAmount: number; pluxeeTicketCount: number };
export type DirectionResourcesResponse = MissionResponse & { warnings: string[] };

export type MissionListResponse = {
  data: Mission[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type MissionDetailResponse = { data: Mission };
export type MissionResponse = { data: Mission };

export type MissionFilters = {
  page?: number;
  limit?: number;
  status?: MissionStatus;
  departmentId?: string;
  teamId?: string;
  search?: string;
  from?: string;
  to?: string;
  createdByMe?: boolean;
  beneficiaryMe?: boolean;
};

export type CreateMissionPayload = {
  beneficiaryId?: string;
  initialApprovalStep: InitialApprovalStep;
  title: string;
  interventionNumber?: string;
  interventionDate?: string;
  location: string;
  destination?: string;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
  destinations?: Array<{ name: string; latitude?: number; longitude?: number }>;
  client?: string;
  purpose?: string;
  orderGiver?: string;
  companion?: string;
  vehicleRegistration?: string;
  transportType?: string;
  departureDate: string;
  returnDate: string;
  accommodationRequested?: boolean;
};

export type UpdateMissionPayload = Partial<CreateMissionPayload>;

export type RejectMissionPayload = {
  reason: string;
};

export type DirectionResourcesPayload = {
  fuelCardNumber?: string;
  fuelAmount?: number;
  accommodation: boolean;
  accommodationLocation?: string;
  destinations?: Array<{
    id: string;
    accommodationLocation: string | null;
  }>;
  pluxeeTicketCount?: number;
  pluxeeAmount?: number;
  notes?: string;
};

export type CalculateRoutePayload = {
  missionId: string;
  departureLatitude: number;
  departureLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  departureCompanySiteId?: string | null;
  destinations?: Array<{ name: string; latitude: number; longitude: number }>;
};

export type CalculateRouteResponse = {
  data: {
    missionId: string;
    departureLatitude: DecimalValue | null;
    departureLongitude: DecimalValue | null;
    departureCompanySiteId: string | null;
    departureSiteName: string | null;
    destinationLatitude: DecimalValue | null;
    destinationLongitude: DecimalValue | null;
    destinations: MissionDestination[];
    distanceKm: DecimalValue | null;
    durationMinutes: number | null;
    calculatedAt: string | null;
    provider: string | null;
    routeGeometry: RouteGeometry | null;
  };
};

export type MissionActionResponse = { data: Mission };

export type MissionDashboardStats = {
  total: number;
  draft: number;
  pendingTeamLeader: number;
  pendingDepartmentDirector: number;
  pendingDirection: number;
  approved: number;
  rejected: number;
  resourcesIncomplete: number;
  resourcesReadyToSave: number;
  monthlyTrend: Array<{ month: string; draft: number; pending: number; approved: number; rejected: number }>;
  dailyTrend: Array<{ date: string; draft: number; pending: number; approved: number; rejected: number }>;
};

export const missionStatusLabels: Record<MissionStatus, string> = {
  DRAFT: "Brouillon",
  PENDING_TEAM_LEADER: "En attente de validation",
  PENDING_DEPARTMENT_DIRECTOR: "En attente du directeur de département",
  PENDING_DIRECTION: "En attente de données Direction",
  APPROVED: "Approuvée",
  REJECTED: "Rejetée",
};

export const missionStatusValues: MissionStatus[] = [
  "DRAFT",
  "PENDING_TEAM_LEADER",
  "PENDING_DEPARTMENT_DIRECTOR",
  "PENDING_DIRECTION",
  "APPROVED",
  "REJECTED",
];

export type MissionRole = GlobalRole | DepartmentRole;

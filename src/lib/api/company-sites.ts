import { apiRequest } from "@/lib/api/client";
import type { CompanySite } from "@/types/company-site";

export const listActiveCompanySites = (): Promise<CompanySite[]> =>
  apiRequest<CompanySite[]>("/company-sites/active");

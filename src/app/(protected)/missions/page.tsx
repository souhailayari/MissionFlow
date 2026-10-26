"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { listMissions } from "@/lib/api/missions";
import { MissionListEmpty, MissionListError, MissionListLoading } from "@/components/missions/mission-list-state";
import { MissionCard } from "@/components/missions/mission-card";
import { MissionFiltersPanel } from "@/components/missions/mission-filters";
import { MissionTable } from "@/components/missions/mission-table";
import { MissionsPageHeader } from "@/components/missions/missions-page-header";
import { PageContainer } from "@/components/ui/page-container";
import { Pagination } from "@/components/ui/pagination";
import { useSession } from "@/lib/auth/session-context";
import type { MissionFilters, MissionListResponse } from "@/types/missions";

const initialFilters: MissionFilters = { page: 1, limit: 20 };

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) return error.message;
  return "Veuillez réessayer dans quelques instants.";
};

export default function MissionsPage() {
  const { user } = useSession();
  const [filters, setFilters] = useState<MissionFilters>(initialFilters);
  const [result, setResult] = useState<MissionListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadMissions = useCallback(async (nextFilters: MissionFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      setResult(await listMissions(nextFilters));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMissions(filters);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [filters, loadMissions]);

  const updateFilter = <T extends keyof MissionFilters>(key: T, value: MissionFilters[T]) => {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  };

  const changePage = (page: number) => setFilters((current) => ({ ...current, page }));

  return (
    <PageContainer>
        <MissionsPageHeader
          missionCount={result?.meta.total ?? null}
          isLoading={isLoading}
          canCreateMission={user?.departmentRole === "EMPLOYE" || user?.departmentRole === "CHEF_EQUIPE"}
          createMissionLabel={user?.departmentRole === "CHEF_EQUIPE" ? "Mission pour un directeur" : "Créer une mission"}
        />
        <MissionFiltersPanel filters={filters} onChange={updateFilter} />

        <section aria-live="polite">
          {isLoading && <MissionListLoading />}
          {!isLoading && error && <MissionListError message={error} onRetry={() => void loadMissions(filters)} />}
          {!isLoading && !error && result && result.data.length === 0 && <MissionListEmpty />}
          {!isLoading && !error && result && result.data.length > 0 && (
            <>
              <MissionTable missions={result.data} />
              <div className="space-y-3 xl:hidden">{result.data.map((mission) => <MissionCard key={mission.id} mission={mission} />)}</div>
              <Pagination page={result.meta.page} totalPages={result.meta.totalPages} total={result.meta.total} onChange={changePage} />
            </>
          )}
        </section>
    </PageContainer>
  );
}

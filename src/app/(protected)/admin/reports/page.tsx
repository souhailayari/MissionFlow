"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { ReportStatistics } from "@/components/admin/reports/report-statistics";
import { ReportFilters } from "@/components/admin/reports/report-filters";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { PageContainer } from "@/components/ui/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { exportMissionReport, exportUserReport, getResourceReportStatistics, listAdminDepartments, listAdminTeams, listAdminUsers, type MissionReportFilters, type ResourceReportStatistics, type UserReportFilters } from "@/lib/api/admin";
import { getMissionDashboardStats } from "@/lib/api/missions";
import type { AdminDepartment, AdminTeam, AdminUser } from "@/types/admin";
import type { MissionDashboardStats } from "@/types/missions";

const downloadCsv = (content: string, filename: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
};

export default function AdminReportsPage() {
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [missionStats, setMissionStats] = useState<MissionDashboardStats | null>(null);
  const [resourceStats, setResourceStats] = useState<ResourceReportStatistics | null>(null);
  const [missionFilters, setMissionFilters] = useState<MissionReportFilters>({});
  const [userFilters, setUserFilters] = useState<UserReportFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resourceError, setResourceError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextDepartments, nextTeams, nextUsers, nextMissionStats] = await Promise.all([
        listAdminDepartments(),
        listAdminTeams(),
        listAdminUsers(),
        getMissionDashboardStats(),
      ]);
      setDepartments(nextDepartments);
      setTeams(nextTeams);
      setUsers(nextUsers);
      setMissionStats(nextMissionStats.data);
      try {
        const nextResourceStats = await getResourceReportStatistics();
        setResourceStats(nextResourceStats.data);
        setResourceError(null);
      } catch (requestError) {
        setResourceStats(null);
        setResourceError(requestError instanceof ApiError ? requestError.message : "Impossible de charger les statistiques carburant et tickets resto.");
      }
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Impossible de charger les statistiques et les filtres des rapports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const exportMissions = async () => {
    setFeedback(null);
    setExportError(null);
    try {
      const csv = await exportMissionReport(missionFilters);
      downloadCsv(csv, "missions.csv");
      setFeedback("Export des missions téléchargé.");
    } catch (requestError) {
      setExportError(requestError instanceof ApiError ? requestError.message : "Impossible d’exporter les missions. Réessayez.");
    }
  };

  const exportUsers = async () => {
    setFeedback(null);
    setExportError(null);
    try {
      const csv = await exportUserReport(userFilters);
      downloadCsv(csv, "utilisateurs.csv");
      setFeedback("Export des utilisateurs téléchargé.");
    } catch (requestError) {
      setExportError(requestError instanceof ApiError ? requestError.message : "Impossible d’exporter les utilisateurs. Réessayez.");
    }
  };

  return (
    <PageContainer>
      <header
        className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[24px] border border-[var(--line)] px-5 py-5 shadow-[var(--shadow-card)] sm:px-7 sm:py-6 lg:flex-row lg:items-center lg:justify-between"
        style={{ background: "linear-gradient(112deg, var(--brand-soft) 0%, var(--surface) 70%, var(--surface) 100%)" }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-60 w-60 rounded-full border border-[var(--line)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-16 h-48 w-48 rounded-full border border-[var(--line)] opacity-70" />
        <div className="relative min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand-strong)] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />
            Administration · rapports
          </div>
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.045em] text-[var(--text)] sm:text-[34px]">Rapports &amp; statistiques</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--text-soft)]">Suivez les missions et les comptes, puis exportez les données de votre organisation.</p>
        </div>
        <div className="relative flex flex-wrap items-center gap-3 lg:ml-auto lg:shrink-0">
          <Button type="button" size="lg" variant="outline" className="min-h-14" disabled={loading} onClick={() => void load()} leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}>Actualiser</Button>
        </div>
      </header>
      {feedback && <Alert tone="success">{feedback}</Alert>}
      {exportError && <Alert tone="danger">{exportError}</Alert>}
      {error && <div className="space-y-2"><ErrorState title="Impossible de charger les statistiques et filtres." message={error} /><Button type="button" size="sm" variant="outline" onClick={() => void load()}>Réessayer</Button></div>}
      <ReportStatistics stats={missionStats} resourceStats={resourceStats} resourceError={resourceError} users={users} loading={loading} />
      {loading && <div className="grid gap-3 md:grid-cols-2"><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>}
      {!loading && !error && (
        <ReportFilters
          departments={departments}
          teams={teams}
          missionFilters={missionFilters}
          userFilters={userFilters}
          onMissionChange={setMissionFilters}
          onUserChange={setUserFilters}
          onExportMissions={() => void exportMissions()}
          onExportUsers={() => void exportUsers()}
        />
      )}
    </PageContainer>
  );
}

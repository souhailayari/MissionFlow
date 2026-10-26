"use client";

import { BadgeCheck, BriefcaseBusiness, Building2, ChartNoAxesCombined, CircleAlert, ClipboardCheck, Clock3, CreditCard, FilePlus2, FileText, FolderClock, MapPinned, ShieldCheck, Users, UsersRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type LabelProps } from "recharts";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentMissions } from "@/components/dashboard/recent-missions";
import { QuickActions, type QuickAction } from "@/components/dashboard/quick-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/ui/page-container";
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome";
import { ApiError } from "@/lib/api/client";
import { getDirectionResourceHistory, getMissionDashboardStats, listMissions } from "@/lib/api/missions";
import { useSession } from "@/lib/auth/session-context";
import type { DepartmentRole, GlobalRole } from "@/types/auth";
import type { Mission, MissionDashboardStats, MissionFilters, MissionListResponse } from "@/types/missions";

const roleLabel = (globalRole: GlobalRole | null, departmentRole: DepartmentRole | null): string => {
  if (globalRole === "ADMIN") return "Administrateur";
  if (globalRole === "RH") return "Ressources humaines";
  if (globalRole === "DIRECTION") return "Direction";
  if (departmentRole === "DIRECTEUR_DEPARTEMENT") return "Directeur de département";
  if (departmentRole === "CHEF_EQUIPE") return "Chef d'équipe";
  return "Employé";
};

const actionsFor = (globalRole: GlobalRole | null, departmentRole: DepartmentRole | null): QuickAction[] => {
  if (globalRole === "RH") return [{ label: "Missions approuvées", href: "/missions", icon: BadgeCheck, tone: "success" }];
  if (departmentRole === "EMPLOYE") return [{ label: "Nouvelle mission", href: "/missions/new", icon: FilePlus2, tone: "brand" }, { label: "Mes missions", href: "/missions", icon: BriefcaseBusiness, tone: "info" }];
  if (departmentRole === "CHEF_EQUIPE") return [{ label: "À valider", href: "/missions", icon: ClipboardCheck, tone: "warning" }, { label: "Missions de mon équipe", href: "/missions", icon: UsersRound, tone: "info" }, { label: "Mission pour un directeur", href: "/missions/new", icon: FilePlus2, tone: "brand" }];
  if (departmentRole === "DIRECTEUR_DEPARTEMENT") return [{ label: "À valider", href: "/missions", icon: ClipboardCheck, tone: "warning" }, { label: "Missions du département", href: "/missions", icon: Building2, tone: "info" }];
  if (globalRole === "DIRECTION") return [];
  return [
    { label: "Utilisateurs", href: "/admin/users", icon: Users, tone: "brand" },
    { label: "Départements", href: "/admin/departments", icon: Building2, tone: "info" },
    { label: "Équipes", href: "/admin/teams", icon: UsersRound, tone: "success" },
    { label: "Sites de l’entreprise", href: "/admin/company-sites", icon: MapPinned, tone: "warning" },
    { label: "Rapports", href: "/admin/reports", icon: ChartNoAxesCombined, tone: "brand" },
  ];
};

const errorMessage = (error: unknown): string => error instanceof ApiError ? error.message : "Veuillez vérifier votre connexion puis réessayer.";

const directionTrendLabel = ({ x, y, value }: LabelProps) => {
  if (x === undefined || y === undefined || (typeof value !== "number" && typeof value !== "string")) return null;
  const numericValue = Number(value);
  const labelX = Number(x);
  const labelY = Number(y);
  if (!Number.isFinite(numericValue) || numericValue <= 0 || !Number.isFinite(labelX) || !Number.isFinite(labelY)) return null;
  return <text x={labelX} y={labelY - 9} textAnchor="middle" fill="var(--text)" fontSize={11} fontWeight={700}>{numericValue}</text>;
};

const queueStatus = (globalRole: GlobalRole | null, departmentRole: DepartmentRole | null): MissionFilters["status"] => {
  if (globalRole === "DIRECTION") return "PENDING_DIRECTION";
  if (globalRole === "RH") return "APPROVED";
  if (departmentRole === "CHEF_EQUIPE") return "PENDING_TEAM_LEADER";
  return undefined;
};

const statusBarColors: Record<string, string> = {
  "Brouillons": "var(--text-muted)",
  "En attente": "var(--warning)",
  "Données à compléter": "var(--warning)",
  "Prêtes à finaliser": "var(--success)",
  "Approuvées": "var(--success)",
  "Rejetées": "var(--danger)",
};

const formatMonthTick = (month: string) => new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "UTC" })
  .format(new Date(`${month}-01T00:00:00.000Z`))
  .replace(".", "");
const formatMonthTooltip = (month: string) => new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" })
  .format(new Date(`${month}-01T00:00:00.000Z`));
const formatDayTick = (date: string) => new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", timeZone: "UTC" })
  .format(new Date(`${date}T00:00:00.000Z`))
  .replace(".", "");
const formatDayTooltip = (date: string) => new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
  .format(new Date(`${date}T00:00:00.000Z`));
const currentMonthRange = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return { from: `${year}-${month}-01`, to: `${year}-${month}-${day}` };
};

export default function DashboardPage() {
  const { user } = useSession();
  const [result, setResult] = useState<MissionListResponse | null>(null);
  const [stats, setStats] = useState<MissionDashboardStats | null>(null);
  const [directionHistoryCount, setDirectionHistoryCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trendView, setTrendView] = useState<"month" | "day">("month");

  const loadDashboard = useCallback(async (globalRole: GlobalRole | null, departmentRole: DepartmentRole | null, userId: string | undefined) => {
    setIsLoading(true);
    setError(null);
    try {
      const listResponsePromise = departmentRole === "DIRECTEUR_DEPARTEMENT"
        ? Promise.all([
          listMissions({ page: 1, limit: 8, status: "PENDING_TEAM_LEADER" }),
          listMissions({ page: 1, limit: 8, status: "PENDING_DEPARTMENT_DIRECTOR" }),
          listMissions({ page: 1, limit: 100, status: "PENDING_DIRECTION", beneficiaryMe: true }),
        ]).then(([teamPending, directorPending, directorTracking]) => {
          const tracking = directorTracking.data.filter((mission) => mission.createdById !== mission.employeeId);
          const total = teamPending.meta.total + directorPending.meta.total + tracking.length;
          const data = [...teamPending.data, ...directorPending.data, ...tracking]
            .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
            .slice(0, 8);
          return { data, meta: { page: 1, limit: 8, total, totalPages: Math.ceil(total / 8) } };
        })
        : departmentRole === "CHEF_EQUIPE"
          ? Promise.all([
            listMissions({ page: 1, limit: 8, status: "PENDING_TEAM_LEADER" }),
            listMissions({ page: 1, limit: 100, status: "PENDING_DEPARTMENT_DIRECTOR", createdByMe: true }),
            listMissions({ page: 1, limit: 100, status: "PENDING_DIRECTION", createdByMe: true }),
          ]).then(([awaitingApproval, awaitingDirector, awaitingDirection]) => {
            const proxyMissions = [...awaitingDirector.data, ...awaitingDirection.data].filter((mission) => mission.createdById === userId && mission.employeeId !== mission.createdById);
            const total = awaitingApproval.meta.total + proxyMissions.length;
            const data = [...awaitingApproval.data, ...proxyMissions]
              .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
              .slice(0, 8);
            return { data, meta: { page: 1, limit: 8, total, totalPages: Math.ceil(total / 8) } };
          })
        : listMissions({ page: 1, limit: 8, status: queueStatus(globalRole, departmentRole) });
      const [statsResponse, listResponse, historyResponse] = await Promise.all([
        getMissionDashboardStats(),
        listResponsePromise,
        globalRole === "DIRECTION"
          ? getDirectionResourceHistory({ page: 1, limit: 1, ...currentMonthRange() }).catch(() => null)
          : Promise.resolve(null),
      ]);
      setStats(statsResponse.data);
      setDirectionHistoryCount(historyResponse?.summary.missions ?? null);
      setResult(listResponse);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = () => loadDashboard(user?.globalRole ?? null, user?.departmentRole ?? null, user?.id);
    const timer = window.setTimeout(() => void load(), 0);
    const handleMissionUpdate = () => { void load(); };
    window.addEventListener("mission:updated", handleMissionUpdate);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("mission:updated", handleMissionUpdate);
    };
  }, [loadDashboard, user?.departmentRole, user?.globalRole, user?.id]);

  const displayName = user?.firstName ?? "";
  const historyMonthRange = currentMonthRange();
  const historyMonthHref = `/direction/history?${new URLSearchParams(historyMonthRange).toString()}`;
  const role = roleLabel(user?.globalRole ?? null, user?.departmentRole ?? null);
  const missions: Mission[] = result?.data ?? [];
  const pending = (stats?.pendingTeamLeader ?? 0) + (stats?.pendingDepartmentDirector ?? 0) + (stats?.pendingDirection ?? 0);
  const directionUser = user?.globalRole === "DIRECTION";
  const isTeamLeader = user?.departmentRole === "CHEF_EQUIPE";
  const isDirector = user?.departmentRole === "DIRECTEUR_DEPARTEMENT";
  const isHr = user?.globalRole === "RH";
  const statCardGridClass = directionUser ? "col-span-1 md:col-span-1 xl:col-span-4" : "col-span-1 md:col-span-1 xl:col-span-3";
  const monthlyTrendData = (stats?.monthlyTrend ?? []).map(({ month, ...values }) => ({ ...values, period: month }));
  const dailyTrendData = (stats?.dailyTrend ?? []).map(({ date, ...values }) => ({ ...values, period: date }));
  const directionMonthlyTrendData = monthlyTrendData.map(({ period, pending, approved }, index) => ({
    period,
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    incomplete: index === monthlyTrendData.length - 1 ? stats?.resourcesIncomplete ?? pending : pending,
    readyToFinalize: index === monthlyTrendData.length - 1 ? stats?.resourcesReadyToSave ?? 0 : 0,
    history: approved,
  }));
  const directionDailyTrendData = dailyTrendData.map(({ period, pending, approved }, index) => ({
    period,
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    incomplete: index === dailyTrendData.length - 1 ? stats?.resourcesIncomplete ?? pending : pending,
    readyToFinalize: index === dailyTrendData.length - 1 ? stats?.resourcesReadyToSave ?? 0 : 0,
    history: approved,
  }));
  const trendData = directionUser
    ? trendView === "month" ? directionMonthlyTrendData : directionDailyTrendData
    : trendView === "month" ? monthlyTrendData : dailyTrendData;

  const statCards: Array<{ label: string; value: number | string | undefined; icon: LucideIcon; tone: "brand" | "info" | "success" | "warning" | "danger"; description?: string; href?: string }> = directionUser
    ? [
      { label: "À compléter", value: stats?.resourcesIncomplete, icon: FileText, tone: "info" },
      { label: "Prêtes à finaliser", value: stats?.resourcesReadyToSave, icon: BadgeCheck, tone: "success" },
      { label: "Historique cartes & tickets", value: directionHistoryCount ?? "—", description: "Missions finalisées ce mois", icon: CreditCard, tone: "brand", href: historyMonthHref },
    ]
    : isDirector
      ? [
        { label: "À traiter", value: (stats?.pendingTeamLeader ?? 0) + (stats?.pendingDepartmentDirector ?? 0), icon: Clock3, tone: "warning" },
        { label: "Département", value: stats?.total, icon: FolderClock, tone: "brand" },
        { label: "Approuvées", value: stats?.approved, icon: BadgeCheck, tone: "success" },
        { label: "Rejetées", value: stats?.rejected, icon: CircleAlert, tone: "danger" },
      ]
      : isTeamLeader
        ? [
          { label: "À valider", value: stats?.pendingTeamLeader, icon: Clock3, tone: "warning" },
          { label: "Mon équipe", value: pending, icon: FolderClock, tone: "brand" },
          { label: "Approuvées", value: stats?.approved, icon: BadgeCheck, tone: "success" },
          { label: "Rejetées", value: stats?.rejected, icon: CircleAlert, tone: "danger" },
        ]
        : isHr
          ? [
            { label: "Approuvées", value: stats?.approved, icon: ShieldCheck, tone: "success" },
          ]
          : [
            { label: "Total missions", value: stats?.total, icon: FolderClock, tone: "brand" },
            { label: "En attente", value: pending, icon: Clock3, tone: "warning" },
            { label: "Approuvées", value: stats?.approved, icon: BadgeCheck, tone: "success" },
            { label: "Rejetées", value: stats?.rejected, icon: CircleAlert, tone: "danger" },
          ];

  const queueTitle = directionUser ? "Missions en attente de données Direction" : isTeamLeader ? "À valider et missions créées pour le directeur" : isDirector ? "À valider et missions à suivre" : isHr ? "Missions approuvées" : "Missions récentes";
  const statusRows = directionUser
    ? [
      { label: "Données à compléter", value: stats?.resourcesIncomplete ?? 0 },
      { label: "Prêtes à finaliser", value: stats?.resourcesReadyToSave ?? 0 },
    ]
    : isHr
      ? [{ label: "Approuvées", value: stats?.approved ?? 0 }]
      : [
        { label: "Brouillons", value: stats?.draft ?? 0 },
        { label: "En attente", value: pending },
        { label: "Approuvées", value: stats?.approved ?? 0 },
        { label: "Rejetées", value: stats?.rejected ?? 0 },
      ];
  const statusTotal = statusRows.reduce((total, row) => total + row.value, 0);
  let accumulatedStatus = 0;
  const statusSegments = statusRows.map(({ label, value }) => {
    const start = statusTotal > 0 ? (accumulatedStatus / statusTotal) * 360 : 0;
    accumulatedStatus += value;
    const end = statusTotal > 0 ? (accumulatedStatus / statusTotal) * 360 : 360;
    return { label, value, color: statusBarColors[label] ?? "var(--brand)", start, end, percentage: statusTotal > 0 ? Math.round((value / statusTotal) * 100) : 0 };
  });
  const statusDonutBackground = statusTotal > 0
    ? `conic-gradient(${statusSegments.filter((segment) => segment.value > 0).map((segment) => {
      const separatorStart = Math.max(segment.start, segment.end - 1.5);
      return `${segment.color} ${segment.start}deg ${separatorStart}deg, var(--surface) ${separatorStart}deg ${segment.end}deg`;
    }).join(", ")})`
    : "var(--surface-muted)";
  const today = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date());
  const quickActions = actionsFor(user?.globalRole ?? null, user?.departmentRole ?? null)
    .filter((action) => action.available !== false);
  const canCreateMission = user?.departmentRole === "EMPLOYE" || user?.departmentRole === "CHEF_EQUIPE";

  return (
    <PageContainer>
      <DashboardWelcome
        displayName={displayName}
        role={role}
        today={today}
        canCreateMission={canCreateMission}
        isLoading={isLoading}
        onRefresh={() => void loadDashboard(user?.globalRole ?? null, user?.departmentRole ?? null, user?.id)}
      />

      <div className={`grid grid-cols-2 gap-3 ${directionUser ? "lg:grid-cols-3 xl:grid-cols-12" : "lg:grid-cols-4 xl:grid-cols-12"}`} aria-label="Statistiques de missions">
          {statCards.map(({ label, value, icon: Icon, tone, description, href }) => {
            return href ? (
              <Link key={label} href={href} className={`${statCardGridClass} rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2`}>
                <StatCard className="h-full" label={label} value={isLoading ? undefined : value ?? 0} description={description} icon={<Icon className="h-4 w-4" />} loading={isLoading} tone={tone} />
              </Link>
            ) : <StatCard key={label} className={statCardGridClass} label={label} value={isLoading ? undefined : value ?? 0} description={description} icon={<Icon className="h-4 w-4" />} loading={isLoading} tone={tone} />;
          })}
      </div>

      <div className="grid grid-cols-12 items-start gap-4">
        <section className="col-span-12 md:col-span-8" aria-label={directionUser ? "Évolution des missions Direction" : "Évolution mensuelle et journalière des missions"}>
          <Card className="min-h-[26.5rem] gap-3 rounded-2xl p-5 sm:p-6">
            <CardHeader className="flex-col items-start gap-3 p-0">
              <div className="flex w-full flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold text-[var(--text)]">{directionUser ? "Évolution des missions Direction" : "Évolution des statuts"}</CardTitle>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{trendView === "month" ? "Vue mensuelle · 7 derniers mois" : "Vue journalière · 30 derniers jours"}</p>
                </div>
                <div className="inline-flex items-center rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-1" role="group" aria-label="Période du graphique">
                  <button type="button" onClick={() => setTrendView("month")} aria-pressed={trendView === "month"} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${trendView === "month" ? "bg-[var(--surface)] text-[var(--text)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}>Mois</button>
                  <button type="button" onClick={() => setTrendView("day")} aria-pressed={trendView === "day"} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${trendView === "day" ? "bg-[var(--surface)] text-[var(--text)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}>Jour</button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--text-soft)]" aria-label="Légende du graphique">
                {directionUser ? <>
                  <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[var(--info)]" aria-hidden="true" />À compléter</span>
                  <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[var(--success)]" aria-hidden="true" />Prêtes à finaliser</span>
                  <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />Historique</span>
                </> : <>
                  <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted)]" aria-hidden="true" />Brouillons</span>
                  <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[var(--warning)]" aria-hidden="true" />En attente</span>
                  <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[var(--success)]" aria-hidden="true" />Approuvées</span>
                  <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[var(--danger)]" aria-hidden="true" />Rejetées</span>
                </>}
              </div>
            </CardHeader>
            <CardContent className="h-72 w-full p-0" aria-busy={isLoading}>
              <div className="h-full w-full" role="img" aria-label={directionUser ? `Courbes ${trendView === "month" ? "mensuelles" : "journalières"} des missions à compléter, prêtes à finaliser et dans l'historique` : `Courbes ${trendView === "month" ? "mensuelles" : "journalières"} du nombre de missions par statut`}>
                <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height: 288 }}>
                  <LineChart data={trendData} margin={{ top: 12, right: trendView === "day" ? 28 : 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="var(--line)" strokeDasharray="4 4" vertical />
                    <XAxis
                      dataKey="period"
                      ticks={trendView === "day" ? dailyTrendData.filter((_, index) => index % 5 === 0 || index === dailyTrendData.length - 1).map(({ period }) => period) : undefined}
                      interval={0}
                      tickFormatter={(value) => trendView === "month" ? formatMonthTick(String(value)) : formatDayTick(String(value))}
                      tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis allowDecimals={false} domain={[0, "auto"]} tick={{ fill: "var(--text-muted)", fontSize: 12 }} tickLine={false} axisLine={false} width={38} />
                    <Tooltip
                      labelFormatter={(label) => trendView === "month" ? formatMonthTooltip(String(label)) : formatDayTooltip(String(label))}
                      cursor={{ stroke: "var(--line-strong)", strokeDasharray: "4 4" }}
                      contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--line)", borderRadius: "0.75rem", boxShadow: "var(--shadow-card)" }}
                      labelStyle={{ color: "var(--text)", fontWeight: 600 }}
                      itemStyle={{ color: "var(--text-soft)" }}
                    />
                    {directionUser ? <>
                      <Line type="monotone" dataKey="incomplete" name="À compléter" stroke="var(--info)" strokeWidth={2.5} dot={{ r: trendView === "day" ? 2.5 : 3, fill: "var(--info)", strokeWidth: 0 }} activeDot={{ r: 4 }} label={directionTrendLabel} />
                      <Line type="monotone" dataKey="readyToFinalize" name="Prêtes à finaliser" stroke="var(--success)" strokeWidth={2.5} dot={{ r: trendView === "day" ? 2.5 : 3, fill: "var(--success)", strokeWidth: 0 }} activeDot={{ r: 4 }} label={directionTrendLabel} />
                      <Line type="monotone" dataKey="history" name="Historique" stroke="var(--brand)" strokeWidth={2.5} dot={{ r: trendView === "day" ? 2.5 : 3, fill: "var(--brand)", strokeWidth: 0 }} activeDot={{ r: 4 }} label={directionTrendLabel} />
                    </> : <>
                      <Line type="monotone" dataKey="draft" name="Brouillons" stroke="var(--text-muted)" strokeWidth={2.5} dot={{ r: trendView === "day" ? 2.5 : 3, fill: "var(--text-muted)", strokeWidth: 0 }} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="pending" name="En attente" stroke="var(--warning)" strokeWidth={2.5} dot={{ r: trendView === "day" ? 2.5 : 3, fill: "var(--warning)", strokeWidth: 0 }} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="approved" name="Approuvées" stroke="var(--success)" strokeWidth={2.5} dot={{ r: trendView === "day" ? 2.5 : 3, fill: "var(--success)", strokeWidth: 0 }} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="rejected" name="Rejetées" stroke="var(--danger)" strokeWidth={2.5} dot={{ r: trendView === "day" ? 2.5 : 3, fill: "var(--danger)", strokeWidth: 0 }} activeDot={{ r: 4 }} />
                    </>}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="col-span-12 md:col-span-4">
          <Card className="min-h-[26.5rem] gap-0 rounded-2xl p-5 sm:p-6">
            <CardHeader className="p-0">
              <div>
                <CardTitle className="text-base font-semibold text-[var(--text)]">Répartition des statuts</CardTitle>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Missions accessibles par statut</p>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center gap-5 p-0 pt-5">
              <div className="relative h-36 w-36 shrink-0 rounded-full" style={{ background: isLoading ? "var(--surface-muted)" : statusDonutBackground }} role="img" aria-label={`Répartition des statuts sur ${isLoading ? "les" : statusTotal} missions`}>
                <div className="absolute inset-[14px] rounded-full bg-[var(--surface)]" />
              </div>
              <ul className="w-full space-y-2.5">
                {statusSegments.map(({ label, value, color, percentage }) => (
                  <li key={label} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-[var(--text-soft)]">{label}</span>
                    <span className="min-w-6 text-right font-medium tabular-nums text-[var(--text-soft)]">{isLoading ? "-" : value}</span>
                    <span className="w-10 text-right font-semibold tabular-nums text-[var(--text)]">{isLoading ? "-" : `${percentage}%`}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

        </aside>
      </div>

      <section className="w-full" aria-label={queueTitle}>
        <Card className="gap-3 rounded-2xl p-4 sm:p-5">
          <CardHeader className="shrink-0 flex-row items-center justify-between gap-3 p-0">
            <div>
              <CardTitle className="text-sm font-semibold text-[var(--text)]">{queueTitle}</CardTitle>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Dernières demandes de votre périmètre</p>
            </div>
            <Link href="/missions" className="inline-flex min-h-11 items-center rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-soft)] transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]">Voir toutes</Link>
          </CardHeader>
          <CardContent className="p-0" aria-busy={isLoading}>
            {isLoading && <div className="space-y-1" aria-label="Chargement des missions">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-16 rounded-xl" />)}</div>}
            {!isLoading && error && (
              <div className="flex h-full flex-col justify-center gap-3">
                <ErrorState title="Impossible de charger le tableau de bord." message={error} />
                <Button type="button" size="sm" variant="outline" className="self-start" onClick={() => void loadDashboard(user?.globalRole ?? null, user?.departmentRole ?? null, user?.id)}>Réessayer</Button>
              </div>
            )}
            {!isLoading && !error && <RecentMissions missions={missions} />}
          </CardContent>
        </Card>
      </section>

      {quickActions.length > 0 && (
        <Card className="gap-4 rounded-2xl p-4 sm:p-5">
          <CardHeader className="p-0">
            <div>
              <CardTitle className="text-sm font-semibold text-[var(--text)]">Accès rapide</CardTitle>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Raccourcis vers les outils de votre périmètre</p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <QuickActions actions={quickActions} />
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}

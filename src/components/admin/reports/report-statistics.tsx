"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChartNoAxesCombined, CreditCard, Fuel, Ticket, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResourceReportStatistics } from "@/lib/api/admin";
import type { AdminUser } from "@/types/admin";
import type { MissionDashboardStats } from "@/types/missions";

type Props = Readonly<{
  stats: MissionDashboardStats | null;
  resourceStats: ResourceReportStatistics | null;
  resourceError: string | null;
  users: AdminUser[];
  loading: boolean;
}>;

type ResourceTrendPoint = Omit<ResourceReportStatistics["monthlyTrend"][number], "month"> & {
  month: string;
  date: string;
};

const statusRows = [
  { key: "draft", label: "Brouillons", color: "var(--text-muted)" },
  { key: "pending", label: "En attente", color: "var(--warning)" },
  { key: "approved", label: "Approuvées", color: "var(--success)" },
  { key: "rejected", label: "Rejetées", color: "var(--danger)" },
] as const;

const roleRows = [
  { label: "Administrateurs", color: "var(--brand-strong)", matches: (user: AdminUser) => user.globalRole === "ADMIN" },
  { label: "Ressources humaines", color: "var(--info)", matches: (user: AdminUser) => user.globalRole === "RH" },
  { label: "Direction", color: "var(--warning)", matches: (user: AdminUser) => user.globalRole === "DIRECTION" },
  { label: "Directeurs de département", color: "var(--success)", matches: (user: AdminUser) => user.departmentRole === "DIRECTEUR_DEPARTEMENT" },
  { label: "Chefs d’équipe", color: "#8b5cf6", matches: (user: AdminUser) => user.departmentRole === "CHEF_EQUIPE" },
  { label: "Employés", color: "#0ea5e9", matches: (user: AdminUser) => user.departmentRole === "EMPLOYE" },
] as const;

const formatAmount = (value: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 3 }).format(value);

function formatMonth(value: string, long = false) {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value;
  return new Intl.DateTimeFormat("fr-FR", { month: long ? "long" : "short", ...(long ? { year: "numeric" as const } : {}) }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function formatDay(value: string, long = false) {
  const date = new Date(`${value}T00:00:00Z`);
  return new Intl.DateTimeFormat("fr-FR", long ? { day: "numeric", month: "long" } : { day: "2-digit", month: "2-digit" }).format(date);
}

export function ReportStatistics({ stats, resourceStats, resourceError, users, loading }: Props) {
  const [period, setPeriod] = useState<"month" | "day">("month");
  const [resourcePeriod, setResourcePeriod] = useState<"month" | "day">("month");
  const pending = (stats?.pendingTeamLeader ?? 0) + (stats?.pendingDepartmentDirector ?? 0) + (stats?.pendingDirection ?? 0);
  const currentStatus = [
    { name: "Brouillons", value: stats?.draft ?? 0, color: "var(--text-muted)" },
    { name: "En attente", value: pending, color: "var(--warning)" },
    { name: "Approuvées", value: stats?.approved ?? 0, color: "var(--success)" },
    { name: "Rejetées", value: stats?.rejected ?? 0, color: "var(--danger)" },
  ];
  const statusTotal = currentStatus.reduce((sum, item) => sum + item.value, 0);
  const activeUsers = users.filter((user) => user.isActive).length;
  const inactiveUsers = users.length - activeUsers;
  const roleDistribution = useMemo(() => roleRows.map((role) => ({ ...role, value: users.filter(role.matches).length })), [users]);
  const resourceTrendData: ResourceTrendPoint[] = !resourceStats
    ? []
    : resourcePeriod === "month"
      ? resourceStats.monthlyTrend.map(({ month, ...values }) => ({ ...values, month, date: month }))
      : resourceStats.dailyTrend.map(({ date, ...values }) => ({ ...values, month: date, date }));
  const trendData = period === "month"
    ? (stats?.monthlyTrend ?? []).map(({ month, ...values }) => ({ ...values, period: month }))
    : (stats?.dailyTrend ?? []).map(({ date, ...values }) => ({ ...values, period: date }));

  const statCards = [
    { label: "Missions totales", value: stats?.total, note: "Périmètre accessible", icon: ChartNoAxesCombined, tone: "brand" as const },
    { label: "Montant carburant", value: resourceStats ? formatAmount(resourceStats.fuelAmount) : "—", note: "Total engagé", icon: Fuel, tone: "warning" as const },
    { label: "Montant tickets resto", value: resourceStats ? formatAmount(resourceStats.pluxeeAmount) : "—", note: "Total Pluxee engagé", icon: Ticket, tone: "success" as const },
    { label: "Nombre d’utilisateurs", value: users.length, note: "Tous les comptes", icon: Users, tone: "info" as const },
  ];

  return (
    <section aria-label="Statistiques des missions et des utilisateurs" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]"><ChartNoAxesCombined className="h-[18px] w-[18px]" aria-hidden="true" /></span>
          <div>
            <h2 className="text-lg font-bold tracking-[-0.025em] text-[var(--text)]">Vue statistique</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Synthèse des missions, des montants engagés et des comptes.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Indicateurs clés de l’organisation">
        {statCards.map(({ label, value, note, icon: Icon, tone }) => (
          <StatCard key={label} label={label} value={value} description={note} icon={<Icon className="h-4 w-4" aria-hidden="true" />} loading={loading} tone={tone} />
        ))}
      </div>

      <div className="grid grid-cols-12 items-start gap-4">
        <Card className="col-span-12 gap-3 rounded-2xl p-5 sm:p-6 xl:col-span-8">
          <CardHeader className="flex-col items-start gap-3 p-0">
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Évolution des statuts</CardTitle>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{period === "month" ? "Vue mensuelle · 7 derniers mois" : "Vue journalière · 30 derniers jours"}</p>
              </div>
              <div className="inline-flex items-center rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-1" role="group" aria-label="Période du graphique">
                <button type="button" onClick={() => setPeriod("month")} aria-pressed={period === "month"} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${period === "month" ? "bg-[var(--surface)] text-[var(--text)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}>Mois</button>
                <button type="button" onClick={() => setPeriod("day")} aria-pressed={period === "day"} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${period === "day" ? "bg-[var(--surface)] text-[var(--text)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}>Jour</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--text-soft)]" aria-label="Légende du graphique">
              {statusRows.map((row) => <span key={row.key} className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color }} aria-hidden="true" />{row.label}</span>)}
            </div>
          </CardHeader>
          <CardContent className="h-72 w-full p-0" aria-busy={loading}>
            {loading ? <div className="h-full animate-pulse rounded-xl bg-[var(--surface-muted)]" /> : (
              <div className="h-full w-full" role="img" aria-label={`Évolution ${period === "month" ? "mensuelle" : "journalière"} des missions par statut`}>
                <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 680, height: 288 }}>
                  <AreaChart data={trendData} margin={{ top: 14, right: 12, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="report-draft-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--text-muted)" stopOpacity={0.18} /><stop offset="95%" stopColor="var(--text-muted)" stopOpacity={0} /></linearGradient>
                      <linearGradient id="report-pending-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--warning)" stopOpacity={0.2} /><stop offset="95%" stopColor="var(--warning)" stopOpacity={0} /></linearGradient>
                      <linearGradient id="report-approved-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--success)" stopOpacity={0.2} /><stop offset="95%" stopColor="var(--success)" stopOpacity={0} /></linearGradient>
                      <linearGradient id="report-rejected-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--danger)" stopOpacity={0.2} /><stop offset="95%" stopColor="var(--danger)" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--line)" strokeDasharray="4 4" vertical />
                    <XAxis dataKey="period" interval={period === "day" ? 4 : 0} tickFormatter={(value) => period === "month" ? formatMonth(String(value)) : formatDay(String(value))} tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} domain={[0, "auto"]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                    <Tooltip
                      labelFormatter={(value) => period === "month" ? formatMonth(String(value), true) : formatDay(String(value), true)}
                      cursor={{ stroke: "var(--line-strong)", strokeDasharray: "4 4" }}
                      contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--line)", borderRadius: "0.75rem", boxShadow: "var(--shadow-card)" }}
                      labelStyle={{ color: "var(--text)", fontWeight: 600 }}
                      itemStyle={{ color: "var(--text-soft)" }}
                    />
                    <Area type="monotone" dataKey="draft" name="Brouillons" stackId="status" stroke="var(--text-muted)" fill="url(#report-draft-fill)" strokeWidth={2.25} activeDot={{ r: 4 }} />
                    <Area type="monotone" dataKey="pending" name="En attente" stackId="status" stroke="var(--warning)" fill="url(#report-pending-fill)" strokeWidth={2.25} activeDot={{ r: 4 }} />
                    <Area type="monotone" dataKey="approved" name="Approuvées" stackId="status" stroke="var(--success)" fill="url(#report-approved-fill)" strokeWidth={2.25} activeDot={{ r: 4 }} />
                    <Area type="monotone" dataKey="rejected" name="Rejetées" stackId="status" stroke="var(--danger)" fill="url(#report-rejected-fill)" strokeWidth={2.25} activeDot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-12 gap-2 rounded-2xl p-5 sm:p-6 xl:col-span-4">
          <CardHeader className="p-0">
            <div>
              <CardTitle>Répartition des missions</CardTitle>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Statut actuel · {statusTotal} missions</p>
            </div>
          </CardHeader>
          <div className="relative mx-auto h-52 w-full max-w-[240px]" role="img" aria-label="Répartition des missions par statut">
            {!loading && statusTotal > 0 && <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center"><span className="font-editorial text-3xl leading-none tabular-nums text-[var(--text)]">{statusTotal}</span><span className="mt-1 text-xs text-[var(--text-muted)]">missions</span></div>}
            {loading ? <div className="h-full w-full animate-pulse rounded-full bg-[var(--surface-muted)]" /> : statusTotal > 0 ? (
              <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 240, height: 208 }}>
                <PieChart><Pie data={currentStatus} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={2} stroke="var(--surface)" strokeWidth={3}>{currentStatus.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => [`${value} missions`, "Nombre"]} contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--line)", borderRadius: "0.75rem", boxShadow: "var(--shadow-card)" }} /></PieChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center rounded-full border-[18px] border-[var(--surface-muted)] text-xs text-[var(--text-muted)]">Aucune mission</div>}
          </div>
          <div className="mt-1 space-y-2">
            {currentStatus.map((row) => <div key={row.name} className="flex items-center justify-between gap-3 text-sm"><span className="inline-flex min-w-0 items-center gap-2 text-[var(--text-soft)]"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} aria-hidden="true" /><span className="truncate">{row.name}</span></span><span className="shrink-0 font-semibold tabular-nums text-[var(--text)]">{loading ? "—" : row.value}<span className="ml-2 w-9 text-right text-xs font-medium text-[var(--text-muted)]">{loading || statusTotal === 0 ? "" : `${Math.round((row.value / statusTotal) * 100)}%`}</span></span></div>)}
          </div>
        </Card>
      </div>

      <section aria-label="Statistiques carburant et tickets restaurant" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--warning-soft)] text-[var(--warning)]"><Fuel className="h-[18px] w-[18px]" aria-hidden="true" /></span>
            <div><h2 className="text-lg font-bold tracking-[-0.025em] text-[var(--text)]">Carburant &amp; tickets resto</h2><p className="mt-1 text-sm text-[var(--text-muted)]">Montants engagés et tickets distribués sur les missions.</p></div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-soft)] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)]" aria-hidden="true" />
              {loading || !resourceStats ? "—" : resourceStats.resourceMissions} missions renseignées
            </span>
            <div className="inline-flex items-center rounded-lg border border-[var(--line)] bg-[var(--surface)] p-1" role="group" aria-label="Période des statistiques carburant et tickets resto">
              <button type="button" onClick={() => setResourcePeriod("month")} aria-pressed={resourcePeriod === "month"} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${resourcePeriod === "month" ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}>Mois</button>
              <button type="button" onClick={() => setResourcePeriod("day")} aria-pressed={resourcePeriod === "day"} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${resourcePeriod === "day" ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}>Jour</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-2" aria-label="Nombre de cartes carburant et tickets resto">
          <StatCard label="Cartes carburant" value={resourceStats?.fuelCards ?? "—"} description="Cartes renseignées" icon={<CreditCard className="h-4 w-4" aria-hidden="true" />} loading={loading} tone="warning" />
          <StatCard label="Tickets resto" value={resourceStats?.pluxeeTicketCount ?? "—"} description="Tickets distribués" icon={<Ticket className="h-4 w-4" aria-hidden="true" />} loading={loading} tone="info" />
        </div>

        <div className="grid grid-cols-12 items-start gap-4">
          <Card className="col-span-12 gap-3 rounded-2xl p-5 sm:p-6 xl:col-span-6">
            <CardHeader className="p-0"><div><CardTitle>Montants {resourcePeriod === "month" ? "mensuels" : "journaliers"}</CardTitle><p className="mt-1 text-sm text-[var(--text-muted)]">Carburant et tickets resto · {resourcePeriod === "month" ? "7 derniers mois" : "30 derniers jours"}</p></div></CardHeader>
            <CardContent className="h-64 w-full p-0" aria-busy={loading}>
              {loading ? <div className="h-full animate-pulse rounded-xl bg-[var(--surface-muted)]" /> : !resourceStats ? <div className="flex h-full items-center justify-center rounded-xl bg-[var(--surface-muted)] px-4 text-center text-sm text-[var(--text-muted)]">{resourceError ?? "Statistiques des ressources indisponibles."}</div> : (
                <div className="h-full w-full" role="img" aria-label={`Montants ${resourcePeriod === "month" ? "mensuels" : "journaliers"} du carburant et des tickets resto`}>
                  <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 560, height: 256 }}>
                    <AreaChart data={resourceTrendData} margin={{ top: 12, right: 10, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="fuel-amount-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--warning)" stopOpacity={0.2} /><stop offset="95%" stopColor="var(--warning)" stopOpacity={0} /></linearGradient>
                        <linearGradient id="pluxee-amount-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--brand)" stopOpacity={0.18} /><stop offset="95%" stopColor="var(--brand)" stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid stroke="var(--line)" strokeDasharray="4 4" vertical />
                      <XAxis dataKey={resourcePeriod === "month" ? "month" : "date"} interval={resourcePeriod === "month" ? 0 : 4} tickFormatter={(value) => resourcePeriod === "month" ? formatMonth(String(value)) : formatDay(String(value))} tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis allowDecimals domain={[0, "auto"]} tickFormatter={(value) => formatAmount(Number(value))} tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
                      <Tooltip labelFormatter={(value) => resourcePeriod === "month" ? formatMonth(String(value), true) : formatDay(String(value), true)} formatter={(value, name) => [formatAmount(Number(value)), name]} cursor={{ stroke: "var(--line-strong)", strokeDasharray: "4 4" }} contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--line)", borderRadius: "0.75rem", boxShadow: "var(--shadow-card)" }} labelStyle={{ color: "var(--text)", fontWeight: 600 }} />
                      <Area type="monotone" dataKey="fuelAmount" name="Carburant" stroke="var(--warning)" fill="url(#fuel-amount-fill)" strokeWidth={2.5} activeDot={{ r: 4 }} />
                      <Area type="monotone" dataKey="pluxeeAmount" name="Tickets resto" stroke="var(--brand)" fill="url(#pluxee-amount-fill)" strokeWidth={2.5} activeDot={{ r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-12 gap-3 rounded-2xl p-5 sm:p-6 xl:col-span-6">
            <CardHeader className="p-0"><div><CardTitle>Tickets resto distribués</CardTitle><p className="mt-1 text-sm text-[var(--text-muted)]">Nombre de tickets Pluxee par {resourcePeriod === "month" ? "mois" : "jour"} · {resourcePeriod === "month" ? "7 derniers mois" : "30 derniers jours"}</p></div></CardHeader>
            <CardContent className="h-64 w-full p-0" aria-busy={loading}>
              {loading ? <div className="h-full animate-pulse rounded-xl bg-[var(--surface-muted)]" /> : !resourceStats ? <div className="flex h-full items-center justify-center rounded-xl bg-[var(--surface-muted)] px-4 text-center text-sm text-[var(--text-muted)]">{resourceError ?? "Statistiques des ressources indisponibles."}</div> : (
                <div className="h-full w-full" role="img" aria-label={`Nombre de tickets resto distribués par ${resourcePeriod === "month" ? "mois" : "jour"}`}>
                  <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 256 }}>
                    <BarChart data={resourceTrendData} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke="var(--line)" strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey={resourcePeriod === "month" ? "month" : "date"} interval={resourcePeriod === "month" ? 0 : 4} tickFormatter={(value) => resourcePeriod === "month" ? formatMonth(String(value)) : formatDay(String(value))} tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} domain={[0, "auto"]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} width={38} />
                      <Tooltip labelFormatter={(value) => resourcePeriod === "month" ? formatMonth(String(value), true) : formatDay(String(value), true)} formatter={(value) => [`${value} tickets`, "Tickets resto"]} cursor={{ fill: "var(--surface-muted)" }} contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--line)", borderRadius: "0.75rem", boxShadow: "var(--shadow-card)" }} labelStyle={{ color: "var(--text)", fontWeight: 600 }} />
                      <Bar dataKey="pluxeeTicketCount" name="Tickets resto" fill="var(--info)" radius={[6, 6, 0, 0]} maxBarSize={resourcePeriod === "month" ? 38 : 18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="gap-4 rounded-2xl p-5 sm:p-6">
        <CardHeader className="p-0">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--info-soft)] text-[var(--info)]"><Users className="h-[18px] w-[18px]" aria-hidden="true" /></span>
            <div><CardTitle>Statistiques des utilisateurs</CardTitle><p className="mt-1 text-sm text-[var(--text-muted)]">Comptes actifs, inactifs et répartition par rôle.</p></div>
          </div>
        </CardHeader>
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[var(--line)] bg-[var(--success-soft)]/60 p-4"><p className="text-xs font-medium text-[var(--text-muted)]">Utilisateurs actifs</p><p className="mt-2 font-editorial text-3xl leading-none tabular-nums text-[var(--success)]">{loading ? "—" : activeUsers}</p></div>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)]/60 p-4"><p className="text-xs font-medium text-[var(--text-muted)]">Utilisateurs inactifs</p><p className="mt-2 font-editorial text-3xl leading-none tabular-nums text-[var(--text)]">{loading ? "—" : inactiveUsers}</p></div>
          </div>
          <div className="space-y-3" aria-label="Répartition des utilisateurs par rôle">
            {roleDistribution.map((role) => {
              const ratio = users.length ? (role.value / users.length) * 100 : 0;
              return <div key={role.label} className="grid grid-cols-[minmax(9rem,1fr)_3fr_2rem] items-center gap-3 text-xs sm:grid-cols-[11rem_1fr_2.5rem]">
                <span className="truncate text-[var(--text-soft)]">{role.label}</span>
                <span className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]"><span className="block h-full rounded-full transition-[width]" style={{ width: `${loading ? 0 : ratio}%`, backgroundColor: role.color }} /></span>
                <span className="text-right font-semibold tabular-nums text-[var(--text)]">{loading ? "—" : role.value}</span>
              </div>;
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--line)] pt-4 text-xs text-[var(--text-muted)]">
          <span className="ml-auto inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />Données actualisées à la demande</span>
        </div>
      </Card>
    </section>
  );
}

"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Building2, ChartNoAxesCombined, MapPinned, RefreshCw, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { PageContainer } from "@/components/ui/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { listAdminCompanySites, listAdminDepartments, listAdminTeams, listAdminUsers } from "@/lib/api/admin";
import type { AdminDepartment, AdminTeam, AdminUser } from "@/types/admin";
import type { CompanySite } from "@/types/company-site";

type AdminOverview = {
  users: AdminUser[];
  departments: AdminDepartment[];
  teams: AdminTeam[];
  sites: CompanySite[];
};

const sections: Array<{ title: string; description: string; href: string; icon: LucideIcon; tone: string; count: (overview: AdminOverview) => number; countLabel: string }> = [
  { title: "Utilisateurs", description: "Créez les comptes et gérez leurs rôles et accès.", href: "/admin/users", icon: Users, tone: "bg-indigo-50 text-indigo-700", count: ({ users }) => users.length, countLabel: "comptes" },
  { title: "Départements", description: "Structurez les services de votre organisation.", href: "/admin/departments", icon: Building2, tone: "bg-sky-50 text-sky-700", count: ({ departments }) => departments.length, countLabel: "départements" },
  { title: "Équipes", description: "Organisez les équipes et leurs responsables.", href: "/admin/teams", icon: BriefcaseBusiness, tone: "bg-emerald-50 text-emerald-700", count: ({ teams }) => teams.length, countLabel: "équipes" },
  { title: "Sites de l’entreprise", description: "Gérez les agences et les points de départ.", href: "/admin/company-sites", icon: MapPinned, tone: "bg-amber-50 text-amber-700", count: ({ sites }) => sites.length, countLabel: "sites" },
];

const errorMessage = (error: unknown) => error instanceof ApiError ? error.message : "Impossible de charger les données d’administration.";

function OverviewCard({ label, value, note, icon: Icon, tone, loading }: Readonly<{ label: string; value: number | undefined; note: string; icon: LucideIcon; tone: string; loading: boolean }>) {
  return (
    <Card className="relative min-h-32 justify-between gap-4 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-[var(--text-muted)]">{label}</p>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" aria-hidden="true" /></span>
      </div>
      {loading ? <Skeleton className="h-9 w-16 rounded-lg" /> : <p className="font-editorial text-3xl leading-none tabular-nums text-[var(--text)]">{value ?? "—"}</p>}
      <p className="truncate text-xs text-[var(--text-muted)]">{note}</p>
    </Card>
  );
}

export default function AdminHomePage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [users, departments, teams, sites] = await Promise.all([
        listAdminUsers(),
        listAdminDepartments(),
        listAdminTeams(),
        listAdminCompanySites(),
      ]);
      setOverview({ users, departments, teams, sites });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const activeUsers = overview?.users.filter((user) => user.isActive).length;
  const activeSites = overview?.sites.filter((site) => site.isActive).length;

  return (
    <PageContainer className="max-w-6xl">
      <header
        className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[24px] border border-[var(--line)] px-5 py-5 shadow-[var(--shadow-card)] sm:px-7 sm:py-6 lg:flex-row lg:items-center lg:justify-between"
        style={{ background: "linear-gradient(112deg, var(--brand-soft) 0%, var(--surface) 70%, var(--surface) 100%)" }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-60 w-60 rounded-full border border-[var(--line)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-16 h-48 w-48 rounded-full border border-[var(--line)] opacity-70" />
        <div className="relative min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand-strong)] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />
            Administration
          </div>
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.045em] text-[var(--text)] sm:text-[34px]">Centre d’administration</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--text-soft)]">
            Un aperçu des comptes, des équipes et des implantations de votre organisation.
          </p>
        </div>
        <div className="relative flex flex-wrap items-center gap-3 lg:shrink-0">
          <Link
            href="/admin/users"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2"
          >
            Gérer les utilisateurs <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Button type="button" size="sm" variant="outline" disabled={loading} onClick={() => void load()} leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />}>
            Actualiser
          </Button>
        </div>
      </header>

      {error && <div className="space-y-2"><ErrorState title="Les chiffres n’ont pas pu être chargés." message={error} /><Button type="button" size="sm" variant="outline" onClick={() => void load()}>Réessayer</Button></div>}

      <section aria-label="Indicateurs de l’organisation" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <OverviewCard label="Comptes actifs" value={activeUsers} loading={loading} note={overview ? `sur ${overview.users.length} comptes` : error ? "Données indisponibles" : "Comptes utilisateurs"} icon={Users} tone="bg-indigo-50 text-indigo-700" />
        <OverviewCard label="Départements" value={overview?.departments.length} loading={loading} note="Dans l’organisation" icon={Building2} tone="bg-sky-50 text-sky-700" />
        <OverviewCard label="Équipes" value={overview?.teams.length} loading={loading} note="Réparties par département" icon={BriefcaseBusiness} tone="bg-emerald-50 text-emerald-700" />
        <OverviewCard label="Sites actifs" value={activeSites} loading={loading} note={overview ? `sur ${overview.sites.length} sites` : error ? "Données indisponibles" : "Agences et bureaux"} icon={MapPinned} tone="bg-amber-50 text-amber-700" />
      </section>

      <section aria-labelledby="organization-title" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <Building2 className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="organization-title" className="text-lg font-bold tracking-[-0.025em] text-[var(--text)]">Structure de l’organisation</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Accédez rapidement aux espaces de gestion.</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-soft)] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />
            {sections.length} espaces de gestion
          </span>
        </div>
        <div aria-hidden="true" className="h-px w-full bg-[var(--line)]" />

        <div className="grid gap-3 sm:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.href} href={section.href} className="group focus-visible:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]">
                <Card className="h-full min-h-[168px] justify-between rounded-2xl p-4 transition-[border-color,box-shadow,transform] duration-200 group-hover:-translate-y-0.5 group-hover:border-indigo-200 group-hover:shadow-[var(--shadow-hover)] sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${section.tone}`}><Icon className="h-[18px] w-[18px]" aria-hidden="true" /></span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold tabular-nums text-[var(--text-soft)]">
                      {loading ? <span className="h-3 w-5 animate-pulse rounded bg-slate-200" aria-label="Chargement du nombre" /> : overview ? section.count(overview) : "—"}
                      <span>{section.countLabel}</span>
                    </span>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <CardTitle>{section.title}</CardTitle>
                      <p className="mt-1.5 text-sm leading-5 text-[var(--text-muted)]">{section.description}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--brand-strong)]">Gérer <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="reports-title">
        <Link href="/admin/reports" className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]">
          <Card className="flex-row items-center justify-between gap-4 rounded-2xl p-4 transition-[border-color,box-shadow] group-hover:border-indigo-200 group-hover:shadow-[var(--shadow-hover)] sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><ChartNoAxesCombined className="h-[18px] w-[18px]" aria-hidden="true" /></span>
              <div className="min-w-0"><CardTitle id="reports-title">Rapports</CardTitle><p className="mt-1 text-sm text-[var(--text-muted)]">Exportez les données des missions et des utilisateurs en CSV.</p></div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--brand-strong)]">Consulter <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </Card>
        </Link>
      </section>
    </PageContainer>
  );
}

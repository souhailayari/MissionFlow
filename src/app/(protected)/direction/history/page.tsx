"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, CalendarDays, CreditCard, Download, Fuel, Hotel, RefreshCw, Search, Ticket, type LucideIcon } from "lucide-react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/ui/page-container";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/components/ui/alert";
import { exportDirectionResourceReport, getDirectionResourceHistory } from "@/lib/api/missions";
import type { DirectionHistoryMission, DirectionResourceHistoryFilters, DirectionResourceHistoryResponse } from "@/types/missions";

const initialFilters: DirectionResourceHistoryFilters = { page: 1, limit: 20 };
const formatAmount = (value: string | number | null | undefined) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 3 }).format(Number(value ?? 0));
const formatDate = (value: string | null | undefined, withTime = false) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(new Date(value));
};
const beneficiaryName = (mission: DirectionHistoryMission) => mission.employee ? `${mission.employee.firstName} ${mission.employee.lastName}` : "Bénéficiaire non renseigné";
const destinationSummary = (mission: DirectionHistoryMission) => mission.destinations?.length
  ? `${mission.destinations[0].name}${mission.destinations.length > 1 ? ` + ${mission.destinations.length - 1}` : ""}`
  : mission.destination ?? "Non renseignée";
const getErrorMessage = (error: unknown) => error instanceof ApiError ? error.message : "Veuillez vérifier votre connexion puis réessayer.";

function MetricCard({ label, value, detail, icon: Icon, tone, className }: Readonly<{ label: string; value: string | number; detail: string; icon: LucideIcon; tone: "brand" | "info" | "success" | "warning" | "danger"; className?: string }>) {
  return (
    <StatCard label={label} value={value} description={detail} icon={<Icon className="h-4 w-4" aria-hidden="true" />} tone={tone} className={className} />
  );
}

function HistoryRow({ mission }: Readonly<{ mission: DirectionHistoryMission }>) {
  const resource = mission.resources;
  const provider = resource?.providedBy ? `${resource.providedBy.firstName} ${resource.providedBy.lastName}` : "Direction";
  return (
    <tr className="align-top transition-colors hover:bg-[var(--table-hover)]">
      <td className="whitespace-nowrap px-3 py-3">
        <Link href={`/missions/${mission.id}`} className="group inline-flex items-center gap-1 font-semibold text-[var(--brand-strong)] hover:text-[var(--brand)]">
          {mission.reference}<ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
        <p className="mt-1 max-w-48 truncate text-xs text-[var(--text-muted)]" title={mission.title}>{mission.title}</p>
      </td>
      <td className="px-3 py-3">
        <p className="font-medium text-[var(--text)]">{beneficiaryName(mission)}</p>
        {mission.employee?.matricule && <p className="mt-1 text-xs text-[var(--text-muted)]">{mission.employee.matricule}</p>}
      </td>
      <td className="max-w-40 px-3 py-3 text-[var(--text-soft)]" title={mission.destinations?.map((stop) => stop.name).join(" → ") || mission.destination || ""}>
        <p className="truncate">{destinationSummary(mission)}</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Départ {formatDate(mission.departureDate)}</p>
      </td>
      <td className="px-3 py-3">
        <p className="font-medium text-[var(--text)]">{resource?.fuelCardNumber || "—"}</p>
        <p className="mt-1 whitespace-nowrap text-xs text-[var(--text-muted)]">{formatAmount(resource?.fuelAmount)} carburant</p>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <p className="font-medium text-[var(--text)]">{resource?.pluxeeTicketCount ?? 0} ticket{resource?.pluxeeTicketCount === 1 ? "" : "s"}</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{formatAmount(resource?.pluxeeAmount)} montant</p>
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-xs text-[var(--text-soft)]">
        <p>{formatDate(resource?.providedAt, true)}</p>
        <p className="mt-1 text-[var(--text-muted)]">Par {provider}</p>
      </td>
    </tr>
  );
}

function HistoryCard({ mission }: Readonly<{ mission: DirectionHistoryMission }>) {
  const resource = mission.resources;
  const provider = resource?.providedBy ? `${resource.providedBy.firstName} ${resource.providedBy.lastName}` : "Direction";
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-hover)] sm:p-5">
      <div className="min-w-0">
        <Link href={`/missions/${mission.id}`} className="inline-flex max-w-full items-center gap-1 font-semibold text-[var(--brand-strong)] hover:text-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]/40">
          <span className="truncate">{mission.reference}</span><ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden="true" />
        </Link>
        <p className="mt-1 break-words text-sm font-medium text-[var(--text)]">{mission.title}</p>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Bénéficiaire</dt>
          <dd className="mt-1 break-words font-medium text-[var(--text)]">{beneficiaryName(mission)}</dd>
          {mission.employee?.matricule && <dd className="mt-0.5 text-xs text-[var(--text-muted)]">{mission.employee.matricule}</dd>}
        </div>
        <div className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Destination · départ</dt>
          <dd className="mt-1 break-words text-[var(--text-soft)]">{destinationSummary(mission)}</dd>
          <dd className="mt-0.5 text-xs text-[var(--text-muted)]">{formatDate(mission.departureDate)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Carte carburant</dt>
          <dd className="mt-1 break-all font-medium text-[var(--text)]">{resource?.fuelCardNumber || "—"}</dd>
          <dd className="mt-0.5 text-xs text-[var(--text-muted)]">{formatAmount(resource?.fuelAmount)} carburant</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Pluxee</dt>
          <dd className="mt-1 font-medium text-[var(--text)]">{resource?.pluxeeTicketCount ?? 0} ticket{resource?.pluxeeTicketCount === 1 ? "" : "s"}</dd>
          <dd className="mt-0.5 text-xs text-[var(--text-muted)]">{formatAmount(resource?.pluxeeAmount)} montant</dd>
        </div>
      </dl>
      <div className="mt-4 border-t border-[var(--line)] pt-3 text-xs text-[var(--text-soft)]">
        <p>Remis le {formatDate(resource?.providedAt, true)}</p>
        <p className="mt-1 text-[var(--text-muted)]">Par {provider}</p>
      </div>
    </article>
  );
}

export default function DirectionHistoryPage() {
  return (
    <Suspense fallback={<PageContainer><Skeleton className="h-40 rounded-2xl" /><Skeleton className="h-48 rounded-2xl" /></PageContainer>}>
      <DirectionHistoryContent />
    </Suspense>
  );
}

function DirectionHistoryContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<DirectionResourceHistoryFilters>(() => ({
    ...initialFilters,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
  }));
  const [result, setResult] = useState<DirectionResourceHistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const loadHistory = useCallback(async (nextFilters: DirectionResourceHistoryFilters) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await getDirectionResourceHistory(nextFilters));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadHistory(filters), filters.search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [filters, loadHistory]);

  const resetFilters = () => {
    setFilters(initialFilters);
    const url = new URL(window.location.href);
    url.searchParams.delete("from");
    url.searchParams.delete("to");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const updateFilter = (key: "search" | "from" | "to", value: string) => {
    setFilters((current) => ({ ...current, [key]: value || undefined, page: 1 }));
  };
  const exportReport = async () => {
    setExporting(true);
    setExportMessage(null);
    setExportError(null);
    try {
      const csv = await exportDirectionResourceReport(filters);
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "rapport-carburant-tickets.csv";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
      setExportMessage("Le rapport CSV a été téléchargé.");
    } catch (requestError) {
      setExportError(getErrorMessage(requestError));
    } finally {
      setExporting(false);
    }
  };
  const summary = result?.summary;
  const metricPlacement = (index: number) => `sm:col-span-2 ${index === 3 ? "sm:col-start-2" : index === 4 ? "sm:col-start-4" : ""} 2xl:col-span-1 2xl:col-start-auto`;
  const metrics = [
    { label: "Missions finalisées", value: summary?.missions ?? 0, detail: "Sur la période filtrée", icon: CalendarDays, tone: "success" as const },
    { label: "Cartes carburant", value: summary?.fuelCards ?? 0, detail: "Cartes attribuées", icon: CreditCard, tone: "info" as const },
    { label: "Carburant engagé", value: formatAmount(summary?.fuelAmount), detail: "Montant cumulé", icon: Fuel, tone: "warning" as const },
    { label: "Tickets Pluxee", value: summary?.pluxeeTicketCount ?? 0, detail: `${formatAmount(summary?.pluxeeAmount)} montant total`, icon: Ticket, tone: "brand" as const },
    { label: "Hébergements", value: summary?.accommodations ?? 0, detail: "Missions avec hébergement", icon: Hotel, tone: "success" as const },
  ];

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
            Rapport des ressources · Direction
          </div>
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.045em] text-[var(--text)] sm:text-[34px]">Rapport carburant &amp; tickets resto</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--text-soft)]">Consultez les ressources attribuées par la Direction et exportez-les en CSV.</p>
        </div>
        <div className="relative flex flex-wrap items-center gap-3 lg:shrink-0">
          <Button type="button" size="lg" className="min-h-14" disabled={isLoading || exporting} onClick={() => void exportReport()} leftIcon={<Download className="h-4 w-4" aria-hidden="true" />}>{exporting ? "Export en cours…" : "Exporter CSV"}</Button>
          <Button type="button" size="lg" variant="outline" className="min-h-14" disabled={isLoading} onClick={() => void loadHistory(filters)} leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />}>Actualiser</Button>
        </div>
      </header>

      {exportMessage && <Alert tone="success">{exportMessage}</Alert>}
      {exportError && <Alert tone="danger">{exportError}</Alert>}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-6 2xl:grid-cols-5" aria-label="Totaux sur la période filtrée">
        {isLoading ? Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className={`h-[138px] rounded-2xl ${metricPlacement(index)}`} />) : metrics.map((metric, index) => <MetricCard key={metric.label} {...metric} className={metricPlacement(index)} />)}
      </section>

      <Card className="gap-4 rounded-2xl border-[var(--line)] p-4 shadow-[var(--shadow-card)] sm:p-5">
        <CardHeader className="items-center">
          <div>
            <CardTitle>Filtrer l’historique</CardTitle>
            <p className="mt-1 text-sm text-[var(--text-muted)]">La période porte sur la date de remise des ressources.</p>
          </div>
          <Button type="button" size="xs" variant="ghost" disabled={!filters.search && !filters.from && !filters.to} onClick={resetFilters}>Réinitialiser</Button>
        </CardHeader>
        <CardContent className="grid gap-3 p-0 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_190px_190px]">
          <label className="relative block">
            <span className="sr-only">Rechercher par référence, bénéficiaire ou numéro de carte</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input className="pl-9" value={filters.search ?? ""} onChange={(event) => updateFilter("search", event.target.value)} placeholder="Référence, bénéficiaire, carte…" />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-2.5 focus-within:ring-2 focus-within:ring-[var(--focus)]/30">
            <CalendarDays className="h-4 w-4 shrink-0 text-[var(--text-muted)]" /><span className="sr-only">Remis à partir du</span>
            <Input aria-label="Remis à partir du" className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" type="date" value={filters.from ?? ""} onChange={(event) => updateFilter("from", event.target.value)} />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-2.5 focus-within:ring-2 focus-within:ring-[var(--focus)]/30">
            <CalendarDays className="h-4 w-4 shrink-0 text-[var(--text-muted)]" /><span className="sr-only">Remis jusqu’au</span>
            <Input aria-label="Remis jusqu’au" className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" type="date" value={filters.to ?? ""} onChange={(event) => updateFilter("to", event.target.value)} />
          </label>
        </CardContent>
      </Card>

      {error && <div className="space-y-3"><ErrorState title="Impossible de charger l’historique." message={error} /><Button type="button" size="sm" variant="outline" onClick={() => void loadHistory(filters)}>Réessayer</Button></div>}
      {!error && isLoading && <div className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]" aria-label="Chargement de l’historique">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-12 rounded-lg" />)}</div>}
      {!error && !isLoading && result && result.data.length === 0 && <EmptyState title="Aucune ressource trouvée." description="Les missions finalisées avec une carte carburant ou des tickets Pluxee apparaîtront ici." />}
      {!error && !isLoading && result && result.data.length > 0 && <>
        <Card className="gap-0 overflow-hidden rounded-2xl border-[var(--line)] p-0 shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--line)] px-5 py-4">
            <h2 className="text-base font-semibold text-[var(--text)]">Missions et ressources attribuées</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{result.meta.total} mission{result.meta.total === 1 ? "" : "s"} · Les totaux ci-dessus couvrent tous les résultats filtrés.</p>
          </div>
          <div className="hidden overflow-x-auto 2xl:block">
            <table className="w-full min-w-[1060px] text-left text-sm">
              <caption className="sr-only">Historique des cartes carburant et tickets Pluxee remis par la Direction</caption>
              <thead className="border-b border-[var(--line)] bg-[var(--table-header)] text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                <tr><th scope="col" className="px-3 py-3">Mission</th><th scope="col" className="px-3 py-3">Bénéficiaire</th><th scope="col" className="px-3 py-3">Destination</th><th scope="col" className="px-3 py-3">Carte carburant</th><th scope="col" className="px-3 py-3">Pluxee</th><th scope="col" className="px-3 py-3">Remise</th></tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">{result.data.map((mission) => <HistoryRow key={mission.id} mission={mission} />)}</tbody>
            </table>
          </div>
          <div className="grid gap-3 p-3 2xl:hidden sm:p-4">
            {result.data.map((mission) => <HistoryCard key={mission.id} mission={mission} />)}
          </div>
        </Card>
        <Pagination page={result.meta.page} totalPages={result.meta.totalPages} total={result.meta.total} onChange={(page) => setFilters((current) => ({ ...current, page }))} />
      </>}
    </PageContainer>
  );
}

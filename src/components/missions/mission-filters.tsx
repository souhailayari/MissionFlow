import { ArrowRight, CalendarRange, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterToolbar } from "@/components/ui/filter-toolbar";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { missionStatusLabels, missionStatusValues, type MissionFilters } from "@/types/missions";

export function MissionFiltersPanel({ filters, onChange }: Readonly<{ filters: MissionFilters; onChange: <T extends keyof MissionFilters>(key: T, value: MissionFilters[T]) => void }>) {
  const hasFilters = Boolean(filters.search || filters.status || filters.from || filters.to);
  const clearFilters = () => {
    onChange("search", "");
    onChange("status", undefined);
    onChange("from", undefined);
    onChange("to", undefined);
  };

  return (
    <FilterToolbar label="Recherche et filtres des missions" className="p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3 border-b border-[var(--line)] pb-3.5">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-[var(--text)]">Recherche et filtres</h2>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">Affinez la liste selon vos critères.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.35fr)_minmax(190px,0.9fr)_minmax(285px,1.2fr)_auto] xl:items-end">
        <div className="md:col-span-2 xl:col-span-1">
          <label htmlFor="mission-search" className="mb-1.5 block text-xs font-semibold text-[var(--text-soft)]">Recherche</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
            <Input id="mission-search" value={filters.search ?? ""} onChange={(event) => onChange("search", event.target.value)} placeholder="Référence ou objet" className="h-12 rounded-xl bg-[var(--surface-muted)]/50 pl-10 focus-visible:bg-[var(--surface)]" />
          </div>
        </div>

        <div>
          <label htmlFor="mission-status" className="mb-1.5 block text-xs font-semibold text-[var(--text-soft)]">Statut</label>
          <Select id="mission-status" value={filters.status ?? ""} onChange={(event) => onChange("status", event.target.value ? event.target.value as MissionFilters["status"] : undefined)} className="h-12">
            <option value="">Tous les statuts accessibles</option>
            {missionStatusValues.map((status) => <option key={status} value={status}>{missionStatusLabels[status]}</option>)}
          </Select>
        </div>

        <fieldset className="min-w-0">
          <legend className="mb-1.5 text-xs font-semibold text-[var(--text-soft)]">Période de départ</legend>
          <div className="flex h-12 min-w-0 items-center gap-2 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] px-2.5 shadow-[0_1px_2px_rgba(16,26,51,0.025)] transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/25">
            <CalendarRange className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
            <label htmlFor="mission-from" className="sr-only">Départ à partir du</label>
            <Input id="mission-from" type="date" value={filters.from ?? ""} onChange={(event) => onChange("from", event.target.value || undefined)} aria-label="Départ à partir du" className="h-9 min-w-0 flex-1 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0" />
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
            <label htmlFor="mission-to" className="sr-only">Départ jusqu&apos;au</label>
            <Input id="mission-to" type="date" value={filters.to ?? ""} onChange={(event) => onChange("to", event.target.value || undefined)} aria-label="Départ jusqu&apos;au" className="h-9 min-w-0 flex-1 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0" />
          </div>
        </fieldset>

        {hasFilters && (
          <Button type="button" size="sm" variant="ghost" onClick={clearFilters} leftIcon={<RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />} className="justify-start text-[var(--text-soft)] md:col-span-2 xl:col-span-1 xl:justify-center">
            Effacer les filtres
          </Button>
        )}
      </div>
    </FilterToolbar>
  );
}

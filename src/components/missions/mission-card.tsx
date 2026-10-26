import Link from "next/link";
import { Eye, MapPin } from "lucide-react";
import { MissionBeneficiary } from "@/components/missions/mission-beneficiary";
import { MissionStatusBadge } from "@/components/missions/mission-status-badge";
import type { Mission } from "@/types/missions";

const formatDate = (value: string): string => new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
const destinationSummary = (mission: Mission): string => mission.destinations?.length
  ? `${mission.destinations[0].name}${mission.destinations.length > 1 ? ` + ${mission.destinations.length - 1}` : ""}`
  : mission.destination ?? "Non renseignée";

export function MissionCard({ mission }: Readonly<{ mission: Mission }>) {
  return (
    <article className="group rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:shadow-[0_10px_24px_rgba(16,26,51,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-semibold tracking-[-0.02em] text-[var(--brand-strong)]">{mission.reference}</p>
          <h2 className="mt-1 truncate text-sm font-semibold leading-5 text-[var(--text)]" title={mission.title}>{mission.title}</h2>
        </div>
        <MissionStatusBadge status={mission.status} showDot />
      </div>
      <div className="mt-4 flex items-center gap-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Bénéficiaire</span>
        <MissionBeneficiary mission={mission} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-[var(--line)] pt-3 text-xs leading-5">
        <p className="col-span-2 flex min-w-0 items-center gap-1.5" title={destinationSummary(mission)}>
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--brand-strong)]" aria-hidden="true" />
          <span className="truncate text-[var(--text-soft)]">{destinationSummary(mission)}</span>
        </p>
        <p className="truncate"><span className="text-[var(--text-muted)]">Départ · </span><span className="text-[var(--text-soft)]">{formatDate(mission.departureDate)}</span></p>
        <p className="truncate"><span className="text-[var(--text-muted)]">Retour · </span><span className="text-[var(--text-soft)]">{formatDate(mission.returnDate)}</span></p>
      </div>
      <div className="mt-3 flex justify-end border-t border-[var(--line)] pt-3">
        <Link href={`/missions/${mission.id}`} aria-label={`${mission.reference} : voir le détail`} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[var(--line)] px-3 text-xs font-semibold text-[var(--brand-strong)] transition hover:border-[var(--brand)]/30 hover:bg-[var(--brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]/60">
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          Ouvrir le détail
        </Link>
      </div>
    </article>
  );
}

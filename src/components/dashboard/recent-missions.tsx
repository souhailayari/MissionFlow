import Link from "next/link";
import { ArrowUpRight, Inbox, MapPin } from "lucide-react";
import { MissionStatusBadge } from "@/components/missions/mission-status-badge";
import type { Mission } from "@/types/missions";

export function RecentMissions({ missions }: Readonly<{ missions: Mission[] }>) {
  if (missions.length === 0) {
    return (
      <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-alt)] px-5 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]"><Inbox className="h-5 w-5" aria-hidden="true" /></span>
        <p className="mt-3 text-sm font-semibold text-[var(--text)]">Aucune mission récente</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Les nouvelles demandes apparaîtront ici.</p>
      </div>
    );
  }

  const date = (value: string) => new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(value));

  return (
    <ul className="divide-y divide-[var(--line)]">
      {missions.map((mission) => (
        <li key={mission.id}>
          <Link href={`/missions/${mission.id}`} className="group grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 rounded-xl px-3 py-4 transition-colors hover:bg-[var(--surface-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]/40 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="font-mono text-[10px] font-semibold tracking-[0.01em] text-[var(--brand-strong)]">{mission.reference}</span>
                <span className="h-1 w-1 rounded-full bg-[var(--line-strong)]" aria-hidden="true" />
                <time dateTime={mission.departureDate} className="text-[11px] tabular-nums text-[var(--text-muted)]">Départ {date(mission.departureDate)}</time>
              </div>
              <p className="mt-1.5 truncate text-sm font-semibold tracking-[-0.01em] text-[var(--text)]" title={mission.title}>{mission.title}</p>
              <p className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-xs text-[var(--text-soft)]">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--info)]" aria-hidden="true" />
                <span className="truncate">{mission.destination ?? "Destination non renseignée"}</span>
              </p>
              {mission.createdById !== mission.employeeId && <p className="mt-1 truncate text-[11px] text-[var(--text-muted)]">Pour {mission.employee ? `${mission.employee.firstName} ${mission.employee.lastName}` : "le directeur"} · créée par {mission.createdBy ? `${mission.createdBy.firstName} ${mission.createdBy.lastName}` : "le chef d'équipe"}</p>}
            </div>
            <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-end">
              <MissionStatusBadge status={mission.status} />
              <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--brand)]" aria-hidden="true" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

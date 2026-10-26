import Link from "next/link";
import { Eye, MapPin } from "lucide-react";
import { MissionBeneficiary } from "@/components/missions/mission-beneficiary";
import { MissionStatusBadge } from "@/components/missions/mission-status-badge";
import type { Mission } from "@/types/missions";

const formatDate = (value: string): string => new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
const destinationSummary = (mission: Mission): string => mission.destinations?.length
  ? `${mission.destinations[0].name}${mission.destinations.length > 1 ? ` + ${mission.destinations.length - 1}` : ""}`
  : mission.destination ?? "Non renseignée";

export function MissionTable({ missions }: Readonly<{ missions: Mission[] }>) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-card)] xl:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <caption className="sr-only">Liste des missions</caption>
          <thead className="border-b border-[var(--line)] bg-[var(--surface-alt)] text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Référence</th>
              <th scope="col" className="px-4 py-3 font-semibold">Bénéficiaire</th>
              <th scope="col" className="px-4 py-3 font-semibold">Objet</th>
              <th scope="col" className="px-4 py-3 font-semibold">Destination</th>
              <th scope="col" className="px-4 py-3 font-semibold">Dates</th>
              <th scope="col" className="px-4 py-3 font-semibold">Statut</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {missions.map((mission) => (
              <tr key={mission.id} className="group h-[68px] transition-colors hover:bg-[var(--brand-soft)]/35">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold tracking-[-0.025em] text-[var(--brand-strong)]">{mission.reference}</td>
                <td className="min-w-[190px] px-4 py-3">
                  <MissionBeneficiary mission={mission} />
                </td>
                <td className="max-w-[240px] truncate px-4 py-3 text-[var(--text-soft)]" title={mission.title}>{mission.title}</td>
                <td className="max-w-[220px] px-4 py-3 text-[var(--text-soft)]">
                  <div className="flex min-w-0 items-center gap-2" title={destinationSummary(mission)}>
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--brand-strong)]" aria-hidden="true" />
                    <span className="truncate">{destinationSummary(mission)}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-[var(--text-soft)]">
                  <div className="font-medium">{formatDate(mission.departureDate)}</div>
                  <div className="mt-1 text-xs text-[var(--text-muted)]">au {formatDate(mission.returnDate)}</div>
                </td>
                <td className="px-4 py-3"><MissionStatusBadge status={mission.status} showDot /></td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/missions/${mission.id}`}
                    aria-label={`${mission.reference} : voir le détail`}
                    title="Voir le détail"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--text-soft)] transition group-hover:border-[var(--brand)]/30 hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]/50"
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

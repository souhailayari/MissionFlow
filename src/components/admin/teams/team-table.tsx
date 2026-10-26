import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AdminTeam } from "@/types/admin";
import { Building2, BriefcaseBusiness, Pencil, UserRound, UsersRound } from "lucide-react";

export function TeamTable({ teams, onEdit }: Readonly<{ teams: AdminTeam[]; onEdit: (team: AdminTeam) => void }>) {
  const heading = (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
          <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-[var(--text)]">Équipes enregistrées</h2>
          <p className="truncate text-xs text-[var(--text-muted)]">Départements, responsables et membres</p>
        </div>
      </div>
      <Badge tone="neutral" className="h-7 shrink-0 px-2.5 text-[10px] normal-case tracking-normal">
        {teams.length} {teams.length === 1 ? "équipe" : "équipes"}
      </Badge>
    </div>
  );

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-card)] md:block">
        {heading}
        <table className="w-full table-fixed text-left text-sm">
          <caption className="sr-only">Liste des équipes</caption>
          <colgroup><col className="w-[27%]" /><col className="w-[22%]" /><col className="w-[25%]" /><col className="w-[13%]" /><col className="w-[13%]" /></colgroup>
          <thead className="border-b border-[var(--line)] bg-[var(--surface-alt)] text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--text-muted)]">
            <tr>
              <th scope="col" className="px-3 py-2.5">Équipe</th>
              <th scope="col" className="px-3 py-2.5">Département</th>
              <th scope="col" className="px-3 py-2.5">Responsable</th>
              <th scope="col" className="px-3 py-2.5">Membres</th>
              <th scope="col" className="px-3 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {teams.map((team) => (
              <tr key={team.id} className="h-16 transition-colors hover:bg-[var(--surface-alt)]">
                <td className="overflow-hidden px-3 py-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-strong)]"><BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden="true" /></span>
                    <span className="truncate text-sm font-semibold text-[var(--text)]">{team.name}</span>
                  </div>
                </td>
                <td className="overflow-hidden px-3 py-3">
                  <span title={team.department?.name ?? team.departmentId} className="inline-flex h-6 max-w-full items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-alt)] px-2 text-[10px] font-medium text-[var(--text-soft)]">
                    <Building2 className="h-3 w-3 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                    <span className="truncate">{team.department?.name ?? team.departmentId}</span>
                  </span>
                </td>
                <td className="overflow-hidden px-3 py-3">
                  {team.leader ? (
                    <span title={`${team.leader.firstName} ${team.leader.lastName}`} className="inline-flex h-6 max-w-full items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-alt)] px-2 text-[10px] font-medium text-[var(--text-soft)]">
                      <UserRound className="h-3 w-3 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                      <span className="truncate">{team.leader.firstName} {team.leader.lastName}</span>
                    </span>
                  ) : <span className="text-xs text-[var(--text-muted)]">Non affecté</span>}
                </td>
                <td className="px-3 py-3">
                  <Badge tone="neutral" className="h-7 px-2.5 text-[10px] normal-case tracking-normal"><UsersRound aria-hidden="true" />{team.members?.length ?? 0}</Badge>
                </td>
                <td className="px-3 py-3 text-right"><Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => onEdit(team)} leftIcon={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}>Modifier</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-card)] md:hidden">
        <li className="list-none">{heading}</li>
        {teams.map((team) => (
          <li key={team.id} className="flex items-center justify-between gap-3 px-3 py-3 transition-colors hover:bg-[var(--surface-alt)]">
            <div className="flex min-w-0 items-start gap-2.5">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-strong)]"><BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden="true" /></span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--text)]">{team.name}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge tone="neutral" className="h-6 max-w-full px-2 text-[10px] normal-case tracking-normal"><Building2 aria-hidden="true" /><span className="truncate">{team.department?.name ?? team.departmentId}</span></Badge>
                  <Badge tone="neutral" className="h-6 px-2 text-[10px] normal-case tracking-normal"><UsersRound aria-hidden="true" />{team.members?.length ?? 0} membres</Badge>
                </div>
                <p className="mt-1 truncate text-xs text-[var(--text-muted)]">{team.leader ? `Responsable : ${team.leader.firstName} ${team.leader.lastName}` : "Responsable non affecté"}</p>
              </div>
            </div>
            <Button type="button" size="icon-sm" variant="outline" className="shrink-0 rounded-xl" aria-label={`Modifier ${team.name}`} title="Modifier" onClick={() => onEdit(team)}><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
          </li>
        ))}
      </ul>
    </>
  );
}

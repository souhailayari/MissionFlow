import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Pencil, UsersRound } from "lucide-react";
import type { AdminDepartment } from "@/types/admin";

export function DepartmentTable({ departments, onEdit }: Readonly<{ departments: AdminDepartment[]; onEdit: (department: AdminDepartment) => void }>) {
  const heading = (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
          <Building2 className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-[var(--text)]">Départements enregistrés</h2>
          <p className="truncate text-xs text-[var(--text-muted)]">Services et équipes de votre organisation</p>
        </div>
      </div>
      <Badge tone="neutral" className="h-7 shrink-0 px-2.5 text-[10px] normal-case tracking-normal">
        {departments.length} {departments.length === 1 ? "département" : "départements"}
      </Badge>
    </div>
  );

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-card)] md:block">
        {heading}
        <table className="w-full table-fixed text-left text-sm">
          <caption className="sr-only">Liste des départements</caption>
          <colgroup><col className="w-[58%]" /><col className="w-[22%]" /><col className="w-[20%]" /></colgroup>
          <thead className="border-b border-[var(--line)] bg-[var(--surface-alt)] text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--text-muted)]">
            <tr>
              <th scope="col" className="px-4 py-2.5">Département</th>
              <th scope="col" className="px-4 py-2.5">Équipes</th>
              <th scope="col" className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {departments.map((department) => (
              <tr key={department.id} className="h-16 transition-colors hover:bg-[var(--surface-alt)]">
                <td className="px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
                      <Building2 className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="truncate text-sm font-semibold text-[var(--text)]">{department.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone="neutral" className="h-7 px-2.5 text-[10px] normal-case tracking-normal">
                    <UsersRound aria-hidden="true" />
                    {department.teams.length} {department.teams.length === 1 ? "équipe" : "équipes"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => onEdit(department)} leftIcon={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}>
                    Modifier
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-card)] md:hidden">
        <li className="list-none">{heading}</li>
        {departments.map((department) => (
          <li key={department.id} className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-alt)]">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
                <Building2 className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--text)]">{department.name}</p>
                <Badge tone="neutral" className="mt-1 h-6 px-2 text-[10px] normal-case tracking-normal">
                  <UsersRound aria-hidden="true" />
                  {department.teams.length} {department.teams.length === 1 ? "équipe" : "équipes"}
                </Badge>
              </div>
            </div>
            <Button type="button" size="icon-sm" variant="outline" className="shrink-0 rounded-xl" aria-label={`Modifier ${department.name}`} title="Modifier" onClick={() => onEdit(department)}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}

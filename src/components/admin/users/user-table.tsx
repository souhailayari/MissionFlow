import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminDepartment, AdminTeam, AdminUser } from "@/types/admin";
import { Building2, Pencil, Power, UsersRound } from "lucide-react";

function roleLabel(user: AdminUser): string {
  const role = user.globalRole ?? user.departmentRole;
  if (role === "ADMIN") return "Administrateur";
  if (role === "RH") return "Ressources humaines";
  if (role === "DIRECTION") return "Direction";
  if (role === "DIRECTEUR_DEPARTEMENT") return "Directeur département";
  if (role === "CHEF_EQUIPE") return "Chef d'équipe";
  if (role === "EMPLOYE") return "Employé";
  return "Sans rôle";
}

function initials(user: AdminUser): string {
  return `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toLocaleUpperCase("fr-FR");
}

function UserIdentity({ user }: Readonly<{ user: AdminUser }>) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[10px] font-semibold text-[var(--brand-strong)] ring-1 ring-inset ring-[var(--brand-soft)]">
        {initials(user)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium leading-4 text-[var(--text)]">{user.firstName} {user.lastName}</span>
        <span className="block truncate text-[11px] leading-4 text-[var(--text-muted)]">{user.email}</span>
      </span>
    </div>
  );
}

function UserRoleBadge({ user }: Readonly<{ user: AdminUser }>) {
  return (
    <Badge tone={user.globalRole ? "info" : "neutral"} className="h-5 max-w-full rounded-full px-2 py-0 text-[10px] font-medium normal-case tracking-normal">
      {roleLabel(user)}
    </Badge>
  );
}

function UserStatus({ active }: Readonly<{ active: boolean }>) {
  return (
    <Badge tone={active ? "success" : "danger"} className="h-5 rounded-full px-2 py-0 text-[10px] font-medium normal-case tracking-normal">
      {active ? "Actif" : "Inactif"}
    </Badge>
  );
}

function DirectoryBadge({ label, kind }: Readonly<{ label: string; kind: "department" | "team" }>) {
  if (label === "-") return <span className="text-xs text-[var(--text-muted)]">Non renseigné</span>;

  const Icon = kind === "department" ? Building2 : UsersRound;
  return (
    <span
      title={label}
      className="inline-flex h-6 max-w-full items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-alt)] px-2 text-[10px] font-medium text-[var(--text-soft)]"
    >
      <Icon className="h-3 w-3 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function UserActions({ user, onEdit, onToggle }: Readonly<{ user: AdminUser; onEdit: (user: AdminUser) => void; onToggle: (user: AdminUser) => void }>) {
  const fullName = `${user.firstName} ${user.lastName}`;
  const toggleLabel = user.isActive ? "Désactiver" : "Activer";
  return (
    <div className="flex shrink-0 items-center justify-end gap-1">
      <Button type="button" variant="ghost" size="icon-xs" className="min-h-11 min-w-11 rounded-xl text-[var(--text-soft)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-strong)] md:min-h-8 md:min-w-8" onClick={() => onEdit(user)} aria-label={`Modifier ${fullName}`} title="Modifier">
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button type="button" variant="ghost" size="icon-xs" className={`min-h-11 min-w-11 rounded-xl hover:bg-[var(--danger-soft)] md:min-h-8 md:min-w-8 ${user.isActive ? "text-[var(--danger)] hover:brightness-90" : "text-[var(--success)] hover:bg-[var(--success-soft)] hover:brightness-90"}`} onClick={() => onToggle(user)} aria-label={`${toggleLabel} ${fullName}`} title={toggleLabel}>
        <Power className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function UserTable({
  users,
  departments,
  teams,
  totalCount,
  onEdit,
  onToggle,
}: Readonly<{
  users: AdminUser[];
  departments: AdminDepartment[];
  teams: AdminTeam[];
  totalCount: number;
  onEdit: (user: AdminUser) => void;
  onToggle: (user: AdminUser) => void;
}>) {
  const departmentName = (user: AdminUser) => departments.find((department) => department.id === user.departmentId)?.name ?? "-";
  const teamName = (user: AdminUser) => teams.find((team) => team.id === user.teamId)?.name ?? user.team?.name ?? "-";
  const heading = (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
          <UsersRound className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-[var(--text)]">Liste des utilisateurs</h2>
          <p className="truncate text-xs text-[var(--text-muted)]">Comptes et accès de votre organisation</p>
        </div>
      </div>
      <Badge tone="neutral" className="h-7 shrink-0 px-2.5 text-[10px] normal-case tracking-normal">
        {totalCount} {totalCount === 1 ? "utilisateur" : "utilisateurs"}
      </Badge>
    </div>
  );

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-card)] md:block">
        {heading}
        <table className="w-full table-fixed text-left">
          <caption className="sr-only">Liste des utilisateurs</caption>
          <colgroup>
            <col className="w-[37%]" />
            <col className="w-[18%]" />
            <col className="w-[16%]" />
            <col className="w-[13%]" />
            <col className="w-[9%]" />
            <col className="w-[7%]" />
          </colgroup>
          <thead className="sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--surface-alt)] text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--text-muted)]">
            <tr>
              <th scope="col" className="px-3 py-2.5">Utilisateur</th>
              <th scope="col" className="px-3 py-2.5">Rôle</th>
              <th scope="col" className="px-3 py-2.5">Département</th>
              <th scope="col" className="px-3 py-2.5">Équipe</th>
              <th scope="col" className="px-3 py-2.5">Statut</th>
              <th scope="col" className="px-2 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {users.map((user) => (
              <tr key={user.id} className="h-12 transition-colors hover:bg-[var(--surface-alt)]">
                <td className="px-3 py-1"><UserIdentity user={user} /></td>
                <td className="overflow-hidden px-3 py-1"><UserRoleBadge user={user} /></td>
                <td className="overflow-hidden px-3 py-1"><DirectoryBadge label={departmentName(user)} kind="department" /></td>
                <td className="overflow-hidden px-3 py-1"><DirectoryBadge label={teamName(user)} kind="team" /></td>
                <td className="px-3 py-1"><UserStatus active={user.isActive} /></td>
                <td className="px-2 py-1"><UserActions user={user} onEdit={onEdit} onToggle={onToggle} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-card)] md:hidden">
        <li className="list-none">{heading}</li>
        {users.map((user) => (
          <li key={user.id} className="px-3 py-3 transition-colors hover:bg-[var(--surface-alt)]">
            <div className="flex items-center justify-between gap-3">
              <UserIdentity user={user} />
              <UserActions user={user} onEdit={onEdit} onToggle={onToggle} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <UserRoleBadge user={user} />
              <UserStatus active={user.isActive} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <DirectoryBadge label={departmentName(user)} kind="department" />
              <DirectoryBadge label={teamName(user)} kind="team" />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { UserFormDialog } from "@/components/admin/users/user-form-dialog";
import { UserTable } from "@/components/admin/users/user-table";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FilterToolbar } from "@/components/ui/filter-toolbar";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/ui/page-container";
import { Select } from "@/components/ui/select";
import { ApiError } from "@/lib/api/client";
import { createAdminUser, listAdminDepartments, listAdminTeams, listAdminUsers, updateAdminUser, updateAdminUserStatus } from "@/lib/api/admin";
import type { AdminDepartment, AdminTeam, AdminUser, CreateAdminUserPayload, UpdateAdminUserPayload } from "@/types/admin";
import { ArrowUpRight, ChevronLeft, ChevronRight, RotateCcw, Search, SlidersHorizontal, UserPlus, Users, X } from "lucide-react";

type UserFilters = {
  search: string;
  role: string;
  departmentId: string;
  teamId: string;
  status: "all" | "active" | "inactive";
};

const initialFilters: UserFilters = {
  search: "",
  role: "",
  departmentId: "",
  teamId: "",
  status: "all",
};

const roleLabels: Record<string, string> = {
  ADMIN: "Administrateur",
  RH: "Ressources humaines",
  DIRECTION: "Direction",
  DIRECTEUR_DEPARTEMENT: "Directeur de département",
  CHEF_EQUIPE: "Chef d’équipe",
  EMPLOYE: "Employé",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<UserFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const editingUser = useMemo(
    () => users.find((user) => user.id === editingUserId) ?? null,
    [editingUserId, users],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextUsers, nextDepartments, nextTeams] = await Promise.all([
        listAdminUsers(),
        listAdminDepartments(),
        listAdminTeams(),
      ]);
      setUsers(nextUsers);
      setDepartments(nextDepartments);
      setTeams(nextTeams);
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Impossible de charger les données d'administration.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const create = async (payload: CreateAdminUserPayload) => {
    setFeedback(null);
    await createAdminUser(payload);
    setFeedback("Utilisateur créé avec succès.");
    await load();
    setIsCreateDialogOpen(false);
  };

  const update = async (payload: UpdateAdminUserPayload) => {
    if (!editingUserId) {
      return;
    }
    setFeedback(null);
    await updateAdminUser(editingUserId, payload);
    setFeedback("Utilisateur modifié avec succès.");
    setEditingUserId(null);
    await load();
  };

  const toggle = async (user: AdminUser) => {
    if (!window.confirm(`${user.isActive ? "Désactiver" : "Activer"} cet utilisateur ?`)) return;
    setFeedback(null);
    await updateAdminUserStatus(user.id, !user.isActive);
    setFeedback("Statut utilisateur mis à jour.");
    await load();
  };

  const formInitialValues = editingUser ? {
    firstName: editingUser.firstName,
    lastName: editingUser.lastName,
    email: editingUser.email,
    password: "",
    matricule: editingUser.matricule ?? "",
    function: editingUser.function ?? "",
    globalRole: editingUser.globalRole ?? "",
    departmentRole: editingUser.departmentRole ?? "",
    departmentId: editingUser.departmentId ?? "",
    teamId: editingUser.teamId ?? "",
  } : undefined;

  const filterTeams = useMemo(
    () => filters.departmentId
      ? teams.filter((team) => team.departmentId === filters.departmentId)
      : teams,
    [filters.departmentId, teams],
  );

  const filteredUsers = useMemo(() => {
    const search = filters.search.trim().toLocaleLowerCase("fr-FR");
    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLocaleLowerCase("fr-FR");
      const matchesSearch = !search || [
        fullName,
        user.email.toLocaleLowerCase("fr-FR"),
        user.matricule?.toLocaleLowerCase("fr-FR") ?? "",
        user.function?.toLocaleLowerCase("fr-FR") ?? "",
      ].some((value) => value.includes(search));
      const matchesRole = !filters.role || user.globalRole === filters.role || user.departmentRole === filters.role;
      const matchesDepartment = !filters.departmentId || user.departmentId === filters.departmentId;
      const matchesTeam = !filters.teamId || user.teamId === filters.teamId;
      const matchesStatus = filters.status === "all" || user.isActive === (filters.status === "active");
      return matchesSearch && matchesRole && matchesDepartment && matchesTeam && matchesStatus;
    });
  }, [filters, users]);

  const hasActiveFilters = Boolean(filters.search.trim() || filters.role || filters.departmentId || filters.teamId || filters.status !== "all");
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const updateFilters = (nextFilters: Partial<UserFilters>) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
    setPage(1);
  };
  const activeFilterBadges: Array<{ label: string; onRemove: () => void }> = [];
  if (filters.search.trim()) activeFilterBadges.push({ label: `Recherche : « ${filters.search.trim()} »`, onRemove: () => updateFilters({ search: "" }) });
  if (filters.role) activeFilterBadges.push({ label: `Rôle : ${roleLabels[filters.role] ?? filters.role}`, onRemove: () => updateFilters({ role: "" }) });
  if (filters.departmentId) {
    const departmentName = departments.find((department) => department.id === filters.departmentId)?.name ?? "Département";
    activeFilterBadges.push({ label: `Département : ${departmentName}`, onRemove: () => updateFilters({ departmentId: "", teamId: "" }) });
  }
  if (filters.teamId) {
    const teamName = teams.find((team) => team.id === filters.teamId)?.name ?? "Équipe";
    activeFilterBadges.push({ label: `Équipe : ${teamName}`, onRemove: () => updateFilters({ teamId: "" }) });
  }
  if (filters.status !== "all") activeFilterBadges.push({ label: `Statut : ${filters.status === "active" ? "Actif" : "Inactif"}`, onRemove: () => updateFilters({ status: "all" }) });

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
            Administration
          </div>
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.045em] text-[var(--text)] sm:text-[34px]">Utilisateurs</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--text-soft)]">
            Gérez les comptes, leurs rôles et leurs accès.
          </p>
        </div>
        <div className="relative flex flex-wrap items-center gap-3 lg:shrink-0">
          <div className="flex min-h-14 min-w-44 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/85 px-4 py-2.5 shadow-sm">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <Users className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-medium text-[var(--text-muted)]">Utilisateurs trouvés</p>
              <p className="text-lg font-bold leading-6 tabular-nums text-[var(--text)]" aria-live="polite" aria-busy={loading}>
                {loading || error ? <span className="text-[var(--text-muted)]">—</span> : filteredUsers.length}
              </p>
            </div>
          </div>
          <Button type="button" size="lg" className="min-h-14" onClick={() => setIsCreateDialogOpen(true)} leftIcon={<UserPlus className="h-4 w-4" />} rightIcon={<ArrowUpRight className="h-4 w-4" />}>
            Créer un utilisateur
          </Button>
        </div>
      </header>

        <UserFormDialog
          open={isCreateDialogOpen}
          departments={departments}
          teams={teams}
          mode="create"
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={(payload) => create(payload as CreateAdminUserPayload)}
        />
        <UserFormDialog
          open={Boolean(editingUser)}
          departments={departments}
          teams={teams}
          mode="edit"
          initialValues={formInitialValues}
          onOpenChange={(open) => {
            if (!open) setEditingUserId(null);
          }}
          onSubmit={(payload) => update(payload as UpdateAdminUserPayload)}
        />
      {feedback && <Alert tone="success" className="py-2 text-sm">{feedback}</Alert>}

      <FilterToolbar label="Filtres des utilisateurs" className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[var(--text)]">Filtres des utilisateurs</h2>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">Affinez la liste par nom, rôle ou affectation.</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--text-muted)]">
              {activeFilterBadges.length} {activeFilterBadges.length === 1 ? "filtre actif" : "filtres actifs"}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!hasActiveFilters}
              onClick={() => updateFilters(initialFilters)}
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              className="text-[var(--text-soft)]"
            >
              Effacer
            </Button>
          </div>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-[minmax(190px,1.4fr)_repeat(4,minmax(130px,1fr))]">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
            <Input
              aria-label="Recherche"
              placeholder="Nom, email, matricule..."
              value={filters.search}
              onChange={(event) => updateFilters({ search: event.target.value })}
              className="h-10 rounded-xl bg-[var(--surface)] pl-9 text-sm"
            />
          </div>
          <Select aria-label="Rôle" value={filters.role} onChange={(event) => updateFilters({ role: event.target.value })} className="h-10 rounded-xl bg-[var(--surface)] text-sm">
            <option value="">Tous les rôles</option>
            <option value="ADMIN">Administrateur</option>
            <option value="RH">Ressources humaines</option>
            <option value="DIRECTION">Direction</option>
            <option value="DIRECTEUR_DEPARTEMENT">Directeur de département</option>
            <option value="CHEF_EQUIPE">Chef d&apos;équipe</option>
            <option value="EMPLOYE">Employé</option>
          </Select>
          <Select aria-label="Département" value={filters.departmentId} onChange={(event) => updateFilters({ departmentId: event.target.value, teamId: "" })} className="h-10 rounded-xl bg-[var(--surface)] text-sm">
            <option value="">Tous les départements</option>
            {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
          </Select>
          <Select aria-label="Équipe" value={filters.teamId} onChange={(event) => updateFilters({ teamId: event.target.value })} className="h-10 rounded-xl bg-[var(--surface)] text-sm">
            <option value="">Toutes les équipes</option>
            {filterTeams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </Select>
          <Select aria-label="Statut" value={filters.status} onChange={(event) => updateFilters({ status: event.target.value as UserFilters["status"] })} className="h-10 rounded-xl bg-[var(--surface)] text-sm">
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </Select>
        </div>

        {activeFilterBadges.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-3" aria-label="Filtres sélectionnés">
            <span className="mr-1 text-xs font-medium text-[var(--text-muted)]">Filtres actifs</span>
            {activeFilterBadges.map(({ label, onRemove }) => (
              <button
                key={label}
                type="button"
                onClick={onRemove}
                aria-label={`Retirer ${label}`}
                className="inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--text-soft)] transition hover:border-[var(--brand)] hover:text-[var(--brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
              >
                <span className="truncate">{label}</span>
                <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </FilterToolbar>

      {error && <div><ErrorState title="Impossible de charger les utilisateurs." message={error} /><Button type="button" size="sm" variant="outline" onClick={() => void load()} className="mt-2">Réessayer</Button></div>}
      {loading && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex h-10 items-center border-b border-slate-200 bg-slate-50 px-4"><Skeleton className="h-3 w-40 rounded" /></div>
          {Array.from({ length: 6 }, (_, index) => <div key={index} className="flex h-[58px] items-center border-b border-slate-100 px-4 last:border-0"><Skeleton className="h-7 w-full max-w-[620px] rounded" /></div>)}
        </div>
      )}
        {!loading && !error && (
          <div className="space-y-3">
            {filteredUsers.length ? (
              <UserTable
                users={visibleUsers}
                departments={departments}
                teams={teams}
                totalCount={filteredUsers.length}
                onEdit={(user) => setEditingUserId(user.id)}
                onToggle={(user) => void toggle(user)}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-800">{users.length ? "Aucun résultat pour ces filtres." : "Aucun utilisateur trouvé."}</p>
                <p className="mt-1 text-xs text-slate-500">{users.length ? "Modifiez ou effacez les filtres pour afficher les comptes." : "Les comptes apparaîtront ici lorsqu&apos;ils seront disponibles."}</p>
              </div>
            )}
            {filteredUsers.length > 0 && (
              <footer className="flex flex-wrap items-center justify-between gap-3 px-1 pt-1 text-xs text-[var(--text-muted)]">
                <span>
                  Affichage <strong className="font-semibold text-[var(--text-soft)]">{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredUsers.length)}</strong> sur {filteredUsers.length}
                </span>
                {pageCount > 1 && (
                  <nav aria-label="Pagination des utilisateurs" className="flex items-center gap-2">
                    <Button type="button" size="icon-sm" variant="outline" className="size-9 rounded-full" aria-label="Page précédente" title="Page précédente" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <span aria-current="page" className="min-w-14 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-center font-medium tabular-nums text-[var(--text-soft)]">{currentPage} / {pageCount}</span>
                    <Button type="button" size="icon-sm" variant="outline" className="size-9 rounded-full" aria-label="Page suivante" title="Page suivante" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </nav>
                )}
              </footer>
            )}
          </div>
        )}
    </PageContainer>
  );
}

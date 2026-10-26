"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, Plus } from "lucide-react";
import { TeamFormDialog } from "@/components/admin/teams/team-form-dialog";
import { TeamTable } from "@/components/admin/teams/team-table";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PageContainer } from "@/components/ui/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { createAdminTeam, listAdminDepartments, listAdminTeams, listAdminUsers, updateAdminTeam } from "@/lib/api/admin";
import type { AdminDepartment, AdminTeam, AdminUser, TeamPayload, UpdateTeamPayload } from "@/types/admin";

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [leaders, setLeaders] = useState<AdminUser[]>([]);
  const [editing, setEditing] = useState<AdminTeam | undefined>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextTeams, nextDepartments, nextUsers] = await Promise.all([listAdminTeams(), listAdminDepartments(), listAdminUsers()]);
      setTeams(nextTeams);
      setDepartments(nextDepartments);
      setLeaders(nextUsers.filter((user) => user.departmentRole === "CHEF_EQUIPE"));
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Impossible de charger les équipes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async (payload: TeamPayload | UpdateTeamPayload) => {
    setIsSubmitting(true);
    try {
      if (editing) await updateAdminTeam(editing.id, payload);
      else await createAdminTeam(payload as TeamPayload);
      setEditing(undefined);
      setIsCreateOpen(false);
      setFeedback(editing ? "Équipe modifiée avec succès." : "Équipe créée avec succès.");
      await load();
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDialog = (open: boolean) => {
    if (!open) {
      setIsCreateOpen(false);
      setEditing(undefined);
    }
  };

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
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.045em] text-[var(--text)] sm:text-[34px]">Équipes</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--text-soft)]">
            Gérez les équipes, leur département et leur responsable.
          </p>
        </div>
        <div className="relative flex flex-wrap items-center gap-3 lg:shrink-0">
          <div className="flex min-h-14 min-w-44 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/85 px-4 py-2.5 shadow-sm">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-medium text-[var(--text-muted)]">Équipes trouvées</p>
              <p className="text-lg font-bold leading-6 tabular-nums text-[var(--text)]" aria-live="polite" aria-busy={loading}>
                {loading || error ? <span className="text-[var(--text-muted)]">—</span> : teams.length}
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="lg"
            className="min-h-14"
            onClick={() => {
              setEditing(undefined);
              setIsCreateOpen(true);
            }}
            disabled={loading || Boolean(error)}
            leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
            rightIcon={<ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
          >
            Créer une équipe
          </Button>
        </div>
      </header>
      <TeamFormDialog
        open={isCreateOpen || Boolean(editing)}
        team={editing}
        departments={departments}
        leaders={leaders}
        submitting={isSubmitting}
        onOpenChange={closeDialog}
        onSubmit={save}
      />
      {feedback && <Alert tone="success" className="py-2 text-sm">{feedback}</Alert>}
      {error && <div className="space-y-2"><ErrorState title="Impossible de charger les équipes." message={error} /><Button size="sm" variant="outline" type="button" onClick={() => void load()}>Réessayer</Button></div>}
      {loading && (
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="space-y-1.5"><Skeleton className="h-3 w-40 rounded" /><Skeleton className="h-2.5 w-56 rounded" /></div>
          </div>
          {Array.from({ length: 3 }, (_, index) => <div key={index} className="flex h-16 items-center gap-3 border-b border-[var(--line)] px-4 last:border-0"><Skeleton className="h-9 w-9 rounded-xl" /><Skeleton className="h-4 w-48 max-w-[45%] rounded" /></div>)}
        </div>
      )}
      {!loading && !error && teams.length === 0 && (
        <EmptyState
          title="Aucune équipe trouvée."
          description="Créez une équipe et rattachez-la à un département de votre organisation."
          action={<Button type="button" size="sm" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}>Créer une équipe</Button>}
        />
      )}
      {!loading && !error && teams.length > 0 && <TeamTable teams={teams} onEdit={setEditing} />}
    </PageContainer>
  );
}

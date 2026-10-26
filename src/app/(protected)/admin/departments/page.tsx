"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Building2, Plus } from "lucide-react";
import { DepartmentFormDialog } from "@/components/admin/departments/department-form-dialog";
import { DepartmentTable } from "@/components/admin/departments/department-table";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PageContainer } from "@/components/ui/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { createAdminDepartment, listAdminDepartments, updateAdminDepartment } from "@/lib/api/admin";
import type { AdminDepartment } from "@/types/admin";

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [editing, setEditing] = useState<AdminDepartment | undefined>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDepartments(await listAdminDepartments());
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Impossible de charger les départements.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async (name: string) => {
    setIsSubmitting(true);
    try {
      if (editing) await updateAdminDepartment(editing.id, { name });
      else await createAdminDepartment({ name });
      setEditing(undefined);
      setIsCreateOpen(false);
      setFeedback(editing ? "Département modifié avec succès." : "Département créé avec succès.");
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
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.045em] text-[var(--text)] sm:text-[34px]">Départements</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--text-soft)]">
            Gérez les départements de votre organisation et consultez les équipes associées.
          </p>
        </div>
        <div className="relative flex flex-wrap items-center gap-3 lg:shrink-0">
          <div className="flex min-h-14 min-w-44 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/85 px-4 py-2.5 shadow-sm">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <Building2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-medium text-[var(--text-muted)]">Départements trouvés</p>
              <p className="text-lg font-bold leading-6 tabular-nums text-[var(--text)]" aria-live="polite" aria-busy={loading}>
                {loading || error ? <span className="text-[var(--text-muted)]">—</span> : departments.length}
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
            Créer un département
          </Button>
        </div>
      </header>
      <DepartmentFormDialog
        open={isCreateOpen || Boolean(editing)}
        department={editing}
        submitting={isSubmitting}
        onOpenChange={closeDialog}
        onSubmit={save}
      />
      {feedback && <Alert tone="success" className="py-2 text-sm">{feedback}</Alert>}
      {error && <div className="space-y-2"><ErrorState title="Impossible de charger les départements." message={error} /><Button size="sm" variant="outline" type="button" onClick={() => void load()}>Réessayer</Button></div>}
      {loading && (
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="space-y-1.5"><Skeleton className="h-3 w-40 rounded" /><Skeleton className="h-2.5 w-56 rounded" /></div>
          </div>
          {Array.from({ length: 3 }, (_, index) => <div key={index} className="flex h-16 items-center gap-3 border-b border-[var(--line)] px-4 last:border-0"><Skeleton className="h-9 w-9 rounded-xl" /><Skeleton className="h-4 w-48 max-w-[45%] rounded" /></div>)}
        </div>
      )}
      {!loading && !error && departments.length === 0 && (
        <EmptyState
          title="Aucun département trouvé."
          description="Créez un département pour organiser les équipes de votre entreprise."
          action={<Button type="button" size="sm" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}>Créer un département</Button>}
        />
      )}
      {!loading && !error && departments.length > 0 && <DepartmentTable departments={departments} onEdit={setEditing} />}
    </PageContainer>
  );
}

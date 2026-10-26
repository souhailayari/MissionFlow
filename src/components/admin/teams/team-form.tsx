"use client";

import { useState, type FormEvent } from "react";
import { Building2, Plus, Save, UserRound, UsersRound } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AdminDepartment, AdminTeam, AdminUser, TeamPayload, UpdateTeamPayload } from "@/types/admin";

export function TeamForm({
  team,
  departments,
  leaders,
  mode,
  submitting = false,
  onSubmit,
  onCancel,
}: Readonly<{
  team?: AdminTeam;
  departments: AdminDepartment[];
  leaders: AdminUser[];
  mode: "create" | "edit";
  submitting?: boolean;
  onSubmit: (payload: TeamPayload | UpdateTeamPayload) => Promise<void>;
  onCancel: () => void;
}>) {
  const [name, setName] = useState(team?.name ?? "");
  const [departmentId, setDepartmentId] = useState(team?.departmentId ?? "");
  const [leaderId, setLeaderId] = useState(team?.leaderId ?? "");
  const [error, setError] = useState<string | null>(null);
  const isEdit = mode === "edit";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await onSubmit(isEdit
        ? { name, departmentId, leaderId: leaderId || undefined }
        : { name, departmentId });
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : "Impossible d'enregistrer l'équipe. Veuillez réessayer.");
    }
  };

  return (
    <form className="grid gap-0" onSubmit={(event) => void submit(event)}>
      <div className="space-y-5 px-6 py-6 sm:px-7">
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700">{error}</p>}
        <label htmlFor="team-name" className="block space-y-2 text-sm font-semibold text-slate-800">
          <span className="flex items-center justify-between gap-3">
            <span>Nom de l&apos;équipe <span className="text-rose-600" aria-hidden="true">*</span></span>
            <span className="text-xs font-medium text-slate-400">Obligatoire</span>
          </span>
          <span className="relative block">
            <UsersRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              id="team-name"
              required
              minLength={2}
              maxLength={120}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex. Équipe informatique"
              disabled={submitting}
              className="pl-10"
            />
          </span>
          <span className="block text-xs font-normal leading-5 text-slate-500">
            Entre 2 et 120 caractères.
          </span>
        </label>
        <label htmlFor="team-department" className="block space-y-2 text-sm font-semibold text-slate-800">
          <span className="flex items-center justify-between gap-3">
            <span>Département <span className="text-rose-600" aria-hidden="true">*</span></span>
            <span className="text-xs font-medium text-slate-400">Obligatoire</span>
          </span>
          <span className="relative block">
            <Building2 className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Select id="team-department" required value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} disabled={submitting} className="h-11 pl-10">
              <option value="">Sélectionner un département</option>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </Select>
          </span>
          <span className="block text-xs font-normal leading-5 text-slate-500">
            Ce rattachement détermine le périmètre de l&apos;équipe.
          </span>
        </label>
        {isEdit && (
          <label htmlFor="team-leader" className="block space-y-2 text-sm font-semibold text-slate-800">
            <span className="flex items-center justify-between gap-3">
              <span>Chef d&apos;équipe</span>
              <span className="text-xs font-medium text-slate-400">Facultatif</span>
            </span>
            <span className="relative block">
              <UserRound className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Select id="team-leader" value={leaderId} onChange={(event) => setLeaderId(event.target.value)} disabled={submitting} className="h-11 pl-10">
                <option value="">Aucun chef</option>
                {leaders.filter((leader) => leader.departmentId === departmentId).map((leader) => <option key={leader.id} value={leader.id}>{leader.firstName} {leader.lastName}</option>)}
              </Select>
            </span>
            <span className="block text-xs font-normal leading-5 text-slate-500">
              Seuls les utilisateurs du département sélectionné sont proposés.
            </span>
          </label>
        )}
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4 sm:flex-row sm:justify-end sm:px-7">
        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={submitting}>
          Annuler
        </Button>
        <Button
          type="submit"
          size="sm"
          isLoading={submitting}
          disabled={submitting}
          leftIcon={isEdit ? <Save className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
        >
          {isEdit ? "Enregistrer les modifications" : "Créer l’équipe"}
        </Button>
      </div>
    </form>
  );
}

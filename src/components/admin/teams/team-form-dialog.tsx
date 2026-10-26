"use client";

import { TeamForm } from "@/components/admin/teams/team-form";
import { UsersRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminDepartment, AdminTeam, AdminUser, TeamPayload, UpdateTeamPayload } from "@/types/admin";

export function TeamFormDialog({
  open,
  team,
  departments,
  leaders,
  submitting,
  onOpenChange,
  onSubmit,
}: Readonly<{
  open: boolean;
  team?: AdminTeam;
  departments: AdminDepartment[];
  leaders: AdminUser[];
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: TeamPayload | UpdateTeamPayload) => Promise<void>;
}>) {
  const mode = team ? "edit" : "create";

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!submitting) onOpenChange(nextOpen);
    }}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg gap-0 overflow-y-auto rounded-3xl border-slate-200 bg-white p-0 shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
        <DialogHeader className="gap-4 border-b border-slate-100 bg-gradient-to-br from-indigo-50 via-white to-white px-6 py-6 pr-14 sm:px-7 sm:py-7">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-white text-indigo-600 shadow-sm">
              <UsersRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600">
                Structure de l’organisation
              </span>
              <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900 sm:text-[22px]">
                {mode === "create" ? "Créer une équipe" : "Modifier l’équipe"}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="max-w-sm text-sm leading-6 text-slate-500">
            {mode === "create"
              ? "Ajoutez une équipe et rattachez-la à un département."
              : "Modifiez les informations et le responsable de cette équipe."}
          </DialogDescription>
        </DialogHeader>
        {open && (
          <TeamForm
            key={`${mode}-${team?.id ?? "new"}`}
            team={team}
            departments={departments}
            leaders={leaders}
            mode={mode}
            submitting={submitting}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

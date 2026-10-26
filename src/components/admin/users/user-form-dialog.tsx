"use client";

import { UserForm } from "@/components/admin/users/user-form";
import type { UserFormValues } from "@/components/admin/users/user-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  AdminDepartment,
  AdminTeam,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
  UserFormMode,
} from "@/types/admin";

export function UserFormDialog({
  open,
  departments,
  teams,
  mode,
  initialValues,
  onOpenChange,
  onSubmit,
}: Readonly<{
  open: boolean;
  departments: AdminDepartment[];
  teams: AdminTeam[];
  mode: UserFormMode;
  initialValues?: Partial<UserFormValues>;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateAdminUserPayload | UpdateAdminUserPayload) => Promise<void>;
}>) {
  const title = mode === "create" ? "Créer un utilisateur" : "Modifier l'utilisateur";
  const description = mode === "create"
    ? "Ajouter un nouvel utilisateur et définir son accès à l'organisation."
    : "Mettre à jour les informations de cet utilisateur.";

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => onOpenChange(nextOpen)}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-xl sm:max-w-2xl">
        <DialogHeader className="mb-0 shrink-0 border-b border-slate-200 bg-slate-50/70 px-5 py-4 pr-12 sm:px-6 sm:py-5">
          <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-slate-500">
            {description}
          </DialogDescription>
        </DialogHeader>
        {open && (
          <UserForm
            key={mode === "edit" ? initialValues?.email ?? "edit-user" : "create-user"}
            departments={departments}
            teams={teams}
            mode={mode}
            presentation="dialog"
            initialValues={initialValues}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

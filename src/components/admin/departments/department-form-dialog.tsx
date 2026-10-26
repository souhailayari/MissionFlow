"use client";

import { DepartmentForm } from "@/components/admin/departments/department-form";
import { Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminDepartment } from "@/types/admin";

export function DepartmentFormDialog({
  open,
  department,
  submitting,
  onOpenChange,
  onSubmit,
}: Readonly<{
  open: boolean;
  department?: AdminDepartment;
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => Promise<void>;
}>) {
  const mode = department ? "edit" : "create";

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!submitting) onOpenChange(nextOpen);
    }}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg gap-0 overflow-y-auto rounded-3xl border-slate-200 bg-white p-0 shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
        <DialogHeader className="gap-4 border-b border-slate-100 bg-gradient-to-br from-indigo-50 via-white to-white px-6 py-6 pr-14 sm:px-7 sm:py-7">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-white text-indigo-600 shadow-sm">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600">
                Structure de l’organisation
              </span>
              <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900 sm:text-[22px]">
                {mode === "create" ? "Créer un département" : "Modifier le département"}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="max-w-sm text-sm leading-6 text-slate-500">
            {mode === "create"
              ? "Ajoutez un département pour organiser les équipes de votre organisation."
              : "Modifiez le nom de ce département."}
          </DialogDescription>
        </DialogHeader>
        {open && (
          <DepartmentForm
            key={`${mode}-${department?.id ?? "new"}`}
            department={department}
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

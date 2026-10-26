"use client";

import { useState, type FormEvent } from "react";
import { Building2, Plus, Save } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminDepartment } from "@/types/admin";

export function DepartmentForm({
  department,
  mode,
  submitting = false,
  onSubmit,
  onCancel,
}: Readonly<{
  department?: AdminDepartment;
  mode: "create" | "edit";
  submitting?: boolean;
  onSubmit: (name: string) => Promise<void>;
  onCancel: () => void;
}>) {
  const [name, setName] = useState(department?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const isEdit = mode === "edit";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await onSubmit(name);
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : "Impossible d'enregistrer le département. Veuillez réessayer.");
    }
  };

  return (
    <form className="grid gap-0" onSubmit={(event) => void submit(event)}>
      <div className="space-y-5 px-6 py-6 sm:px-7">
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700">{error}</p>}
        <label htmlFor="department-name" className="block space-y-2 text-sm font-semibold text-slate-800">
          <span className="flex items-center justify-between gap-3">
            <span>Nom du département <span className="text-rose-600" aria-hidden="true">*</span></span>
            <span className="text-xs font-medium text-slate-400">Obligatoire</span>
          </span>
          <span className="relative block">
            <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              id="department-name"
              required
              minLength={2}
              maxLength={120}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex. Informatique"
              disabled={submitting}
              className="pl-10"
            />
          </span>
          <span className="block text-xs font-normal leading-5 text-slate-500">
            Entre 2 et 120 caractères.
          </span>
        </label>
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
          {isEdit ? "Enregistrer les modifications" : "Créer le département"}
        </Button>
      </div>
    </form>
  );
}

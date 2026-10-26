import type { ReactNode } from "react";

export function FormField({ id, label, required, error, children }: Readonly<{ id: string; label: string; required?: boolean; error?: string; children: ReactNode }>) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-700">
        {label}
        {required && <span aria-hidden="true" className="ml-1 text-red-600">*</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}
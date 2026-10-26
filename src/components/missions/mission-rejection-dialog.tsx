"use client";

import { useState } from "react";
import { z } from "zod";
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const rejectionSchema = z.object({ reason: z.string().trim().min(3, "Le motif doit contenir au moins 3 caractères.") });

export function MissionRejectionDialog({ onClose, onConfirm }: Readonly<{ onClose: () => void; onConfirm: (reason: string) => Promise<void> }>) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const result = rejectionSchema.safeParse({ reason });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Le motif du rejet est obligatoire.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm(result.data.reason);
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Une erreur est survenue. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-[min(520px,calc(100%-2rem))]">
        <DialogHeader className="pr-8">
          <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">Rejeter la mission</DialogTitle>
          <DialogDescription>Le motif sera enregistré dans l&apos;historique de validation.</DialogDescription>
        </DialogHeader>
        <div>
          <label htmlFor="rejection-reason" className="mb-1 block text-xs font-medium text-slate-700">Motif du rejet</label>
          <Textarea id="rejection-reason" rows={3} value={reason} onChange={(event) => setReason(event.target.value)} aria-invalid={Boolean(error)} />
        </div>
        {error && <Alert tone="danger" role="alert">{error}</Alert>}
        <DialogFooter>
          <Button type="button" size="sm" variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
          <Button type="button" size="sm" variant="danger" onClick={() => void submit()} disabled={isSubmitting}>{isSubmitting ? "Rejet en cours..." : "Rejeter la mission"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

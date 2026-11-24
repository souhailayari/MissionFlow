"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/api/auth";

const schema = z.object({
  password: z.string().min(12, "Le mot de passe doit contenir au moins 12 caractères.").max(128, "Le mot de passe ne peut pas dépasser 128 caractères."),
  confirmation: z.string(),
}).refine((values) => values.password === values.confirmation, {
  path: ["confirmation"],
  message: "Les mots de passe ne correspondent pas.",
});
type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [requestError, setRequestError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }: FormValues) => {
    if (!token) {
      setRequestError("Ce lien de réinitialisation est incomplet. Demandez un nouveau lien.");
      return;
    }
    setRequestError(null);
    try {
      await resetPassword(token, password);
      setSubmitted(true);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Ce lien n'est plus valide. Demandez-en un nouveau.");
    }
  };

  return <AuthShell
    title="Créer un nouveau mot de passe"
    description="Choisissez un mot de passe d'au moins 12 caractères. Ce lien ne peut être utilisé qu'une seule fois."
    sideTitle="Sécurisez votre compte."
    sideDescription="Un mot de passe robuste protège l’accès à vos demandes et aux informations de mission de votre organisation."
  >
    {submitted ? <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900">
      <p>Votre mot de passe a été modifié. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
      <Button type="button" onClick={() => router.replace("/login")} className="mt-4 h-12 w-full rounded-xl bg-[#4f46e5] text-sm font-semibold text-white hover:bg-[#4338ca]">Aller à la connexion</Button>
    </div> : <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="password" className="mb-2 block text-xs font-semibold text-[#26334d]">Nouveau mot de passe</label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} className="h-12 rounded-xl border-[#d9dfeb] bg-white pl-10 text-sm shadow-none focus-visible:border-[#4f46e5] focus-visible:ring-4 focus-visible:ring-indigo-100" />
        </div>
        {errors.password ? <p id="password-error" role="alert" className="mt-1.5 text-xs font-medium text-red-700">{errors.password.message}</p> : null}
      </div>

      <div>
        <label htmlFor="confirmation" className="mb-2 block text-xs font-semibold text-[#26334d]">Confirmer le nouveau mot de passe</label>
        <Input id="confirmation" type="password" autoComplete="new-password" {...register("confirmation")} aria-invalid={Boolean(errors.confirmation)} aria-describedby={errors.confirmation ? "confirmation-error" : undefined} className="h-12 rounded-xl border-[#d9dfeb] bg-white text-sm shadow-none focus-visible:border-[#4f46e5] focus-visible:ring-4 focus-visible:ring-indigo-100" />
        {errors.confirmation ? <p id="confirmation-error" role="alert" className="mt-1.5 text-xs font-medium text-red-700">{errors.confirmation.message}</p> : null}
      </div>
      {!token ? <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm leading-5 text-amber-900">Ce lien est incomplet. Demandez un nouveau lien de réinitialisation.</p> : null}
      {requestError ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700">{requestError}</p> : null}
      <Button type="submit" size="lg" isLoading={isSubmitting} disabled={isSubmitting || !token} className="h-12 w-full justify-between rounded-xl bg-[#4f46e5] px-4 text-sm font-semibold text-white hover:bg-[#4338ca] focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:opacity-70">
        {isSubmitting ? "Modification en cours..." : "Modifier le mot de passe"}
      </Button>
    </form>}

    <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#4f46e5] hover:underline"><ArrowLeft size={15} aria-hidden="true" /> Retour à la connexion</Link>
  </AuthShell>;
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="min-h-dvh bg-[#eef2f8]" />}><ResetPasswordForm /></Suspense>;
}

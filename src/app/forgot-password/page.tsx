"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Mail, QrCode } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { QrLoginPanel } from "@/components/auth/qr-login-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPasswordRecoveryOptions, requestPasswordReset, type PasswordRecoveryOptions, type PasswordResetChannel } from "@/lib/api/auth";
import { useSession } from "@/lib/auth/session-context";
import type { AuthResponse } from "@/types/auth";

const schema = z.object({ email: z.string().email("Saisissez une adresse email valide.") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { loginWithSession } = useSession();
  const [submitted, setSubmitted] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [channel, setChannel] = useState<PasswordResetChannel>("EMAIL");
  const [showQrLogin, setShowQrLogin] = useState(false);
  const [options, setOptions] = useState<PasswordRecoveryOptions["data"]>({ email: false, whatsapp: false });
  const [optionsStatus, setOptionsStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const handleQrSession = useCallback((session: AuthResponse) => {
    loginWithSession(session);
    router.replace("/dashboard");
  }, [loginWithSession, router]);

  useEffect(() => {
    let active = true;
    void getPasswordRecoveryOptions().then((response) => {
      if (!active) return;
      setOptions(response.data);
      setChannel(response.data.email ? "EMAIL" : response.data.whatsapp ? "WHATSAPP" : "EMAIL");
      setOptionsStatus("ready");
    }).catch(() => {
      if (active) setOptionsStatus("unavailable");
    });
    return () => { active = false; };
  }, []);

  const channelEnabled = channel === "EMAIL" ? options.email : options.whatsapp;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: FormValues) => {
    setRequestError(null);
    try {
      await requestPasswordReset(email.trim(), channel);
      setSubmitted(true);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "La demande n'a pas pu être envoyée. Réessayez.");
    }
  };

  return <AuthShell
    title="Mot de passe oublié ?"
    description="Saisissez l'adresse e-mail de votre compte et choisissez où recevoir le lien valable 30 minutes."
    sideTitle="Retrouvez l’accès à votre compte."
    sideDescription="Réinitialisez votre mot de passe en toute sécurité, ou connectez-vous directement avec MissionFlow mobile."
  >
    {submitted ? <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900">
      {channel === "WHATSAPP" ? "Si un compte actif avec un numéro WhatsApp existe, la demande a été prise en compte. Vérifiez WhatsApp." : "Si le compte existe, la demande a été prise en compte. Vérifiez votre boîte de réception et vos courriers indésirables."}
    </div> : <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="mb-2 block text-xs font-semibold text-[#26334d]">Adresse e-mail</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input id="email" type="email" autoComplete="email" placeholder="nom@entreprise.tn" {...register("email")} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} className="h-12 rounded-xl border-[#d9dfeb] bg-white pl-10 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[#4f46e5] focus-visible:ring-4 focus-visible:ring-indigo-100" />
        </div>
        {errors.email ? <p id="email-error" role="alert" className="mt-1.5 text-xs font-medium text-red-700">{errors.email.message}</p> : null}
      </div>

      <div role="radiogroup" aria-label="Méthode d'envoi" className="grid grid-cols-2 gap-2 rounded-xl bg-[#f1f3f8] p-1">
        {([{ value: "EMAIL", label: "Par e-mail", enabled: options.email }, { value: "WHATSAPP", label: "Par WhatsApp", enabled: options.whatsapp }] as const).map((option) => <button key={option.value} type="button" role="radio" aria-checked={channel === option.value} disabled={!option.enabled} onClick={() => setChannel(option.value)} className={`min-h-10 rounded-lg px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${channel === option.value ? "bg-white text-[#3730a3] shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>{option.label}</button>)}
      </div>
      {channel === "WHATSAPP" && options.whatsapp ? <p className="-mt-2 text-xs leading-5 text-slate-500">Le message sera envoyé au numéro WhatsApp déjà enregistré pour votre compte.</p> : null}
      {optionsStatus === "loading" ? <p role="status" className="text-xs leading-5 text-slate-500">Vérification des méthodes de récupération…</p> : null}
      {optionsStatus === "unavailable" ? <p role="alert" className="text-xs leading-5 text-amber-800">Impossible de contacter le serveur. Vérifiez que le backend est démarré, puis actualisez cette page.</p> : null}
      {optionsStatus === "ready" && !options.email && !options.whatsapp ? <p role="status" className="text-xs leading-5 text-amber-800">La récupération n&apos;est pas encore configurée sur ce serveur.</p> : null}
      {requestError ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700">{requestError}</p> : null}
      <Button type="submit" size="lg" isLoading={isSubmitting} disabled={isSubmitting || !channelEnabled} className="h-12 w-full justify-between rounded-xl bg-[#4f46e5] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.16)] transition hover:bg-[#4338ca] focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:opacity-70">
        {isSubmitting ? "Envoi en cours..." : "Envoyer le lien"}
      </Button>
    </form>}

    <div className="mt-5">
      <button type="button" onClick={() => setShowQrLogin((visible) => !visible)} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#dce2ed] bg-white px-4 text-sm font-semibold text-[#26334d] transition hover:border-[#4f46e5] hover:text-[#3730a3] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100">
        <QrCode size={17} aria-hidden="true" />
        {showQrLogin ? "Fermer la connexion mobile" : "Se connecter avec MissionFlow mobile"}
      </button>
      {showQrLogin && <QrLoginPanel onSession={handleQrSession} />}
    </div>

    <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#4f46e5] hover:underline"><ArrowLeft size={15} aria-hidden="true" /> Retour à la connexion</Link>
  </AuthShell>;
}

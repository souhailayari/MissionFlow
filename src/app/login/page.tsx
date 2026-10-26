"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import { useSession } from "@/lib/auth/session-context";

const loginSchema = z.object({
  email: z.string().email("Saisissez une adresse email valide."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginForm) => {
    try {
      await login(values.email, values.password);
    } catch (error) {
      const message = error instanceof ApiError && error.status === 401 ? "Email ou mot de passe incorrect." : error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer.";
      setError("root", { message });
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [router, status]);

  if (status !== "unauthenticated") {
    return null;
  }

  return (
    <main className="min-h-dvh overflow-hidden bg-[#f4f6fb] p-0 sm:p-3 lg:h-dvh lg:min-h-0 lg:p-5">
      <section className="mx-auto grid min-h-dvh w-full max-w-[1720px] overflow-hidden bg-white sm:min-h-[calc(100dvh-1.5rem)] sm:rounded-[28px] sm:border sm:border-[#e4e8f1] sm:shadow-[0_24px_80px_rgba(16,26,51,0.12)] lg:h-[calc(100dvh-2.5rem)] lg:min-h-0 lg:grid-cols-[minmax(0,1.08fr)_minmax(480px,0.92fr)] lg:grid-rows-[minmax(0,1fr)]">
        <aside className="login-brand-panel relative isolate flex min-h-[132px] flex-col justify-between overflow-hidden bg-[var(--navy)] px-5 py-4 text-white sm:min-h-0 sm:px-9 sm:py-5 lg:min-h-0 lg:px-10 lg:py-8 xl:px-[clamp(3rem,5vw,5.5rem)] xl:py-9">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#18264a_0%,#101a33_55%,#0b1226_100%)]" />
            <div className="absolute inset-0 opacity-[0.075] [background-image:linear-gradient(rgba(198,204,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(198,204,255,0.35)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(135deg,black,transparent_82%)]" />
            <div className="absolute inset-y-0 right-[14%] w-px bg-white/[0.045]" />
            <div className="absolute left-0 right-0 top-[21%] h-px bg-white/[0.045]" />
            <div className="absolute bottom-[16%] left-0 right-0 h-px bg-white/[0.045]" />
            <div className="absolute right-[10%] top-[28%] h-[340px] w-[340px] rounded-full border border-indigo-50/[0.08]">
              <span aria-hidden="true" className="login-circle-orbit absolute inset-0">
                <span className="login-circle-trail login-circle-trail--outer" />
                <span className="login-circle-point login-circle-point--outer" />
              </span>
            </div>
            <div className="absolute right-[16%] top-[34%] h-[220px] w-[220px] rounded-full border border-sky-50/[0.08]">
              <span aria-hidden="true" className="login-circle-orbit login-circle-orbit--inner absolute inset-0">
                <span className="login-circle-trail login-circle-trail--inner" />
                <span className="login-circle-point login-circle-point--inner" />
              </span>
            </div>
            <div className="absolute bottom-[25%] left-[12%] h-40 w-40 rounded-full bg-indigo-300/[0.1] blur-3xl" />
            <svg viewBox="0 0 520 560" aria-hidden="true" focusable="false" className="absolute right-[-6%] top-[17%] hidden h-[72%] w-[52%] opacity-[0.32] lg:block">
              <defs>
                <linearGradient id="login-architecture-stroke" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#c4b5fd" />
                  <stop offset="1" stopColor="#7dd3fc" />
                </linearGradient>
                <linearGradient id="login-signal-trail-sky" x1="0" y1="0.5" x2="1" y2="0.5">
                  <stop offset="0" stopColor="#7dd3fc" stopOpacity="0" />
                  <stop offset="0.7" stopColor="#7dd3fc" stopOpacity="0.1" />
                  <stop offset="1" stopColor="#7dd3fc" stopOpacity="0.28" />
                </linearGradient>
                <linearGradient id="login-signal-trail-lavender" x1="0" y1="0.5" x2="1" y2="0.5">
                  <stop offset="0" stopColor="#c4b5fd" stopOpacity="0" />
                  <stop offset="0.7" stopColor="#c4b5fd" stopOpacity="0.1" />
                  <stop offset="1" stopColor="#c4b5fd" stopOpacity="0.28" />
                </linearGradient>
                <filter id="login-signal-glow" x="-200%" y="-200%" width="500%" height="500%">
                  <feGaussianBlur stdDeviation="2.5" result="signal-blur" />
                  <feMerge>
                    <feMergeNode in="signal-blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g fill="none" stroke="url(#login-architecture-stroke)" strokeWidth="1">
                <path d="M260 54 408 138 260 222 112 138Z" />
                <path d="M112 138v164l148 84V222m148-84v164l-148 84" />
                <path d="m260 222 83 47-83 47-83-47Z" />
                <path d="M177 269v92l83 47v-92m83-47v92l-83 47" />
                <path d="M36 368h84l47-27h76l43-25h86l42-24h68" />
                <path d="M64 408h88l42-24h74l42-25h82l38-22h44" />
                <path d="M84 449h82l40-23h72l38-22h79l35-20h39" />
                <path d="M112 138 56 106m352 32 56-32M260 54V18m0 368v78" strokeOpacity=".55" />
                <path d="m75 150 72-42 72 42v83l-72 42-72-42Zm298 83 56-33 56 33v65l-56 32-56-32Z" strokeOpacity=".45" />
              </g>
              <g fill="#c4b5fd" stroke="#101a33" strokeWidth="5">
                <circle cx="56" cy="368" r="6" />
                <circle cx="167" cy="341" r="6" />
                <circle cx="243" cy="341" r="6" />
                <circle cx="362" cy="316" r="6" />
                <circle cx="452" cy="292" r="6" />
              </g>
              <g filter="url(#login-signal-glow)" aria-hidden="true">
                <g className="login-cube-signal-group">
                  <ellipse cx="-8" cy="0" rx="9" ry="2" fill="url(#login-signal-trail-sky)" />
                  <circle className="login-cube-signal" r="4" fill="#7dd3fc" />
                  <animateMotion dur="16s" repeatCount="indefinite" rotate="auto" path="M260 54 L408 138 L408 302 L260 386 L112 302 L112 138 Z" />
                </g>
                <g className="login-cube-signal-group">
                  <ellipse cx="-7" cy="0" rx="8" ry="1.8" fill="url(#login-signal-trail-lavender)" />
                  <circle className="login-cube-signal" r="3.5" fill="#c4b5fd" />
                  <animateMotion dur="11s" repeatCount="indefinite" rotate="auto" path="M260 222 L343 269 L343 361 L260 408 L177 361 L177 269 Z" />
                </g>
                <g className="login-cube-signal-group">
                  <ellipse cx="-6" cy="0" rx="7" ry="1.6" fill="url(#login-signal-trail-sky)" />
                  <circle className="login-cube-signal" r="3" fill="#7dd3fc" />
                  <animateMotion dur="13s" repeatCount="indefinite" rotate="auto" path="M75 150 L147 108 L219 150 L219 233 L147 275 L75 233 Z" />
                </g>
                <g className="login-cube-signal-group">
                  <ellipse cx="-6" cy="0" rx="7" ry="1.6" fill="url(#login-signal-trail-lavender)" />
                  <circle className="login-cube-signal" r="3" fill="#c4b5fd" />
                  <animateMotion dur="9s" repeatCount="indefinite" rotate="auto" path="M373 233 L429 200 L485 233 L485 298 L429 330 L373 298 Z" />
                </g>
              </g>
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-100/20 bg-white/[0.07] text-indigo-100">
                <ShieldCheck className="h-[19px] w-[19px]" strokeWidth={1.65} aria-hidden="true" />
                <span aria-hidden="true" className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full border border-[#101a33] bg-sky-300" />
              </span>
              <div>
                <p className="text-[17px] font-semibold leading-none tracking-[-0.045em] text-white">MissionFlow</p>
                <p className="mt-2 text-[8px] font-medium uppercase tracking-[0.22em] text-slate-400">Gestion des ordres de mission</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-slate-500 lg:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-300/80" />
              MF / WORKSPACE
            </div>
          </div>

          <div className="login-hero relative z-10 mt-9 hidden lg:my-auto lg:mt-0 lg:block lg:max-w-[660px] lg:py-6 xl:py-8">
            <div className="login-hero-label mb-5 flex items-center gap-3">
              <span className="font-mono text-[9px] tracking-[0.18em] text-indigo-200/80">01—03</span>
              <span className="h-px w-8 bg-indigo-200/40" />
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">Mission control</p>
            </div>
            <h1 className="login-headline max-w-[680px] text-[clamp(2.15rem,3.9vw,4.25rem)] font-medium leading-[1.055] tracking-[-0.065em] text-[#f4f5ff]">
              <span className="login-headline-line login-headline-line--one">Chaque mission.</span>
              <span className="login-headline-line login-headline-line--two">Chaque validation.</span>
              <span className="login-headline-line login-headline-line--three">Chaque décision.</span>
              <span className="login-headline-line login-headline-line--final relative inline-block text-[#c3c7ff]">
                Un seul flux.
                <span aria-hidden="true" className="login-headline-underline absolute -bottom-2 left-0 h-px w-[72%] bg-sky-200/60" />
              </span>
            </h1>
            <p className="login-description mt-6 max-w-[410px] text-[13px] leading-6 text-slate-400 sm:text-sm sm:leading-7">
              Du déplacement à la décision, chaque étape reste lisible, structurée et sous contrôle.
            </p>

            <div className="login-workflow mt-8 max-w-[520px] rounded-2xl border border-white/[0.09] bg-[#172445]/80 lg:mt-10">
              <div className="login-workflow-header flex items-center justify-between border-b border-white/[0.08] px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="grid h-5 w-5 grid-cols-2 gap-[2px]">
                    <i className="bg-indigo-200/80" />
                    <i className="bg-white/20" />
                    <i className="bg-white/20" />
                    <i className="bg-white/20" />
                  </span>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-300">Circuit de traitement</p>
                </div>
                <span className="font-mono text-[9px] tracking-[0.08em] text-slate-500">03 ÉTAPES</span>
              </div>
              <div className="login-workflow-body grid grid-cols-[64px_1fr] px-4 py-3 sm:grid-cols-[80px_1fr] sm:px-5 sm:py-4">
                <div className="flex flex-col items-center">
                  <span className="font-mono text-[8px] tracking-[0.1em] text-slate-500">01</span>
                  <span className="login-workflow-node login-workflow-node--one relative my-1 flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-200/25 bg-indigo-200/[0.08]">
                    <span className="h-2 w-2 rounded-full bg-indigo-200" />
                  </span>
                  <span aria-hidden="true" className="login-workflow-connector login-workflow-connector--one relative h-5 w-px bg-gradient-to-b from-indigo-200/50 to-white/10" />
                  <span className="font-mono text-[8px] tracking-[0.1em] text-slate-500">02</span>
                    <span className="login-workflow-node login-workflow-node--two my-1 flex h-8 w-8 items-center justify-center border border-white/15 bg-white/[0.025]">
                    <span className="h-2 w-2 border border-slate-400 bg-[#14213d]" />
                  </span>
                  <span aria-hidden="true" className="login-workflow-connector login-workflow-connector--two relative h-5 w-px bg-white/10" />
                  <span className="font-mono text-[8px] tracking-[0.1em] text-slate-500">03</span>
                    <span className="login-workflow-node login-workflow-node--three my-1 flex h-8 w-8 items-center justify-center border border-white/15 bg-white/[0.025]">
                    <span className="h-2 w-2 border border-slate-500 bg-[#14213d]" />
                  </span>
                </div>
                <div className="flex flex-col justify-between py-5">
                  <div className="login-workflow-step login-workflow-step--one flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-slate-200">Demande</p>
                      <p className="mt-1 text-[10px] text-slate-500">Création &amp; préparation</p>
                    </div>
                    <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-cyan-200/80">Initiée</span>
                  </div>
                  <div className="my-3 h-px bg-white/[0.055]" />
                  <div className="login-workflow-step login-workflow-step--two flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-slate-300">Validation</p>
                      <p className="mt-1 text-[10px] text-slate-500">Revue du circuit</p>
                    </div>
                    <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-slate-500">En cours</span>
                  </div>
                  <div className="my-3 h-px bg-white/[0.055]" />
                  <div className="login-workflow-step login-workflow-step--three flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Finalisation</p>
                      <p className="mt-1 text-[10px] text-slate-500">Ressources &amp; clôture</p>
                    </div>
                    <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-slate-600">À venir</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-4 flex items-center justify-between gap-3 border-t border-white/[0.09] pt-3 text-[10px] text-slate-400 sm:mt-5 sm:pt-4 lg:mt-0 lg:pt-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-indigo-200/80" strokeWidth={1.8} aria-hidden="true" />
              <span>Environnement sécurisé</span>
              <span aria-hidden="true" className="h-1 w-1 bg-slate-600" />
              <span>Accès professionnel</span>
            </div>
            <span className="hidden font-mono tracking-[0.12em] text-slate-600 lg:inline">MF—01</span>
          </div>
        </aside>

        <div className="login-right relative flex min-w-0 flex-col justify-center bg-[var(--surface-alt)] px-6 py-10 sm:px-10 sm:py-12 lg:min-h-0 lg:px-12 xl:px-[clamp(3.5rem,7vw,8rem)]">
          <div className="login-context mb-8 flex items-center justify-between lg:absolute lg:left-12 lg:right-12 lg:top-10 xl:left-[clamp(3.5rem,7vw,8rem)] xl:right-[clamp(3.5rem,7vw,8rem)]">
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.19em] text-slate-500">
              <span className="h-px w-5 bg-indigo-600/50" />
              Espace professionnel
            </div>
            <span className="flex h-[58px] w-[90px] shrink-0 items-center justify-center rounded-xl border border-[#e4e8f1] bg-white px-2 py-1 shadow-sm sm:h-[64px] sm:w-[98px]">
              <Image
                src="/images/ige-medicale.png"
                alt="IGE Médicale — Est. 1968"
                width={243}
                height={178}
                className="h-full w-full object-contain"
                priority
              />
            </span>
          </div>

          <div className="login-content relative mx-auto w-full max-w-[410px] rounded-[24px] border border-[#e4e8f1] bg-[linear-gradient(145deg,#fbfbff_0%,#f5f6ff_58%,#f6faff_100%)] p-5 shadow-[0_18px_50px_rgba(16,26,51,0.08)] sm:p-7 lg:p-8">
            <div className="login-heading-rule mb-7 h-px w-10 bg-[var(--brand)] lg:mb-9" />
            <h2 className="text-[clamp(1.9rem,3vw,2.65rem)] font-medium leading-[1.1] tracking-[-0.06em] text-[var(--text)]">
              Bienvenue dans<br /><span className="text-[var(--brand)]">MissionFlow</span>
            </h2>
              <p className="mt-4 max-w-[340px] text-sm leading-6 text-[var(--text-soft)] sm:text-[15px]">
              Connectez-vous pour accéder à vos missions et à leur suivi.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="login-form mt-9 space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="mb-2 block text-[12px] font-semibold tracking-[0.01em] text-[var(--text)]">Adresse email</label>
                <div className="group relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[var(--brand)]" strokeWidth={1.7} aria-hidden="true" />
                  <Input id="email" type="email" autoComplete="email" placeholder="nom@entreprise.fr" {...register("email")} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} className="h-[54px] rounded-xl border-[var(--line)] bg-[var(--surface)] pl-11 pr-4 text-sm text-[var(--text)] transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-slate-400 hover:border-[var(--line-strong)] focus-visible:border-[var(--brand)] focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-[var(--brand)]/10" />
                </div>
                {errors.email && <p id="email-error" role="alert" className="mt-1.5 text-xs font-medium text-red-700">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-[12px] font-semibold tracking-[0.01em] text-[var(--text)]">Mot de passe</label>
                <div className="group relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[var(--brand)]" strokeWidth={1.7} aria-hidden="true" />
                  <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Saisissez votre mot de passe" {...register("password")} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} className="h-[54px] rounded-xl border-[var(--line)] bg-[var(--surface)] py-2 pl-11 pr-12 text-sm text-[var(--text)] transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-slate-400 hover:border-[var(--line-strong)] focus-visible:border-[var(--brand)] focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-[var(--brand)]/10" />
                  <button type="button" onClick={() => setShowPassword((open) => !open)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} className="absolute inset-y-1 right-1 inline-flex w-11 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-indigo-50 hover:text-[var(--brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus)]/50">
                    {showPassword ? <EyeOff className="h-[17px] w-[17px]" aria-hidden="true" /> : <Eye className="h-[17px] w-[17px]" aria-hidden="true" />}
                  </button>
                </div>
                {errors.password && <p id="password-error" role="alert" className="mt-1.5 text-xs font-medium text-red-700">{errors.password.message}</p>}
              </div>

              {errors.root && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700">{errors.root.message}</p>}

              <Button type="submit" size="lg" isLoading={isSubmitting} disabled={isSubmitting} className="mt-2 h-[54px] w-full justify-between rounded-xl bg-[var(--brand)] px-5 text-[13px] font-semibold tracking-[0.01em] text-white shadow-[0_8px_20px_rgba(79,70,229,0.18)] transition duration-200 hover:-translate-y-px hover:bg-[var(--brand-strong)] hover:shadow-[0_12px_24px_rgba(79,70,229,0.24)] active:translate-y-0 focus-visible:ring-4 focus-visible:ring-[var(--focus)]/20 disabled:translate-y-0 disabled:shadow-none" rightIcon={!isSubmitting ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : undefined}>
                {isSubmitting ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>

            <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3" aria-hidden="true">
              <span className="h-px bg-slate-200" />
              <span className="font-mono text-[8px] tracking-[0.15em] text-slate-400">SESSION PRIVÉE</span>
              <span className="h-px bg-slate-200" />
            </div>
            <div className="login-security mt-5 flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" strokeWidth={1.75} aria-hidden="true" />
              <p className="text-[11px] leading-[1.65] text-slate-500">
                <span className="font-semibold text-slate-700">Connexion sécurisée.</span>{" "}
                L’accès est réservé aux utilisateurs autorisés de votre organisation.
              </p>
            </div>
          </div>
          <div className="login-bottom mt-10 flex items-center justify-between border-t border-slate-200/80 pt-4 text-[9px] font-medium uppercase tracking-[0.12em] text-slate-400 lg:absolute lg:bottom-8 lg:left-12 lg:right-12 lg:mt-0 lg:border-0 lg:pt-0 xl:left-[clamp(3.5rem,7vw,8rem)] xl:right-[clamp(3.5rem,7vw,8rem)]">
            <span>MissionFlow</span>
            <span>Gestion des déplacements professionnels</span>
          </div>
        </div>
      </section>
      <style jsx>{`
        @keyframes login-enter {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes login-headline-reveal {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes login-headline-rule-in {
          to { transform: scaleX(1); }
        }
        @keyframes login-headline-sweep {
          0% { opacity: 0; transform: translateX(-120%); }
          12% { opacity: 0.9; }
          78% { opacity: 0.65; transform: translateX(420%); }
          100% { opacity: 0; transform: translateX(480%); }
        }
        @keyframes login-workflow-node-cycle {
          0%, 10% {
            border-color: rgba(165, 180, 252, 0.62);
            background: rgba(165, 180, 252, 0.14);
            box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.08), 0 0 18px rgba(125, 211, 252, 0.12);
            transform: scale(1.04);
          }
          20%, 100% {
            border-color: rgba(255, 255, 255, 0.15);
            background: rgba(255, 255, 255, 0.025);
            box-shadow: none;
            transform: scale(1);
          }
        }
        @keyframes login-workflow-step-cycle {
          0%, 10% { background: rgba(125, 211, 252, 0.055); box-shadow: inset 2px 0 rgba(125, 211, 252, 0.65); }
          20%, 100% { background: transparent; box-shadow: inset 2px 0 transparent; }
        }
        @keyframes login-workflow-travel {
          0% { top: 0; opacity: 0; }
          3% { opacity: 1; }
          17% { top: calc(100% - 6px); opacity: 0.9; }
          20%, 100% { top: calc(100% - 6px); opacity: 0; }
        }
        @keyframes login-circle-spin {
          to { transform: rotate(360deg); }
        }
        .login-content { animation: login-enter 500ms ease-out both; }
        .login-headline-line { display: block; animation: login-headline-reveal 600ms cubic-bezier(0.2, 0.75, 0.25, 1) both; }
        .login-headline-line--two { animation-delay: 120ms; }
        .login-headline-line--three { animation-delay: 240ms; }
        .login-headline-line--final { animation-delay: 360ms; }
        .login-headline-underline { transform: scaleX(0); transform-origin: left center; animation: login-headline-rule-in 450ms 900ms cubic-bezier(0.2, 0.75, 0.25, 1) both; }
        .login-headline-underline::after {
          position: absolute;
          top: -1px;
          left: 0;
          width: 22%;
          height: 3px;
          border-radius: 999px;
          background: linear-gradient(90deg, transparent, #e0f2fe, transparent);
          box-shadow: 0 0 10px rgba(125, 211, 252, 0.65);
          content: "";
          opacity: 0;
          animation: login-headline-sweep 950ms 1.25s ease-out both;
        }
        .login-circle-orbit { border-radius: 999px; animation: login-circle-spin 22s linear infinite; }
        .login-circle-orbit--inner { animation-duration: 15s; animation-direction: reverse; }
        .login-circle-point {
          position: absolute;
          top: 0;
          left: 50%;
          width: 7px;
          height: 7px;
          border-radius: 999px;
          transform: translate(-50%, -50%);
        }
        .login-circle-point--outer { background: #7dd3fc; box-shadow: 0 0 0 2px rgba(125, 211, 252, 0.12), 0 0 16px 3px rgba(125, 211, 252, 0.78); }
        .login-circle-point--inner { width: 6px; height: 6px; background: #c4b5fd; box-shadow: 0 0 0 2px rgba(196, 181, 253, 0.12), 0 0 14px 3px rgba(196, 181, 253, 0.76); }
        .login-circle-trail {
          position: absolute;
          top: 0;
          left: 50%;
          width: 16px;
          height: 3px;
          border-radius: 999px;
          filter: blur(1.5px);
          opacity: 0.55;
          transform: translate(-100%, -50%);
        }
        .login-circle-trail--outer { background: linear-gradient(90deg, transparent, rgba(125, 211, 252, 0.4)); }
        .login-circle-trail--inner { background: linear-gradient(90deg, rgba(196, 181, 253, 0.4), transparent); transform: translate(0, -50%); }
        .login-cube-signal { opacity: 0.92; }
        .login-cube-signal-group > ellipse { opacity: 0.68; }
        .login-workflow-node { animation: login-workflow-node-cycle 6s ease-in-out infinite; }
        .login-workflow-step { animation: login-workflow-step-cycle 6s ease-in-out infinite; }
        .login-workflow-node--two,
        .login-workflow-step--two { animation-delay: -4s; }
        .login-workflow-node--three,
        .login-workflow-step--three { animation-delay: -2s; }
        .login-workflow-step { min-width: 0; border-radius: 0.5rem; margin-inline: -0.5rem; padding-inline: 0.5rem; }
        .login-workflow-connector::after {
          position: absolute;
          top: 0;
          left: -1px;
          width: 3px;
          height: 6px;
          border-radius: 999px;
          background: #a5f3fc;
          box-shadow: 0 0 10px rgba(125, 211, 252, 0.8);
          content: "";
          opacity: 0;
          animation: login-workflow-travel 6s linear infinite;
        }
        .login-workflow-connector--one::after { animation-delay: 850ms; }
        .login-workflow-connector--two::after { animation-delay: 2850ms; }
        @media (min-width: 1024px) and (max-height: 900px) {
          .login-brand-panel { padding-block: clamp(1.125rem, 3vh, 1.5rem); }
          .login-hero { padding-block: clamp(0rem, 1.5vh, 0.75rem); }
          .login-hero-label { margin-bottom: clamp(0.625rem, 1.8vh, 1rem); }
          .login-headline { font-size: clamp(2rem, 3.65vw, 3.25rem); }
          .login-description { margin-top: clamp(0.75rem, 2vh, 1.125rem); line-height: 1.45; }
          .login-workflow { margin-top: clamp(0.875rem, 2.4vh, 1.25rem); }
          .login-workflow-header { padding-block: clamp(0.4rem, 1.2vh, 0.625rem); }
          .login-workflow-body { padding-block: clamp(0.4rem, 1.2vh, 0.625rem); }
          .login-right { padding-block: clamp(1rem, 3vh, 1.5rem); }
          .login-context { top: clamp(0.75rem, 2.2vh, 1.25rem); }
          .login-bottom { bottom: clamp(0.75rem, 2.2vh, 1.25rem); }
          .login-form { margin-top: clamp(1.25rem, 3.5vh, 2rem); gap: clamp(0.75rem, 2vh, 1.25rem); }
          .login-heading-rule { margin-bottom: clamp(0.75rem, 2vh, 1.25rem); }
          .login-security { margin-top: clamp(0.875rem, 2.5vh, 1.25rem); }
        }
        @media (min-width: 1024px) and (max-height: 820px) {
          .login-brand-panel { padding-block: 0.875rem; }
          .login-hero { margin-top: 0; padding-block: 0; }
          .login-hero-label { margin-bottom: 0.625rem; }
          .login-headline { font-size: clamp(1.95rem, 3.1vw, 2.7rem); line-height: 1.02; }
          .login-description { margin-top: 0.625rem; font-size: 0.75rem; line-height: 1.35; }
          .login-workflow { margin-top: 0.75rem; }
          .login-workflow-header { padding-block: 0.375rem; }
          .login-workflow-body { padding-block: 0.375rem; }
          .login-workflow-body > div:first-child > span:nth-child(2),
          .login-workflow-body > div:first-child > span:nth-child(5),
          .login-workflow-body > div:first-child > span:nth-child(8) { width: 1.5rem; height: 1.5rem; }
          .login-workflow-body > div:first-child > span:nth-child(3),
          .login-workflow-body > div:first-child > span:nth-child(6) { height: 0.75rem; }
          .login-right { padding-block: 0.875rem; }
          .login-context { top: 0.75rem; }
          .login-bottom { bottom: 0.75rem; }
          .login-content { max-width: 390px; }
          .login-heading-rule { margin-bottom: 0.75rem; }
          .login-content h2 { font-size: clamp(1.7rem, 2.2vw, 2.05rem); }
          .login-content h2 + p { margin-top: 0.625rem; font-size: 0.8125rem; line-height: 1.4; }
          .login-form { margin-top: 1rem; gap: 0.75rem; }
          .login-form input { height: 46px; }
          .login-form button[type="submit"] { height: 46px; }
          .login-security { margin-top: 0.75rem; }
          .login-content > div[aria-hidden="true"] { margin-top: 0.75rem; }
          .login-content > div[aria-hidden="true"] + div { margin-top: 0.75rem; }
        }
        @media (min-width: 1024px) and (max-height: 740px) {
          .login-headline { font-size: clamp(1.8rem, 2.7vw, 2.3rem); }
          .login-workflow-body { grid-template-columns: 2.75rem 1fr; }
          .login-workflow-body > div:last-child { padding-block: 0.5rem; }
          .login-workflow-body > div:last-child > div > div > p + p { display: none; }
          .login-right { overflow-y: auto; padding-block: 0.5rem; }
          .login-context, .login-bottom { position: static; }
          .login-context { margin-bottom: 0.75rem; }
          .login-content { padding: 1rem; }
          .login-bottom { margin-top: 1rem; }
        }
        @media (max-height: 700px) and (max-width: 1023px) {
          .login-right { padding-block: clamp(1.25rem, 4vh, 2rem); }
          .login-context { margin-bottom: clamp(1rem, 3vh, 1.5rem); }
          .login-content h2 { font-size: clamp(1.75rem, 6vw, 2.25rem); }
          .login-heading-rule { margin-bottom: 1rem; }
          .login-form { margin-top: 1.5rem; gap: 1rem; }
          .login-security { margin-top: 1rem; }
          .login-bottom { margin-top: 1.5rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .login-content { animation: none; }
          .login-headline-line,
          .login-headline-underline,
          .login-headline-underline::after { animation: none; opacity: 1; transform: none; }
          .login-headline-underline::after { display: none; }
          .login-workflow-node,
          .login-workflow-step,
          .login-workflow-connector::after,
          .login-circle-orbit { animation: none; }
          .login-cube-signal-group { display: none; }
          .login-workflow-step--one { background: rgba(125, 211, 252, 0.055); box-shadow: inset 2px 0 rgba(125, 211, 252, 0.65); }
        }
      `}</style>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, CircleCheck, LockKeyhole, LoaderCircle, Mail, ShieldCheck, User, UserPlus } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import { createInitialAdmin, getSetupStatus, type SetupAdminPayload } from "@/lib/api/setup";

const setupSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est obligatoire."),
  lastName: z.string().trim().min(1, "Le nom est obligatoire."),
  email: z.string().email("Saisissez une adresse email valide."),
  setupToken: z.string().min(32, "Le code d’initialisation doit contenir au moins 32 caractères."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  passwordConfirmation: z.string().min(8, "Confirmez le mot de passe.")
}).superRefine((values, context) => {
  if (values.password !== values.passwordConfirmation) context.addIssue({ code: "custom", path: ["passwordConfirmation"], message: "Les mots de passe ne correspondent pas." });
});

type SetupForm = z.infer<typeof setupSchema>;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError && (error.status === 409 || error.status === 403)) return "Accès de configuration fermé. Le compte administrateur initial existe déjà.";
  if (error instanceof ApiError) return error.message;
  return "Le serveur est inaccessible. Vérifiez que le backend est démarré puis réessayez.";
};

export default function MissionflowAdminSetupPage() {
  const [isChecking, setIsChecking] = useState(true);
  const [closed, setClosed] = useState(false);
  const [created, setCreated] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<SetupForm>({ resolver: zodResolver(setupSchema) });

  useEffect(() => {
    void getSetupStatus()
      .then(({ configured }) => setClosed(configured))
      .catch(() => setError("root", { message: "Le statut de configuration est indisponible. Vérifiez que le backend est démarré." }))
      .finally(() => setIsChecking(false));
  }, [setError]);

  const onSubmit: SubmitHandler<SetupForm> = async (values) => {
    setApiError(null);
    try {
      const { setupToken, ...payload } = values;
      await createInitialAdmin(payload as SetupAdminPayload, setupToken);
      setCreated(true);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 403 || error.status === 409)) setClosed(true);
      else if (error instanceof ApiError && error.status === 400) setError("root", { message: error.message });
      else setApiError(getErrorMessage(error));
    }
  };

  if (isChecking) return <SetupShell><div className="setup-state" role="status" aria-live="polite"><span className="setup-state-icon"><LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /></span><div><p className="setup-eyebrow">Initialisation sécurisée</p><h1 className="setup-state-title">Vérification de la configuration...</h1><p className="setup-state-copy">Nous vérifions que cet espace peut être initialisé.</p></div></div></SetupShell>;
  if (closed) return <SetupShell><div className="setup-state setup-state-closed"><span className="setup-state-icon"><LockKeyhole className="h-5 w-5" aria-hidden="true" /></span><div><p className="setup-eyebrow">Configuration fermée</p><h1 className="setup-state-title">Configuration déjà effectuée</h1><p className="setup-state-copy">Le compte administrateur initial existe déjà. Connectez-vous pour accéder à MissionFlow.</p><LoginLink /></div></div></SetupShell>;
  if (created) return <SetupShell><div className="setup-state setup-state-created"><span className="setup-state-icon"><CircleCheck className="h-5 w-5" aria-hidden="true" /></span><div><p className="setup-eyebrow">Configuration terminée</p><h1 className="setup-state-title">Compte ADMIN créé avec succès</h1><p className="setup-state-copy">Vous pouvez maintenant vous connecter avec les identifiants définis.</p><LoginLink /></div></div></SetupShell>;

  return (
    <SetupShell>
      <div className="setup-form-intro">
        <p className="setup-eyebrow">Initialisation</p>
        <h1 className="setup-title">Configuration administrateur</h1>
        <p className="setup-description">Créez le compte administrateur initial de cette installation.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="setup-form" noValidate>
        <div className="setup-name-fields">
          <SetupField id="firstName" label="Prénom" register={register} error={errors.firstName?.message} />
          <SetupField id="lastName" label="Nom" register={register} error={errors.lastName?.message} />
        </div>
        <SetupField id="email" label="Email" type="email" register={register} error={errors.email?.message} />
        <SetupField id="setupToken" label="Code d’initialisation fourni par l’opérateur" type="password" register={register} error={errors.setupToken?.message} />
        <SetupField id="password" label="Mot de passe" type="password" register={register} error={errors.password?.message} />
        <SetupField id="passwordConfirmation" label="Confirmation du mot de passe" type="password" register={register} error={errors.passwordConfirmation?.message} />
        {errors.root && <p role="alert" className="setup-error"><AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />{errors.root.message}</p>}
        {apiError && <p role="alert" className="setup-error"><AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />{apiError}</p>}
        <Button type="submit" size="lg" isLoading={isSubmitting} disabled={isSubmitting} className="setup-submit" rightIcon={!isSubmitting ? <UserPlus className="h-4 w-4" aria-hidden="true" /> : undefined}>
          {isSubmitting ? "Création en cours..." : "Créer le compte ADMIN"}
        </Button>
      </form>
    </SetupShell>
  );
}

function SetupShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="setup-page">
      <section className="setup-frame">
        <aside className="setup-brand">
          <div aria-hidden="true" className="setup-grid" />
          <div className="setup-brand-lockup">
            <span className="setup-brand-mark"><ShieldCheck className="h-[19px] w-[19px]" strokeWidth={1.7} aria-hidden="true" /><i /></span>
            <div>
              <p className="setup-brand-name">MissionFlow</p>
              <p className="setup-brand-caption">Administration sécurisée</p>
            </div>
            <span className="setup-coordinate">MF / INIT</span>
          </div>

          <div className="setup-brand-content">
            <p className="setup-section-label"><span>00—01</span><i />Secure workspace initialization</p>
            <h2 className="setup-brand-title">Initialisez votre environnement MissionFlow.</h2>
            <p className="setup-brand-copy">Créez le premier compte administrateur de cette installation pour commencer à gérer les missions et les utilisateurs.</p>

            <div className="setup-flow" aria-label="Étapes d'initialisation">
              <div className="setup-flow-header"><span>Initialisation du workspace</span><span>01 / 03</span></div>
              <div className="setup-flow-steps">
                <span className="setup-flow-line" aria-hidden="true" />
                <div className="setup-flow-step setup-flow-step-active"><i /><span>Installation</span><small>Prête</small></div>
                <div className="setup-flow-step"><i /><span>Administrateur</span><small>En cours</small></div>
                <div className="setup-flow-step"><i /><span>Espace MissionFlow</span><small>À venir</small></div>
              </div>
            </div>
          </div>

          <div className="setup-brand-footer"><ShieldCheck className="h-4 w-4 text-indigo-200/80" aria-hidden="true" /><span>Environnement sécurisé</span><i /><span>Accès initial contrôlé</span></div>
        </aside>

        <div className="setup-main">
          <div className="setup-context"><span /><span>Configuration d’espace</span><small>ACCÈS / 00</small></div>
          <div className="setup-content">{children}</div>
          <footer className="setup-footer"><span>MissionFlow</span><span>Gestion des déplacements professionnels</span><small>ADMIN SETUP</small></footer>
        </div>
      </section>
      <style jsx global>{`
        .setup-page { min-height:100dvh; background:#f2f4f2; padding:0; }
        .setup-frame { display:grid; width:100%; max-width:1720px; min-height:100dvh; margin:0 auto; overflow:hidden; background:#fbfcfa; }
        .setup-brand { position:relative; isolation:isolate; display:flex; min-height:132px; flex-direction:column; justify-content:space-between; overflow:hidden; background:#101c21; padding:1rem 1.25rem; color:white; }
        .setup-grid { position:absolute; inset:0; z-index:-1; pointer-events:none; background:linear-gradient(135deg,#14242a 0%,#101c21 55%,#0d171c 100%); }
        .setup-grid::before { position:absolute; inset:0; content:""; opacity:.075; background-image:linear-gradient(rgba(202,222,216,.35) 1px,transparent 1px),linear-gradient(90deg,rgba(202,222,216,.35) 1px,transparent 1px); background-size:64px 64px; mask-image:linear-gradient(135deg,#000,transparent 82%); }
        .setup-grid::after { position:absolute; right:8%; top:28%; width:260px; height:260px; border:1px solid rgba(240,255,250,.055); border-radius:50%; content:""; }
        .setup-brand-lockup { position:relative; display:flex; align-items:center; gap:.75rem; }
        .setup-brand-mark { position:relative; display:flex; width:40px; height:40px; align-items:center; justify-content:center; border:1px solid rgba(204,251,241,.2); background:#172a30; color:#ccfbf1; }
        .setup-brand-mark i { position:absolute; right:-4px; bottom:-4px; width:8px; height:8px; border:1px solid #101c21; background:#5eead4; }
        .setup-brand-name { font-size:17px; font-weight:600; line-height:1; letter-spacing:-.045em; }
        .setup-brand-caption { margin-top:.45rem; color:#94a3a7; font-size:8px; font-weight:500; text-transform:uppercase; letter-spacing:.22em; }
        .setup-coordinate { display:none; margin-left:auto; color:#64747a; font:9px ui-monospace,monospace; letter-spacing:.12em; }
        .setup-brand-content { display:none; position:relative; max-width:600px; }
        .setup-section-label { display:flex; align-items:center; gap:.7rem; color:#94a3a7; font-size:9px; font-weight:600; text-transform:uppercase; letter-spacing:.17em; }
        .setup-section-label span { color:rgba(153,246,228,.75); font:9px ui-monospace,monospace; }
        .setup-section-label i { width:28px; height:1px; background:rgba(153,246,228,.35); }
        .setup-brand-title { max-width:560px; margin-top:1rem; color:#f1f4f1; font-size:clamp(2rem,3.25vw,3.5rem); font-weight:500; line-height:1.06; letter-spacing:-.06em; }
        .setup-brand-copy { max-width:390px; margin-top:1rem; color:#a0adb0; font-size:13px; line-height:1.7; }
        .setup-flow { max-width:480px; margin-top:1.5rem; border:1px solid rgba(255,255,255,.09); background:rgba(20,35,40,.8); }
        .setup-flow-header { display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,.08); padding:.65rem .85rem; color:#cbd5d6; font-size:9px; font-weight:600; text-transform:uppercase; letter-spacing:.13em; }
        .setup-flow-header span+span { color:#64747a; font:9px ui-monospace,monospace; }
        .setup-flow-steps { position:relative; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.5rem; padding:1rem .85rem .9rem; }
        .setup-flow-line { position:absolute; top:26px; left:16.5%; right:16.5%; height:1px; background:linear-gradient(90deg,rgba(153,246,228,.45),rgba(255,255,255,.12)); }
        .setup-flow-step { position:relative; display:flex; flex-direction:column; align-items:center; gap:.4rem; color:#aab6b8; text-align:center; font-size:10px; }
        .setup-flow-step i { width:18px; height:18px; border:1px solid rgba(255,255,255,.18); background:#142328; }
        .setup-flow-step-active i { display:grid; place-items:center; border-color:rgba(153,246,228,.35); }
        .setup-flow-step-active i::after { width:6px; height:6px; background:#99f6e4; content:""; }
        .setup-flow-step small { color:#66767a; font:8px ui-monospace,monospace; text-transform:uppercase; letter-spacing:.08em; }
        .setup-brand-footer { position:relative; display:flex; align-items:center; gap:.5rem; margin-top:1rem; border-top:1px solid rgba(255,255,255,.09); padding-top:.75rem; color:#a0adb0; font-size:10px; }
        .setup-brand-footer i { width:4px; height:4px; margin:0 .15rem; background:#59696e; }
        .setup-main { position:relative; display:flex; min-width:0; flex-direction:column; justify-content:center; background:#fbfcfa; padding:1.75rem 1.5rem; }
        .setup-context { display:flex; align-items:center; gap:.55rem; margin-bottom:1.5rem; color:#647174; font-size:9px; font-weight:600; text-transform:uppercase; letter-spacing:.17em; }
        .setup-context > span:first-child { width:20px; height:1px; background:rgba(15,118,110,.55); }
        .setup-context small { display:none; margin-left:auto; color:#9aa5a4; font:9px ui-monospace,monospace; }
        .setup-content { width:100%; max-width:480px; margin:0 auto; animation:setup-enter 450ms ease-out both; }
        .setup-eyebrow { color:var(--brand); font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.17em; }
        .setup-title { margin-top:.6rem; color:#172a30; font-size:clamp(1.8rem,2.5vw,2.45rem); font-weight:500; line-height:1.1; letter-spacing:-.055em; }
        .setup-description { max-width:360px; margin-top:.65rem; color:#647174; font-size:13px; line-height:1.55; }
        .setup-form { display:grid; gap:.85rem; margin-top:1.5rem; }
        .setup-name-fields { display:grid; grid-template-columns:1fr; gap:.85rem; }
        .setup-field-label { display:block; margin-bottom:.4rem; color:#475569; font-size:11px; font-weight:600; }
        .setup-field-wrap { position:relative; }
        .setup-field-icon { position:absolute; top:50%; left:.85rem; width:16px; height:16px; transform:translateY(-50%); color:#94a3a5; pointer-events:none; transition:color 180ms ease; }
        .setup-field-wrap:focus-within .setup-field-icon { color:var(--brand); }
        .setup-field-input { height:46px!important; border-color:#dce3df!important; border-radius:10px!important; background:#f5f7f5!important; padding-left:2.65rem!important; color:#172a30!important; font-size:13px!important; transition:border-color 180ms ease,background-color 180ms ease,box-shadow 180ms ease!important; }
        .setup-field-input:hover { border-color:#cbd5d1!important; }
        .setup-field-input:focus-visible { border-color:#115e59!important; background:#fff!important; box-shadow:0 0 0 3px rgba(15,118,110,.1)!important; }
        .setup-field-input[aria-invalid="true"] { border-color:#dc8a82!important; }
        .setup-field-error { margin-top:.35rem; color:#b42318; font-size:10px; line-height:1.4; }
        .setup-error { display:flex; align-items:flex-start; gap:.5rem; border:1px solid #fecaca; background:#fff5f4; padding:.65rem .75rem; color:#b42318; font-size:11px; line-height:1.45; }
        .setup-submit { height:48px!important; width:100%; justify-content:space-between!important; margin-top:.2rem; border-radius:10px!important; background:var(--brand)!important; padding-inline:1rem!important; font-size:12px!important; box-shadow:0 5px 12px rgba(79,70,229,.16)!important; transition:transform 180ms ease,background-color 180ms ease,box-shadow 180ms ease!important; }
        .setup-submit:hover { transform:translateY(-1px); background:var(--brand-strong)!important; box-shadow:0 8px 16px rgba(79,70,229,.2)!important; }
        .setup-submit:active { transform:translateY(0); }
        .setup-state { display:grid; grid-template-columns:42px 1fr; gap:1rem; align-items:start; border:1px solid #dce3df; background:#fff; padding:clamp(1rem,3vw,1.5rem); }
        .setup-state-icon { display:flex; width:42px; height:42px; align-items:center; justify-content:center; border:1px solid #cde8d7; background:var(--success-soft); color:var(--success); }
        .setup-state-closed .setup-state-icon { border-color:#ead8a6; background:#fbf6e8; color:#8a6412; }
        .setup-state-created .setup-state-icon { border-color:#c5e3d0; background:#eef8f1; color:#24764a; }
        .setup-state-title { margin-top:.6rem; color:#172a30; font-size:clamp(1.4rem,2.4vw,2rem); font-weight:500; line-height:1.12; letter-spacing:-.05em; }
        .setup-state-copy { margin-top:.65rem; color:#647174; font-size:13px; line-height:1.6; }
        .setup-login-link { display:inline-flex; height:44px; align-items:center; gap:.7rem; margin-top:1.25rem; border-radius:10px; background:var(--brand); padding:0 1rem; color:white; font-size:12px; font-weight:600; transition:background-color 180ms ease,transform 180ms ease; }
        .setup-login-link:hover { transform:translateY(-1px); background:var(--brand-strong); }
        .setup-login-link:focus-visible { outline:3px solid rgba(15,118,110,.3); outline-offset:2px; }
        .setup-footer { display:flex; justify-content:space-between; gap:.5rem; margin-top:2rem; border-top:1px solid #e2e8e4; padding-top:.75rem; color:#94a3a3; font-size:8px; font-weight:500; text-transform:uppercase; letter-spacing:.1em; }
        .setup-footer small { display:none; font-family:ui-monospace,monospace; }
        @keyframes setup-enter { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        @media (min-width:640px) { .setup-brand { padding:1.25rem 2.25rem; } .setup-main { padding:2rem 2.5rem; } .setup-name-fields { grid-template-columns:repeat(2,minmax(0,1fr)); } .setup-brand-footer { margin-top:1.25rem; padding-top:.9rem; } }
        @media (min-width:1024px) { .setup-page { height:100dvh; min-height:0; padding:1.25rem; } .setup-frame { height:calc(100dvh - 2.5rem); min-height:0; grid-template-columns:minmax(0,1.08fr) minmax(480px,.92fr); grid-template-rows:minmax(0,1fr); border:1px solid #dfe5e1; box-shadow:0 24px 80px rgba(20,36,38,.09); } .setup-brand { min-height:0; padding:2rem clamp(2.5rem,4vw,4.5rem); } .setup-coordinate,.setup-brand-content,.setup-context small,.setup-footer small { display:flex; } .setup-brand-content { display:block; margin-block:auto; } .setup-main { min-height:0; padding:2rem clamp(2.5rem,5vw,6rem); } .setup-context { position:absolute; top:2rem; right:clamp(2.5rem,5vw,6rem); left:clamp(2.5rem,5vw,6rem); margin:0; } .setup-content { max-width:460px; } .setup-footer { position:absolute; right:clamp(2.5rem,5vw,6rem); bottom:1.75rem; left:clamp(2.5rem,5vw,6rem); margin:0; border:0; padding:0; } }
        @media (min-width:1024px) and (max-height:900px) { .setup-brand { padding-block:clamp(1rem,3vh,1.5rem); } .setup-brand-title { font-size:clamp(1.9rem,3vw,3rem); } .setup-brand-copy { margin-top:.75rem; font-size:12px; line-height:1.5; } .setup-flow { margin-top:clamp(.75rem,2vh,1.25rem); } .setup-flow-header { padding-block:.5rem; } .setup-flow-steps { padding-block:.75rem; } .setup-main { padding-block:clamp(.8rem,2.5vh,1.5rem); } .setup-context { top:clamp(.75rem,2vh,1.25rem); } .setup-footer { bottom:clamp(.75rem,2vh,1.25rem); } .setup-title { font-size:clamp(1.65rem,2.3vw,2.1rem); } .setup-form { gap:clamp(.55rem,1.5vh,.8rem); margin-top:clamp(.9rem,2.5vh,1.25rem); } .setup-field-input { height:42px!important; } .setup-submit { height:44px!important; } .setup-footer { font-size:7px; } }
        @media (min-width:1024px) and (max-height:760px) { .setup-brand { padding-block:.7rem; } .setup-brand-title { font-size:clamp(1.7rem,2.5vw,2.4rem); } .setup-brand-copy { margin-top:.55rem; font-size:11px; } .setup-flow { margin-top:.65rem; } .setup-flow-header { padding-block:.35rem; } .setup-flow-steps { padding-block:.5rem; } .setup-main { overflow-y:auto; padding-block:2.4rem; } .setup-context,.setup-footer { position:static; } .setup-context { margin-bottom:.75rem; } .setup-footer { margin-top:1rem; } .setup-content { max-width:440px; } .setup-title { font-size:1.6rem; } .setup-description { margin-top:.4rem; font-size:12px; } .setup-form { gap:.45rem; margin-top:.75rem; } .setup-field-label { margin-bottom:.25rem; } .setup-field-input { height:38px!important; } .setup-submit { height:40px!important; } .setup-state { padding:1rem; } }
        @media (max-width:639px) { .setup-page { overflow-x:hidden; } .setup-brand { min-height:124px; } .setup-brand-footer { font-size:9px; } .setup-main { padding:1.5rem 1.25rem; } .setup-context { margin-bottom:1rem; } .setup-content { max-width:440px; } .setup-title { font-size:1.75rem; } .setup-form { gap:.75rem; margin-top:1.25rem; } .setup-field-input { height:48px!important; } .setup-submit { height:50px!important; } .setup-footer { font-size:7px; } .setup-footer span:nth-child(2) { text-align:right; } }
        @media (max-height:700px) and (max-width:1023px) { .setup-main { padding-block:clamp(1.25rem,4vh,2rem); } .setup-context { margin-bottom:clamp(.75rem,2.5vh,1.1rem); } .setup-form { gap:.6rem; margin-top:1rem; } .setup-field-input { height:44px!important; } .setup-submit { height:46px!important; } .setup-footer { margin-top:1.25rem; } }
        @media (prefers-reduced-motion:reduce) { .setup-content { animation:none; } .setup-submit,.setup-login-link { transition:none; } }
      `}</style>
    </main>
  );
}

function LoginLink() {
  return <Link href="/login" className="setup-login-link">Se connecter<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>;
}

function SetupField({ id, label, register, error, type = "text" }: Readonly<{ id: keyof SetupForm; label: string; register: UseFormRegister<SetupForm>; error?: string; type?: string }>) {
  const Icon = id === "firstName" || id === "lastName" ? User : id === "email" ? Mail : id === "passwordConfirmation" ? ShieldCheck : LockKeyhole;
  return (
    <div>
      <label htmlFor={id} className="setup-field-label">{label}</label>
      <div className="setup-field-wrap">
        <Icon className="setup-field-icon" strokeWidth={1.7} aria-hidden="true" />
        <Input
          id={id}
          type={type}
          autoComplete={id === "password" || id === "passwordConfirmation" ? "new-password" : id === "email" ? "email" : "off"}
          {...register(id)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="setup-field-input"
        />
      </div>
      {error && <p id={`${id}-error`} className="setup-field-error">{error}</p>}
    </div>
  );
}

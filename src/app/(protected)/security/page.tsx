"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/session-context";
import { Input } from "@/components/ui/input";
import { disableTwoFactor, enableTwoFactor, getTwoFactorStatus, regenerateTwoFactorRecoveryCodes, startTwoFactorSetup, type TwoFactorSetup } from "@/lib/api/auth";

export default function SecurityPage() {
  const router = useRouter();
  const { logout } = useSession();
  const [status, setStatus] = useState<{ enabled: boolean; recoveryCodesRemaining: number } | null>(null);
  const [setup, setSetup] = useState<TwoFactorSetup["data"] | null>(null);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await getTwoFactorStatus();
    setStatus(result.data);
  }, []);
  useEffect(() => {
    let active = true;
    getTwoFactorStatus()
      .then((result) => { if (active) setStatus(result.data); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Impossible de charger la sécurité du compte."); });
    return () => { active = false; };
  }, []);

  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setError(null); setMessage(null); setRecoveryCodes([]);
    try { await action(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "L’opération a échoué."); }
    finally { setBusy(false); }
  };

  const beginSetup = () => run(async () => { const result = await startTwoFactorSetup(password); setSetup(result.data); setPassword(""); setMessage("Scannez le QR code puis confirmez avec un code à 6 chiffres."); });
  const confirmSetup = () => run(async () => { const result = await enableTwoFactor(code.trim()); setRecoveryCodes(result.data.recoveryCodes); setSetup(null); setCode(""); await refresh(); setMessage("La protection en deux étapes est activée. Enregistrez ces codes de secours maintenant."); });
  const disable = () => run(async () => { await disableTwoFactor(password, code.trim()); setPassword(""); setCode(""); setMessage("La protection en deux étapes est désactivée. Reconnectez-vous pour continuer."); await logout(); router.replace("/login"); });
  const regenerate = () => run(async () => { const result = await regenerateTwoFactorRecoveryCodes(password, code.trim()); setRecoveryCodes(result.data.recoveryCodes); setPassword(""); setCode(""); await refresh(); setMessage("Les anciens codes de secours sont annulés. Enregistrez les nouveaux codes."); });

  return <section className="mx-auto w-full max-w-3xl space-y-6">
    <header><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Compte</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text)]">Sécurité</h1><p className="mt-2 text-sm text-[var(--text-soft)]">Ajoutez une vérification par application d’authentification. Cette protection est facultative et peut être activée pour chaque compte.</p></header>
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-[var(--text)]">Vérification en deux étapes</h2><p className="mt-1 text-sm text-[var(--text-soft)]">État : {status ? status.enabled ? "Activée" : "Désactivée" : "Chargement…"}</p></div>{status?.enabled && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{status.recoveryCodesRemaining} codes de secours</span>}</div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}
      {!status?.enabled && !setup && <div className="mt-5 max-w-md space-y-4"><label className="block text-sm font-medium text-[var(--text)]" htmlFor="security-password">Confirmez votre mot de passe</label><Input id="security-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /><Button onClick={() => void beginSetup()} disabled={busy || !password}>{busy ? "Préparation…" : "Configurer la 2FA"}</Button></div>}
      {setup && <div className="mt-6 grid gap-6 sm:grid-cols-[220px_1fr] sm:items-center"><Image src={setup.qrCodeDataUrl} alt="QR code de configuration 2FA" width={220} height={220} unoptimized className="rounded-xl border border-[var(--line)] bg-white p-2" /><div className="space-y-3"><p className="text-sm text-[var(--text-soft)]">Scannez ce QR avec Google Authenticator, Microsoft Authenticator ou une application TOTP compatible.</p><p className="break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-[var(--text)]">{setup.secret}</p><label htmlFor="security-enable-code" className="block text-sm font-medium text-[var(--text)]">Code à 6 chiffres</label><Input id="security-enable-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="000000" /><Button onClick={() => void confirmSetup()} disabled={busy || !/^\d{6}$/.test(code)}>{busy ? "Vérification…" : "Activer la protection"}</Button><button type="button" className="ml-3 text-sm font-medium text-[var(--text-soft)] underline" onClick={() => { setSetup(null); setCode(""); }}>Annuler</button></div></div>}
      {status?.enabled && <div className="mt-5 max-w-md space-y-4"><label className="block text-sm font-medium text-[var(--text)]" htmlFor="security-current-password">Mot de passe actuel</label><Input id="security-current-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /><label className="block text-sm font-medium text-[var(--text)]" htmlFor="security-factor-code">Code de l’application ou code de secours</label><Input id="security-factor-code" autoComplete="one-time-code" autoCapitalize="characters" value={code} onChange={(event) => setCode(event.target.value)} placeholder="000000 ou code de secours" /><div className="flex flex-wrap gap-3"><Button onClick={() => void regenerate()} disabled={busy || !password || !code}>Régénérer les codes</Button><Button variant="outline" onClick={() => void disable()} disabled={busy || !password || !code}>Désactiver la 2FA</Button></div></div>}
      {recoveryCodes.length > 0 && <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4"><h3 className="font-semibold text-amber-950">Codes de secours — affichés une seule fois</h3><p className="mt-1 text-sm text-amber-900">Gardez-les dans un endroit sûr. Chaque code ne peut servir qu’une fois.</p><ul className="mt-3 grid gap-2 font-mono text-sm sm:grid-cols-2">{recoveryCodes.map((item) => <li key={item} className="rounded-lg bg-white px-3 py-2">{item}</li>)}</ul></div>}
    </div>
  </section>;
}

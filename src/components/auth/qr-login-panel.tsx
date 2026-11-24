"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cancelQrLogin, getQrLoginStatus, startQrLogin, type QrLoginStart } from "@/lib/api/auth";
import type { AuthResponse } from "@/types/auth";

export function QrLoginPanel({ onSession }: { onSession: (session: AuthResponse) => void }) {
  const [challenge, setChallenge] = useState<QrLoginStart | null>(null);
  const [state, setState] = useState<"loading" | "PENDING" | "SCANNED" | "REJECTED" | "CANCELLED" | "EXPIRED" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    let stopped = false;
    let timer: number | undefined;
    let current: QrLoginStart | null = null;
    const begin = async () => {
      setState("loading");
      setError(null);
      setChallenge(null);
      try {
        current = await startQrLogin();
        if (stopped) {
          void cancelQrLogin(current.challengeId, current.browserToken).catch(() => undefined);
          return;
        }
        setChallenge(current);
        setState("PENDING");
        const poll = async () => {
          if (stopped || !current) return;
          try {
            const result = await getQrLoginStatus(current.challengeId, current.browserToken);
            if (stopped) return;
            if (result.status === "APPROVED") {
              if (result.session) onSession(result.session);
              else { setState("error"); setError("La connexion n’a pas pu être terminée. Réessayez."); }
              return;
            }
            if (result.status === "REJECTED" || result.status === "CANCELLED" || result.status === "EXPIRED" || result.status === "CONSUMED") {
              setState(result.status === "CONSUMED" ? "EXPIRED" : result.status);
              return;
            }
            if (result.status === "PENDING" || result.status === "SCANNED") {
              setState(result.status);
            } else {
              setState("error");
              setError("La connexion n’a pas pu être terminée. Réessayez.");
              return;
            }
            timer = window.setTimeout(() => void poll(), 2000);
          } catch (requestError) {
            if (!stopped) {
              setState("error");
              setError(requestError instanceof Error ? requestError.message : "Impossible de vérifier la connexion.");
            }
          }
        };
        void poll();
      } catch (requestError) {
        if (!stopped) {
          setState("error");
          setError(requestError instanceof Error ? requestError.message : "Impossible de créer le QR code.");
        }
      }
    };
    void begin();
    return () => {
      stopped = true;
      if (timer !== undefined) window.clearTimeout(timer);
      if (current) void cancelQrLogin(current.challengeId, current.browserToken).catch(() => undefined);
    };
  }, [generation, onSession]);

  const terminal = state === "REJECTED" || state === "CANCELLED" || state === "EXPIRED" || state === "error";
  const statusText = state === "SCANNED"
    ? "Téléphone détecté. Vérifiez le même numéro sur les deux écrans."
    : state === "PENDING"
      ? "Ouvrez MissionFlow mobile et scannez ce QR code."
      : state === "REJECTED"
        ? "La demande a été refusée sur le téléphone."
        : state === "EXPIRED"
          ? "Ce QR code a expiré. Générez-en un nouveau."
          : state === "CANCELLED"
            ? "La demande a été annulée."
            : state === "loading"
              ? "Préparation du QR code…"
              : error ?? "Connexion en cours…";

  return <section className="mt-4 rounded-2xl border border-indigo-100 bg-white p-4 text-center shadow-sm" aria-live="polite">
    <h3 className="text-sm font-bold text-[var(--text)]">Connexion sécurisée par QR</h3>
    <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[var(--text-soft)]">Scannez avec MissionFlow mobile, puis choisissez sur le téléphone le numéro affiché ici.</p>
    {challenge && !terminal && <>
      <Image src={challenge.qrCodeDataUrl} alt="QR code temporaire pour se connecter avec MissionFlow mobile" width={208} height={208} unoptimized className="mx-auto mt-3 h-52 w-52 rounded-xl border border-slate-100 bg-white p-2" />
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Numéro à faire correspondre</p>
      <p className="mt-1 font-mono text-3xl font-bold tracking-[0.28em] text-[var(--brand-strong)]">{challenge.matchNumber}</p>
    </>}
    <p className="mt-3 text-xs leading-5 text-[var(--text-soft)]">{statusText}</p>
    {terminal && <button type="button" onClick={() => setGeneration((value) => value + 1)} className="mt-3 min-h-10 rounded-lg bg-[var(--brand)] px-4 text-xs font-semibold text-white hover:bg-[var(--brand-strong)]">Générer un nouveau QR</button>}
  </section>;
}

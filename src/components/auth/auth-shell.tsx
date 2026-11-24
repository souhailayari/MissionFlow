import type { ReactNode } from "react";
import { Check, ShieldCheck } from "lucide-react";

type AuthShellProps = {
  title: string;
  description: string;
  sideTitle: string;
  sideDescription: string;
  children: ReactNode;
};

const workflow = ["Demande", "Validation", "Suivi"];

export function AuthShell({ title, description, sideTitle, sideDescription, children }: AuthShellProps) {
  return <main className="grid min-h-dvh place-items-center bg-[#eef2f8] px-4 py-7 sm:px-6 sm:py-10">
    <div className="w-full max-w-[1160px]">
      <section aria-labelledby="auth-page-title" className="grid overflow-hidden rounded-[28px] border border-[#e3e8f1] bg-white shadow-[0_24px_70px_rgba(24,39,75,0.11)] md:grid-cols-[0.92fr_1.08fr] md:rounded-[30px]">
        <aside className="relative flex flex-col overflow-hidden bg-[#f8f9fc] px-6 py-5 sm:px-10 sm:py-6 md:min-h-[630px] md:px-9 md:py-10 lg:px-12 lg:py-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-36 h-96 w-96 rounded-full border border-indigo-100/70" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-indigo-100/60" />

          <header className="relative flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#4f46e5] text-white shadow-[0_8px_20px_rgba(79,70,229,0.2)]">
              <ShieldCheck size={21} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[17px] font-semibold leading-none tracking-[-0.04em] text-[#17233b]">MissionFlow</p>
              <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">IGE Médicale</p>
            </div>
          </header>

          <div className="relative my-auto hidden max-w-[430px] py-12 md:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.19em] text-[#4f46e5]">Gestion des missions professionnelles</p>
            <h2 className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.055em] text-[#17233b]">{sideTitle}</h2>
            <p className="mt-4 max-w-[390px] text-sm leading-7 text-slate-600">{sideDescription}</p>

            <div className="mt-8 flex flex-wrap gap-2" aria-label="Étapes du circuit MissionFlow">
              {workflow.map((step, index) => <span key={step} className="inline-flex items-center gap-2 rounded-full border border-[#e2e7f0] bg-white/80 px-3 py-2 text-[11px] font-medium text-slate-600 shadow-[0_2px_8px_rgba(24,39,75,0.03)]">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-indigo-50 text-[#4f46e5]">
                  {index === 0 ? <Check size={10} strokeWidth={2.5} aria-hidden="true" /> : <span className="text-[9px]">{index + 1}</span>}
                </span>
                {step}
              </span>)}
            </div>
          </div>

          <div className="relative mt-auto hidden items-center gap-2.5 border-t border-[#e4e8f0] pt-4 text-[11px] leading-5 text-slate-500 md:flex">
            <ShieldCheck size={15} className="shrink-0 text-[#4f46e5]" aria-hidden="true" />
            <span>Accès professionnel réservé aux utilisateurs autorisés.</span>
          </div>
        </aside>

        <div className="flex items-center justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-14 xl:px-16">
          <div className="w-full max-w-[450px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4f46e5]">Espace professionnel</p>
            <h1 id="auth-page-title" className="mt-3 text-[32px] font-semibold leading-tight tracking-[-0.05em] text-[#17233b] sm:text-[36px]">{title}</h1>
            <p className="mt-3 max-w-[420px] text-sm leading-6 text-slate-600">{description}</p>
            <div className="mt-7">{children}</div>
          </div>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 px-2 pt-4 text-[10px] font-medium text-slate-500 sm:px-4 sm:pt-5">
        <span>© MissionFlow · IGE Médicale</span>
        <span>Gestion des déplacements professionnels</span>
      </footer>
    </div>
  </main>;
}

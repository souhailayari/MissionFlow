"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CalendarDays, Fuel, History, RefreshCw, Ticket, WalletCards } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/ui/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { addDirectionMonthlyBudget, getDirectionMonthlyBudget } from "@/lib/api/missions";
import type { DirectionMonthlyBudget } from "@/types/missions";

type Feedback = { tone: "success" | "warning" | "danger"; message: string };

const formatAmount = (value: number | string) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 3 }).format(Number(value));
const monthTitle = (budget: DirectionMonthlyBudget) => new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date(budget.year, budget.month - 1, 1));
const formatDepositDate = (value: string) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const errorMessage = (error: unknown) => error instanceof ApiError ? error.message : "Veuillez vérifier votre connexion puis réessayer.";

function BudgetBalance({
  title,
  icon: Icon,
  remaining,
  allocated,
  used,
  unit,
  format = (value: number | string) => String(value),
}: Readonly<{
  title: string;
  icon: typeof Fuel;
  remaining: number | string;
  allocated: number | string;
  used: number | string;
  unit: string;
  format?: (value: number | string) => string;
}>) {
  const isOverdrawn = Number(remaining) < 0;
  return (
    <Card className="gap-4 rounded-2xl border-[var(--line)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Doté : {format(allocated)} {unit}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      </div>
      <div>
        <p className="text-xs font-medium text-[var(--text-muted)]">Solde disponible</p>
        <p className={`mt-1 text-3xl font-bold tracking-tight tabular-nums ${isOverdrawn ? "text-[var(--danger)]" : "text-[var(--text)]"}`}>
          {format(remaining)} <span className="text-sm font-medium text-[var(--text-muted)]">{unit}</span>
        </p>
      </div>
      <div className="border-t border-[var(--line)] pt-3 text-xs text-[var(--text-muted)]">Attribué aux missions : {format(used)} {unit}</div>
    </Card>
  );
}

export default function DirectionBudgetPage() {
  const [budget, setBudget] = useState<DirectionMonthlyBudget | null>(null);
  const [fuelAmount, setFuelAmount] = useState("");
  const [ticketCount, setTicketCount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const loadBudget = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await getDirectionMonthlyBudget();
      setBudget(response.data);
    } catch (error) {
      setLoadError(errorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void getDirectionMonthlyBudget().then((response) => {
      if (active) setBudget(response.data);
    }).catch((error: unknown) => {
      if (active) setLoadError(errorMessage(error));
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  const addDeposit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    const fuel = Number(fuelAmount || 0);
    const tickets = Number(ticketCount || 0);
    if (!Number.isFinite(fuel) || fuel < 0 || (fuelAmount.includes(".") && fuelAmount.split(".")[1].length > 3)) {
      setFeedback({ tone: "danger", message: "Saisissez un montant carburant valide, avec au maximum trois décimales." });
      return;
    }
    if (!Number.isInteger(tickets) || tickets < 0) {
      setFeedback({ tone: "danger", message: "Le nombre de tickets doit être un entier positif ou nul." });
      return;
    }
    if (fuel === 0 && tickets === 0) {
      setFeedback({ tone: "danger", message: "Ajoutez un montant carburant ou des tickets restaurant." });
      return;
    }

    setIsSaving(true);
    try {
      const response = await addDirectionMonthlyBudget({ fuelAmount: fuel, pluxeeTicketCount: tickets });
      setBudget(response.data);
      setFuelAmount("");
      setTicketCount("");
      setFeedback({ tone: "success", message: `La dotation a été ajoutée au budget de ${monthTitle(response.data)}.` });
    } catch (error) {
      setFeedback({ tone: "danger", message: errorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer className="max-w-6xl">
      <header className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[24px] border border-[var(--line)] px-5 py-5 shadow-[var(--shadow-card)] sm:px-7 sm:py-6 lg:flex-row lg:items-center lg:justify-between" style={{ background: "linear-gradient(112deg, var(--brand-soft) 0%, var(--surface) 70%, var(--surface) 100%)" }}>
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-24 h-56 w-56 rounded-full border border-[var(--line)]" />
        <div className="relative min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand-strong)] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" aria-hidden="true" /> Dotations · Direction
          </div>
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.045em] text-[var(--text)] sm:text-[34px]">Budget mensuel</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--text-soft)]">Ajoutez les montants de carburant et les tickets restaurant disponibles. Les attributions aux missions sont déduites automatiquement.</p>
        </div>
        <div className="relative flex flex-wrap items-center gap-3 lg:shrink-0">
          <div className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--text-soft)]"><CalendarDays className="h-4 w-4 text-[var(--brand)]" />{budget ? monthTitle(budget) : "Ce mois"}</div>
          <Button type="button" variant="outline" disabled={isLoading} onClick={() => void loadBudget()} leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />}>Actualiser</Button>
        </div>
      </header>

      {loadError && <div className="space-y-3"><ErrorState title="Impossible de charger le budget mensuel." message={loadError} /><Button type="button" size="sm" variant="outline" onClick={() => void loadBudget()}>Réessayer</Button></div>}

      {isLoading ? <section className="grid gap-3 md:grid-cols-2" aria-label="Chargement du budget"><Skeleton className="h-52 rounded-2xl" /><Skeleton className="h-52 rounded-2xl" /></section> : budget && <section className="grid gap-3 md:grid-cols-2" aria-label="Solde du budget mensuel">
        <BudgetBalance title="Carburant" icon={Fuel} remaining={budget.fuelRemaining} allocated={budget.fuelLimit} used={budget.fuelUsed} unit="DT" format={formatAmount} />
        <BudgetBalance title="Tickets restaurant" icon={Ticket} remaining={budget.pluxeeTicketRemaining} allocated={budget.pluxeeTicketLimit} used={budget.pluxeeTicketUsed} unit="tickets" />
      </section>}

      {budget && (Number(budget.fuelRemaining) < 0 || budget.pluxeeTicketRemaining < 0) && <Alert tone="warning"><p>Le budget du mois est dépassé. Les attributions restent possibles ; elles afficheront un avertissement et le solde négatif restera visible.</p></Alert>}
      {feedback && <Alert tone={feedback.tone}>{feedback.message}</Alert>}

      <Card className="gap-4 rounded-2xl border-[var(--line)] p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div>
          <CardTitle><span className="inline-flex items-center gap-2"><WalletCards className="h-4 w-4 text-[var(--brand)]" />Ajouter une dotation</span></CardTitle>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Les nouvelles dotations s’ajoutent au solde de {budget ? monthTitle(budget) : "ce mois"}.</p>
        </div>
        <form onSubmit={addDeposit} className="grid gap-3 md:grid-cols-2" noValidate>
          <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]" htmlFor="fuel-deposit">Montant carburant à ajouter (DT)
            <Input id="fuel-deposit" type="number" inputMode="decimal" min="0" step="0.001" value={fuelAmount} onChange={(event) => setFuelAmount(event.target.value)} placeholder="Ex. 500" />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]" htmlFor="restaurant-ticket-deposit">Tickets restaurant à ajouter
            <Input id="restaurant-ticket-deposit" type="number" inputMode="numeric" min="0" step="1" value={ticketCount} onChange={(event) => setTicketCount(event.target.value)} placeholder="Ex. 20" />
          </label>
          <div className="md:col-span-2"><Button type="submit" disabled={isSaving || isLoading || Boolean(loadError)} leftIcon={<WalletCards className="h-4 w-4" />}>{isSaving ? "Ajout en cours…" : "Ajouter au budget du mois"}</Button></div>
        </form>
      </Card>

      {budget && <Card className="gap-0 overflow-hidden rounded-2xl border-[var(--line)] p-0 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <History className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <CardTitle>Historique des dotations</CardTitle>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">Ajouts au budget de {monthTitle(budget)}</p>
            </div>
          </div>
          <span className="rounded-full border border-[var(--line)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-soft)]">
            {budget.deposits.length} dotation{budget.deposits.length === 1 ? "" : "s"}
          </span>
        </div>

        {budget.deposits.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead className="bg-[var(--surface-muted)] text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                <tr>
                  <th scope="col" className="px-4 py-3 sm:px-5">Date</th>
                  <th scope="col" className="px-4 py-3 text-right sm:px-5">Carburant ajouté</th>
                  <th scope="col" className="px-4 py-3 text-right sm:px-5">Tickets restaurant ajoutés</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {budget.deposits.map((deposit) => (
                  <tr key={deposit.id} className="transition-colors hover:bg-[var(--surface-muted)]/60">
                    <td className="whitespace-nowrap px-4 py-3.5 font-medium text-[var(--text)] sm:px-5">{formatDepositDate(deposit.createdAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold tabular-nums text-[var(--text)]">{formatAmount(deposit.fuelAmount)} <span className="text-xs font-medium text-[var(--text-muted)]">DT</span></td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold tabular-nums text-[var(--text)] sm:px-5">{deposit.pluxeeTicketCount} <span className="text-xs font-medium text-[var(--text-muted)]">tickets</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-9 text-center">
            <p className="text-sm font-semibold text-[var(--text)]">Aucune dotation enregistrée ce mois-ci.</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Les prochains ajouts apparaîtront ici avec leur date et leur montant.</p>
          </div>
        )}
      </Card>}

      <p className="px-1 text-xs leading-5 text-[var(--text-muted)]">Le budget est suivi séparément pour chaque mois civil. Une mission qui dépasse le solde peut être finalisée, avec un avertissement visible pour la Direction.</p>
    </PageContainer>
  );
}

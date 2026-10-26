import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function MissionListLoading() { return <div className="overflow-hidden rounded-xl border border-slate-200 bg-white" aria-label="Chargement des missions"><div className="h-9 border-b border-slate-200 bg-slate-50" />{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="mx-3 my-2 h-8 rounded-md" />)}</div>; }

export function MissionListEmpty() { return <EmptyState title="Aucune mission trouvée." description="Modifiez les filtres ou créez une nouvelle demande." />; }

export function MissionListError({ message, onRetry }: Readonly<{ message: string; onRetry: () => void }>) {
  return <div className="space-y-3"><ErrorState title="Impossible de charger les missions." message={message} /><Button type="button" size="sm" variant="outline" onClick={onRetry} leftIcon={<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}>Réessayer</Button></div>;
}

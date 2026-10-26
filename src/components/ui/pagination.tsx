import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({ page, totalPages, total, onChange }: Readonly<{ page: number; totalPages: number; total: number; onChange: (page: number) => void }>) {
  return (
    <footer className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-2 text-xs text-slate-500">
      <p>{total} mission{total > 1 ? "s" : ""} · {page} / {totalPages}</p>
      <div className="flex items-center gap-1.5">
        <Button type="button" size="icon-xs" variant="outline" aria-label="Page précédente" title="Page précédente" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <span className="min-w-12 text-center tabular-nums">{page} / {totalPages}</span>
        <Button type="button" size="icon-xs" variant="outline" aria-label="Page suivante" title="Page suivante" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </footer>
  );
}

"use client";

import { useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EXPAND_TEXT_THRESHOLD = 56;

type ExpandableTextCardProps = Readonly<{
  title: string;
  text: string;
  subtitle?: string;
  number?: number;
}>;

export function ExpandableTextCard({ title, text, subtitle, number }: ExpandableTextCardProps) {
  const [open, setOpen] = useState(false);
  const isLong = `${subtitle ?? ""} ${text}`.trim().length > EXPAND_TEXT_THRESHOLD;

  return (
    <>
      <div className="min-w-0 rounded-xl border border-slate-100 bg-white/80 p-3">
        <div className="flex min-w-0 items-start gap-2.5">
          {number !== undefined && (
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-700" aria-hidden="true">
              {number}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">{title}</p>
            {subtitle && <p className="mt-1 line-clamp-1 break-words text-xs font-semibold leading-5 text-slate-700 [overflow-wrap:anywhere]">{subtitle}</p>}
          </div>
        </div>
        <p className="mt-2 line-clamp-2 break-words text-sm leading-5 text-slate-700 [overflow-wrap:anywhere]">{text}</p>
        {isLong && (
          <Button
            type="button"
            variant="link"
            size="xs"
            className="mt-1 h-auto px-0 py-1 text-xs"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
          >
            Afficher plus <ArrowUpRight aria-hidden="true" />
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[calc(100dvh-2rem)] max-w-[min(560px,calc(100%-2rem))] gap-0 overflow-hidden rounded-2xl border-slate-200 p-0"
        >
          <DialogHeader className="flex-row items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 pr-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-700">Détail complet</p>
              <DialogTitle className="mt-1 text-lg font-bold text-slate-900">{title}</DialogTitle>
              <DialogDescription className="mt-1 break-words text-xs leading-5 text-slate-500 [overflow-wrap:anywhere]">
                Informations complètes de cette étape.
              </DialogDescription>
            </div>
            <DialogClose render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Fermer le détail" />}>
              <X aria-hidden="true" />
            </DialogClose>
          </DialogHeader>
          <div className="max-h-[65dvh] space-y-3 overflow-y-auto p-5">
            {subtitle && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">Destination</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-slate-800 [overflow-wrap:anywhere]">{subtitle}</p>
              </div>
            )}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
              {subtitle && <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-indigo-700">Lieu d&apos;hébergement</p>}
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-800 [overflow-wrap:anywhere]">{text}</p>
            </div>
          </div>
          <div className="flex justify-end border-t border-slate-100 bg-white px-5 py-3">
            <DialogClose render={<Button type="button" variant="outline" size="sm">Fermer</Button>} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Download, FileText, LoaderCircle, X } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getMissionPdf } from "@/lib/api/missions";
import type { Mission } from "@/types/missions";

const pdfErrorMessage = "Impossible de générer le PDF. Veuillez réessayer.";

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function MissionPdfActions({ mission }: Readonly<{ mission: Mission }>) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"preview" | "download" | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const safeReference = mission.reference.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  const fileName = `ordre-mission-${safeReference || mission.id}.pdf`;

  useEffect(() => () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
  }, [blobUrl]);

  const fetchPdf = async () => {
    if (pdfBlob) return pdfBlob;
    const blob = await getMissionPdf(mission.id);
    setPdfBlob(blob);
    return blob;
  };

  const openPreview = async () => {
    setIsOpen(true);
    setHasError(false);
    if (pdfBlob) {
      if (!blobUrl) setBlobUrl(URL.createObjectURL(pdfBlob));
      return;
    }

    setLoadingAction("preview");
    try {
      const blob = await fetchPdf();
      if (!blobUrl) setBlobUrl(URL.createObjectURL(blob));
    } catch {
      setHasError(true);
    } finally {
      setLoadingAction(null);
    }
  };

  const downloadPdf = async () => {
    setHasError(false);
    setLoadingAction("download");
    try {
      downloadBlob(await fetchPdf(), fileName);
    } catch {
      setHasError(true);
    } finally {
      setLoadingAction(null);
    }
  };

  const isLoading = loadingAction !== null;
  const errorMessage = hasError ? (
    <Alert tone="danger" className="sm:max-w-sm">
      <AlertCircle aria-hidden="true" />
      <span>{pdfErrorMessage}</span>
    </Alert>
  ) : null;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void openPreview()}
        disabled={isLoading}
        leftIcon={loadingAction === "preview" ? <LoaderCircle className="animate-spin" /> : <FileText />}
      >
        {loadingAction === "preview" ? "Génération du PDF..." : "Voir le PDF"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void downloadPdf()}
        disabled={isLoading}
        leftIcon={loadingAction === "download" ? <LoaderCircle className="animate-spin" /> : <Download />}
      >
        {loadingAction === "download" ? "Génération du PDF..." : "Télécharger"}
      </Button>
      {!isOpen && errorMessage}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          showCloseButton={false}
          className="grid h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-6xl grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden p-3 sm:h-[min(90dvh,56rem)] sm:w-[calc(100vw-2rem)] sm:gap-4 sm:p-4"
        >
          <div className="space-y-3">
            <DialogHeader className="flex-row items-start justify-between gap-3 pr-0">
              <div className="min-w-0">
                <DialogTitle className="text-base font-semibold text-slate-900">Aperçu du PDF</DialogTitle>
                <DialogDescription className="mt-1 truncate">
                  {mission.reference} · {mission.title}
                </DialogDescription>
              </div>
              <DialogClose
                render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Fermer l’aperçu PDF" />}
              >
                <X aria-hidden="true" />
              </DialogClose>
            </DialogHeader>

            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <span className="truncate text-xs font-medium text-slate-500">{fileName}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void downloadPdf()}
                disabled={isLoading}
                leftIcon={loadingAction === "download" ? <LoaderCircle className="animate-spin" /> : <Download />}
              >
                {loadingAction === "download" ? "Génération..." : "Télécharger"}
              </Button>
            </div>
            {hasError && errorMessage}
          </div>

          <div className="relative min-h-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            {loadingAction === "preview" || (pdfBlob && !blobUrl) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white text-sm text-slate-600" role="status" aria-live="polite">
                <LoaderCircle className="h-6 w-6 animate-spin text-indigo-700" aria-hidden="true" />
                <span>Génération du PDF...</span>
              </div>
            ) : null}
            {hasError && !pdfBlob ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white p-4 text-sm text-slate-600">
                Le PDF n’a pas pu être chargé. Vous pouvez réessayer.
              </div>
            ) : null}
            {blobUrl && (
              <iframe
                key={blobUrl}
                src={blobUrl}
                title={`PDF de la mission ${mission.reference}`}
                className="h-full min-h-0 w-full bg-white"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

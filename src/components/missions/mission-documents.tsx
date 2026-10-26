"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Download, Eye, FileArchive, FileImage, FileSpreadsheet, FileText, LoaderCircle, TriangleAlert } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/api/client";
import type { Mission, MissionDocument } from "@/types/missions";

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.includes("pdf") || mimeType.includes("text") || mimeType.includes("json")) return FileText;
  if (mimeType.includes("sheet") || mimeType.includes("csv") || mimeType.includes("excel")) return FileSpreadsheet;
  if (mimeType.includes("zip") || mimeType.includes("gzip") || mimeType.includes("archive")) return FileArchive;
  return FileText;
};

const getDocumentTypeLabel = (documentType: string) => {
  if (documentType === "JUSTIFICATIF") return "Justificatif";
  if (documentType === "ORDRE_MISSION") return "Ordre de mission";
  if (documentType === "AUTRE") return "Autre document";
  return documentType;
};

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

export function MissionDocuments({ mission }: Readonly<{ mission: Mission }>) {
  const [selectedDocument, setSelectedDocument] = useState<MissionDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<{ id: string; action: "preview" | "download" } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewRequest = useRef(0);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const closePreview = () => {
    previewRequest.current += 1;
    setSelectedDocument(null);
    setPreviewUrl(null);
    setBusyAction(null);
  };

  const previewDocument = async (file: MissionDocument) => {
    const requestId = ++previewRequest.current;
    setSelectedDocument(file);
    setPreviewUrl(null);
    setError(null);
    setBusyAction({ id: file.id, action: "preview" });
    try {
      const blob = await apiRequest<Blob>(`/documents/${encodeURIComponent(file.id)}`, { responseType: "blob" });
      const url = URL.createObjectURL(blob);
      if (previewRequest.current === requestId) setPreviewUrl(url);
      else URL.revokeObjectURL(url);
    } catch {
      if (previewRequest.current === requestId) setError("Impossible d’afficher ce justificatif. Réessayez.");
    } finally {
      if (previewRequest.current === requestId) setBusyAction(null);
    }
  };

  const downloadDocument = async (file: MissionDocument) => {
    setBusyAction({ id: file.id, action: "download" });
    setError(null);
    try {
      const blob = await apiRequest<Blob>(`/documents/${encodeURIComponent(file.id)}`, { responseType: "blob" });
      downloadBlob(blob, file.fileName);
    } catch {
      setError("Impossible de télécharger ce document. Réessayez.");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <>
      <Card className="gap-3 rounded-2xl border-slate-200/80 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Documents</CardTitle>
            <p className="mt-1 text-xs text-slate-500">Justificatifs et fichiers associés à la mission</p>
          </div>
          <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700" aria-label={`${mission.documents?.length ?? 0} documents`}>
            {mission.documents?.length ?? 0}
          </span>
        </div>
        {error && !selectedDocument && <Alert tone="danger"><AlertCircle aria-hidden="true" /><span>{error}</span></Alert>}
        {mission.documents?.length ? (
          <ul className="mt-1 divide-y divide-slate-200/80">
            {mission.documents.map((file) => {
              const Icon = getFileIcon(file.mimeType);
              const isImage = file.mimeType.startsWith("image/");
              const isBusy = busyAction?.id === file.id;

              return (
                <li key={file.id} className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{file.fileName}</p>
                      <p className="text-xs text-slate-500">{getDocumentTypeLabel(file.documentType)} · {file.mimeType}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    {isImage && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void previewDocument(file)}
                        disabled={busyAction !== null}
                        leftIcon={isBusy && busyAction?.action === "preview" ? <LoaderCircle className="animate-spin" /> : <Eye />}
                      >
                        {isBusy && busyAction?.action === "preview" ? "Chargement..." : "Voir"}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void downloadDocument(file)}
                      disabled={busyAction !== null}
                      leftIcon={isBusy && busyAction?.action === "download" ? <LoaderCircle className="animate-spin" /> : <Download />}
                    >
                      {isBusy && busyAction?.action === "download" ? "Téléchargement..." : "Télécharger"}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-500">
            <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
            <p>Aucun document disponible pour cette mission.</p>
          </div>
        )}
      </Card>

      <Dialog open={selectedDocument !== null} onOpenChange={(open) => { if (!open) closePreview(); }}>
        <DialogContent className="grid h-[min(88dvh,52rem)] w-[calc(100vw-1rem)] max-w-4xl grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden p-3 sm:w-[calc(100vw-2rem)] sm:p-4">
          <DialogHeader className="pr-7">
            <DialogTitle className="truncate">Aperçu du justificatif</DialogTitle>
            <DialogDescription className="truncate">{selectedDocument?.fileName}</DialogDescription>
          </DialogHeader>
          <div className="flex min-h-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-2">
            {busyAction?.action === "preview" ? (
              <div className="flex items-center gap-2 text-sm text-slate-500" role="status"><LoaderCircle className="h-5 w-5 animate-spin text-indigo-700" aria-hidden="true" />Chargement de l’image...</div>
            ) : error ? (
              <div className="flex items-center gap-2 text-sm text-rose-700"><TriangleAlert className="h-4 w-4" aria-hidden="true" />{error}</div>
            ) : previewUrl ? (
              <img src={previewUrl} alt={selectedDocument?.fileName ?? "Justificatif de la mission"} className="max-h-full max-w-full rounded-lg object-contain" />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

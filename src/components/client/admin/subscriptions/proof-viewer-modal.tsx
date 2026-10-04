"use client";

import { useState } from "react";
import { GlobalModal, Button, Badge } from "@/components";
import { useModal } from "@/stores/modal/use-modal-store";
import {
  FileText,
  Download,
  RotateCw,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  DollarSign,
  Hash,
} from "lucide-react";

export function ProofViewerModal() {
  const { open, modalData, closeModal } = useModal();
  const proof = modalData["proof-viewer"] as
    | { url: string; title?: string; amount?: string; reference?: string }
    | undefined;

  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  if (!open["proof-viewer"] || !proof) return null;

  const isPdf = proof.url?.toLowerCase().endsWith(".pdf") || proof.url?.includes("application/pdf");

  const handleClose = () => {
    setRotation(0);
    setZoom(1);
    closeModal("proof-viewer");
  };

  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));

  return (
    <GlobalModal
      id="proof-viewer"
      title={
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">{proof.title || "Comprovativo de Pagamento"}</span>
        </div>
      }
      description={
        <div className="flex flex-wrap items-center gap-3 text-xs mt-1">
          {proof.amount && (
            <span className="flex items-center gap-1 font-semibold text-emerald-500">
              <DollarSign className="h-3.5 w-3.5" /> {proof.amount}
            </span>
          )}
          {proof.reference && (
            <span className="flex items-center gap-1 font-mono text-muted-foreground">
              <Hash className="h-3.5 w-3.5" /> Ref: {proof.reference}
            </span>
          )}
        </div>
      }
      canClose
      className="max-w-3xl"
      headerExtra={
        !isPdf && (
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={handleRotate} title="Rodar 90º">
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut} title="Diminuir Zoom">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-mono px-1 text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn} title="Aumentar Zoom">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        )
      }
      footer={
        <>
          {proof.url && (
            <a href={proof.url} target="_blank" rel="noopener noreferrer" download>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1.5" /> Descarregar Original
              </Button>
            </a>
          )}
          <Button variant="default" size="sm" onClick={handleClose}>
            Fechar
          </Button>
        </>
      }
    >
      <div className="mt-2 flex min-h-[400px] max-h-[65vh] items-center justify-center overflow-auto rounded-xl border border-border bg-black/40 p-4">
        {isPdf ? (
          <iframe
            src={proof.url}
            className="h-[550px] w-full rounded-lg border-0"
            title="Comprovativo PDF"
          />
        ) : (
          <div className="overflow-auto max-w-full max-h-full flex items-center justify-center">
            <img
              src={proof.url}
              alt="Comprovativo de Pagamento"
              className="max-h-[500px] w-auto rounded object-contain transition-transform duration-200"
              style={{
                transform: `rotate(${rotation}deg) scale(${zoom})`,
              }}
            />
          </div>
        )}
      </div>
    </GlobalModal>
  );
}

'use client';

import { useState } from 'react';
import {
  Heart,
  XCircle,
  CheckCircle2,
  ZoomIn,
  MessageSquare,
  Sparkles,
  CreditCard,
  AlertCircle,
  X,
  Send,
  Lock,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonSubmit } from '@/components/ui/button-submit';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { portalService, PortalDeliverableAsset } from '@/services/portal-service';
import { toast } from 'sonner';

interface PhotoProofingGalleryProps {
  token: string;
  assets: PortalDeliverableAsset[];
  includedPhotosCount?: number;
  extraPhotoPrice?: number;
  allowExtraPurchase?: boolean;
  canDownloadMaster?: boolean;
  onRequestMasterDownload?: (assetId: string) => void;
  onOpenCheckout: (selectedAssetIds: string[], extraCount: number, totalAmount: number) => void;
  onAssetUpdated: () => void;
}

export function PhotoProofingGallery({
  token,
  assets,
  includedPhotosCount = 0,
  extraPhotoPrice = 2500,
  allowExtraPurchase = true,
  canDownloadMaster = false,
  onRequestMasterDownload,
  onOpenCheckout,
  onAssetUpdated,
}: PhotoProofingGalleryProps) {
  const [activeLightbox, setActiveLightbox] = useState<PortalDeliverableAsset | null>(null);

  // Reject modal state
  const [rejectingAsset, setRejectingAsset] = useState<PortalDeliverableAsset | null>(null);
  const [feedback, setFeedback] = useState('');
  const [clientName, setClientName] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Optimistic review tracking
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const acceptedAssets = assets.filter((a) => a.status === 'ACCEPTED');
  const rejectedAssets = assets.filter((a) => a.status === 'REJECTED');
  const pendingAssets = assets.filter((a) => !a.status || a.status === 'PENDING');

  const acceptedCount = acceptedAssets.length;
  const extraPhotosCount = Math.max(0, acceptedCount - includedPhotosCount);
  const extraTotalAmount = extraPhotosCount * (extraPhotoPrice || 2500);

  const handleToggleAccept = async (asset: PortalDeliverableAsset) => {
    const nextStatus = asset.status === 'ACCEPTED' ? 'PENDING' : 'ACCEPTED';
    setActionLoadingId(asset.id);

    try {
      await portalService.reviewAsset(token, asset.id, {
        status: nextStatus,
        clientName: clientName || 'Cliente',
      });
      toast.success(
        nextStatus === 'ACCEPTED'
          ? 'Foto selecionada com sucesso!'
          : 'Seleção removida.'
      );
      onAssetUpdated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Falha ao atualizar seleção da foto.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenRejectModal = (asset: PortalDeliverableAsset) => {
    setRejectingAsset(asset);
    setFeedback(asset.feedback || '');
  };

  const handleSubmitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingAsset) return;
    if (!feedback.trim()) {
      toast.error('Indique o seu parecer sobre os ajustes desejados para esta fotografia.');
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      await portalService.reviewAsset(token, rejectingAsset.id, {
        status: 'REJECTED',
        feedback: feedback.trim(),
        clientName: clientName || 'Cliente',
      });
      toast.success('Parecer registado! A equipa irá efetuar os ajustes solicitados.');
      setRejectingAsset(null);
      setFeedback('');
      onAssetUpdated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Falha ao registar parecer.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Proofing Status Banner */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">
                Seleção &amp; Validação de Fotografias (Photo Proofing)
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Clique no ícone de coração no canto de cada foto para escolher as que deseja receber.
            </p>
          </div>

          {/* Counters Pill */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-xl bg-muted/60 px-3 py-1.5 font-medium border border-border/50">
              <span className="text-muted-foreground">Pacote contratado:</span>
              <span className="font-semibold text-foreground">{includedPhotosCount} fotos</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-3 py-1.5 font-medium border border-rose-500/20 text-rose-500">
              <Heart className="h-3.5 w-3.5 fill-current" />
              <span>{acceptedCount} selecionadas</span>
            </div>
            {rejectedAssets.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3 py-1.5 font-medium border border-amber-500/20 text-amber-500">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{rejectedAssets.length} com parecer</span>
              </div>
            )}
          </div>
        </div>

        {/* Extra photos alert bar */}
        {extraPhotosCount > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 text-xs text-amber-600 dark:text-amber-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
              <div>
                <span className="font-semibold">Atenção:</span> Selecionou{' '}
                <span className="font-semibold text-foreground underline">{extraPhotosCount} foto(s) extra</span>{' '}
                além das {includedPhotosCount} contratadas. Total adicional:{' '}
                <span className="font-semibold text-foreground">
                  {new Intl.NumberFormat('pt-AO', {
                    style: 'currency',
                    currency: 'AOA',
                  }).format(extraTotalAmount)}
                </span>
              </div>
            </div>

            {allowExtraPurchase && (
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  onOpenCheckout(
                    acceptedAssets.map((a) => a.id),
                    extraPhotosCount,
                    extraTotalAmount
                  )
                }
                className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-1.5 rounded-xl shadow-sm"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Pagar Fotos Adicionais
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {assets.map((asset) => {
          const isAccepted = asset.status === 'ACCEPTED';
          const isRejected = asset.status === 'REJECTED';
          const isLoading = actionLoadingId === asset.id;

          return (
            <div
              key={asset.id}
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 bg-card ${
                isAccepted
                  ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-md'
                  : isRejected
                  ? 'border-amber-500/70 opacity-90'
                  : 'border-border/80 hover:border-primary/50'
              }`}
            >
              {/* Image Preview with 4:5 Portrait Aspect */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/5 dark:bg-black/40">
                <img
                  src={asset.thumbnailUrl || asset.previewUrl || asset.downloadUrl || ''}
                  alt={asset.label || asset.filename}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Dark gradient overlay for bottom actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                {/* Top Left: Status Badge */}
                <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                  {isAccepted && (
                    <Badge className="bg-rose-500 text-white font-semibold text-[10px] py-0.5 px-2 rounded-lg gap-1 border-none shadow">
                      <Heart className="h-2.5 w-2.5 fill-current" /> Selecionada
                    </Badge>
                  )}
                  {isRejected && (
                    <Badge className="bg-amber-500 text-white font-semibold text-[10px] py-0.5 px-2 rounded-lg gap-1 border-none shadow">
                      <MessageSquare className="h-2.5 w-2.5" /> Com Parecer
                    </Badge>
                  )}
                </div>

                {/* Top Right: Lightbox & Reject Actions */}
                <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveLightbox(asset)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white/90 backdrop-blur-md hover:bg-black/80 hover:text-white transition shadow"
                    title="Ampliar Foto"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenRejectModal(asset)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg backdrop-blur-md transition shadow ${
                      isRejected
                        ? 'bg-amber-500 text-white'
                        : 'bg-black/60 text-white/90 hover:bg-amber-500 hover:text-white'
                    }`}
                    title="Solicitar Ajuste / Parecer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* BOTTOM RIGHT: HEART ICON BUTTON (Mandatory position) */}
                <div className="absolute bottom-3 right-3 z-10">
                  <button
                    type="button"
                    onClick={() => handleToggleAccept(asset)}
                    disabled={isLoading}
                    aria-label="Escolher foto"
                    className={`group/heart flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 shadow-xl ${
                      isAccepted
                        ? 'bg-rose-500 text-white scale-105 shadow-rose-500/40'
                        : 'bg-black/65 text-white/90 hover:bg-rose-500 hover:text-white hover:scale-110 active:scale-95'
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 transition-transform duration-200 ${
                        isAccepted ? 'fill-current scale-110' : 'group-hover/heart:fill-current'
                      }`}
                    />
                  </button>
                </div>

                {/* Bottom Left: Filename / Label */}
                <div className="absolute bottom-3 left-3 right-14 z-10 text-white truncate text-[11px] font-medium">
                  {asset.label || asset.filename}
                </div>
              </div>

              {/* Feedback note preview if rejected */}
              {isRejected && asset.feedback && (
                <div className="p-3 bg-amber-500/10 border-t border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                  <div className="flex items-center gap-1 font-semibold mb-0.5">
                    <MessageSquare className="h-3 w-3" /> Parecer de Ajuste:
                  </div>
                  <p className="line-clamp-2 text-[11px] text-muted-foreground">{asset.feedback}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div
          onClick={() => setActiveLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/10 bg-black"
          >
            <button
              type="button"
              onClick={() => setActiveLightbox(null)}
              className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white hover:bg-white/20 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={activeLightbox.previewUrl || activeLightbox.downloadUrl || ''}
              alt={activeLightbox.filename}
              className="max-h-[85vh] max-w-[85vw] object-contain"
            />
            <div className="p-3 bg-zinc-900/90 text-white text-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-100">{activeLightbox.label || activeLightbox.filename}</span>
                <span className="text-[11px] text-zinc-400 font-mono bg-white/10 px-2 py-0.5 rounded">Preview Otimizado</span>
              </div>
              {canDownloadMaster ? (
                onRequestMasterDownload ? (
                  <button
                    type="button"
                    onClick={() => onRequestMasterDownload(activeLightbox.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-500 transition shadow cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Descarregar Alta Resolução</span>
                  </button>
                ) : activeLightbox.downloadUrl ? (
                  <a
                    href={activeLightbox.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-500 transition shadow"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Descarregar Alta Resolução</span>
                  </a>
                ) : null
              ) : (
                <div
                  className="flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 border border-amber-500/30 text-[11px] font-medium text-amber-300 cursor-help"
                  title="Ficheiros em alta resolução originais liberados após aprovação formal e liquidação."
                >
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Alta Resolução Bloqueada (Requer Aprovação)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection / Feedback Modal */}
      {rejectingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm">
                <MessageSquare className="h-4 w-4" /> Parecer sobre a Fotografia
              </div>
              <button
                type="button"
                onClick={() => setRejectingAsset(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Foto:{' '}
              <span className="font-semibold text-foreground">
                {rejectingAsset.label || rejectingAsset.filename}
              </span>
              . Descreva as correções necessárias (ex.: iluminação, enquadramento, retoque de pele, remoção de elemento).
            </p>

            <form onSubmit={handleSubmitReject} className="space-y-3">
              <Input
                label="O seu Nome"
                placeholder="Ex: Maria Fernandes"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Parecer / Notas de Ajuste *
                </label>
                <Textarea
                  rows={4}
                  placeholder="Ex: Por favor ajustar o brilho e retirar o reflexo do óculos..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejectingAsset(null)}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
                <ButtonSubmit
                  isLoading={isSubmittingFeedback}
                  className="rounded-xl bg-amber-500 text-white hover:bg-amber-600 gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submeter Parecer
                </ButtonSubmit>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

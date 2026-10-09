'use client';

import { useState, useMemo, useEffect } from 'react';
import { Deliverable } from '@/types';
import { ItemStatusBadge } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Camera,
  Heart,
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MessageSquare,
  Send,
  X,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export interface PhotoItem {
  id: string;
  url: string;
  thumbnailUrl: string;
  filename: string;
  resolution?: string;
  sizeBytes?: number;
  status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED';
  feedback?: string;
}

interface PortalPhotoshootGalleryProps {
  deliverable: Deliverable;
  onApproveAll?: () => void;
  onRequestChanges?: (notes: string) => void;
}

// Função de download direto em blob sem redirecionamento para nova janela
async function downloadDirectly(url: string, filename: string): Promise<boolean> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('Falha na resposta HTTP');
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    return true;
  } catch {
    // Fallback via elemento canvas se o host da imagem tiver restrições CORS estritas
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        await new Promise<void>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) {
              const blobUrl = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = blobUrl;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
            }
            resolve();
          }, 'image/jpeg', 0.95);
        });
        return true;
      }
    } catch {
      // Fallback final direto
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_self';
      link.click();
      return true;
    }
  }
  return false;
}

export function PortalPhotoshootGallery({
  deliverable,
  onApproveAll,
  onRequestChanges,
}: PortalPhotoshootGalleryProps) {
  // Inicialização de fotos a partir dos assets ou fallback demonstrativo de alta fidelidade
  const initialPhotos: PhotoItem[] = useMemo(() => {
    if ((deliverable as any).photos && Array.isArray((deliverable as any).photos)) {
      return (deliverable as any).photos;
    }

    if (deliverable.assets && deliverable.assets.length > 0) {
      return deliverable.assets.map((asset, idx) => ({
        id: asset.id,
        url: (asset as any).url || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
        thumbnailUrl: (asset as any).thumbnailUrl || (asset as any).url || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
        filename: asset.label || `Foto_${String(idx + 1).padStart(2, '0')}.jpg`,
        resolution: '4480x6720',
        sizeBytes: 18400000,
        status: (asset as any).status || 'PENDING',
        feedback: (asset as any).feedback,
      }));
    }

    return [];
  }, [deliverable]);

  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'CHANGES_REQUESTED'>('ALL');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [retouchNotes, setRetouchNotes] = useState('');
  const [isFinishingSelection, setIsFinishingSelection] = useState(false);
  const [isDownloadingSelected, setIsDownloadingSelected] = useState(false);

  const includedQuota = deliverable.includedPhotosCount || 10;
  const extraPhotoPrice = deliverable.extraPhotoPrice || 25000;

  const approvedPhotos = useMemo(() => photos.filter((p) => p.status === 'APPROVED'), [photos]);
  const extraPhotosCount = Math.max(0, approvedPhotos.length - includedQuota);

  const filteredPhotos = useMemo(() => {
    if (activeFilter === 'ALL') return photos;
    return photos.filter((p) => p.status === activeFilter);
  }, [photos, activeFilter]);

  const currentLightboxPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  // Atualizar notas quando navegar no lightbox
  useEffect(() => {
    if (currentLightboxPhoto) {
      setRetouchNotes(currentLightboxPhoto.feedback || '');
    }
  }, [currentLightboxPhoto?.id]);

  // Teclas de atalho para lightbox (setas e ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1));
      } else if (e.key === 'Escape') {
        setLightboxIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredPhotos.length]);

  const togglePhotoApproval = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === photoId) {
          const nextStatus = p.status === 'APPROVED' ? 'PENDING' : 'APPROVED';
          toast.success(
            nextStatus === 'APPROVED'
              ? `Foto "${p.filename}" adicionada às suas favoritas!`
              : `Foto "${p.filename}" removida da seleção.`
          );
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  const handleSavePhotoFeedback = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === photoId) {
          return { ...p, status: 'CHANGES_REQUESTED', feedback: retouchNotes.trim() };
        }
        return p;
      })
    );
    toast.success('Nota de retoque guardada para esta foto!');
  };

  const handleFinishSelection = () => {
    setIsFinishingSelection(true);
    setTimeout(() => {
      setIsFinishingSelection(false);
      toast.success(
        `Seleção concluída com sucesso! ${approvedPhotos.length} fotos confirmadas para exportação final.`
      );
      onApproveAll?.();
    }, 600);
  };

  const handleDownloadSinglePhoto = async (photo: PhotoItem) => {
    toast.loading(`A preparar download direto de "${photo.filename}"...`, { id: `dl-${photo.id}` });
    const success = await downloadDirectly(photo.url, photo.filename);
    if (success) {
      toast.success(`Download de "${photo.filename}" concluído!`, { id: `dl-${photo.id}` });
    } else {
      toast.error(`Não foi possível transferir o ficheiro.`, { id: `dl-${photo.id}` });
    }
  };

  const handleDownloadSelectedPhotos = async () => {
    if (approvedPhotos.length === 0) {
      toast.error('Nenhuma foto aprovada/selecionada para descarregar.');
      return;
    }

    setIsDownloadingSelected(true);
    toast.info(`A iniciar descarregamento direto de ${approvedPhotos.length} foto(s) selecionada(s)...`);

    let count = 0;
    for (const photo of approvedPhotos) {
      await downloadDirectly(photo.url, photo.filename);
      count++;
      // Pequeno intervalo entre disparos para não bloquear o navegador
      await new Promise((r) => setTimeout(r, 400));
    }

    setIsDownloadingSelected(false);
    toast.success(`Concluído! ${count} foto(s) transferida(s) com sucesso.`);
  };

  return (
    <div className="border border-border bg-card p-6 lg:p-8 space-y-6">
      {/* Cabeçalho da Sessão Fotográfica */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-primary" />
              v{deliverable.version} • Sessão Fotográfica
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-xs font-mono text-muted-foreground">
              {deliverable.project?.title || 'Projecto de Estúdio'}
            </span>
            {deliverable.hasWatermark && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-muted border border-border text-muted-foreground">
                  Marca de Prova Activa
                </span>
              </>
            )}
          </div>

          <h2 className="text-lg font-semibold text-foreground mt-0.5">
            {deliverable.title}
          </h2>
        </div>

        <ItemStatusBadge status={deliverable.status} />
      </div>

      {/* Barra de Controlo de Seleção, Quota & Downloads em Lote */}
      <div className="p-4 rounded-xs border border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
              Fotos Selecionadas (Favoritas)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-mono text-foreground flex items-center gap-1.5">
                <Heart className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                {approvedPhotos.length} / {photos.length}
              </span>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold">
                {includedQuota} incluídas no pacote
              </Badge>
            </div>
          </div>

          {extraPhotosCount > 0 && (
            <div className="space-y-0.5 border-l border-border pl-4">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                Fotos Extras Adicionais
              </span>
              <span className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400">
                +{extraPhotosCount} fotos ({(extraPhotosCount * extraPhotoPrice).toLocaleString('pt-AO')} Kz)
              </span>
            </div>
          )}
        </div>

        {/* Ações de Download e Conclusão */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadSelectedPhotos}
            disabled={approvedPhotos.length === 0 || isDownloadingSelected}
            className="text-xs gap-1.5 border-border rounded-none h-9 font-medium"
            title="Descarregar todas as fotos selecionadas diretamente no dispositivo"
          >
            <Download className="h-3.5 w-3.5" />
            {isDownloadingSelected ? 'A Transferir...' : `Baixar Selecionadas (${approvedPhotos.length})`}
          </Button>

          <Button
            size="sm"
            onClick={handleFinishSelection}
            disabled={approvedPhotos.length === 0 || isFinishingSelection}
            className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-none h-9 font-semibold"
          >
            <Heart className="h-3.5 w-3.5 fill-current" />
            {isFinishingSelection ? 'A Confirmar...' : `Aprovar Seleção (${approvedPhotos.length} fotos)`}
          </Button>
        </div>
      </div>

      {/* Filtros da Galeria */}
      <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Button
            size="sm"
            variant={activeFilter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('ALL')}
            className="rounded-none text-xs h-7 px-2.5"
          >
            Todas ({photos.length})
          </Button>
          <Button
            size="sm"
            variant={activeFilter === 'APPROVED' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('APPROVED')}
            className={`rounded-none text-xs h-7 px-2.5 gap-1.5 ${
              activeFilter === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
            }`}
          >
            <Heart className={`h-3 w-3 ${activeFilter === 'APPROVED' ? 'fill-white text-white' : 'fill-emerald-500 text-emerald-500'}`} />
            Aprovadas ({approvedPhotos.length})
          </Button>
          <Button
            size="sm"
            variant={activeFilter === 'PENDING' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('PENDING')}
            className="rounded-none text-xs h-7 px-2.5"
          >
            Pendentes ({photos.filter((p) => p.status === 'PENDING').length})
          </Button>
          <Button
            size="sm"
            variant={activeFilter === 'CHANGES_REQUESTED' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('CHANGES_REQUESTED')}
            className={`rounded-none text-xs h-7 px-2.5 ${
              activeFilter === 'CHANGES_REQUESTED' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''
            }`}
          >
            Com Retoque ({photos.filter((p) => p.status === 'CHANGES_REQUESTED').length})
          </Button>
        </div>

        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          Clique na foto para abrir o Lightbox de alta resolução
        </span>
      </div>

      {/* Grade de Fotos (Masonry / Cards) ou Empty State */}
      {photos.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center bg-card space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-none bg-muted border border-border text-muted-foreground">
            <Camera className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Galeria sem Fotografias</h3>
            <p className="text-xs text-muted-foreground">
              Ainda não foram carregados ficheiros de fotografia para esta sessão pela equipa de estúdio.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredPhotos.map((photo, index) => {
            const isApproved = photo.status === 'APPROVED';
            const hasFeedback = photo.status === 'CHANGES_REQUESTED';

            return (
              <div
                key={photo.id}
                className={`group relative rounded-none border overflow-hidden bg-muted/30 transition-all ${
                  isApproved
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : hasFeedback
                    ? 'border-amber-500 ring-1 ring-amber-500/20'
                    : 'border-border hover:border-border/90'
                }`}
              >
                {/* Imagem com Proporção 3:4 */}
                <div
                  onClick={() => setLightboxIndex(index)}
                  className="relative aspect-[3/4] w-full cursor-pointer overflow-hidden bg-black/40"
                >
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.filename}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Marca d'Água Sutil e Discreta (Não obstrui a avaliação da foto) */}
                  {deliverable.hasWatermark && (
                    <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center">
                      <div className="transform -rotate-25 select-none text-center opacity-15">
                        <span className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] font-medium text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] border-y border-white/20 py-0.5 px-3">
                          NORA PROOF
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Overlay no Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <div className="p-2 rounded-none bg-black/60 text-white">
                      <Maximize2 className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Badge de Número da Foto */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] font-mono font-semibold">
                    #{String(index + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* Botão de Seleção Rápida (Coração Verde) no Topo Direito com Touch Target Acessível */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePhotoApproval(photo.id);
                  }}
                  className={`absolute top-2 right-2 h-9 w-9 sm:h-8 sm:w-8 rounded-none flex items-center justify-center shadow-md transition-all ${
                    isApproved
                      ? 'bg-emerald-600 text-white'
                      : 'bg-black/60 text-white/70 hover:text-white hover:bg-black/80'
                  }`}
                  title={isApproved ? 'Remover da seleção' : 'Aprovar / Favoritar esta foto'}
                  aria-label={isApproved ? 'Remover da seleção' : 'Aprovar esta foto'}
                >
                  <Heart className={`h-4 w-4 sm:h-3.5 sm:w-3.5 ${isApproved ? 'fill-current text-white stroke-[2.5]' : 'stroke-2'}`} />
                </button>

                {/* Barra Inferior do Card */}
                <div className="p-2.5 bg-card border-t border-border space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] font-medium text-foreground truncate max-w-[130px]">
                      {photo.filename}
                    </span>
                    <button
                      onClick={() => handleDownloadSinglePhoto(photo)}
                      className="text-muted-foreground hover:text-foreground p-1.5 sm:p-1 -mr-1 flex items-center justify-center"
                      title="Descarregar foto diretamente"
                      aria-label="Descarregar foto diretamente"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{photo.resolution || 'RAW'}</span>
                  {hasFeedback ? (
                    <span className="text-amber-500 font-semibold flex items-center gap-1">
                      <MessageSquare className="h-2.5 w-2.5" /> Retoque
                    </span>
                  ) : isApproved ? (
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <Heart className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" /> Aprovada
                    </span>
                  ) : (
                    <span>Pendente</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Lightbox em Tela Cheia Interativo */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && setLightboxIndex(null)}>
        <DialogContent className="max-w-6xl w-full h-[90vh] bg-black/95 text-white p-0 border-border/40 rounded-none flex flex-col overflow-hidden">
          {currentLightboxPhoto && (
            <div className="flex flex-col md:flex-row h-full w-full">
              {/* Área Principal da Imagem */}
              <div className="flex-1 relative flex items-center justify-center p-4 bg-black/80 overflow-hidden">
                <img
                  src={currentLightboxPhoto.url}
                  alt={currentLightboxPhoto.filename}
                  className="max-h-full max-w-full object-contain"
                />

                {/* Marca d'Água Sutil no Lightbox Fullscreen */}
                {deliverable.hasWatermark && (
                  <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center">
                    <div className="transform -rotate-20 select-none text-center opacity-15">
                      <span className="font-mono text-xs md:text-sm tracking-[0.4em] font-medium text-white uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] border-y border-white/25 py-1 px-8">
                        NORA PROOF • PROVA DE SELEÇÃO
                      </span>
                    </div>
                  </div>
                )}

                {/* Botões de Navegação Anterior/Seguinte */}
                <button
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-none bg-black/60 text-white/80 hover:text-white hover:bg-black/90 transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-none bg-black/60 text-white/80 hover:text-white hover:bg-black/90 transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Contador de Foto no Topo */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 text-xs font-mono">
                  {(lightboxIndex ?? 0) + 1} de {filteredPhotos.length} • {currentLightboxPhoto.filename}
                </div>
              </div>

              {/* Painel Lateral de Avaliação & Retoque */}
              <div className="w-full md:w-80 bg-zinc-950 border-t md:border-t-0 md:border-l border-zinc-800 p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Inspeção de Foto
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        {currentLightboxPhoto.resolution} • Master
                      </p>
                    </div>
                    <button
                      onClick={() => setLightboxIndex(null)}
                      className="text-zinc-400 hover:text-white p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Botão de Aprovação com Coração Verde */}
                  <Button
                    onClick={() => togglePhotoApproval(currentLightboxPhoto.id)}
                    className={`w-full text-xs font-semibold gap-2 rounded-none h-10 ${
                      currentLightboxPhoto.status === 'APPROVED'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${currentLightboxPhoto.status === 'APPROVED' ? 'fill-current text-white' : ''}`} />
                    {currentLightboxPhoto.status === 'APPROVED'
                      ? 'Foto Aprovada (Favorita)'
                      : 'Aprovar Esta Foto'}
                  </Button>

                  {/* Notas de Retoque / Ajustes Específicos */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                      Solicitar Retoque / Ajuste
                    </label>
                    <Textarea
                      rows={3}
                      value={retouchNotes}
                      onChange={(e) => setRetouchNotes(e.target.value)}
                      placeholder="Ex: Suavizar sombra no pescoço, remover manchas ou ajustar contraste..."
                      className="text-xs bg-zinc-900 border-zinc-700 text-white rounded-none resize-none"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSavePhotoFeedback(currentLightboxPhoto.id)}
                      disabled={!retouchNotes.trim()}
                      className="w-full text-xs gap-1.5 bg-primary text-primary-foreground rounded-none h-8"
                    >
                      <Send className="h-3 w-3" />
                      Salvar Pedido de Retoque
                    </Button>
                  </div>
                </div>

                {/* Download Individual da Imagem Diretamente */}
                <div className="pt-3 border-t border-zinc-800">
                  <Button
                    onClick={() => handleDownloadSinglePhoto(currentLightboxPhoto)}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1.5 border-zinc-700 text-zinc-300 hover:text-white rounded-none h-9"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descarregar Imagem Direta
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

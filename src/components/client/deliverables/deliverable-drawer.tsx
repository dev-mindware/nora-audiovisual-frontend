'use client';

import { useState, useMemo, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Button,
  ButtonSubmit,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { InputCurrency } from '@/components/ui/input-currency';
import { PaginatedSelect } from '@/components/shared';
import { useCreateDeliverable, useDeliverableTypes } from '@/hooks/deliverables';
import { useProjects } from '@/hooks/projects';
import { storageUploadService, UploadedAsset } from '@/services/storage-upload-service';
import {
  Video,
  Camera,
  UploadCloud,
  X,
  Play,
  Maximize2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Film,
  Sparkles,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

interface DeliverableDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

interface LocalMediaItem {
  id: string;
  file: File;
  previewUrl: string;
  type: 'PHOTO' | 'VIDEO' | 'OTHER';
  progress: number;
  uploadedAssetId?: string;
  error?: string;
}

export function DeliverableDrawer({
  isOpen,
  onClose,
  defaultProjectId,
}: DeliverableDrawerProps) {
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects();
  const projects = projectsData?.data || [];
  const [projectSearch, setProjectSearch] = useState('');
  const { types: deliverableTypes } = useDeliverableTypes();

  const [mediaItems, setMediaItems] = useState<LocalMediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [previewModalUrl, setPreviewModalUrl] = useState<{ url: string; type: 'PHOTO' | 'VIDEO' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || '');
  const [type, setType] = useState('FINAL_MASTER');
  const [includedPhotosCount, setIncludedPhotosCount] = useState<number>(25);
  const [extraPhotoPrice, setExtraPhotoPrice] = useState<number>(2500);
  const [allowExtraPurchase, setAllowExtraPurchase] = useState(true);
  const [hasWatermark, setHasWatermark] = useState(true);
  const [notes, setNotes] = useState('');

  const { mutateAsync: createDeliverable } = useCreateDeliverable(selectedProjectId);

  const isPhotoshoot = type === 'PHOTOSHOOT';

  const projectOptions = useMemo(() => {
    return projects
      .filter((p) =>
        projectSearch ? p.title.toLowerCase().includes(projectSearch.toLowerCase()) : true
      )
      .map((p) => ({
        label: p.title,
        value: p.id,
      }));
  }, [projects, projectSearch]);

  const handleFilesSelected = (files: FileList | File[]) => {
    const newItems: LocalMediaItem[] = [];

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const previewUrl = URL.createObjectURL(file);

      newItems.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        previewUrl,
        type: isImage ? 'PHOTO' : isVideo ? 'VIDEO' : 'OTHER',
        progress: 0,
      });
    });

    setMediaItems((prev) => [...prev, ...newItems]);
  };

  const handleRemoveMedia = (id: string) => {
    setMediaItems((prev) => {
      const item = prev.find((m) => m.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((m) => m.id !== id);
    });
  };

  const handleClearAll = () => {
    mediaItems.forEach((m) => URL.revokeObjectURL(m.previewUrl));
    setMediaItems([]);
  };

  const handleCancel = () => {
    if (isUploading) return;
    handleClearAll();
    setTitle('');
    setNotes('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProjectId) {
      toast.error('Selecione um projecto audiovisual.');
      return;
    }
    if (!title.trim()) {
      toast.error('Insira o título do entregável.');
      return;
    }
    if (mediaItems.length === 0) {
      toast.error('Selecione pelo menos um ficheiro de mídia para o entregável.');
      return;
    }

    try {
      setIsUploading(true);
      const uploadedAssets: { fileAssetId: string; label?: string }[] = [];

      // Upload sequencial/concorrente para o Cloudflare R2
      for (let i = 0; i < mediaItems.length; i++) {
        const item = mediaItems[i];
        setUploadStatusText(`A carregar ficheiro ${i + 1} de ${mediaItems.length}: ${item.file.name}...`);

        try {
          const asset = await storageUploadService.uploadFile(
            item.file,
            selectedProjectId,
            (percent) => {
              setMediaItems((current) =>
                current.map((m) => (m.id === item.id ? { ...m, progress: percent } : m))
              );
            }
          );

          uploadedAssets.push({
            fileAssetId: asset.id,
            label: item.file.name,
          });
        } catch (uploadErr: any) {
          console.error(`Erro ao carregar ${item.file.name}:`, uploadErr);
          throw new Error(`Falha no upload do ficheiro "${item.file.name}".`);
        }
      }

      setUploadStatusText('A registar pacote de entregável...');

      // Criar entregável único vinculando todos os assets carregados
      await createDeliverable({
        title: title.trim(),
        type: type as any,
        notes: notes.trim() || undefined,
        includedPhotosCount: isPhotoshoot ? Number(includedPhotosCount) : undefined,
        extraPhotoPrice: isPhotoshoot ? Number(extraPhotoPrice) : undefined,
        allowExtraPurchase: isPhotoshoot ? allowExtraPurchase : undefined,
        assets: uploadedAssets,
      } as any);

      toast.success(
        isPhotoshoot
          ? `Sessão de fotos gravada com ${uploadedAssets.length} fotos prontas no entregável!`
          : `Entregável "${title}" gravado com ${uploadedAssets.length} ficheiro(s)!`
      );

      handleCancel();
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao processar upload e gravação do entregável.');
    } finally {
      setIsUploading(false);
      setUploadStatusText('');
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-3xl md:max-w-4xl p-0 flex flex-col h-full bg-card border-l border-border"
        >
          {/* Header Fixo */}
          <SheetHeader className="px-6 py-4 border-b border-border bg-muted/20 shrink-0">
            <div className="flex items-center gap-2.5 text-primary">
              {isPhotoshoot ? <Camera className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              <SheetTitle className="text-base font-semibold uppercase tracking-wider text-foreground">
                Registo de Entregável / Copião & Galeria
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted-foreground">
              Carregamento direto para Cloudflare R2 com pré-visualização instantânea antes da gravação.
            </SheetDescription>
          </SheetHeader>

          {/* Corpo do Formulário */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <form id="deliverable-drawer-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Projeto e Título */}
              <div className="p-4 rounded-xs border border-border bg-background space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Projecto Audiovisual <span className="text-destructive">*</span>
                  </label>
                  <PaginatedSelect
                    value={selectedProjectId}
                    options={projectOptions}
                    onChange={setSelectedProjectId}
                    isLoading={isLoadingProjects}
                    placeholder="Selecione o projecto associado..."
                    fullWidth
                    searchValue={projectSearch}
                    onSearchChange={setProjectSearch}
                    searchPlaceholder="Pesquisar por título de projecto..."
                    pagination={{ page: 1, totalPages: 1 }}
                    onPageChange={() => {}}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Título do Entregável / Pacote <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Ex: Ensaio Editorial Completo / Versão Master 4K"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="h-9 text-xs rounded-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Tipo de Entregável
                    </label>
                    <Select value={type} onValueChange={(val) => setType(val)}>
                      <SelectTrigger className="h-9 text-xs rounded-xs">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FINAL_MASTER" className="text-xs">
                          Vídeo Master Final (Aprovação)
                        </SelectItem>
                        <SelectItem value="PHOTOSHOOT" className="text-xs">
                          Sessão de Fotos (Galeria Fotográfica)
                        </SelectItem>
                        <SelectItem value="TEASER" className="text-xs">
                          Teaser / Short Promocional
                        </SelectItem>
                        <SelectItem value="TRAILER" className="text-xs">
                          Trailer Principal
                        </SelectItem>
                        <SelectItem value="SOCIAL_CUT" className="text-xs">
                          Corte para Redes / Reels / TikTok
                        </SelectItem>
                        <SelectItem value="RAW" className="text-xs">
                          Material Bruto / Copião de Rodagem
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Parâmetros Específicos para Pacote de Fotos */}
              {isPhotoshoot && (
                <div className="p-4 rounded-xs border border-primary/30 bg-primary/5 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                    <Camera className="h-4 w-4" />
                    Parâmetros Comerciais da Sessão Fotográfica
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <Input
                        type="quantity"
                        label="Fotos Incluídas no Contrato"
                        value={includedPhotosCount}
                        onChange={(e: any) => setIncludedPhotosCount(Number(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-1">
                      <InputCurrency
                        label="Preço por Foto Extra (Kz)"
                        value={extraPhotoPrice}
                        onValueChange={(val) => setExtraPhotoPrice(val)}
                        currency="Kz"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label htmlFor="allowExtra" className="text-xs font-medium text-foreground cursor-pointer">
                      Permitir que o cliente compre fotos extras no portal
                    </label>
                    <input
                      id="allowExtra"
                      type="checkbox"
                      checked={allowExtraPurchase}
                      onChange={(e) => setAllowExtraPurchase(e.target.checked)}
                      className="h-4 w-4 rounded-xs accent-primary cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Upload e Pré-visualização Dinâmica de Mídias */}
              <div className="p-4 rounded-xs border border-border bg-background space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Film className="h-4 w-4 text-primary" />
                    Mídias para Envio ao Cloudflare R2 ({mediaItems.length})
                  </div>
                  {mediaItems.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      disabled={isUploading}
                      className="text-[11px] text-destructive hover:underline"
                    >
                      Remover Todas
                    </button>
                  )}
                </div>

                {/* Dropzone de Ficheiros */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
                  className="hidden"
                />

                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (!isUploading && e.dataTransfer.files) {
                      handleFilesSelected(e.dataTransfer.files);
                    }
                  }}
                  className={`p-6 border-2 border-dashed rounded-xs text-center cursor-pointer transition-colors ${
                    isUploading
                      ? 'border-muted opacity-50 cursor-not-allowed'
                      : 'border-border/80 hover:border-primary/60 bg-muted/10 hover:bg-muted/20'
                  }`}
                >
                  <UploadCloud className="h-8 w-8 mx-auto text-primary mb-2 opacity-80" />
                  <p className="text-xs font-medium text-foreground">
                    Clique ou arraste arquivos para este entregável
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {isPhotoshoot
                      ? 'Selecione várias ou todas as fotos da sessão fotográfica (JPG, PNG, TIFF, DNG)'
                      : 'Selecione vídeos ou renders finais em alta definição (MP4, MOV, ProRes)'}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    className="mt-3 text-xs h-8 gap-1.5 rounded-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> Selecionar no Computador
                  </Button>
                </div>

                {/* Grade de Pré-visualização com Thumbnails e Players */}
                {mediaItems.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Pré-visualização das Mídias Selecionadas:
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[320px] overflow-y-auto p-1">
                      {mediaItems.map((item, idx) => (
                        <div
                          key={item.id}
                          className="group relative rounded-xs border border-border/80 bg-card overflow-hidden shadow-xs hover:border-primary/50 transition-all flex flex-col"
                        >
                          {/* Área Visual */}
                          <div className="relative aspect-video bg-muted/40 flex items-center justify-center overflow-hidden">
                            {item.type === 'PHOTO' ? (
                              <img
                                src={item.previewUrl}
                                alt={item.file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : item.type === 'VIDEO' ? (
                              <div className="relative w-full h-full bg-black flex items-center justify-center">
                                <video
                                  src={item.previewUrl}
                                  className="w-full h-full object-cover opacity-80"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-7 h-7 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center">
                                    <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <FileText className="h-8 w-8 text-muted-foreground" />
                            )}

                            {/* Botão de Zoom/Lightbox */}
                            <button
                              type="button"
                              onClick={() => setPreviewModalUrl({ url: item.previewUrl, type: item.type as any })}
                              className="absolute top-1.5 left-1.5 p-1 rounded-xs bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Expandir Mídia"
                            >
                              <Maximize2 className="h-3 w-3" />
                            </button>

                            {/* Botão de Remoção */}
                            {!isUploading && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMedia(item.id)}
                                className="absolute top-1.5 right-1.5 p-1 rounded-xs bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remover"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>

                          {/* Info do Ficheiro */}
                          <div className="p-2 space-y-1 text-left bg-background">
                            <p className="text-[11px] font-medium text-foreground truncate" title={item.file.name}>
                              {item.file.name}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>{(item.file.size / (1024 * 1024)).toFixed(1)} MB</span>
                              <span className="font-semibold uppercase text-primary">
                                {item.type}
                              </span>
                            </div>

                            {/* Barra de progresso individual se em upload */}
                            {isUploading && (
                              <div className="w-full bg-muted rounded-full h-1 overflow-hidden mt-1">
                                <div
                                  className="bg-primary h-full transition-all duration-300"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Marca d'água e Notas */}
              <div className="p-4 rounded-xs border border-border bg-background space-y-3">
                <div className="flex items-center justify-between p-2.5 border border-border/80 bg-muted/20 rounded-xs">
                  <div className="space-y-0.5">
                    <label htmlFor="drawerHasWatermark" className="text-xs font-semibold text-foreground cursor-pointer">
                      Aplicar Marca d'Água de Prova Técnica
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Garante proteção técnica durante a aprovação do cliente antes da liquidação financeira.
                    </p>
                  </div>
                  <input
                    id="drawerHasWatermark"
                    type="checkbox"
                    checked={hasWatermark}
                    onChange={(e) => setHasWatermark(e.target.checked)}
                    className="h-4 w-4 rounded-xs accent-primary cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Notas de Pós-Produção & Instruções
                  </label>
                  <Textarea
                    placeholder="Instruções de visualização, LUT utilizada, perfil de cores..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="text-xs rounded-xs"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer Fixo */}
          <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between shrink-0">
            <div className="text-xs text-muted-foreground">
              {isUploading ? (
                <span className="flex items-center gap-2 text-primary font-medium animate-pulse">
                  <Sparkles className="h-4 w-4" />
                  {uploadStatusText || 'A transferir para o armazenamento R2...'}
                </span>
              ) : (
                <span>{mediaItems.length} arquivo(s) prontos para entrega</span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isUploading}
                className="text-xs h-9 px-4 rounded-xs"
              >
                Cancelar
              </Button>
              <ButtonSubmit
                form="deliverable-drawer-form"
                size="sm"
                isLoading={isUploading}
                className="text-xs h-9 px-5 rounded-xs"
              >
                {isUploading ? 'A Carregar...' : 'Gravar Entregável'}
              </ButtonSubmit>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal Simples de Lightbox/Zoom para Pré-visualização */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-black rounded-xs overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {previewModalUrl.type === 'PHOTO' ? (
              <img
                src={previewModalUrl.url}
                alt="Visualização"
                className="max-h-[85vh] w-auto object-contain mx-auto"
              />
            ) : (
              <video
                src={previewModalUrl.url}
                controls
                autoPlay
                className="max-h-[85vh] w-auto mx-auto"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

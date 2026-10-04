'use client';

import { useState, useEffect } from 'react';
import {
  portalService,
  PortalDeliverable,
  ApproveDeliverablePayload,
  RequestChangesPayload,
} from '@/services/portal-service';
import {
  Button,
  ButtonSubmit,
  Input,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui';
import {
  Video,
  CheckCircle2,
  AlertTriangle,
  Download,
  Film,
  Calendar,
  Send,
  Sparkles,
  ShieldCheck,
  Clock,
  Camera,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { CinemaVideoPlayer } from './cinema-video-player';
import { PhotoProofingGallery } from './photo-proofing-gallery';
import { ExtraPhotosCheckoutModal } from './extra-photos-checkout-modal';

interface PortalDeliverableViewProps {
  token: string;
}

export function PortalDeliverableView({ token }: PortalDeliverableViewProps) {
  const [deliverable, setDeliverable] = useState<PortalDeliverable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Approval state
  const [approveName, setApproveName] = useState('');
  const [approveEmail, setApproveEmail] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Request Changes state
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [changesName, setChangesName] = useState('');
  const [changesEmail, setChangesEmail] = useState('');
  const [changesNotes, setChangesNotes] = useState('');
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);

  // Extra photos checkout state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutSelectedAssetIds, setCheckoutSelectedAssetIds] = useState<string[]>([]);
  const [checkoutExtraCount, setCheckoutExtraCount] = useState(0);
  const [checkoutTotalAmount, setCheckoutTotalAmount] = useState(0);

  const refreshDeliverable = () => {
    portalService
      .viewDeliverable(token)
      .then((data) => setDeliverable(data))
      .catch(() => {});
  };

  const handleDownloadMaster = async (assetId: string) => {
    try {
      const res = await portalService.requestAssetDownload(token, assetId);
      if (res?.downloadUrl) {
        const a = document.createElement('a');
        a.href = res.downloadUrl;
        a.download = res.filename || 'master_file';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success(`Download de ${res.filename} iniciado.`);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Download bloqueado. Conclua a aprovação e regularize pendências financeiras.'
      );
    }
  };

  useEffect(() => {
    portalService
      .viewDeliverable(token)
      .then((data) => {
        setDeliverable(data);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Link inválido ou expirado.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveName || !approveEmail) {
      toast.error('Preencha seu nome e email para validação da aprovação.');
      return;
    }

    setIsApproving(true);
    try {
      const res = await portalService.approveDeliverable(token, {
        clientName: approveName,
        clientEmail: approveEmail,
        feedbackNotes: approveNotes,
      });
      toast.success(res.message || 'Entregável aprovado com sucesso!');
      // reload
      const updated = await portalService.viewDeliverable(token);
      setDeliverable(updated);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Falha ao registar aprovação.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRequestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changesName || !changesNotes) {
      toast.error('Indique o seu nome e descreva detalhadamente os ajustes solicitados.');
      return;
    }

    setIsRequestingChanges(true);
    try {
      const res = await portalService.requestChanges(token, {
        clientName: changesName,
        clientEmail: changesEmail,
        feedbackNotes: changesNotes,
      });
      toast.success(res.message || 'Solicitação de ajustes enviada à equipa de produção.');
      setShowChangesModal(false);
      const updated = await portalService.viewDeliverable(token);
      setDeliverable(updated);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Falha ao enviar solicitação.');
    } finally {
      setIsRequestingChanges(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4" />
        <p className="text-sm font-semibold">A carregar entregável da produção...</p>
      </div>
    );
  }

  if (error || !deliverable) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
        <Card className="max-w-md w-full rounded-xs border border-destructive/20 bg-card p-6 text-center shadow-none">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xs bg-destructive/10 text-destructive mb-4">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg font-semibold text-foreground mb-2">Acesso ao Entregável</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mb-4">{error || 'Este link de revisão expirou ou foi revogado.'}</CardDescription>
          <p className="text-xs text-muted-foreground/60">Por favor, entre em contacto com a equipa da produtora.</p>
        </Card>
      </div>
    );
  }

  const primaryVideoAsset = deliverable.assets.find(
    (a) => a.mimeType?.startsWith('video/') || a.filename?.endsWith('.mp4') || a.filename?.endsWith('.mov')
  );

  const photoAssets = deliverable.assets.filter(
    (a) =>
      a.mimeType?.startsWith('image/') ||
      /\.(jpg|jpeg|png|webp|avif|cr3|arw|nef|raw)$/i.test(a.filename)
  );

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              <Film className="h-4 w-4" /> Portal de Revisão &amp; Aprovação Nora
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              {deliverable.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Produção: <span className="font-medium text-foreground">{deliverable.projectTitle}</span> • Versão{' '}
              <span className="font-semibold text-foreground">{deliverable.version}</span> ({deliverable.type})
            </p>
          </div>

          <div>
            <Badge
              variant="outline"
              className={
                deliverable.status === 'APPROVED'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs py-1 px-2.5 font-semibold rounded-xs'
                  : deliverable.status === 'CHANGES_REQUESTED'
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs py-1 px-2.5 font-semibold rounded-xs'
                  : 'bg-primary/10 text-primary border-primary/20 text-xs py-1 px-2.5 font-semibold rounded-xs'
              }
            >
              {deliverable.status === 'APPROVED'
                ? 'APROVADO'
                : deliverable.status === 'CHANGES_REQUESTED'
                ? 'ALTERAÇÕES SOLICITADAS'
                : 'PENDENTE DE REVISÃO'}
            </Badge>
          </div>
        </div>

        {/* Proofing Quality Notice Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xs border border-border/80 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <div>
              <span className="font-semibold text-foreground">Modo de Revisão Otimizado:</span> Este portal carrega proxies a 720p e imagens WebP comprimidas para aprovação rápida sem buffering.
              {deliverable.access?.canDownloadMaster ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold block sm:inline sm:ml-1">
                  • Ficheiros Master originais desbloqueados para download.
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-medium block sm:inline sm:ml-1">
                  • Masters 4K / RAW liberados após aprovação formal e confirmação de pagamento.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Video Showcase (Cinema Studio Player) */}
        {primaryVideoAsset && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-2">
                <Film className="h-3.5 w-3.5 text-primary" /> Player de Copião / Master de Vídeo
              </span>
              <span className="text-[11px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                Stream: 720p Proxy
              </span>
            </div>
            <CinemaVideoPlayer
              src={primaryVideoAsset.previewUrl || primaryVideoAsset.downloadUrl || ''}
              poster={primaryVideoAsset.posterUrl}
              filename={primaryVideoAsset.filename}
              downloadUrl={primaryVideoAsset.downloadUrl}
              qualityBadge="720p Proxy (Modo de Aprovação)"
              canDownloadMaster={Boolean(deliverable.access?.canDownloadMaster)}
              onRequestMasterDownload={() => handleDownloadMaster(primaryVideoAsset.id)}
              title={deliverable.title}
            />
          </div>
        )}

        {/* Photo Proofing Gallery (Photoshoot deliverable or image assets) */}
        {photoAssets.length > 0 && (
          <div className="space-y-2">
            <PhotoProofingGallery
              token={token}
              assets={photoAssets}
              includedPhotosCount={deliverable.includedPhotosCount || 0}
              extraPhotoPrice={deliverable.extraPhotoPrice || 2500}
              allowExtraPurchase={deliverable.allowExtraPurchase ?? true}
              canDownloadMaster={Boolean(deliverable.access?.canDownloadMaster)}
              onRequestMasterDownload={(assetId) => handleDownloadMaster(assetId)}
              onOpenCheckout={(assetIds, extraCount, totalAmount) => {
                setCheckoutSelectedAssetIds(assetIds);
                setCheckoutExtraCount(extraCount);
                setCheckoutTotalAmount(totalAmount);
                setCheckoutModalOpen(true);
              }}
              onAssetUpdated={refreshDeliverable}
            />
          </div>
        )}

        {!primaryVideoAsset && photoAssets.length === 0 && (
          <Card className="rounded-2xl border border-border bg-card p-8 text-center shadow-none">
            <Film className="mx-auto h-10 w-10 text-primary/50 mb-3" />
            <CardTitle className="text-base font-semibold text-foreground">Pacote de Entregáveis Pronto</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Este pacote reúne arquivos de áudio, documentação ou renders prontos para download e validação.
            </CardDescription>
          </Card>
        )}

        {/* Assets List */}
        <Card className="rounded-xs border border-border bg-card shadow-none p-0 gap-0">
          <CardHeader className="p-5 border-b border-border">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" /> Arquivos Disponíveis no Pacote
              </span>
              {deliverable.access?.canDownloadMaster ? (
                <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Masters Desbloqueados
                </span>
              ) : (
                <span className="text-[11px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Masters Protegidos
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 divide-y divide-border">
            {deliverable.assets.map((asset) => {
              const canDownload = deliverable.access?.canDownloadMaster;
              return (
                <div key={asset.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground block truncate">
                        {asset.filename}
                      </span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono text-muted-foreground">
                        {asset.fileType === 'VIDEO' ? '720p Proxy Ativo' : 'WebP Otimizado'}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(asset.sizeBytes / (1024 * 1024)).toFixed(2)} MB • {asset.mimeType}
                    </span>
                  </div>

                  {canDownload ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadMaster(asset.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shrink-0 cursor-pointer shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" /> Descarregar Master
                    </button>
                  ) : (
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs font-medium shrink-0 cursor-help"
                      title="O download do arquivo original em alta resolução está protegido até a aprovação formal e regularização financeira."
                    >
                      <Lock className="h-3.5 w-3.5" /> Bloqueado até Aprovação
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Status / Approval Section */}
        {deliverable.status === 'APPROVED' ? (
          <Card className="rounded-xs border border-emerald-500/20 bg-emerald-500/10 p-5 shadow-none flex flex-row items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xs bg-emerald-600 text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-emerald-600">Entregável Aprovado Formalmente</CardTitle>
              <p className="text-xs text-emerald-600/90 mt-1">
                Aprovado por <span className="font-semibold">{deliverable.approvedBy}</span> em{' '}
                {deliverable.approvedAt ? new Date(deliverable.approvedAt).toLocaleString('pt-PT') : 'Data registada'}.
              </p>
              {deliverable.feedbackNotes && (
                <p className="text-xs text-foreground mt-2 italic bg-background/60 p-3 rounded-xs border border-emerald-500/20">
                  &ldquo;{deliverable.feedbackNotes}&rdquo;
                </p>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formal Approval Form */}
            <Card className="rounded-xs border border-border bg-card shadow-none p-0 gap-0 flex flex-col justify-between">
              <div>
                <CardHeader className="p-5 border-b border-border">
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <ShieldCheck className="h-4 w-4" />
                    <CardTitle className="text-sm font-semibold text-foreground">Aprovação do Entregável</CardTitle>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">
                    Se o conteúdo estiver conforme o pretendido, aprove para avançar para a fase seguinte ou entrega final.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5">
                  <form onSubmit={handleApprove} className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-foreground">Seu Nome Completo *</label>
                      <Input
                        value={approveName}
                        onChange={(e) => setApproveName(e.target.value)}
                        placeholder="Ex: João Baptista"
                        className="bg-background border-input text-xs rounded-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-foreground">Seu Email Corporativo *</label>
                      <Input
                        type="email"
                        value={approveEmail}
                        onChange={(e) => setApproveEmail(e.target.value)}
                        placeholder="Ex: joao@empresa.com"
                        className="bg-background border-input text-xs rounded-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-foreground">Notas / Elogios (Opcional)</label>
                      <Input
                        value={approveNotes}
                        onChange={(e) => setApproveNotes(e.target.value)}
                        placeholder="Ex: Aprovado sem alterações. Excelente trabalho."
                        className="bg-background border-input text-xs rounded-xs"
                      />
                    </div>

                    <div className="pt-2">
                      <ButtonSubmit
                        isLoading={isApproving}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-none font-semibold rounded-xs"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Aprovar Entregável
                      </ButtonSubmit>
                    </div>
                  </form>
                </CardContent>
              </div>
            </Card>

            {/* Request Changes Card */}
            <Card className="rounded-xs border border-border bg-card shadow-none p-0 gap-0 flex flex-col justify-between">
              <div>
                <CardHeader className="p-5 border-b border-border">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Clock className="h-4 w-4" />
                    <CardTitle className="text-sm font-semibold text-foreground">Solicitar Ajustes / Alterações</CardTitle>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">
                    Necessita de correções no corte, grafismos, áudio ou legendagem? Envie as notas diretamente aos editores.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5">
                  {showChangesModal ? (
                    <form onSubmit={handleRequestChanges} className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-foreground">Seu Nome *</label>
                        <Input
                          value={changesName}
                          onChange={(e) => setChangesName(e.target.value)}
                          placeholder="Ex: João Baptista"
                          className="bg-background border-input text-xs rounded-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-foreground">Email (Opcional)</label>
                        <Input
                          type="email"
                          value={changesEmail}
                          onChange={(e) => setChangesEmail(e.target.value)}
                          placeholder="Ex: joao@empresa.com"
                          className="bg-background border-input text-xs rounded-xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-foreground">Descrição das Alterações *</label>
                        <textarea
                          value={changesNotes}
                          onChange={(e) => setChangesNotes(e.target.value)}
                          rows={3}
                          placeholder="Indique os timecodes ou pontos a ajustar (ex: 00:45 alterar logotipo)..."
                          className="w-full rounded-xs border border-input bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none"
                          required
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowChangesModal(false)}
                          className="rounded-xs"
                        >
                          Cancelar
                        </Button>
                        <ButtonSubmit
                          isLoading={isRequestingChanges}
                          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xs"
                        >
                          <Send className="mr-1.5 h-3.5 w-3.5" /> Enviar Ajustes
                        </ButtonSubmit>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4 pt-4 text-center">
                      <p className="text-xs text-muted-foreground">
                        As notas serão vinculadas diretamente à versão {deliverable.version} e a equipa será notificada.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setShowChangesModal(true)}
                        className="w-full border-border text-foreground hover:bg-muted font-semibold rounded-xs"
                      >
                        Pedir Alterações
                      </Button>
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>
          </div>
        )}

        {/* Extra Photos Checkout Modal */}
        <ExtraPhotosCheckoutModal
          isOpen={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          token={token}
          selectedAssetIds={checkoutSelectedAssetIds}
          extraPhotosCount={checkoutExtraCount}
          totalAmount={checkoutTotalAmount}
          onPaymentSuccess={refreshDeliverable}
        />
      </div>
    </div>
  );
}

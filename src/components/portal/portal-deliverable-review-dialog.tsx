'use client';

import { useState, useRef, useEffect } from 'react';
import { Deliverable, ReviewComment } from '@/types';
import { portalService } from '@/services/portal-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Film,
  Share2,
  Send,
  Video,
  ShieldCheck,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores';

interface PortalDeliverableReviewDialogProps {
  deliverable: Deliverable | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

function formatTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * 25);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(frames).padStart(2, '0')}`;
}

export function PortalDeliverableReviewDialog({
  deliverable,
  isOpen,
  onClose,
  onUpdated,
}: PortalDeliverableReviewDialogProps) {
  const { user } = useAuthStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Comments state
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');

  // Approval modal states
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [approveName, setApproveName] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Changes request modal states
  const [showChangesForm, setShowChangesForm] = useState(false);
  const [changesName, setChangesName] = useState('');
  const [changesNotes, setChangesNotes] = useState('');
  const [isSubmittingChanges, setIsSubmittingChanges] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setApproveName(user.name);
      setChangesName(user.name);
    }
  }, [user]);

  // Reset states when opening a deliverable
  useEffect(() => {
    if (deliverable && isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      setShowApproveForm(false);
      setShowChangesForm(false);
      setComments((deliverable as any).comments || []);
    }
  }, [deliverable, isOpen]);

  if (!deliverable) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 60);
    }
  };

  const seek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const jump = (delta: number) => {
    if (videoRef.current) {
      const target = Math.max(0, Math.min(duration || 60, videoRef.current.currentTime + delta));
      seek(target);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: ReviewComment = {
      id: `comment-${Date.now()}`,
      reviewId: deliverable.id,
      authorName: user?.name || 'Cliente Revisor',
      authorRole: 'Cliente',
      timecodeSeconds: currentTime,
      timecodeFormatted: formatTimecode(currentTime),
      content: newCommentText.trim(),
      resolved: false,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, newComment]);
    setNewCommentText('');
    toast.success(`Nota adicionada no timecode ${formatTimecode(currentTime)}!`);
  };

  const handleApprove = async () => {
    if (!approveName.trim()) {
      toast.error('Indique o seu nome para validação formal.');
      return;
    }

    if (!deliverable.shareToken) {
      toast.error('Token do entregável não disponível.');
      return;
    }

    setIsApproving(true);
    try {
      await portalService.approveDeliverable(deliverable.shareToken, {
        clientName: approveName,
        clientEmail: user?.email || 'cliente@nora.ao',
        feedbackNotes: approveNotes,
      });

      toast.success('Entregável aprovado com sucesso! A equipa foi notificada.');
      setShowApproveForm(false);
      onUpdated?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Falha ao aprovar entregável.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!changesNotes.trim()) {
      toast.error('Descreva as alterações técnicas ou artísticas solicitadas.');
      return;
    }

    if (!deliverable.shareToken) {
      toast.error('Token do entregável não disponível.');
      return;
    }

    setIsSubmittingChanges(true);
    try {
      await portalService.requestChanges(deliverable.shareToken, {
        clientName: changesName || user?.name || 'Cliente',
        clientEmail: user?.email,
        feedbackNotes: changesNotes,
      });

      toast.success('Solicitação de alterações registada e enviada à montagem.');
      setShowChangesForm(false);
      onUpdated?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Falha ao submeter alterações.');
    } finally {
      setIsSubmittingChanges(false);
    }
  };

  const copyShareLink = () => {
    if (!deliverable.shareToken) return;
    const url = `${window.location.origin}/portal/deliverables/view/${deliverable.shareToken}`;
    navigator.clipboard.writeText(url);
    toast.success('Link direto copiado para a área de transferência!');
  };

  const isApproved = deliverable.status === 'APPROVED';
  const isChangesRequested = deliverable.status === 'CHANGES_REQUESTED';
  const isPending = deliverable.status === 'PUBLISHED';

  // Video fallback sample
  const sampleVideoUrl =
    deliverable.mediaUrl ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl w-full max-h-[92vh] overflow-y-auto bg-card border-border p-0 rounded-none shadow-2xl text-foreground">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-border bg-muted/20 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-none border-primary/40 bg-primary/10 text-primary text-[10px] font-mono uppercase"
              >
                Sala de Revisão Frame-a-Frame
              </Badge>
              <Badge
                variant="outline"
                className={`rounded-none text-[10px] font-mono uppercase font-semibold ${isApproved
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : isChangesRequested
                      ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
              >
                {isApproved
                  ? 'Aprovado Formalmente'
                  : isChangesRequested
                    ? 'Alterações Pedidas'
                    : 'Aguardando Parecer'}
              </Badge>
              <span className="text-xs font-mono text-muted-foreground">
                v{deliverable.version} • {deliverable.type}
              </span>
            </div>

            <DialogTitle className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
              {deliverable.title}
            </DialogTitle>
            {deliverable.project && (
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                <Film className="h-3 w-3 text-primary" />
                Projeto: {deliverable.project.title}
              </DialogDescription>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={copyShareLink}
              className="rounded-none gap-1.5 text-xs h-8 border-border hover:bg-muted"
              title="Copiar link de partilha com equipa técnica"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Copiar Link</span>
            </Button>
          </div>
        </div>

        {/* Content Body: Video Player & Comments Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* Col 1 & 2: Video Player & Controls */}
          <div className="lg:col-span-2 p-4 sm:p-6 space-y-4 flex flex-col justify-between bg-black/95 text-white">
            <div className="relative aspect-video w-full bg-black flex items-center justify-center border border-border/40 overflow-hidden shadow-inner">
              <video
                ref={videoRef}
                src={sampleVideoUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="h-full w-full object-contain cursor-pointer"
                onClick={togglePlay}
              />

              {/* Timecode HUD Overlay */}
              <div className="absolute top-3 left-3 bg-black/80 border border-white/20 px-2.5 py-1 font-mono text-xs font-semibold text-amber-400 tracking-widest backdrop-blur-md">
                TC: {formatTimecode(currentTime)}
              </div>

              {/* Resolution / FPS Tag */}
              <div className="absolute top-3 right-3 bg-black/80 border border-white/20 px-2 py-0.5 font-mono text-[10px] text-white/80">
                PRORES 422 • 25 FPS
              </div>
            </div>

            {/* Scrubber & Timeline Progress */}
            <div className="space-y-2 pt-2">
              <div
                className="h-2.5 w-full bg-stone-800 cursor-pointer relative group rounded-none border border-stone-700"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  seek(pos * (duration || 60));
                }}
              >
                <div
                  className="h-full bg-primary transition-all relative"
                  style={{
                    width: `${((currentTime / (duration || 60)) * 100).toFixed(2)}%`,
                  }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border border-stone-900 shadow-md transform translate-x-1/2 group-hover:scale-125 transition-transform" />
                </div>

                {/* Comment Markers on timeline */}
                {comments.map((c) => (
                  <div
                    key={c.id}
                    title={`${c.timecodeFormatted}: ${c.content}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      seek(c.timecodeSeconds);
                    }}
                    className="absolute top-0 bottom-0 w-1.5 bg-amber-400 z-10 cursor-pointer hover:w-2 transition-all"
                    style={{
                      left: `${((c.timecodeSeconds / (duration || 60)) * 100).toFixed(2)}%`,
                    }}
                  />
                ))}
              </div>

              {/* Player Controls Bar */}
              <div className="flex items-center justify-between font-mono text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={togglePlay}
                    className="rounded-none text-white hover:bg-stone-800 h-8 px-2.5"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => jump(-5)}
                    className="rounded-none text-white hover:bg-stone-800 h-8 px-2"
                    title="Recuar 5 segundos"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => jump(5)}
                    className="rounded-none text-white hover:bg-stone-800 h-8 px-2"
                    title="Avançar 5 segundos"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </Button>

                  <span className="text-[11px] text-stone-400 pl-2">
                    {formatTimecode(currentTime)} / {formatTimecode(duration || 60)}
                  </span>
                </div>

                <div className="text-[10px] text-stone-400">
                  Espaço: Play/Pause • Setas: Frame +/-
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Review Comments & Decisions Panel */}
          <div className="p-4 sm:p-6 flex flex-col justify-between space-y-4 bg-card h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-xs tracking-wider uppercase text-foreground">
                    Notas Frame-a-Frame ({comments.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  TC Ancorado
                </span>
              </div>

              {/* Comments Feed */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <div className="border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    Sem notas registadas. Pause o vídeo e escreva um apontamento abaixo.
                  </div>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => seek(c.timecodeSeconds)}
                      className="border border-border/80 bg-muted/20 p-2.5 rounded-none cursor-pointer hover:border-primary transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-semibold text-primary">{c.authorName}</span>
                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 border border-primary/20">
                          {c.timecodeFormatted}
                        </span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>Adicionar nota no timecode atual:</span>
                  <span className="font-semibold text-primary">{formatTimecode(currentTime)}</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Ajustar transição de áudio aos 00:15..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="rounded-none text-xs border-border bg-background h-8"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8 px-3"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </form>
            </div>

            {/* Decision Actions Panel (Approve / Request Changes) */}
            <div className="border-t border-border pt-4 space-y-3">
              {showApproveForm ? (
                <div className="border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" /> Aceite Formal do Entregável
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowApproveForm(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Input
                    label="Nome do Revisor"
                    value={approveName}
                    onChange={(e) => setApproveName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="rounded-none text-xs h-8 bg-background"
                  />
                  <textarea
                    rows={2}
                    placeholder="Notas opcionais de validação final..."
                    value={approveNotes}
                    onChange={(e) => setApproveNotes(e.target.value)}
                    className="w-full rounded-none border border-border bg-background p-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="w-full rounded-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {isApproving ? 'A registar aprovação...' : 'Confirmar Aprovação Oficial'}
                  </Button>
                </div>
              ) : showChangesForm ? (
                <div className="border border-rose-500/30 bg-rose-500/5 p-3 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" /> Solicitar Ajustes de Montagem
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowChangesForm(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Descreva detalhadamente o que deve ser ajustado para a próxima versão..."
                    value={changesNotes}
                    onChange={(e) => setChangesNotes(e.target.value)}
                    className="w-full rounded-none border border-border bg-background p-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                  <Button
                    onClick={handleRequestChanges}
                    disabled={isSubmittingChanges}
                    className="w-full rounded-none bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isSubmittingChanges ? 'A enviar...' : 'Enviar Pedido à Montagem'}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => setShowApproveForm(true)}
                    className="w-full rounded-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5 font-semibold"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isApproved ? 'Re-Aprovar Entregável' : 'Aprovar Entregável'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowChangesForm(true)}
                    className="w-full rounded-none border-border hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30 text-xs h-9 gap-1.5 text-muted-foreground"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Solicitar Alterações
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

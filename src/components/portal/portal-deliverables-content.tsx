'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useDeliverablesList } from '@/hooks/deliverables';
import { Deliverable, ReviewComment } from '@/types';
import { portalService } from '@/services/portal-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Film,
  Search,
  MessageSquare,
  Send,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores';

const TYPE_LABELS: Record<string, string> = {
  FINAL_MASTER: 'Master Final',
  ROUGH_CUT: 'Copião',
  TEASER: 'Teaser',
  TRAILER: 'Trailer',
  SOCIAL_CUT: 'Redes (9:16)',
  RAW: 'Bruto',
};

function formatTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * 25);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(frames).padStart(2, '0')}`;
}

export function PortalDeliverablesContent() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Video playback states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Feedback comments state
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');

  // Decision forms states
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [approveNotes, setApproveNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const [showChangesForm, setShowChangesForm] = useState(false);
  const [changesNotes, setChangesNotes] = useState('');
  const [isSubmittingChanges, setIsSubmittingChanges] = useState(false);

  const { data, isLoading, refetch } = useDeliverablesList();
  const deliverables: Deliverable[] = useMemo(() => data?.data || [], [data]);

  const filteredDeliverables = useMemo(() => {
    return deliverables.filter((item: Deliverable) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.project?.title && item.project.title.toLowerCase().includes(searchTerm.toLowerCase()));

      if (statusFilter === 'ALL') return matchesSearch;
      if (statusFilter === 'PENDING') return matchesSearch && item.status === 'PUBLISHED';
      return matchesSearch && item.status === statusFilter;
    });
  }, [deliverables, searchTerm, statusFilter]);

  // Default selection
  useEffect(() => {
    if (!selectedId && filteredDeliverables.length > 0) {
      const pending = filteredDeliverables.find((d) => d.status === 'PUBLISHED');
      setSelectedId((pending || filteredDeliverables[0]).id);
    }
  }, [filteredDeliverables, selectedId]);

  const selectedDeliverable = useMemo(() => {
    return deliverables.find((d) => d.id === selectedId) || filteredDeliverables[0] || null;
  }, [deliverables, selectedId, filteredDeliverables]);

  useEffect(() => {
    if (selectedDeliverable) {
      setIsPlaying(false);
      setCurrentTime(0);
      setShowApproveForm(false);
      setShowChangesForm(false);

      setComments((selectedDeliverable as any).comments || []);
    }
  }, [selectedDeliverable?.id]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => { });
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(newTime, duration || 100));
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    handleSeek(videoRef.current.currentTime + seconds);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: ReviewComment = {
      id: `comm-${Date.now()}`,
      reviewId: selectedDeliverable?.id || '',
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
    toast.success(`Nota registada em ${formatTimecode(currentTime)}`);
  };

  const handleApprove = async () => {
    if (!selectedDeliverable?.shareToken) return;
    setIsApproving(true);
    try {
      await portalService.approveDeliverable(selectedDeliverable.shareToken, {
        clientName: user?.name || 'Cliente Autorizado',
        clientEmail: user?.email || 'cliente@empresa.com',
        feedbackNotes: approveNotes || 'Corte aprovado.',
      });
      toast.success('Versão aprovada com sucesso!');
      setShowApproveForm(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao aprovar.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!selectedDeliverable?.shareToken) return;
    if (!changesNotes.trim()) {
      toast.error('Descreva as alterações pretendidas.');
      return;
    }

    setIsSubmittingChanges(true);
    try {
      await portalService.requestChanges(selectedDeliverable.shareToken, {
        clientName: user?.name || 'Cliente Autorizado',
        clientEmail: user?.email,
        feedbackNotes: changesNotes.trim(),
      });
      toast.success('Pedido de alterações enviado à montagem.');
      setShowChangesForm(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao solicitar alterações.');
    } finally {
      setIsSubmittingChanges(false);
    }
  };

  const pendingCount = deliverables.filter((d: Deliverable) => d.status === 'PUBLISHED').length;
  const approvedCount = deliverables.filter((d: Deliverable) => d.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Entregáveis & Copiões
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pendingCount > 0
              ? `${pendingCount} corte aguarda a sua revisão técnica`
              : 'Nenhum corte pendente de aprovação'}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ALL')}
            className="rounded-none text-xs h-8 px-3"
          >
            Todos ({deliverables.length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PENDING')}
            className={`rounded-none text-xs h-8 px-3 ${statusFilter === 'PENDING' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''
              }`}
          >
            Aguardando Parecer ({pendingCount})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('APPROVED')}
            className={`rounded-none text-xs h-8 px-3 ${statusFilter === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
              }`}
          >
            Aprovados ({approvedCount})
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="border border-border p-12 text-center text-xs font-mono text-muted-foreground bg-card">
          A carregar cortes e sala de projeção...
        </div>
      ) : deliverables.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center bg-card space-y-2">
          <Video className="h-8 w-8 text-muted-foreground mx-auto opacity-40" />
          <h3 className="text-sm font-semibold text-foreground">Sem Vídeos Disponíveis</h3>
          <p className="text-xs text-muted-foreground">
            A equipa de montagem ainda não disponibilizou cortes para esta conta.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Cuts List (3 cols on desktop) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 rounded-none text-xs border-border bg-card h-8"
              />
            </div>

            <div className="space-y-2">
              {filteredDeliverables.map((item: Deliverable) => {
                const isSelected = selectedDeliverable?.id === item.id;
                const isApproved = item.status === 'APPROVED';
                const isChanges = item.status === 'CHANGES_REQUESTED';
                const isPending = item.status === 'PUBLISHED';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`cursor-pointer p-3 border transition-colors ${isSelected
                        ? 'border-primary bg-primary/5 text-foreground'
                        : 'border-border bg-card hover:border-muted-foreground/40'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold font-mono">
                        v{item.version} • {TYPE_LABELS[item.type] || item.type}
                      </span>
                      <Badge
                        variant="outline"
                        className={`rounded-none text-[9px] font-mono uppercase px-1.5 py-0 ${isApproved
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : isChanges
                              ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : isPending
                                ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'border-border text-muted-foreground'
                          }`}
                      >
                        {isApproved ? 'Aprovado' : isChanges ? 'Alterações' : isPending ? 'Em Revisão' : item.status}
                      </Badge>
                    </div>

                    <h4 className="text-xs font-semibold text-foreground mt-1 truncate">
                      {item.title}
                    </h4>

                    {item.project && (
                      <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">
                        {item.project.title}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Sleek Video Review Console (9 cols on desktop) */}
          <div className="lg:col-span-8 xl:col-span-9">
            {selectedDeliverable ? (
              <div className="border border-border bg-card p-6 lg:p-8 space-y-6">
                {/* Video Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase text-muted-foreground">
                        v{selectedDeliverable.version} • {TYPE_LABELS[selectedDeliverable.type] || selectedDeliverable.type}
                      </span>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {selectedDeliverable.project?.title || 'Projeto'}
                      </span>
                    </div>

                    <h2 className="text-lg font-semibold text-foreground mt-0.5">
                      {selectedDeliverable.title}
                    </h2>
                  </div>

                  <Badge
                    variant="outline"
                    className={`rounded-none text-xs font-mono uppercase px-2.5 py-0.5 ${selectedDeliverable.status === 'APPROVED'
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : selectedDeliverable.status === 'CHANGES_REQUESTED'
                          ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                  >
                    {selectedDeliverable.status === 'APPROVED'
                      ? 'Aprovado'
                      : selectedDeliverable.status === 'CHANGES_REQUESTED'
                        ? 'Alterações Solicitadas'
                        : 'Aguardando Parecer'}
                  </Badge>
                </div>

                {/* 16:9 Video Player */}
                <div className="space-y-2">
                  <div className="relative aspect-video bg-black/90 border border-border flex items-center justify-center overflow-hidden">
                    <video
                      ref={videoRef}
                      src={
                        selectedDeliverable.mediaUrl ||
                        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                      }
                      onTimeUpdate={() => {
                        if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                      }}
                      onLoadedMetadata={() => {
                        if (videoRef.current) setDuration(videoRef.current.duration);
                      }}
                      onEnded={() => setIsPlaying(false)}
                      className="w-full h-full object-contain cursor-pointer"
                      onClick={handlePlayPause}
                    />

                    {!isPlaying && (
                      <div
                        onClick={handlePlayPause}
                        className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer"
                      >
                        <div className="h-12 w-12 bg-primary/90 text-primary-foreground flex items-center justify-center rounded-none shadow-md">
                          <Play className="h-6 w-6 ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* HUD Timecode */}
                    <div className="absolute top-2.5 left-2.5 bg-black/80 px-2 py-0.5 border border-white/20 font-mono text-xs text-white pointer-events-none">
                      {formatTimecode(currentTime)} / {formatTimecode(duration || 0)}
                    </div>
                  </div>

                  {/* Scrubber & Controls */}
                  <div className="space-y-1 bg-muted/20 p-2.5 border border-border font-mono text-xs">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.04}
                      value={currentTime}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer accent-primary"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handlePlayPause}
                          className="rounded-none h-6 px-2.5 text-[11px] gap-1 border-border"
                        >
                          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSkip(-5)}
                          className="rounded-none h-6 px-1.5 text-[11px] text-muted-foreground"
                        >
                          <RotateCcw className="h-2.5 w-2.5 mr-0.5" /> -5s
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSkip(5)}
                          className="rounded-none h-6 px-1.5 text-[11px] text-muted-foreground"
                        >
                          <RotateCw className="h-2.5 w-2.5 mr-0.5" /> +5s
                        </Button>
                      </div>

                      <span className="text-[11px] text-muted-foreground">
                        {formatTimecode(currentTime)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timecode Comments */}
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                      Notas ({comments.length})
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Clique no timecode para saltar no vídeo
                    </span>
                  </div>

                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <div className="bg-muted px-2 py-1 font-mono text-xs text-primary font-semibold border border-border flex items-center">
                      {formatTimecode(currentTime)}
                    </div>
                    <Input
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Adicionar nota neste timecode..."
                      className="rounded-none text-xs border-border bg-card h-8 flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8 px-3"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </form>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {comments.map((comm) => (
                      <div
                        key={comm.id}
                        className="border border-border p-2 bg-muted/10 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSeek(comm.timecodeSeconds)}
                            className="px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/30 font-mono text-[10px] font-semibold"
                          >
                            {formatTimecode(comm.timecodeSeconds)}
                          </button>
                          <span className="text-foreground">{comm.content}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {format(new Date(comm.createdAt), 'HH:mm')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    {selectedDeliverable.status === 'APPROVED' ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Versão Aprovada</span>
                      </div>
                    ) : selectedDeliverable.status === 'CHANGES_REQUESTED' ? (
                      <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold text-xs">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Alterações em Curso</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                        <Clock className="h-4 w-4" />
                        <span>Aguardando o seu parecer</span>
                      </div>
                    )}
                  </div>

                  {selectedDeliverable.status === 'PUBLISHED' && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowChangesForm(!showChangesForm);
                          setShowApproveForm(false);
                        }}
                        className="rounded-none text-xs h-8 border-border"
                      >
                        Solicitar Alterações
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => {
                          setShowApproveForm(true);
                          setShowChangesForm(false);
                        }}
                        className="rounded-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-4 gap-1.5 font-semibold"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Aprovar Versão</span>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Inline confirmation drawers */}
                {showApproveForm && (
                  <div className="border border-emerald-500/30 bg-muted/20 p-3 space-y-2 animate-in fade-in">
                    <span className="text-xs font-semibold text-foreground block">
                      Confirmar Aprovação da Versão v{selectedDeliverable.version}
                    </span>
                    <Textarea
                      value={approveNotes}
                      onChange={(e) => setApproveNotes(e.target.value)}
                      placeholder="Observações opcionais..."
                      className="rounded-none text-xs border-border bg-card min-h-[50px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowApproveForm(false)}
                        className="rounded-none text-xs h-7"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleApprove}
                        disabled={isApproving}
                        className="rounded-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7"
                      >
                        {isApproving ? 'A registar...' : 'Confirmar Aprovação'}
                      </Button>
                    </div>
                  </div>
                )}

                {showChangesForm && (
                  <div className="border border-amber-500/30 bg-muted/20 p-3 space-y-2 animate-in fade-in">
                    <span className="text-xs font-semibold text-foreground block">
                      Descrever Alterações de Montagem
                    </span>
                    <Textarea
                      value={changesNotes}
                      onChange={(e) => setChangesNotes(e.target.value)}
                      placeholder="Descreva o que deve ser ajustado..."
                      className="rounded-none text-xs border-border bg-card min-h-[60px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowChangesForm(false)}
                        className="rounded-none text-xs h-7"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleRequestChanges}
                        disabled={isSubmittingChanges}
                        className="rounded-none bg-amber-600 hover:bg-amber-700 text-white text-xs h-7"
                      >
                        {isSubmittingChanges ? 'A enviar...' : 'Enviar à Montagem'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

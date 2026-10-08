'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Deliverable, ReviewComment } from '@/types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Play,
  Copy,
  User,
  Calendar,
  MessageSquare,
  Clapperboard,
  Film,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface DeliverableFeedbackModalProps {
  deliverable: Deliverable | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPlayer?: (deliverable: Deliverable) => void;
  comments?: ReviewComment[];
}

export function DeliverableFeedbackModal({
  deliverable,
  isOpen,
  onClose,
  onOpenPlayer,
  comments = [],
}: DeliverableFeedbackModalProps) {
  if (!deliverable) return null;

  const status = deliverable.status;
  const isApproved = status === 'APPROVED';
  const isChangesRequested = status === 'CHANGES_REQUESTED';
  const isRejected = (status as string) === 'REJECTED';
  const isInReview = (status as string) === 'IN_REVIEW' || status === 'PUBLISHED';

  const getStatusBadge = () => {
    if (isApproved) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          Aprovado pelo Cliente
        </span>
      );
    }
    if (isChangesRequested) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          Melhorias Solicitadas
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0">
          <XCircle className="h-3.5 w-3.5 text-rose-400" />
          Rejeitado pelo Cliente
        </span>
      );
    }
    if (isInReview) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 shrink-0">
          <Clock className="h-3.5 w-3.5 text-sky-400" />
          Em Análise pelo Cliente
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/70 shrink-0">
        Rascunho Interno
      </span>
    );
  };

  const handleCopyPortalLink = () => {
    if (!deliverable.shareToken) {
      toast.error('Este entregável ainda não possui link de portal gerado.');
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const portalUrl = `${origin}/portal/deliverables/${deliverable.shareToken}`;
    navigator.clipboard.writeText(portalUrl);
    toast.success('Link do portal do cliente copiado!');
  };

  const formattedDate = deliverable.approvedAt
    ? format(new Date(deliverable.approvedAt), 'dd/MM/yyyy HH:mm')
    : deliverable.updatedAt
      ? format(new Date(deliverable.updatedAt), 'dd/MM/yyyy HH:mm')
      : 'Pendente';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-[92vw] sm:w-full rounded-xl border border-border/80 bg-card p-6 shadow-2xl">
        <DialogHeader className="space-y-3 pb-2 border-b border-border/60">
          {/* Top Bar: Tipo e Versão à esquerda, Status Badge à direita */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono tracking-wider uppercase text-muted-foreground bg-muted/40 px-2 py-0.5 rounded border border-border/60">
                <Film className="h-3 w-3 text-primary" />
                {deliverable.type?.replace(/_/g, ' ') || 'CORTE'}
              </span>
              <span className="text-[11px] font-mono text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                v{deliverable.version}
              </span>
            </div>

            <div>{getStatusBadge()}</div>
          </div>

          {/* Título Principal */}
          <div>
            <DialogTitle className="text-lg sm:text-xl font-semibold tracking-tight text-foreground leading-snug break-words">
              {deliverable.title}
            </DialogTitle>
            {deliverable.project?.title && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <Clapperboard className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                <span className="truncate">Projecto: {deliverable.project.title}</span>
              </p>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          {/* Cartões de Metadados Claros e Bem Espaçados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3 flex flex-col justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground/70" />
                Avaliador / Revisor
              </span>
              <span className="text-xs font-semibold text-foreground mt-1.5 truncate">
                {deliverable.approvedBy || 'Cliente / Responsável de Produção'}
              </span>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/20 p-3 flex flex-col justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                Data do Parecer
              </span>
              <span className="text-xs font-mono font-semibold text-foreground mt-1.5">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Seção de Parecer Exato do Cliente */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                Parecer Exato do Cliente
              </h4>
              <span className="text-[11px] text-muted-foreground">
                {deliverable.feedbackNotes ? 'Feedback Registado' : 'Sem notas textuais'}
              </span>
            </div>

            <div
              className={`rounded-lg p-4 text-xs leading-relaxed border ${
                isApproved
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-foreground'
                  : isChangesRequested
                    ? 'border-amber-500/30 bg-amber-500/5 text-foreground'
                    : isRejected
                      ? 'border-rose-500/30 bg-rose-500/5 text-foreground'
                      : 'border-border/70 bg-muted/20 text-muted-foreground'
              }`}
            >
              {deliverable.feedbackNotes ? (
                <div className="space-y-1">
                  <p className="whitespace-pre-line text-[13px] leading-relaxed italic text-foreground/90">
                    &ldquo;{deliverable.feedbackNotes}&rdquo;
                  </p>
                </div>
              ) : (
                <p className="italic text-muted-foreground">
                  {isApproved
                    ? 'O cliente aprovou formalmente esta versão sem notas de alteração adicionais.'
                    : isChangesRequested
                      ? 'O cliente solicitou melhorias neste corte. Consulte as notas pontuais abaixo.'
                      : isRejected
                        ? 'O cliente rejeitou este entregável.'
                        : 'Aguardando parecer formal ou comentários do cliente.'}
                </p>
              )}
            </div>
          </div>

          {/* Notas Pontuais por Timecode (se houver) */}
          {comments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center justify-between">
                <span>Notas por Timecode</span>
                <span className="text-[11px] font-mono text-muted-foreground font-normal">
                  {comments.length} {comments.length === 1 ? 'comentário' : 'comentários'}
                </span>
              </h4>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg border border-border/70 bg-muted/20 p-2.5 space-y-1 text-xs transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-primary font-bold text-[11px] bg-primary/15 px-1.5 py-0.5 rounded border border-primary/20">
                          {c.timecodeFormatted || `${c.timecodeSeconds}s`}
                        </span>
                        <span className="font-semibold text-foreground text-xs">{c.authorName}</span>
                      </div>
                      {c.resolved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Resolvido
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          Pendente
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed pl-1 pt-0.5">
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rodapé de Ações com Design Consistente */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyPortalLink}
              className="text-xs border-border/80 gap-1.5 h-9 rounded-md hover:bg-muted/50"
            >
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              Copiar Link do Portal
            </Button>

            <div className="flex items-center gap-2">
              {onOpenPlayer && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onOpenPlayer(deliverable);
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold tracking-wide uppercase px-3.5 h-9 rounded-md gap-1.5 shadow-sm"
                >
                  <Play className="h-3.5 w-3.5 fill-primary-foreground" />
                  Abrir Leitor de Revisão
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="text-xs h-9 px-3.5 rounded-md"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

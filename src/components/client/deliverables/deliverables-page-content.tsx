'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/projects';
import { useDeliverablesList, usePublishDeliverable, useDeliverablesFilters, useDeliverableTypes } from '@/hooks/deliverables';
import {
  ItemStatusBadge,
  Button,
} from '@/components';
import { FilterPopover } from '@/components/shared';
import { Deliverable, ReviewComment } from '@/types';
import { DeliverableModal } from './deliverable-modal';
import { DeliverableTypesModal } from './deliverable-types-modal';
import { DeliverableFeedbackModal } from './deliverable-feedback-modal';
import { VideoReviewPlayer } from './video-review-player';
import {
  Plus,
  Clapperboard,
  FileVideo,
  Play,
  Share2,
  MoreHorizontal,
  Search,
  X,
  Clock,
  Layers,
  LayoutGrid,
  List,
  Image as ImageIcon,
  Music,
  FileText,
  Code2,
  FileArchive,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useMemo } from 'react';

const DELIVERABLE_TYPE_LABELS: Record<string, string> = {
  FINAL_MASTER: 'Master Final',
  ROUGH_CUT: 'Copião / Primeiro Corte',
  PHOTOSHOOT: 'Sessão Fotográfica',
  TEASER: 'Teaser',
  TRAILER: 'Trailer',
  SOCIAL_CUT: 'Corte Redes (9:16)',
  RAW: 'Material Bruto',
};

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'PUBLISHED', label: 'Publicado' },
  { value: 'IN_REVIEW', label: 'Em Revisão' },
  { value: 'APPROVED', label: 'Aprovado' },
  { value: 'CHANGES_REQUESTED', label: 'Alterações Solicitadas' },
];

export function DeliverablesPageContent() {
  const { data: projectsData } = useProjects();
  const projects = projectsData?.data || [];
  const { types: deliverableTypes } = useDeliverableTypes();

  const {
    filters,
    search,
    status,
    type,
    projectId,
    setSearch,
    setStatus,
    setType,
    setProjectId,
    resetFilters,
  } = useDeliverablesFilters();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypesModalOpen, setIsTypesModalOpen] = useState(false);
  const [activeReviewDeliverable, setActiveReviewDeliverable] = useState<Deliverable | null>(null);
  const [feedbackDeliverable, setFeedbackDeliverable] = useState<Deliverable | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const dynamicTypeOptions = useMemo(() => {
    return deliverableTypes.map((t) => ({ value: t.code, label: t.name }));
  }, [deliverableTypes]);

  const typeLabelsMap = useMemo(() => {
    const map: Record<string, string> = { ...DELIVERABLE_TYPE_LABELS };
    for (const t of deliverableTypes) {
      map[t.code] = t.name;
    }
    return map;
  }, [deliverableTypes]);

  const { data, isLoading } = useDeliverablesList(filters);
  const { mutate: publishDeliverable } = usePublishDeliverable();

  const deliverables = data?.data || [];

  const getDeliverableIcon = (item: Deliverable) => {
    const t = item.type;
    const title = (item.title || '').toLowerCase();
    const assetFilename = (item.assets?.[0]?.fileAsset?.name || '').toLowerCase();

    if (
      t === 'PHOTOSHOOT' ||
      title.endsWith('.png') ||
      title.endsWith('.jpg') ||
      title.endsWith('.jpeg') ||
      title.endsWith('.webp') ||
      assetFilename.endsWith('.png') ||
      assetFilename.endsWith('.jpg')
    ) {
      return ImageIcon;
    }

    if (
      title.endsWith('.mp3') ||
      title.endsWith('.wav') ||
      title.endsWith('.aac') ||
      title.endsWith('.flac') ||
      assetFilename.endsWith('.mp3')
    ) {
      return Music;
    }

    if (
      title.endsWith('.docx') ||
      title.endsWith('.pdf') ||
      title.endsWith('.txt') ||
      assetFilename.endsWith('.pdf') ||
      assetFilename.endsWith('.txt')
    ) {
      return FileText;
    }

    if (
      title.endsWith('.tsx') ||
      title.endsWith('.jsx') ||
      title.endsWith('.js') ||
      title.endsWith('.ts')
    ) {
      return Code2;
    }

    if (title.endsWith('.zip') || title.endsWith('.rar')) {
      return FileArchive;
    }

    return Play;
  };

  const renderFeedbackBadge = (item: Deliverable) => {
    const s = item.status;
    if (s === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="h-3 w-3" /> Aprovado
        </span>
      );
    }
    if (s === 'CHANGES_REQUESTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <AlertTriangle className="h-3 w-3" /> Melhorias
        </span>
      );
    }
    if ((s as string) === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-destructive/15 text-destructive border border-destructive/30">
          <XCircle className="h-3 w-3" /> Rejeitado
        </span>
      );
    }
    if ((s as string) === 'IN_REVIEW' || s === 'PUBLISHED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
          <Clock className="h-3 w-3" /> Em Revisão
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground border border-border/60">
        Rascunho
      </span>
    );
  };

  const [demoComments, setDemoComments] = useState<ReviewComment[]>([
    {
      id: 'c1',
      reviewId: 'del-1',
      authorName: 'Ana Silva (Cliente)',
      timecodeSeconds: 14.5,
      timecodeFormatted: '00:00:14.50',
      content: 'Aumentar a saturação de cor no plano geral da praia.',
      resolved: false,
      createdAt: new Date().toISOString(),
    },
  ]);

  const handleAddComment = (commentData: any) => {
    const newComment: ReviewComment = {
      id: `c-${Date.now()}`,
      reviewId: activeReviewDeliverable?.id || '',
      authorName: 'Você',
      timecodeSeconds: commentData.timecodeSeconds,
      timecodeFormatted: `${Math.floor(commentData.timecodeSeconds / 60)}:${Math.floor(commentData.timecodeSeconds % 60)}`,
      content: commentData.content,
      resolved: false,
      createdAt: new Date().toISOString(),
    };
    setDemoComments((prev) => [...prev, newComment]);
  };

  const handleResolveComment = (commentId: string) => {
    setDemoComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, resolved: !c.resolved } : c))
    );
  };

  const hasActiveFilters = Boolean(
    (type && type !== 'ALL') ||
    (status && status !== 'ALL') ||
    (projectId && projectId !== 'ALL') ||
    search
  );

  return (
    <div className="space-y-6">
      {/* Barra de Filtros Minimalista */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Campo de Busca Rápida */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search || ''}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar corte ou título..."
              className="pl-9 h-10 text-base sm:text-xs rounded-none border-border bg-background"
            />
            {Boolean(search) && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground min-h-[44px] min-w-[36px] flex items-center justify-center"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <FilterPopover
            icon="Clapperboard"
            label="Projecto"
            options={projects.map((p) => ({ value: p.id, label: p.title }))}
            value={projectId && projectId !== 'ALL' ? projectId : null}
            onChange={(val) => setProjectId(val || '')}
          />

          <FilterPopover
            icon="Tag"
            label="Tipo de Corte"
            options={dynamicTypeOptions}
            value={type !== 'ALL' ? type : null}
            onChange={(val) => setType(val || '')}
          />

          <FilterPopover
            icon="CircleDot"
            label="Estado"
            options={STATUS_OPTIONS}
            value={status !== 'ALL' ? status : null}
            onChange={(val) => setStatus(val || '')}
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="rounded-none text-xs text-muted-foreground hover:text-foreground h-10 px-2 min-h-[44px] sm:min-h-0"
            >
              Limpar
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Alternância de Visualização (Ficheiros vs Lista) */}
          <div className="flex items-center border border-border p-0.5 bg-background">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none h-9 sm:h-8 px-2.5 text-xs gap-1.5"
              title="Grelha de Ficheiros (View de Files)"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ficheiros</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none h-9 sm:h-8 px-2.5 text-xs gap-1.5"
              title="Visualização em Lista Detalhada"
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Lista</span>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTypesModalOpen(true)}
            className="rounded-none border-border h-11 sm:h-10 text-xs font-medium tracking-wide uppercase px-3.5 min-h-[44px] sm:min-h-0 gap-1.5"
            title="Gerir e registar tipos de entregáveis"
          >
            <Layers className="h-3.5 w-3.5 text-primary" />
            Tipos de Entregáveis
          </Button>

          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 h-11 sm:h-10 text-xs font-medium tracking-wide uppercase px-4 min-h-[44px] sm:min-h-0"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Novo Entregável
          </Button>
        </div>
      </div>

      {/* Leitor de Revisão em Destaque */}
      {activeReviewDeliverable && (
        <div className="space-y-3 p-4 rounded-none border border-border/80 bg-card">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Em Revisão:</span>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                {activeReviewDeliverable.title} (v{activeReviewDeliverable.version})
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveReviewDeliverable(null)}
              className="rounded-none text-xs h-9 sm:h-8 border-border min-h-[36px]"
            >
              Fechar Leitor
            </Button>
          </div>

          <VideoReviewPlayer
            videoUrl={activeReviewDeliverable.mediaUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
            comments={demoComments}
            onAddComment={handleAddComment}
            onResolveComment={handleResolveComment}
          />
        </div>
      )}

      {/* Conteúdo Principal de Entregáveis */}
      {isLoading ? (
        <div className="rounded-none border border-border/70 bg-card p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-muted/30 animate-pulse border border-border/50" />
            ))}
          </div>
        </div>
      ) : deliverables.length === 0 ? (
        <div className="rounded-none border border-border/70 bg-card py-16 text-center">
          <FileVideo className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm font-medium text-foreground">Sem entregáveis disponíveis</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Nenhum corte encontrado com os filtros aplicados.'
              : 'Adicione um novo corte ou master audiovisual para disponibilizar para revisão com timecode.'}
          </p>
          {!hasActiveFilters && (
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="mt-4 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Adicionar Primeiro Corte
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* View de Files (Grid de Cartões idêntica ao design de referência) */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {deliverables.map((item) => {
            const IconComp = getDeliverableIcon(item);

            return (
              <div
                key={item.id}
                onClick={() => setFeedbackDeliverable(item)}
                className="group relative rounded-2xl border border-border/80 bg-card/70 hover:bg-card p-3.5 flex flex-col justify-between transition-all duration-200 hover:border-primary/60 hover:shadow-md cursor-pointer min-h-[175px]"
              >
                {/* Topo do Card: Versão e Badge de Feedback no canto superior direito */}
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className="text-[10px] font-mono text-muted-foreground/80 px-1 border border-border/50 rounded bg-muted/20">
                    v{item.version}
                  </span>
                  <div>{renderFeedbackBadge(item)}</div>
                </div>

                {/* Centro do Card: Grande Ícone Estilizado da Mídia */}
                <div className="flex-1 flex items-center justify-center py-4">
                  <div className="h-16 w-16 rounded-xl bg-muted/40 group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground/80 group-hover:text-primary transition-colors">
                    <IconComp className="h-8 w-8 stroke-[1.5]" />
                  </div>
                </div>

                {/* Rodapé do Card: Nome do ficheiro e menu ... */}
                <div className="border-t border-border/50 pt-2 flex items-center justify-between gap-1.5">
                  <span
                    className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors"
                    title={item.title}
                  >
                    {item.title}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-none text-muted-foreground hover:text-foreground shrink-0"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-none border-border">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setFeedbackDeliverable(item);
                        }}
                        className="text-xs cursor-pointer gap-2"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                        Ver Feedback Exacto
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveReviewDeliverable(item);
                        }}
                        className="text-xs cursor-pointer gap-2"
                      >
                        <Play className="h-3.5 w-3.5 text-muted-foreground" />
                        Abrir Leitor de Revisão
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          publishDeliverable({ deliverableId: item.id, options: {} });
                        }}
                        className="text-xs cursor-pointer gap-2"
                      >
                        <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                        Publicar Versão ao Cliente
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Visualização em Lista Detalhada */
        <div className="rounded-none border border-border/70 bg-card overflow-hidden divide-y divide-border/60">
          {deliverables.map((item) => (
            <div
              key={item.id}
              onClick={() => setFeedbackDeliverable(item)}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/20 transition-colors cursor-pointer"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-border/70 bg-muted/30 text-foreground">
                  <FileVideo className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold tracking-tight text-foreground">
                      {item.title}
                    </span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 border border-border/70 text-muted-foreground bg-muted/20">
                      v{item.version}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
                    {item.project?.title && (
                      <span className="text-foreground font-medium flex items-center gap-1">
                        <Clapperboard className="h-3 w-3 text-muted-foreground" />
                        {item.project.title}
                      </span>
                    )}
                    <span>•</span>
                    <span>{typeLabelsMap[item.type] || item.type}</span>
                    <span>•</span>
                    <span className="font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground/70" />
                      {item.createdAt ? format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm') : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                {renderFeedbackBadge(item)}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveReviewDeliverable(item)}
                  className="rounded-none border-border text-foreground hover:bg-muted/50 h-9 sm:h-8 text-xs font-medium gap-1.5 px-3 min-h-[36px]"
                >
                  <Play className="h-3 w-3 text-primary fill-primary" /> Rever
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-none h-9 w-9 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-foreground min-h-[36px] min-w-[36px]"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-none border-border">
                    <DropdownMenuItem
                      onClick={() => setFeedbackDeliverable(item)}
                      className="text-xs cursor-pointer gap-2"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-primary" /> Ver Feedback Exacto
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveReviewDeliverable(item)}
                      className="text-xs cursor-pointer gap-2"
                    >
                      <Play className="h-3.5 w-3.5 text-muted-foreground" /> Abrir Leitor de Revisão
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => publishDeliverable({ deliverableId: item.id, options: {} })}
                      className="text-xs cursor-pointer gap-2"
                    >
                      <Share2 className="h-3.5 w-3.5 text-muted-foreground" /> Publicar Versão ao Cliente
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeliverableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultProjectId={projectId || undefined}
      />

      <DeliverableTypesModal
        isOpen={isTypesModalOpen}
        onClose={() => setIsTypesModalOpen(false)}
      />

      <DeliverableFeedbackModal
        isOpen={Boolean(feedbackDeliverable)}
        onClose={() => setFeedbackDeliverable(null)}
        deliverable={feedbackDeliverable}
        onOpenPlayer={(deliv) => setActiveReviewDeliverable(deliv)}
        comments={demoComments}
      />
    </div>
  );
}

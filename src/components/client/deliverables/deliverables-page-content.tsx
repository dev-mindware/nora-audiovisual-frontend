'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/projects';
import { useDeliverablesList, usePublishDeliverable, useDeliverablesFilters } from '@/hooks/deliverables';
import {
  ItemStatusBadge,
  Button,
} from '@/components';
import { FilterPopover } from '@/components/shared';
import { Deliverable, ReviewComment } from '@/types';
import { DeliverableModal } from './deliverable-modal';
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
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const DELIVERABLE_TYPE_LABELS: Record<string, string> = {
  FINAL_MASTER: 'Master Final',
  ROUGH_CUT: 'Copião / Primeiro Corte',
  TEASER: 'Teaser',
  TRAILER: 'Trailer',
  SOCIAL_CUT: 'Corte Redes (9:16)',
  RAW: 'Material Bruto',
};

const TYPE_OPTIONS = [
  { value: 'FINAL_MASTER', label: 'Master Final' },
  { value: 'ROUGH_CUT', label: 'Copião / Primeiro Corte' },
  { value: 'TEASER', label: 'Teaser' },
  { value: 'TRAILER', label: 'Trailer' },
  { value: 'SOCIAL_CUT', label: 'Corte Redes (9:16)' },
  { value: 'RAW', label: 'Material Bruto' },
];

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
  const [activeReviewDeliverable, setActiveReviewDeliverable] = useState<Deliverable | null>(null);

  const { data, isLoading } = useDeliverablesList(filters);
  const { mutate: publishDeliverable } = usePublishDeliverable();

  const deliverables = data?.data || [];

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
              className="pl-9 h-10 text-xs rounded-none border-border bg-background"
            />
            {Boolean(search) && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <FilterPopover
            icon="Clapperboard"
            label="Projeto"
            options={projects.map((p) => ({ value: p.id, label: p.title }))}
            value={projectId && projectId !== 'ALL' ? projectId : null}
            onChange={(val) => setProjectId(val || '')}
          />

          <FilterPopover
            icon="Tag"
            label="Tipo de Corte"
            options={TYPE_OPTIONS}
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
              className="rounded-none text-xs text-muted-foreground hover:text-foreground h-10 px-2"
            >
              Limpar
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 text-xs font-medium tracking-wide uppercase px-4"
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
              className="rounded-none text-xs h-8 border-border"
            >
              Fechar Player
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

      {/* Lista Minimalista de Entregáveis */}
      <div className="rounded-none border border-border/70 bg-card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border/50">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted/40" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-44 bg-muted/40" />
                    <div className="h-3 w-28 bg-muted/20" />
                  </div>
                </div>
                <div className="h-7 w-20 bg-muted/30" />
              </div>
            ))}
          </div>
        ) : deliverables.length === 0 ? (
          <div className="py-16 text-center">
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
        ) : (
          <div className="divide-y divide-border/60">
            {deliverables.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/20 transition-colors"
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
                      <span>{DELIVERABLE_TYPE_LABELS[item.type] || item.type}</span>
                      <span>•</span>
                      <span className="font-mono flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground/70" />
                        {item.createdAt ? format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm') : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center">
                  <ItemStatusBadge status={item.status} />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveReviewDeliverable(item)}
                    className="rounded-none border-border text-foreground hover:bg-muted/50 h-8 text-xs font-medium gap-1.5 px-3"
                  >
                    <Play className="h-3 w-3 text-primary fill-primary" /> Rever
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-none h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-none border-border">
                      <DropdownMenuItem
                        onClick={() => setActiveReviewDeliverable(item)}
                        className="text-xs cursor-pointer"
                      >
                        <Play className="mr-2 h-3.5 w-3.5" /> Abrir Leitor de Revisão
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => publishDeliverable({ deliverableId: item.id, options: {} })}
                        className="text-xs cursor-pointer"
                      >
                        <Share2 className="mr-2 h-3.5 w-3.5" /> Publicar Versão ao Cliente
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeliverableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultProjectId={projectId || undefined}
      />
    </div>
  );
}

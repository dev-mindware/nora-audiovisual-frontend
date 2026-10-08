'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import {
  ItemStatusBadge,
  Button,
} from '@/components';
import {
  UniversalTable,
  MobileFilterBottomSheet,
  FilterSectionConfig,
  DateRangeFilter,
  SortFilter,
  SortOption,
} from '@/components/custom/universal-table';
import { FilterPopover } from '@/components/shared';
import { useProjects, useProjectsFilters } from '@/hooks/projects';
import { Project } from '@/types';
import { ProjectModal } from './project-modal';
import { Plus, Clapperboard, Calendar, Eye, Kanban, Video, MoreHorizontal, Filter, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STAGE_OPTIONS = [
  { value: 'ALL', label: 'Todas as Fases' },
  { value: 'PRE_PRODUCTION', label: 'Pré-Produção' },
  { value: 'PRODUCTION', label: 'Rodagem' },
  { value: 'POST_PRODUCTION', label: 'Pós-Produção' },
  { value: 'REVIEW', label: 'Revisão' },
  { value: 'DELIVERED', label: 'Entregue' },
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos os Estados' },
  { value: 'PLANNING', label: 'Planeamento' },
  { value: 'ACTIVE', label: 'Em Curso' },
  { value: 'LEAD', label: 'Proposta / Lead' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'ARCHIVED', label: 'Arquivado' },
  { value: 'DRAFT', label: 'Rascunho' },
];

const SORT_OPTIONS: SortOption[] = [
  { value: 'createdAt', label: 'Data de Registo' },
  { value: 'title', label: 'Título da Produção' },
  { value: 'lifecycleStatus', label: 'Estado' },
  { value: 'startDate', label: 'Data de Início' },
];

export function ProjectsPageContent() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    filters,
    search,
    stage,
    status,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    setSearch,
    setStage,
    setStatus,
    setSort,
    setDateRange,
    resetFilters,
  } = useProjectsFilters();

  const { data, isLoading } = useProjects(filters);
  const projects = data?.data || [];

  const columns: ColumnDef<Project>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Produção / Título',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <Link href={`/projects/${item.id}`} className="group flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-border/70 bg-primary/10 text-primary">
                <Clapperboard className="h-4 w-4" />
              </div>
              <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm tracking-tight">
                {item.title}
              </span>
            </Link>
          );
        },
      },
      {
        accessorKey: 'client',
        header: 'Cliente / Produtora',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <span className="text-xs text-foreground font-medium">
              {item.client?.name || item.clientName || 'Cliente Direto'}
            </span>
          );
        },
      },
      {
        accessorKey: 'productionStage',
        header: 'Fase',
        cell: ({ row }) => <ItemStatusBadge status={row.original.productionStage} />,
      },
      {
        accessorKey: 'lifecycleStatus',
        header: 'Estado',
        cell: ({ row }) => <ItemStatusBadge status={row.original.lifecycleStatus} />,
      },
      {
        accessorKey: 'responsible',
        header: 'Responsável',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <span className="text-xs text-muted-foreground">
              {item.responsibleUserName || 'Não atribuído'}
            </span>
          );
        },
      },
      {
        id: 'dates',
        header: 'Prazos',
        cell: ({ row }) => {
          const item = row.original;
          const start = item.startDate ? new Date(item.startDate).toLocaleDateString('pt-PT') : '—';
          const end = item.endDate ? new Date(item.endDate).toLocaleDateString('pt-PT') : '—';
          return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <Calendar className="h-3 w-3" />
              <span>{start} &rarr; {end}</span>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Acções',
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 sm:h-8 sm:w-8 p-0 min-h-[36px] min-w-[36px]">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/projects/${item.id}`)}>
                  <Eye className="mr-2 h-4 w-4" /> Hub de Produção
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/kanban?projectId=${item.id}`)}>
                  <Kanban className="mr-2 h-4 w-4" /> Quadro Kanban
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/deliverables?projectId=${item.id}`)}>
                  <Video className="mr-2 h-4 w-4" /> Copiões & Revisão
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [router]
  );

  // Configuração das secções para o MobileFilterBottomSheet
  const mobileSections: FilterSectionConfig[] = useMemo(
    () => [
      {
        id: 'stage',
        title: 'Fase de Produção',
        options: STAGE_OPTIONS.filter((s) => s.value !== 'ALL').map((s) => ({
          label: s.label,
          value: s.value,
        })),
        multiple: false,
      },
      {
        id: 'status',
        title: 'Estado do Projecto',
        options: STATUS_OPTIONS.filter((s) => s.value !== 'ALL').map((s) => ({
          label: s.label,
          value: s.value,
        })),
        multiple: false,
      },
    ],
    []
  );

  const appliedMobileFilters: Record<string, string[]> = useMemo(
    () => ({
      stage: stage && stage !== 'ALL' ? [stage] : [],
      status: status && status !== 'ALL' ? [status] : [],
    }),
    [stage, status]
  );

  const handleApplyMobileFilters = (newFilters: Record<string, string[]>) => {
    const nextStage = newFilters.stage?.[0] || 'ALL';
    const nextStatus = newFilters.status?.[0] || 'ALL';
    setStage(nextStage);
    setStatus(nextStatus);
  };

  return (
    <div className="mt-6 space-y-6">
      {/* UniversalTable Unificada - Barra Única sem Repetições */}
      <UniversalTable<Project>
        data={projects}
        columns={columns}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Pesquisar projectos por título ou cliente..."
        searchValue={search}
        onSearchChange={setSearch}
        pageSize={filters.limit || 10}
        customFilters={
          <>
            <FilterPopover
              icon="Tag"
              label="Fase"
              options={STAGE_OPTIONS}
              value={stage}
              onChange={(val) => setStage(val || 'ALL')}
            />
            <FilterPopover
              icon="CircleDot"
              label="Estado"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(val) => setStatus(val || 'ALL')}
            />
          </>
        }
        mobileSections={mobileSections}
        appliedMobileFilters={appliedMobileFilters}
        onApplyMobileFilters={(newFilters, extra) => {
          handleApplyMobileFilters(newFilters);
          if (extra?.sortBy && extra?.sortOrder) {
            setSort(extra.sortBy, extra.sortOrder);
          }
          if (extra?.startDate !== undefined || extra?.endDate !== undefined) {
            setDateRange(extra.startDate, extra.endDate);
          }
        }}
        onClearFilters={resetFilters}
        sortFilter={{
          options: SORT_OPTIONS,
          sortBy,
          sortOrder,
          onSortChange: (sb, so) => setSort(sb, so),
        }}
        dateRangeFilter={{
          startDate,
          endDate,
          onChange: (start, end) => setDateRange(start, end),
        }}
        toolbar={{
          actions: (
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="h-10 sm:h-9 min-h-[44px] sm:min-h-0 text-xs gap-1.5 shrink-0 rounded-none px-3.5"
            >
              <Plus className="h-4 w-4" /> Novo Projecto
            </Button>
          ),
        }}
        emptyState={{
          title: 'Sem Projectos',
          description:
            search || stage !== 'ALL' || status !== 'ALL'
              ? 'Nenhum projecto encontrado com os filtros seleccionados.'
              : 'Adicione uma nova produção audiovisual para iniciar.',
          action: (
            <Button size="sm" onClick={() => setIsModalOpen(true)} className="text-xs min-h-[44px] sm:min-h-0">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Criar Primeiro Projecto
            </Button>
          ),
        }}
      />

      <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

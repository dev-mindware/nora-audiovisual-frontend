'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import {
  ItemStatusBadge,
  Button,
} from '@/components';
import { UniversalTable } from '@/components/custom/universal-table';
import { FilterPopover } from '@/components/shared';
import { useProjects, useProjectsFilters } from '@/hooks/projects';
import { Project } from '@/types';
import { ProjectModal } from './project-modal';
import { Plus, Clapperboard, Calendar, Eye, Kanban, Video, MoreHorizontal } from 'lucide-react';
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
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'ACTIVE', label: 'Em Curso' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'ARCHIVED', label: 'Arquivado' },
];

export function ProjectsPageContent() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    filters,
    search,
    stage,
    status,
    setSearch,
    setStage,
    setStatus,
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
        cell: ({ row }) => {
          const item = row.original;
          const stageOption = STAGE_OPTIONS.find((s) => s.value === item.productionStage);
          return (
            <span className="text-xs font-medium text-foreground">
              {stageOption?.label || item.productionStage}
            </span>
          );
        },
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
        header: 'Ações',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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

  return (
    <div className="mt-6 space-y-6">
      {/* Mindgest Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-baseline">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
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
          {(stage !== 'ALL' || status !== 'ALL' || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-foreground h-9"
            >
              Limpar filtros
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="h-10 text-xs gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" /> Novo Projeto
          </Button>
        </div>
      </div>

      {/* UniversalTable */}
      <UniversalTable<Project>
        data={projects}
        columns={columns}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Pesquisar projetos por título ou cliente..."
        pageSize={filters.limit || 10}
        emptyState={{
          title: 'Sem Projetos',
          description:
            search || stage !== 'ALL' || status !== 'ALL'
              ? 'Nenhum projeto encontrado com os filtros selecionados.'
              : 'Adicione uma nova produção audiovisual para iniciar.',
          action: (
            <Button size="sm" onClick={() => setIsModalOpen(true)} className="text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Criar Primeiro Projeto
            </Button>
          ),
        }}
      />

      <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

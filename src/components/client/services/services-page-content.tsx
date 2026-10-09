'use client';

import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Button,
  Badge,
} from '@/components';
import {
  UniversalTable,
  SortOption,
} from '@/components/custom/universal-table';
import { FilterPopover } from '@/components/shared';
import { DynamicMetricCard } from '@/components/shared/dynamic-metric-card';
import {
  useServices,
  useUpdateService,
  useDeleteService,
} from '@/hooks/services';
import { CatalogService, CatalogServiceCategory } from '@/types';
import { ServiceModal } from './service-modal';
import {
  Briefcase,
  Plus,
  Clock,
  Sparkles,
  CheckCircle2,
  MoreHorizontal,
  Edit,
  PowerOff,
  Power,
  Trash2,
  Tag,
  Globe,
  Copy,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTenantStore } from '@/stores/tenant/tenant-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CATEGORY_LABELS: Record<CatalogServiceCategory | string, string> = {
  VIDEO_PRODUCTION: 'Produção de Vídeo',
  PHOTOGRAPHY: 'Fotografia',
  POST_PRODUCTION: 'Pós-Produção',
  STUDIO_RENTAL: 'Aluguer de Estúdio',
  LIVE_STREAMING: 'Streaming / Directo',
  COMMERCIAL: 'Comercial & Ads',
  MUSIC_VIDEO: 'Videoclipe',
  CORPORATE: 'Corporativo',
  EVENT: 'Eventos',
  PODCAST: 'Podcast / Videocast',
  COLOR_GRADING: 'Color Grading',
  AUDIO_MASTERING: 'Áudio & Mix',
  DRONE_FOOTAGE: 'Drone Aéreo',
  OTHER: 'Geral & Outros',
};

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'Todas as Categorias' },
  { value: 'COMMERCIAL', label: 'Comercial & Ads' },
  { value: 'MUSIC_VIDEO', label: 'Videoclipe' },
  { value: 'CORPORATE', label: 'Corporativo' },
  { value: 'EVENT', label: 'Eventos' },
  { value: 'PODCAST', label: 'Podcast' },
  { value: 'STUDIO_RENTAL', label: 'Aluguer Estúdio' },
  { value: 'COLOR_GRADING', label: 'Color Grading' },
  { value: 'AUDIO_MASTERING', label: 'Áudio & Mix' },
  { value: 'DRONE_FOOTAGE', label: 'Drone Aéreo' },
  { value: 'VIDEO_PRODUCTION', label: 'Produção Vídeo' },
  { value: 'PHOTOGRAPHY', label: 'Fotografia' },
  { value: 'POST_PRODUCTION', label: 'Pós-Produção' },
  { value: 'OTHER', label: 'Outros' },
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos os Estados' },
  { value: 'ACTIVE', label: 'Apenas Ativos' },
  { value: 'INACTIVE', label: 'Apenas Inativos' },
];

const SORT_OPTIONS: SortOption[] = [
  { value: 'name', label: 'Nome do Serviço' },
  { value: 'price', label: 'Preço de Referência' },
  { value: 'createdAt', label: 'Data de Adição' },
];

export function ServicesPageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceToEdit, setSelectedServiceToEdit] =
    useState<CatalogService | null>(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize] = useState(10);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const { data: responseData, isLoading } = useServices();
  const { mutate: updateService } = useUpdateService();
  const { mutate: deleteService } = useDeleteService();

  const rawServices: CatalogService[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    if (responseData && Array.isArray((responseData as any).data)) {
      return (responseData as any).data;
    }
    return [];
  }, [responseData]);

  const handleOpenCreate = () => {
    setSelectedServiceToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: CatalogService) => {
    setSelectedServiceToEdit(service);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (service: CatalogService) => {
    updateService({
      id: service.id,
      data: { isActive: !service.isActive },
    });
  };

  const handleDelete = (service: CatalogService) => {
    if (
      confirm(
        `Tem a certeza de que deseja remover o serviço "${service.name}" do catálogo?`,
      )
    ) {
      deleteService(service.id);
    }
  };

  // Filtragem e ordenação local
  const filteredServices = useMemo(() => {
    let result = [...rawServices];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      );
    }

    if (categoryFilter !== 'ALL') {
      result = result.filter((s) => s.category === categoryFilter);
    }

    if (statusFilter === 'ACTIVE') {
      result = result.filter((s) => s.isActive);
    } else if (statusFilter === 'INACTIVE') {
      result = result.filter((s) => !s.isActive);
    }

    result.sort((a, b) => {
      if (sortBy === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      }
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      // Padrão createdAt
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [rawServices, search, categoryFilter, statusFilter, sortBy, sortOrder]);

  // Métricas
  const totalServices = rawServices.length;
  const activeServices = rawServices.filter((s) => s.isActive).length;
  const avgPrice =
    totalServices > 0
      ? rawServices.reduce((acc, curr) => acc + Number(curr.price), 0) /
        totalServices
      : 0;
  const categoriesCount = useMemo(() => {
    return new Set(rawServices.map((s) => s.category)).size;
  }, [rawServices]);

  const { activeOrganization } = useTenantStore();
  const orgSlug = activeOrganization?.slug || activeOrganization?.id || 'nora-studios';

  const handleCopyPublicLink = () => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}/catalog/${orgSlug}`;
      navigator.clipboard.writeText(fullUrl);
      toast.success('Link do catálogo público copiado com sucesso!');
    }
  };

  const columns: ColumnDef<CatalogService>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Pacote / Serviço',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Briefcase className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-foreground block text-sm truncate">
                  {item.name}
                </span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {CATEGORY_LABELS[item.category] || item.category}
                  </span>
                  {item.durationHours ? (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.durationHours}h estimadas
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'price',
        header: 'Preço Base (AOA)',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="font-semibold text-sm text-foreground">
              {Number(item.price).toLocaleString('pt-AO')} {item.currency || 'AOA'}
            </div>
          );
        },
      },
      {
        accessorKey: 'deliverablesIncluded',
        header: 'Entregáveis & Escopo',
        cell: ({ row }) => {
          const item = row.original;
          const count = item.deliverablesIncluded?.length || 0;
          return (
            <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
              {count > 0 ? (
                item.deliverablesIncluded.slice(0, 2).map((deliv, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 truncate max-w-[140px]"
                    title={deliv}
                  >
                    <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">{deliv}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  Definido na proposta
                </span>
              )}
              {count > 2 ? (
                <span className="text-[10px] text-muted-foreground font-medium">
                  +{count - 2}
                </span>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Visibilidade',
        cell: ({ row }) => {
          const isActive = row.original.isActive;
          return (
            <Badge
              variant={isActive ? 'default' : 'outline'}
              className={
                isActive
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30'
                  : 'text-muted-foreground'
              }
            >
              {isActive ? 'Ativo no Portal' : 'Oculto'}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Ações</span>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => handleOpenEdit(item)}>
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    Editar Serviço
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToggleStatus(item)}>
                    {item.isActive ? (
                      <>
                        <PowerOff className="h-3.5 w-3.5 mr-2 text-amber-500" />
                        Ocultar do Portal
                      </>
                    ) : (
                      <>
                        <Power className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                        Ativar no Portal
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDelete(item)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Excluir Serviço
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [handleToggleStatus, handleDelete],
  );

  return (
    <div className="space-y-6">
      {/* Banner de Catálogo Público com Link e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xs border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xs bg-primary/10 text-primary">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">Catálogo Público da Produtora</span>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold">Página Pública Dedicada</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              A sua organização possui um link público próprio para partilhar com clientes e divulgar pacotes comerciais.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyPublicLink}
            className="text-xs gap-1.5 h-8 border-border rounded-xs"
          >
            <Copy className="h-3.5 w-3.5" />
            Copiar Link
          </Button>
          <Button
            asChild
            size="sm"
            className="text-xs gap-1.5 h-8 bg-primary text-primary-foreground rounded-xs"
          >
            <Link href={`/catalog/${orgSlug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Ver Página Pública
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 Cards de Métricas Padronizados */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        <DynamicMetricCard
          subtitle="Total no Catálogo"
          title={totalServices}
          icon="Briefcase"
          description="Pacotes configurados pela produtora"
        />
        <DynamicMetricCard
          subtitle="Serviços Ativos"
          title={activeServices}
          icon="CheckCheck"
          description="Disponíveis no catálogo público"
        />
        <DynamicMetricCard
          subtitle="Ticket Médio"
          title={`${Math.round(avgPrice).toLocaleString('pt-AO')} Kz`}
          icon="DollarSign"
          description="Valor base de referência dos pacotes"
        />
        <DynamicMetricCard
          subtitle="Categorias Cobertas"
          title={`${categoriesCount} Activas`}
          icon="Tag"
          description="Especialidades prontas no catálogo"
        />
      </div>

      {/* Grid de Cards Personalizados quando em Grid View */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Pesquisar pacote ou diferencial..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-xs h-9 px-3 rounded-md border border-input bg-background w-64 shadow-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs h-9 px-2 rounded-md border border-input bg-background shadow-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewMode('grid')}
                className="text-xs h-9"
              >
                Grelha de Cards
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className="text-xs h-9"
              >
                Tabela
              </Button>
              <Button onClick={handleOpenCreate} size="sm" className="h-9 gap-1.5">
                <Plus className="h-4 w-4" /> Novo Serviço
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="relative flex flex-col justify-between rounded-xl border bg-card p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                      <Tag className="h-3 w-3" />
                      {CATEGORY_LABELS[service.category] || service.category}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground opacity-60 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(service)}>
                          <Edit className="h-3.5 w-3.5 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(service)}>
                          {service.isActive ? (
                            <>
                              <PowerOff className="h-3.5 w-3.5 mr-2 text-amber-500" />
                              Ocultar
                            </>
                          ) : (
                            <>
                              <Power className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(service)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-semibold text-foreground text-base mt-3 leading-snug">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {service.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-foreground tracking-tight">
                      {Number(service.price).toLocaleString('pt-AO')}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {service.currency || 'AOA'}
                    </span>
                    {service.durationHours ? (
                      <span className="text-xs text-muted-foreground ml-2">
                        / ~{service.durationHours}h
                      </span>
                    ) : null}
                  </div>

                  {/* Benefícios */}
                  {service.benefits && service.benefits.length > 0 && (
                    <div className="mt-4 space-y-1.5 border-t pt-3">
                      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                        Destaques do Pacote
                      </span>
                      <ul className="space-y-1">
                        {service.benefits.slice(0, 3).map((b: string, i: number) => (
                          <li
                            key={i}
                            className="text-xs text-foreground/90 flex items-center gap-1.5"
                          >
                            <Sparkles className="h-3 w-3 text-primary shrink-0" />
                            <span className="truncate">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Entregáveis Inclusos */}
                  {service.deliverablesIncluded &&
                    service.deliverablesIncluded.length > 0 && (
                      <div className="mt-3 space-y-1.5 border-t pt-2.5">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                          Entregáveis Garantidos
                        </span>
                        <ul className="space-y-1">
                          {service.deliverablesIncluded.slice(0, 2).map((d: string, i: number) => (
                            <li
                              key={i}
                              className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="h-3 w-3 shrink-0" />
                              <span className="truncate">{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t pt-3">
                  <Badge
                    variant={service.isActive ? 'default' : 'outline'}
                    className={
                      service.isActive
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'text-muted-foreground'
                    }
                  >
                    {service.isActive ? 'Ativo no Portal' : 'Oculto'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(service)}
                    className="text-xs h-7"
                  >
                    Editar
                  </Button>
                </div>
              </div>
            ))}

            {filteredServices.length === 0 && !isLoading && (
              <div className="col-span-full py-12 text-center border rounded-xl border-dashed">
                <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-foreground">
                  Nenhum serviço encontrado no catálogo.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Adicione pacotes como Videoclipes, Spots Comerciais ou Diárias de
                  Estúdio.
                </p>
                <Button
                  onClick={handleOpenCreate}
                  size="sm"
                  className="mt-4 gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Criar Primeiro Serviço
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visualização em Tabela */}
      {viewMode === 'list' && (
        <UniversalTable<CatalogService>
          data={filteredServices}
          columns={columns}
          isLoading={isLoading}
          searchKey="name"
          searchPlaceholder="Pesquisar por nome ou escopo..."
          searchValue={search}
          onSearchChange={setSearch}
          pageSize={pageSize}
          customFilters={
            <div className="flex items-center gap-2">
              <FilterPopover
                icon="Tag"
                label="Categoria"
                options={CATEGORY_OPTIONS}
                value={categoryFilter}
                onChange={(val) => setCategoryFilter(val || 'ALL')}
              />
              <FilterPopover
                icon="Eye"
                label="Visibilidade"
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(val) => setStatusFilter(val || 'ALL')}
              />
            </div>
          }
          sortFilter={{
            options: SORT_OPTIONS,
            sortBy,
            sortOrder,
            onSortChange: (sb, so) => {
              setSortBy(sb);
              setSortOrder(so);
            },
          }}
          toolbar={{
            actions: (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="text-xs h-9"
                >
                  Cards
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="text-xs h-9"
                >
                  Tabela
                </Button>
                <Button onClick={handleOpenCreate} size="sm" className="h-9 gap-1.5">
                  <Plus className="h-4 w-4" /> Novo Serviço
                </Button>
              </div>
            ),
          }}
          emptyState={{
            title: 'Nenhum serviço cadastrado',
            description:
              'Crie pacotes e serviços padronizados para acelerar propostas comerciais e solicitações no portal.',
            action: (
              <Button size="sm" onClick={handleOpenCreate} className="text-xs">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Criar Serviço
              </Button>
            ),
          }}
        />
      )}

      {/* Modal de Criação / Edição */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceToEdit={selectedServiceToEdit}
      />
    </div>
  );
}

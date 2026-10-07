'use client';

import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components';
import {
  UniversalTable,
  MobileFilterBottomSheet,
  FilterSectionConfig,
  DateRangeFilter,
  SortFilter,
  SortOption,
} from '@/components/custom/universal-table';
import { FilterPopover } from '@/components/shared';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService, ClientData } from '@/services/clients-service';
import { useCrmFilters } from '@/hooks/crm';
import { ClientModal } from './client-modal';
import { Plus, Users, Pencil, Archive, MoreHorizontal, Filter, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ClientRow = ClientData & { id: string };

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'Todos os Tipos' },
  { value: 'COMPANY', label: 'Empresa / Produtora' },
  { value: 'INDIVIDUAL', label: 'Cliente Individual' },
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos os Estados' },
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'ARCHIVED', label: 'Arquivado' },
];

const SORT_OPTIONS: SortOption[] = [
  { value: 'createdAt', label: 'Data de Registo' },
  { value: 'name', label: 'Nome do Cliente' },
  { value: 'status', label: 'Estado' },
];

export function CrmPageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const queryClient = useQueryClient();

  const {
    filters,
    search,
    type,
    status,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    setSearch,
    setType,
    setStatus,
    setSort,
    setDateRange,
    resetFilters,
  } = useCrmFilters();

  const { data, isLoading } = useQuery({
    queryKey: ['clients', filters],
    queryFn: () => clientsService.getAll(filters),
  });

  const clients: ClientRow[] = useMemo(() => {
    const list = data?.data || [];
    return list.map((c) => ({
      ...c,
      id: c.id || '',
    }));
  }, [data]);

  const archiveMutation = useMutation({
    mutationFn: (id: string) => clientsService.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente arquivado com sucesso.');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Falha ao arquivar cliente');
    },
  });

  const handleEdit = (client: ClientData) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const columns: ColumnDef<ClientRow>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Cliente / Produtora',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-medium text-foreground text-sm">{item.name}</span>
              {item.legalName && (
                <span className="text-xs text-muted-foreground">{item.legalName}</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'taxId',
        header: 'NIF Fiscal',
        cell: ({ row }) => (
          <span className="text-xs font-mono text-foreground">{row.original.taxId || '—'}</span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email Comercial',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.email || '—'}</span>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Telefone',
        cell: ({ row }) => (
          <span className="text-xs text-foreground font-mono">{row.original.phone || '—'}</span>
        ),
      },
      {
        accessorKey: 'address',
        header: 'Endereço',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.address || '—'}
          </span>
        ),
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
                <DropdownMenuItem onClick={() => handleEdit(item)}>
                  <Pencil className="mr-2 h-4 w-4" /> Editar Dados
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    if (item.id) archiveMutation.mutate(item.id);
                  }}
                >
                  <Archive className="mr-2 h-4 w-4" /> Arquivar Cliente
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [archiveMutation]
  );

  // Configuração das secções para o MobileFilterBottomSheet
  const mobileSections: FilterSectionConfig[] = useMemo(
    () => [
      {
        id: 'type',
        title: 'Tipo de Cliente / Entidade',
        options: TYPE_OPTIONS.filter((t) => t.value !== 'ALL').map((t) => ({
          label: t.label,
          value: t.value,
        })),
        multiple: false,
      },
      {
        id: 'status',
        title: 'Estado do Registo',
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
      type: type && type !== 'ALL' ? [type] : [],
      status: status && status !== 'ALL' ? [status] : [],
    }),
    [type, status]
  );

  const handleApplyMobileFilters = (newFilters: Record<string, string[]>) => {
    const nextType = newFilters.type?.[0] || 'ALL';
    const nextStatus = newFilters.status?.[0] || 'ALL';
    setType(nextType);
    setStatus(nextStatus);
  };

  return (
    <div className="mt-6 space-y-6">
      {/* UniversalTable Unificada - Barra Única sem Repetições */}
      <UniversalTable<ClientRow>
        data={clients}
        columns={columns}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Pesquisar por nome, NIF, email ou denominação social..."
        searchValue={search}
        onSearchChange={setSearch}
        pageSize={filters.limit || 10}
        customFilters={
          <>
            <FilterPopover
              icon="Tag"
              label="Tipo"
              options={TYPE_OPTIONS}
              value={type}
              onChange={(val) => setType(val || 'ALL')}
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
              onClick={handleCreate}
              size="sm"
              className="h-10 sm:h-9 min-h-[44px] sm:min-h-0 text-xs gap-1.5 shrink-0 rounded-none px-3.5"
            >
              <Plus className="h-4 w-4" /> Novo Cliente
            </Button>
          ),
        }}
        emptyState={{
          title: 'Sem Clientes',
          description:
            search || type !== 'ALL' || status !== 'ALL'
              ? 'Nenhum cliente encontrado com os critérios pesquisados.'
              : 'Registe agências, produtoras ou marcas parceiras.',
          action: (
            <Button size="sm" onClick={handleCreate} className="text-xs min-h-[44px] sm:min-h-0">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Adicionar Primeiro Cliente
            </Button>
          ),
        }}
      />

      <ClientModal
        clientToEdit={selectedClient}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClient(null);
        }}
      />
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components';
import { UniversalTable } from '@/components/custom/universal-table';
import { FilterPopover } from '@/components/shared';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService, ClientData } from '@/services/clients-service';
import { useCrmFilters } from '@/hooks/crm';
import { ClientModal } from './client-modal';
import { Plus, Users, Pencil, Archive, MoreHorizontal } from 'lucide-react';
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
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'ARCHIVED', label: 'Arquivado' },
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
    setSearch,
    setType,
    setStatus,
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
        header: 'Ação',
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

  return (
    <div className="mt-6 space-y-6">
      {/* Mindgest Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-baseline">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
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
          {(type !== 'ALL' || status !== 'ALL' || search) && (
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
            onClick={handleCreate}
            size="sm"
            className="h-10 text-xs gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" /> Novo Cliente
          </Button>
        </div>
      </div>

      {/* UniversalTable */}
      <UniversalTable<ClientRow>
        data={clients}
        columns={columns}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Pesquisar por nome, NIF, email ou razão social..."
        pageSize={filters.limit || 10}
        emptyState={{
          title: 'Sem Clientes',
          description:
            search || type !== 'ALL' || status !== 'ALL'
              ? 'Nenhum cliente encontrado com os critérios pesquisados.'
              : 'Cadastre agências, produtoras ou marcas parceiras.',
          action: (
            <Button size="sm" onClick={handleCreate} className="text-xs">
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

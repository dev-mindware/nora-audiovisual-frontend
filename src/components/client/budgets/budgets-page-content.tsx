'use client';

import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  ItemStatusBadge,
  Button,
} from '@/components';
import {
  UniversalTable,
  FilterSectionConfig,
  SortOption,
} from '@/components/custom/universal-table';
import { FilterPopover } from '@/components/shared';
import { useBudgets, useSendBudget, useDuplicateBudget, useChangeBudgetStatus, useBudgetsFilters } from '@/hooks/budgets';
import { Budget } from '@/types';
import { BudgetModal } from './budget-modal';
import { MindgestInvoiceModal } from './mindgest-invoice-modal';
import { Plus, FileSpreadsheet, Send, Check, FileCheck, Copy, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos os Estados' },
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'SENT', label: 'Proposta Enviada' },
  { value: 'APPROVED', label: 'Aprovado' },
  { value: 'REJECTED', label: 'Recusado' },
  { value: 'CONVERTED_TO_PROJECT', label: 'Convertido em Projecto' },
];

const SORT_OPTIONS: SortOption[] = [
  { value: 'createdAt', label: 'Data de Criação' },
  { value: 'total', label: 'Valor Orçado' },
  { value: 'status', label: 'Estado' },
];

export function BudgetsPageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedBudgetForInvoice, setSelectedBudgetForInvoice] = useState<Budget | null>(null);

  const {
    filters,
    search,
    status,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    setSearch,
    setStatus,
    setSort,
    setDateRange,
    resetFilters,
  } = useBudgetsFilters();

  const { data, isLoading } = useBudgets(filters);
  const { mutate: sendBudget } = useSendBudget();
  const { mutate: duplicateBudget } = useDuplicateBudget();
  const { mutate: changeStatus } = useChangeBudgetStatus();

  const budgets = data?.data || [];

  const columns: ColumnDef<Budget>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Orçamento / Produção',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div>
                <span className="font-medium text-foreground block text-sm">
                  {item.title || `Orçamento #${item.id.slice(0, 8)}`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.client?.name || item.clientName || 'Cliente Direto'} • v{item.version}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => <ItemStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'subtotal',
        header: 'Subtotal',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-mono">
            {Number(row.original.subtotal || 0).toLocaleString('pt-AO')} Kz
          </span>
        ),
      },
      {
        accessorKey: 'estimatedTax',
        header: 'Impostos / Taxas',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-mono">
            {Number(row.original.estimatedTax || 0).toLocaleString('pt-AO')} Kz
          </span>
        ),
      },
      {
        accessorKey: 'total',
        header: 'Total Orçado',
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-foreground font-mono">
            {Number(row.original.total || 0).toLocaleString('pt-AO')} Kz
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
                {item.status === 'DRAFT' && (
                  <DropdownMenuItem onClick={() => sendBudget(item.id)}>
                    <Send className="mr-2 h-4 w-4" /> Enviar Proposta
                  </DropdownMenuItem>
                )}
                {item.status === 'SENT' && (
                  <DropdownMenuItem onClick={() => changeStatus({ id: item.id, status: 'APPROVED' })}>
                    <Check className="mr-2 h-4 w-4" /> Aprovar Manualmente
                  </DropdownMenuItem>
                )}
                {item.status === 'APPROVED' && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedBudgetForInvoice(item);
                      setIsInvoiceModalOpen(true);
                    }}
                  >
                    <FileCheck className="mr-2 h-4 w-4" /> Emitir Factura Mindgest
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => duplicateBudget(item.id)}>
                  <Copy className="mr-2 h-4 w-4" /> Duplicar Versão
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [sendBudget, duplicateBudget, changeStatus]
  );

  // Configuração das secções para o MobileFilterBottomSheet
  const mobileSections: FilterSectionConfig[] = useMemo(
    () => [
      {
        id: 'status',
        title: 'Estado da Proposta / Orçamento',
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
      status: status && status !== 'ALL' ? [status] : [],
    }),
    [status]
  );

  const handleApplyMobileFilters = (newFilters: Record<string, string[]>) => {
    const nextStatus = newFilters.status?.[0] || 'ALL';
    setStatus(nextStatus);
  };

  return (
    <div className="mt-6 space-y-6">
      {/* UniversalTable Unificada - Barra Única sem Repetições */}
      <UniversalTable<Budget>
        data={budgets}
        columns={columns}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Pesquisar por cliente ou referência de proposta..."
        searchValue={search}
        onSearchChange={setSearch}
        pageSize={filters.limit || 10}
        customFilters={
          <FilterPopover
            icon="Tag"
            label="Estado"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(val) => setStatus(val || 'ALL')}
          />
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
              <Plus className="h-4 w-4" /> Novo Orçamento
            </Button>
          ),
        }}
        emptyState={{
          title: 'Sem Orçamentos',
          description:
            search || status !== 'ALL'
              ? 'Nenhum orçamento encontrado com os critérios filtrados.'
              : 'Crie uma nova proposta comercial para os seus projectos audiovisuais.',
          action: (
            <Button size="sm" onClick={() => setIsModalOpen(true)} className="text-xs min-h-[44px] sm:min-h-0">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Criar Orçamento
            </Button>
          ),
        }}
      />

      <BudgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <MindgestInvoiceModal
        budget={selectedBudgetForInvoice}
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedBudgetForInvoice(null);
        }}
      />
    </div>
  );
}

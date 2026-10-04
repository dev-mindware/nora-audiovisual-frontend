'use client';

import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  ItemStatusBadge,
  Button,
} from '@/components';
import { UniversalTable } from '@/components/custom/universal-table';
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
  { value: 'CONVERTED_TO_PROJECT', label: 'Convertido em Projeto' },
];

export function BudgetsPageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedBudgetForInvoice, setSelectedBudgetForInvoice] = useState<Budget | null>(null);

  const {
    filters,
    search,
    status,
    setSearch,
    setStatus,
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
                    <FileCheck className="mr-2 h-4 w-4" /> Emitir Fatura Mindgest
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

  return (
    <div className="mt-6 space-y-6">
      {/* Mindgest Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-baseline">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <FilterPopover
            icon="Tag"
            label="Estado"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(val) => setStatus(val || 'ALL')}
          />
          {(status !== 'ALL' || search) && (
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
            <Plus className="h-4 w-4" /> Novo Orçamento
          </Button>
        </div>
      </div>

      {/* UniversalTable */}
      <UniversalTable<Budget>
        data={budgets}
        columns={columns}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Pesquisar por cliente ou referência de proposta..."
        pageSize={filters.limit || 10}
        emptyState={{
          title: 'Sem Orçamentos',
          description:
            search || status !== 'ALL'
              ? 'Nenhum orçamento encontrado com os critérios filtrados.'
              : 'Crie uma nova proposta comercial para seus projetos audiovisuais.',
          action: (
            <Button size="sm" onClick={() => setIsModalOpen(true)} className="text-xs">
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

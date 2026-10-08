'use client';

import { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  DynamicMetricCard,
  ItemStatusBadge,
  UniversalTable,
} from '@/components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  usePayments,
  useExpenses,
  useApproveExpense,
  useRejectExpense,
  useConfirmPayment,
} from '@/hooks/finance';
import { RecordExpenseModal } from './record-expense-modal';
import { RecordPaymentModal } from './record-payment-modal';
import { Expense, ProductionPayment, ExpenseCategory, ExpenseStatus } from '@/types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  Plus,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Clock,
  Filter,
  FileCheck,
  Building,
  Check,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const CATEGORY_LABELS: Record<ExpenseCategory, { label: string; color: string }> = {
  FOOD: { label: 'Alimentação / Catering', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  FUEL: { label: 'Combustível / Transporte', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30' },
  RENTAL: { label: 'Aluguer de Locação', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  PERMITS: { label: 'Licenças & Taxas', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
  FREELANCER: { label: 'Cachês & Freelancers', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  MISC: { label: 'Diversos / Campo', color: 'bg-muted text-muted-foreground border-border' },
};

export function FinancePageContent() {
  const [activeTab, setActiveTab] = useState<'expenses' | 'payments' | 'cashflow'>('expenses');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Filters
  const [expenseStatusFilter, setExpenseStatusFilter] = useState<string>('ALL');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('ALL');

  // Queries
  const { data: expenses = [], isLoading: loadingExpenses } = useExpenses();
  const { data: payments = [], isLoading: loadingPayments } = usePayments();

  // Mutations
  const { mutateAsync: approveExpense, isPending: approving } = useApproveExpense();
  const { mutateAsync: rejectExpense, isPending: rejecting } = useRejectExpense();
  const { mutateAsync: confirmPayment, isPending: confirming } = useConfirmPayment();

  // KPI Calculations
  const metrics = useMemo(() => {
    let totalIncome = 0;
    let totalPendingIncome = 0;
    payments.forEach((p) => {
      const amt = Number(p.amount) || 0;
      if (p.status === 'PAID') totalIncome += amt;
      else totalPendingIncome += amt;
    });

    let totalExpenses = 0;
    let pendingApprovalExpensesCount = 0;
    let pendingApprovalExpensesAmount = 0;
    expenses.forEach((e) => {
      const amt = Number(e.amount) || 0;
      if (e.status === 'APPROVED') {
        totalExpenses += amt;
      } else if (e.status === 'PENDING') {
        pendingApprovalExpensesCount += 1;
        pendingApprovalExpensesAmount += amt;
      }
    });

    const netCashflow = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalPendingIncome,
      totalExpenses,
      pendingApprovalExpensesCount,
      pendingApprovalExpensesAmount,
      netCashflow,
    };
  }, [payments, expenses]);

  // Formatter
  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (expenseStatusFilter !== 'ALL' && e.status !== expenseStatusFilter) return false;
      if (expenseCategoryFilter !== 'ALL' && e.category !== expenseCategoryFilter) return false;
      return true;
    });
  }, [expenses, expenseStatusFilter, expenseCategoryFilter]);

  const expenseColumns: ColumnDef<Expense>[] = useMemo(
    () => [
      {
        accessorKey: 'date',
        header: 'Data',
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground whitespace-nowrap">
            {format(new Date(row.original.date), 'dd/MM/yyyy')}
          </span>
        ),
      },
      {
        accessorKey: 'project',
        header: 'Projecto',
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {row.original.project?.title || 'Projecto Geral'}
          </span>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Categoria',
        cell: ({ row }) => {
          const catMeta = CATEGORY_LABELS[row.original.category] || CATEGORY_LABELS.MISC;
          return (
            <span
              className={`inline-block px-2 py-0.5 text-[10px] rounded-md border font-medium ${catMeta.color}`}
            >
              {catMeta.label}
            </span>
          );
        },
      },
      {
        accessorKey: 'description',
        header: 'Descrição',
        cell: ({ row }) => (
          <span className="max-w-xs truncate text-muted-foreground block">
            {row.original.description}
          </span>
        ),
      },
      {
        accessorKey: 'receiptUrl',
        header: 'Comprovativo',
        cell: ({ row }) => {
          const url = row.original.receiptUrl;
          return url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline flex items-center gap-1 text-[11px]"
            >
              <ExternalLink className="h-3 w-3" />
              Ver Recibo
            </a>
          ) : (
            <span className="text-muted-foreground/60 text-[11px]">—</span>
          );
        },
      },
      {
        accessorKey: 'amount',
        header: () => <div className="text-right">Valor</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono font-semibold text-foreground whitespace-nowrap">
            {formatKz(Number(row.original.amount))}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: () => <div className="text-center">Estado</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <ItemStatusBadge status={row.original.status} />
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Acções de Gestão</div>,
        cell: ({ row }) => {
          const expense = row.original;
          return (
            <div className="flex items-center justify-end whitespace-nowrap">
              {expense.status === 'PENDING' ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => approveExpense(expense.id)}
                    disabled={approving}
                    className="h-7 px-2 text-[11px] rounded-md border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectExpense({ expenseId: expense.id })}
                    disabled={rejecting}
                    className="h-7 px-2 text-[11px] rounded-md border-rose-500/40 text-rose-600 hover:bg-rose-500/10 gap-1"
                  >
                    <X className="h-3 w-3" />
                    Rejeitar
                  </Button>
                </div>
              ) : (
                <span className="text-[11px] text-muted-foreground font-mono">Concluído</span>
              )}
            </div>
          );
        },
      },
    ],
    [approving, rejecting, approveExpense, rejectExpense]
  );

  const paymentColumns: ColumnDef<ProductionPayment>[] = useMemo(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Data',
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground whitespace-nowrap">
            {format(new Date(row.original.createdAt), 'dd/MM/yyyy')}
          </span>
        ),
      },
      {
        accessorKey: 'project',
        header: 'Projecto',
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {row.original.project?.title || 'Geral / Sem Projecto'}
          </span>
        ),
      },
      {
        accessorKey: 'method',
        header: 'Método',
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-muted-foreground">
            {row.original.method === 'BANK_TRANSFER' && 'Transferência Bancária'}
            {row.original.method === 'MULTICAIXA' && 'Multicaixa Express'}
            {row.original.method === 'CASH' && 'Numerário'}
          </span>
        ),
      },
      {
        accessorKey: 'reference',
        header: 'Referência',
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-muted-foreground">
            {row.original.reference || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'amount',
        header: () => <div className="text-right">Valor</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono font-semibold text-foreground whitespace-nowrap">
            {formatKz(Number(row.original.amount))}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: () => <div className="text-center">Estado</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <ItemStatusBadge status={row.original.status} />
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Acções</div>,
        cell: ({ row }) => {
          const payment = row.original;
          return (
            <div className="flex justify-end">
              {payment.status !== 'PAID' ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => confirmPayment(payment.id)}
                  disabled={confirming}
                  className="h-7 px-2.5 text-[11px] rounded-md border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Confirmar
                </Button>
              ) : (
                <span className="text-[11px] text-muted-foreground font-mono">Liquidado</span>
              )}
            </div>
          );
        },
      },
    ],
    [confirming, confirmPayment]
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end border-b border-border pb-5">

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPaymentModalOpen(true)}
            className="rounded-none text-xs h-9 gap-1.5 border-border"
          >
            <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Registar Recebimento
          </Button>

          <Button
            size="sm"
            onClick={() => setIsExpenseModalOpen(true)}
            className="rounded-none text-xs h-9 gap-1.5 font-medium"
          >
            <Plus className="h-4 w-4" />
            Registar Despesa
          </Button>
        </div>
      </div>

      {/* KPI Cards Padronizados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          subtitle="Total Recebido"
          title={formatKz(metrics.totalIncome)}
          icon="TrendingUp"
          description={`+ ${formatKz(metrics.totalPendingIncome)} a receber pendente`}
        />
        <DynamicMetricCard
          subtitle="Despesas Aprovadas"
          title={formatKz(metrics.totalExpenses)}
          icon="Receipt"
          colors="destructive"
          variant="action"
          description="Custos de rodagem contabilizados"
        />
        <DynamicMetricCard
          subtitle="Margem / Saldo Líquido"
          title={formatKz(metrics.netCashflow)}
          icon="DollarSign"
          description="Entradas confirmadas menos saídas"
        />
        <DynamicMetricCard
          subtitle="Despesas Pendentes"
          title={`${metrics.pendingApprovalExpensesCount} pendentes`}
          icon="Clock"
          description={`Total: ${formatKz(metrics.pendingApprovalExpensesAmount)}`}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border text-xs font-medium">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'expenses'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Receipt className="h-3.5 w-3.5" />
          Despesas de Campo & Produção ({expenses.length})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          Recebimentos & Pagamentos ({payments.length})
        </button>

        <button
          onClick={() => setActiveTab('cashflow')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'cashflow'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Demonstrativo & Fluxo de Caixa
        </button>
      </div>

      {/* Content: TAB 1 - DESPESAS */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/20 border border-border">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" /> Filtros:
              </span>

              {/* Status */}
              <Select
                value={expenseStatusFilter}
                onValueChange={(val) => setExpenseStatusFilter(val)}
              >
                <SelectTrigger className="h-8 px-2.5 text-xs bg-background border border-border rounded-none w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground rounded-none text-xs">
                  <SelectItem value="ALL" className="text-xs">Todos os Estados</SelectItem>
                  <SelectItem value="PENDING" className="text-xs">Pendentes de Validação</SelectItem>
                  <SelectItem value="APPROVED" className="text-xs">Aprovadas</SelectItem>
                  <SelectItem value="REJECTED" className="text-xs">Rejeitadas</SelectItem>
                </SelectContent>
              </Select>

              {/* Category */}
              <Select
                value={expenseCategoryFilter}
                onValueChange={(val) => setExpenseCategoryFilter(val)}
              >
                <SelectTrigger className="h-8 px-2.5 text-xs bg-background border border-border rounded-none w-52">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground rounded-none text-xs">
                  <SelectItem value="ALL" className="text-xs">Todas as Categorias</SelectItem>
                  <SelectItem value="FOOD" className="text-xs">Alimentação / Catering</SelectItem>
                  <SelectItem value="FUEL" className="text-xs">Combustível / Transporte</SelectItem>
                  <SelectItem value="RENTAL" className="text-xs">Aluguer de Locação</SelectItem>
                  <SelectItem value="PERMITS" className="text-xs">Licenças & Taxas</SelectItem>
                  <SelectItem value="FREELANCER" className="text-xs">Cachês & Freelancers</SelectItem>
                  <SelectItem value="MISC" className="text-xs">Diversos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <span className="text-xs text-muted-foreground font-mono">
              A mostrar {filteredExpenses.length} de {expenses.length} despesas
            </span>
          </div>

          {/* Expenses Table */}
          <UniversalTable<Expense>
            columns={expenseColumns}
            data={filteredExpenses}
            isLoading={loadingExpenses}
            searchPlaceholder="Pesquisar despesa por descrição..."
            searchKey="description"
            emptyState={{
              title: 'Nenhuma despesa encontrada',
              description: 'Registe os custos de alimentação, transporte e diárias de rodagem.',
              action: (
                <Button
                  size="sm"
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="rounded-none text-xs gap-1.5 font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Registar Despesa
                </Button>
              ),
            }}
          />
        </div>
      )}

      {/* Content: TAB 2 - PAGAMENTOS */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <UniversalTable<ProductionPayment>
            columns={paymentColumns}
            data={payments}
            isLoading={loadingPayments}
            searchPlaceholder="Pesquisar pagamento por referência..."
            searchKey="reference"
            emptyState={{
              title: 'Nenhum pagamento registado',
              description: 'Liquide propostas comerciais e parcelas de produção.',
              action: (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="rounded-none text-xs gap-1.5 border-border"
                >
                  <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Registar Recebimento
                </Button>
              ),
            }}
          />
        </div>
      )}

      {/* Content: TAB 3 - CASHFLOW */}
      {activeTab === 'cashflow' && (
        <Card className="rounded-none border-border shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-tight">
              Demonstrativo Consolidado de Margem Operacional
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Relação em tempo real entre receitas de propostas aprovadas e custos reais de produção.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-border p-4 bg-muted/10">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Entradas Confirmadas</p>
                <p className="text-xl font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatKz(metrics.totalIncome)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium">Saídas Operacionais Aprovadas</p>
                <p className="text-xl font-mono font-semibold text-rose-600 dark:text-rose-400 mt-1">
                  {formatKz(metrics.totalExpenses)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium">Margem Operacional Efetiva</p>
                <p className="text-xl font-mono font-semibold text-foreground mt-1">
                  {formatKz(metrics.netCashflow)}
                </p>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                  Margem: {metrics.totalIncome > 0 ? ((metrics.netCashflow / metrics.totalIncome) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Distribuição das Despesas por Categoria
              </h4>
              <div className="space-y-2">
                {Object.entries(CATEGORY_LABELS).map(([catKey, catMeta]) => {
                  const catExpenses = expenses.filter((e) => e.category === catKey && e.status === 'APPROVED');
                  const catTotal = catExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
                  const percent = metrics.totalExpenses > 0 ? (catTotal / metrics.totalExpenses) * 100 : 0;

                  return (
                    <div key={catKey} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{catMeta.label}</span>
                        <span className="font-mono text-muted-foreground">
                          {formatKz(catTotal)} ({percent.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <RecordExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
}

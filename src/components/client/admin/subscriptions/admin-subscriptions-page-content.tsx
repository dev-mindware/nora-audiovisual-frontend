'use client';

import { useState, useMemo } from 'react';
import {
  GenericTable,
  Column,
  ListSkeleton,
  EmptyState,
  ButtonOnlyAction,
  ItemStatusBadge,
  SearchHandlerWrapper,
} from '@/components';
import { FilterPopover } from '@/components/shared';
import { useAdmin } from '@/hooks/admin';
import { format } from 'date-fns';

export interface AdminSubscriptionItem {
  id: string;
  organizationId?: string;
  organizationName?: string;
  organization?: { id: string; name: string };
  planName?: string;
  plan?: { name: string; code?: string };
  status: string;
  billingInterval?: string;
  proofUrl?: string;
  createdAt?: string;
}

export function AdminSubscriptionsPageContent() {
  const {
    subscriptions,
    isLoadingSubscriptions,
    updateSubscriptionStatus,
    isUpdatingSubscriptionStatus,
  } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const typedSubscriptions = (subscriptions || []) as AdminSubscriptionItem[];

  const handleApprove = async (id: string) => {
    if (isUpdatingSubscriptionStatus) return;
    await updateSubscriptionStatus({ id, status: 'ACTIVE' });
  };

  const handleReject = async (id: string) => {
    if (isUpdatingSubscriptionStatus) return;
    await updateSubscriptionStatus({ id, status: 'REJECTED', reason: 'Cancelado pelo administrador' });
  };

  const filteredSubscriptions = useMemo(() => {
    let result = typedSubscriptions;
    if (statusFilter && statusFilter !== 'ALL') {
      result = result.filter((s: AdminSubscriptionItem) => s.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s: AdminSubscriptionItem) =>
          (s.organizationName || s.organization?.name || '').toLowerCase().includes(q) ||
          (s.planName || s.plan?.name || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [typedSubscriptions, search, statusFilter]);

  const columns: Column<AdminSubscriptionItem>[] = [
    {
      key: 'organizationName',
      header: 'Produtora',
      render: (_, item) => (
        <span className="font-medium text-foreground text-sm">
          {item.organizationName || item.organization?.name || 'Produtora'}
        </span>
      ),
    },
    {
      key: 'planName',
      header: 'Plano',
      render: (_, item) => (
        <span className="text-xs font-semibold text-foreground">
          {item.planName || item.plan?.name || 'Plano'}
        </span>
      ),
    },
    {
      key: 'billingInterval',
      header: 'Intervalo',
      render: (_, item) => (
        <span className="text-xs text-muted-foreground uppercase font-mono">
          {item.billingInterval === 'YEARLY' ? 'Anual' : 'Mensal'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (_, item) => <ItemStatusBadge status={item.status} />,
    },
    {
      key: 'createdAt',
      header: 'Criado em',
      render: (_, item) => (
        <span className="text-xs text-foreground">
          {item.createdAt ? format(new Date(item.createdAt), 'dd/MM/yyyy') : '—'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Ação',
      render: (_, item) => {
        const isPending = item.status === 'PENDING';
        const actions = [];

        if (isPending) {
          actions.push({
            label: 'Aprovar subscrição',
            icon: 'Check' as const,
            onClick: () => handleApprove(item.id),
          });
          actions.push({
            label: 'Rejeitar',
            icon: 'X' as const,
            variant: 'destructive' as const,
            onClick: () => handleReject(item.id),
          });
        } else {
          actions.push({
            label: 'Cancelar subscrição',
            icon: 'CirclePower' as const,
            variant: 'destructive' as const,
            onClick: () => handleReject(item.id),
          });
        }

        return <ButtonOnlyAction data={item} actions={actions} />;
      },
    },
  ];

  if (isLoadingSubscriptions) {
    return <ListSkeleton rows={5} cols={6} />;
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Filters (Exact Mindgest Pattern) */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-baseline">
        <SearchHandlerWrapper
          search={search}
          setSearch={setSearch}
          placeholder="Pesquisar por produtora ou plano..."
          className="w-full sm:max-w-md"
        />

        <FilterPopover
          icon="Tag"
          label="Estado"
          options={[
            { value: 'ALL', label: 'Todos' },
            { value: 'PENDING', label: 'Pendente' },
            { value: 'ACTIVE', label: 'Activo' },
            { value: 'CANCELLED', label: 'Cancelado' },
            { value: 'TRIALING', label: 'Trial' },
          ]}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val || null)}
        />
      </div>

      {/* Table (Directly rendered, NOT in a card) */}
      {filteredSubscriptions.length > 0 ? (
        <GenericTable<AdminSubscriptionItem>
          data={filteredSubscriptions}
          columns={columns}
          total={filteredSubscriptions.length}
          totalPages={Math.ceil(filteredSubscriptions.length / 10) || 1}
          emptyMessage="Nenhuma subscrição encontrada"
        />
      ) : (
        <EmptyState
          title="Sem Subscrições"
          description={
            search || statusFilter
              ? 'Nenhuma subscrição encontrada com os filtros selecionados.'
              : 'Nenhuma subscrição registada na plataforma.'
          }
          icon="CreditCard"
        />
      )}
    </div>
  );
}

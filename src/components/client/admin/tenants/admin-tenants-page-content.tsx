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
import { TenantAdminItem } from '@/services/admin-service';
import { format } from 'date-fns';
import { TenantDetailsModal } from './tenant-details-modal';

export function AdminTenantsPageContent() {
  const {
    tenants,
    isLoadingTenants,
    updateStatus,
    isUpdatingStatus,
    openTenantDetails,
  } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const handleToggleTenantStatus = async (tenant: TenantAdminItem) => {
    if (isUpdatingStatus) return;
    const nextStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await updateStatus({
      id: tenant.id,
      status: nextStatus,
      reason: nextStatus === 'SUSPENDED' ? 'Suspensão administrativa de plataforma' : 'Reativação',
    });
  };

  const filteredTenants = useMemo(() => {
    let result = tenants;
    if (statusFilter && statusFilter !== 'ALL') {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          t.owner?.email?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tenants, search, statusFilter]);

  const columns: Column<TenantAdminItem>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground text-sm">{item.name}</span>
          <span className="text-xs font-mono text-muted-foreground">{item.slug}</span>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Proprietário',
      render: (_, item) => (
        <div className="flex flex-col text-xs text-foreground">
          <span>{item.owner?.name || '—'}</span>
          <span className="text-muted-foreground">{item.owner?.email}</span>
        </div>
      ),
    },
    {
      key: 'subscription',
      header: 'Plano',
      render: (_, item) => (
        <span className="font-semibold text-xs text-foreground">
          {item.subscription?.planCode || 'INICIAL'}
        </span>
      ),
    },
    {
      key: 'metrics',
      header: 'Quotas & Recursos',
      render: (_, item) => {
        const m = item.metrics;
        return (
          <div className="text-xs text-muted-foreground">
            {m?.membersCount || 0} membros • {m?.projectsCount || 0} projetos • {m?.storageUsedGb || 0} GB
          </div>
        );
      },
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
      render: (_, item) => (
        <ButtonOnlyAction
          data={item}
          actions={[
            {
              label: 'Ver detalhes',
              icon: 'Eye',
              onClick: (tenant) => openTenantDetails(tenant),
            },
            { type: 'separator' },
            {
              label: item.status === 'ACTIVE' ? 'Suspender' : 'Activar',
              icon: item.status === 'ACTIVE' ? 'UserX' : 'UserCheck',
              variant: item.status === 'ACTIVE' ? 'destructive' : 'default',
              onClick: (tenant) => handleToggleTenantStatus(tenant),
            },
          ]}
        />
      ),
    },
  ];

  if (isLoadingTenants) {
    return <ListSkeleton rows={5} cols={7} />;
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Filters (Exact Mindgest Pattern) */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-baseline">
        <SearchHandlerWrapper
          search={search}
          setSearch={setSearch}
          placeholder="Pesquisar por nome, slug ou email..."
          className="w-full sm:max-w-md"
        />

        <FilterPopover
          icon="Tag"
          label="Estado"
          options={[
            { value: 'ALL', label: 'Todos' },
            { value: 'ACTIVE', label: 'Activo' },
            { value: 'SUSPENDED', label: 'Suspenso' },
            { value: 'TRIAL', label: 'Trial' },
          ]}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val || null)}
        />
      </div>

      {/* Table (Directly rendered, NOT in a card) */}
      {filteredTenants.length > 0 ? (
        <GenericTable<TenantAdminItem>
          data={filteredTenants}
          columns={columns}
          total={filteredTenants.length}
          totalPages={Math.ceil(filteredTenants.length / 10) || 1}
          emptyMessage="Nenhuma produtora encontrada"
        />
      ) : (
        <EmptyState
          title="Sem Produtoras"
          description={
            search || statusFilter
              ? 'Nenhuma organização encontrada com os critérios filtrados.'
              : 'Nenhuma produtora ou organização registada na plataforma.'
          }
          icon="Building2"
        />
      )}

      <TenantDetailsModal />
    </div>
  );
}

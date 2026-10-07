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
import { AdminUserItem } from '@/services/admin-service';
import { format } from 'date-fns';
import { UserDetailsModal } from './user-details-modal';
import { ResetPasswordModal } from './reset-password-modal';

export function AdminUsersPageContent() {
  const {
    users,
    isLoadingUsers,
    updateUserStatus,
    isUpdatingUserStatus,
    openUserDetails,
    openResetPassword,
  } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const handleToggleUserStatus = async (user: AdminUserItem) => {
    if (isUpdatingUserStatus) return;
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await updateUserStatus({
      userId: user.id,
      status: nextStatus,
      reason: 'Alteração pelo painel administrativo',
    });
  };

  const filteredUsers = useMemo(() => {
    let result = users;
    if (statusFilter && statusFilter !== 'ALL') {
      result = result.filter((u) => u.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.organizations?.some((o) => o.organizationName.toLowerCase().includes(q))
      );
    }
    return result;
  }, [users, search, statusFilter]);

  const columns: Column<AdminUserItem>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (_, item) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-foreground text-sm">{item.name}</span>
            {item.isPlatformAdmin && (
              <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-1 rounded border border-amber-500/20">
                Admin
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{item.email}</span>
        </div>
      ),
    },
    {
      key: 'organizations',
      header: 'Produtora',
      render: (_, item) => (
        <span className="text-xs text-foreground font-medium">
          {item.organizations?.[0]?.organizationName || 'Plataforma Global'}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Papel',
      render: (_, item) => (
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
          {item.organizations?.[0]?.roleName || (item.isPlatformAdmin ? 'Superadmin' : 'Membro')}
        </span>
      ),
    },
    {
      key: 'activeProjectsCount',
      header: 'Projectos',
      render: (_, item) => (
        <span className="text-xs text-foreground">{item.activeProjectsCount ?? 0}</span>
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
      render: (_, item) => (
        <ButtonOnlyAction
          data={item}
          actions={[
            {
              label: 'Ver detalhes',
              icon: 'Eye',
              onClick: (user) => openUserDetails(user),
            },
            { type: 'separator' },
            {
              label: 'Resetar palavra-passe',
              icon: 'KeyRound',
              onClick: (user) => openResetPassword(user),
            },
            {
              label: item.status === 'ACTIVE' ? 'Desativar' : 'Activar',
              icon: item.status === 'ACTIVE' ? 'UserX' : 'UserCheck',
              variant: item.status === 'ACTIVE' ? 'destructive' : 'default',
              onClick: (user) => handleToggleUserStatus(user),
            },
          ]}
        />
      ),
    },
  ];

  if (isLoadingUsers) {
    return <ListSkeleton rows={5} cols={7} />;
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Filters (Exact Mindgest Pattern) */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-baseline">
        <SearchHandlerWrapper
          search={search}
          setSearch={setSearch}
          placeholder="Pesquisar por nome, email ou produtora..."
          className="w-full sm:max-w-md"
        />

        <FilterPopover
          icon="Tag"
          label="Estado"
          options={[
            { value: 'ALL', label: 'Todos' },
            { value: 'ACTIVE', label: 'Activo' },
            { value: 'SUSPENDED', label: 'Suspenso' },
          ]}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val || null)}
        />
      </div>

      {/* Table (Directly rendered, NOT in a card) */}
      {filteredUsers.length > 0 ? (
        <GenericTable<AdminUserItem>
          data={filteredUsers}
          columns={columns}
          total={filteredUsers.length}
          totalPages={Math.ceil(filteredUsers.length / 10) || 1}
          emptyMessage="Nenhum utilizador encontrado"
        />
      ) : (
        <EmptyState
          title="Sem Utilizadores"
          description={
            search || statusFilter
              ? 'Nenhum utilizador encontrado com os filtros selecionados.'
              : 'Nenhum utilizador registado na plataforma.'
          }
          icon="Users"
        />
      )}

      <UserDetailsModal />
      <ResetPasswordModal />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminService,
  TenantAdminItem,
  PlatformStats,
  PlatformStorageControl,
  AdminUserItem,
  AdminUserDetails,
} from '@/services/admin-service';
import { useModal } from '@/stores/modal/use-modal-store';
import { toast } from 'sonner';

export function useAdmin() {
  const queryClient = useQueryClient();
  const { openModal, closeModal } = useModal();

  // Filtros locais
  const [userSearch, setUserSearch] = useState('');
  const [userStatus, setUserStatus] = useState<string>('ALL');
  const [userRole, setUserRole] = useState<string>('ALL');
  const [subStatus, setSubStatus] = useState<string>('ALL');
  const [subSearch, setSubSearch] = useState('');

  const adminQueryConfig = {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false as const,
    retry: false,
  };

  // 1. Tenants
  const tenantsQuery = useQuery<{ tenants: TenantAdminItem[]; total: number }>({
    queryKey: ['admin-tenants'],
    queryFn: () => adminService.listTenants(),
    ...adminQueryConfig,
  });

  // 2. Stats
  const statsQuery = useQuery<PlatformStats>({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getPlatformStats(),
    ...adminQueryConfig,
  });

  // 2.1 Storage Control (Cloudflare R2)
  const storageControlQuery = useQuery<PlatformStorageControl>({
    queryKey: ['admin-storage-control'],
    queryFn: () => adminService.getPlatformStorageControl(),
    ...adminQueryConfig,
  });

  // 3. Audit Logs
  const auditLogsQuery = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => adminService.listAuditLogs(),
    ...adminQueryConfig,
  });

  // 4. Users Globais
  const usersQuery = useQuery({
    queryKey: ['admin-users', userSearch, userStatus, userRole],
    queryFn: () =>
      adminService.listUsers({
        search: userSearch || undefined,
        status: userStatus !== 'ALL' ? (userStatus as any) : undefined,
        role: userRole !== 'ALL' ? userRole : undefined,
      }),
    ...adminQueryConfig,
  });

  // 5. Subscrições Multi-Tenant
  const subscriptionsQuery = useQuery({
    queryKey: ['admin-subscriptions', subStatus, subSearch],
    queryFn: () =>
      adminService.listSubscriptions({
        status: subStatus !== 'ALL' ? subStatus : undefined,
        search: subSearch || undefined,
      }),
    ...adminQueryConfig,
  });

  // Mutation: Status Tenant
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: 'ACTIVE' | 'SUSPENDED'; reason?: string }) =>
      adminService.updateTenantStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Estado da produtora atualizado com sucesso!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Falha ao atualizar estado da produtora');
    },
  });

  // Mutation: Status Utilizador
  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, status, reason }: { userId: string; status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED'; reason?: string }) =>
      adminService.updateUserStatus(userId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Estado do utilizador atualizado com sucesso!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Falha ao atualizar utilizador');
    },
  });

  // Mutation: Reset Password Utilizador
  const resetUserPasswordMutation = useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      adminService.resetUserPassword(userId, newPassword),
    onSuccess: () => {
      closeModal('reset-user-password');
      toast.success('Palavra-passe redefinida e sessões invalidadas com sucesso!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Falha ao redefinir palavra-passe');
    },
  });

  // Mutation: Status Subscrição (Aprovação / Cancelamento)
  const updateSubscriptionStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      reason,
      extendDays,
    }: {
      id: string;
      status: 'ACTIVE' | 'CANCELLED' | 'SUSPENDED' | 'REJECTED';
      reason?: string;
      extendDays?: number;
    }) => adminService.updateSubscriptionStatus(id, status, reason, extendDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      closeModal('view-subscription-details');
      toast.success('Estado da subscrição atualizado com sucesso!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Falha ao atualizar subscrição');
    },
  });

  // Modais helpers
  const openUserDetails = (user: AdminUserItem) => {
    openModal('view-user-details', { user });
  };

  const openResetPassword = (user: AdminUserItem) => {
    openModal('reset-user-password', { user });
  };

  const openTenantDetails = (tenant: TenantAdminItem) => {
    openModal('view-tenant-details', { tenant });
  };

  const openProofViewer = (proofData: { url: string; title: string; amount?: string; reference?: string }) => {
    openModal('proof-viewer', proofData);
  };

  const openSubscriptionDetails = (subscription: any) => {
    openModal('view-subscription-details', { subscription });
  };

  return {
    // Tenants
    tenants: tenantsQuery.data?.tenants || [],
    totalTenants: tenantsQuery.data?.total || 0,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    openTenantDetails,

    // Stats & Storage Control (Cloudflare R2)
    stats: statsQuery.data,
    storageControl: storageControlQuery.data,

    // Audit
    auditLogs: auditLogsQuery.data?.logs || [],

    // Users
    users: usersQuery.data?.data || [],
    totalUsers: usersQuery.data?.meta?.total || 0,
    userSearch,
    setUserSearch,
    userStatus,
    setUserStatus,
    userRole,
    setUserRole,
    updateUserStatus: updateUserStatusMutation.mutateAsync,
    isUpdatingUserStatus: updateUserStatusMutation.isPending,
    resetUserPassword: resetUserPasswordMutation.mutateAsync,
    isResettingPassword: resetUserPasswordMutation.isPending,
    openUserDetails,
    openResetPassword,

    // Subscriptions
    subscriptions: subscriptionsQuery.data?.data || [],
    totalSubscriptions: subscriptionsQuery.data?.meta?.total || 0,
    subStatus,
    setSubStatus,
    subSearch,
    setSubSearch,
    updateSubscriptionStatus: updateSubscriptionStatusMutation.mutateAsync,
    isUpdatingSubscriptionStatus: updateSubscriptionStatusMutation.isPending,
    openProofViewer,
    openSubscriptionDetails,

    // Loading states
    isLoading:
      tenantsQuery.isLoading ||
      statsQuery.isLoading ||
      storageControlQuery.isLoading ||
      usersQuery.isLoading ||
      subscriptionsQuery.isLoading ||
      auditLogsQuery.isLoading,
    isLoadingTenants: tenantsQuery.isLoading,
    isLoadingStats: statsQuery.isLoading,
    isLoadingStorageControl: storageControlQuery.isLoading,
    isLoadingUsers: usersQuery.isLoading,
    isLoadingSubscriptions: subscriptionsQuery.isLoading,
    isLoadingAudit: auditLogsQuery.isLoading,

    // Refetch handlers
    refetchTenants: tenantsQuery.refetch,
    refetchStats: statsQuery.refetch,
    refetchStorageControl: storageControlQuery.refetch,
    refetchUsers: usersQuery.refetch,
    refetchSubscriptions: subscriptionsQuery.refetch,
    refetchAudit: auditLogsQuery.refetch,
  };
}


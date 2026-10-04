import { api } from './api';

export interface TenantAdminItem {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
  createdAt: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  subscription?: {
    planCode: string;
    status: string;
    billingCycle: string;
  };
  metrics?: {
    membersCount: number;
    projectsCount: number;
    equipmentCount: number;
    storageUsedGb: number;
  };
}

export interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  totalUsers: number;
  totalProjects: number;
  totalFiles?: number;
  totalStorageBytes?: number;
  totalStorageGb?: number;
  totalStorageTb: number;
  mrrKz: number;
  arrKz: number;
  aiCreditsConsumedTotal?: number;
  planDistribution?: Array<{ name: string; value: number }>;
  storageEvolution?: Array<{ month: string; bytes: number; storageGb: number }>;
}

export interface PlatformStorageControl {
  provider: string;
  bucket: string;
  endpoint: string;
  isHealthy: boolean;
  totalFiles: number;
  totalBytes: number;
  totalGb: number;
  totalTb: number;
  breakdownByType: Array<{
    type: string;
    count: number;
    bytes: number;
    gb: number;
  }>;
  topTenants: Array<{
    organizationId: string;
    name: string;
    slug: string;
    status: string;
    usedBytes: number;
    usedGb: number;
    allocatedGb: number;
  }>;
  updatedAt: string;
}

export interface AuditLogItem {
  id: string;
  organizationId: string;
  organizationName?: string;
  userId: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  createdAt: string;
}

export const adminService = {
  listTenants: async (params?: Record<string, unknown>): Promise<{ tenants: TenantAdminItem[]; total: number }> => {
    const res = await api.get('/admin/tenants', { params });
    const payload = res.data?.data || res.data;
    if (Array.isArray(payload)) {
      return {
        tenants: payload,
        total: res.data?.meta?.total ?? payload.length,
      };
    }
    return {
      tenants: payload?.tenants || payload?.items || [],
      total: payload?.total ?? res.data?.meta?.total ?? 0,
    };
  },

  getTenantDetails: async (id: string) => {
    const res = await api.get(`/admin/tenants/${id}`);
    return res.data?.data || res.data;
  },

  updateTenantStatus: async (id: string, status: 'ACTIVE' | 'SUSPENDED', reason?: string) => {
    const res = await api.patch(`/admin/tenants/${id}/status`, { status, reason });
    return res.data?.data || res.data;
  },

  getPlatformStats: async (): Promise<PlatformStats> => {
    const res = await api.get('/admin/stats');
    return res.data?.data || res.data;
  },

  getPlatformStorageControl: async (): Promise<PlatformStorageControl> => {
    const res = await api.get('/admin/storage');
    return res.data?.data || res.data;
  },

  listAuditLogs: async (params?: Record<string, unknown>): Promise<{ logs: AuditLogItem[]; total: number }> => {
    const res = await api.get('/admin/audit-logs', { params });
    const payload = res.data?.data || res.data;
    if (Array.isArray(payload)) {
      return {
        logs: payload,
        total: res.data?.meta?.total ?? payload.length,
      };
    }
    return {
      logs: payload?.logs || payload?.items || [],
      total: payload?.total ?? res.data?.meta?.total ?? 0,
    };
  },

  listSubscriptions: async (params?: Record<string, unknown>) => {
    const res = await api.get('/admin/subscriptions', { params });
    return res.data?.data || res.data;
  },

  updateSubscriptionStatus: async (
    id: string,
    status: 'ACTIVE' | 'CANCELLED' | 'SUSPENDED' | 'REJECTED',
    reason?: string,
    extendDays: number = 30,
  ) => {
    const res = await api.patch(`/admin/subscriptions/${id}/status`, { status, reason, extendDays });
    return res.data?.data || res.data;
  },

  listEntitlements: async (params?: Record<string, unknown>) => {
    const res = await api.get('/admin/entitlements', { params });
    return res.data?.data || res.data;
  },

  getPlatformUsage: async () => {
    const res = await api.get('/admin/usage');
    return res.data?.data || res.data;
  },

  listUsers: async (
    params?: Record<string, unknown>,
  ): Promise<{ data: AdminUserItem[]; meta: { page: number; limit: number; total: number; totalPages: number } }> => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  getUserDetails: async (id: string): Promise<AdminUserDetails> => {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  },

  resetUserPassword: async (userId: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.post(`/admin/users/${userId}/reset-password`, { newPassword, notifyUser: true });
    return res.data;
  },

  updateUserStatus: async (
    userId: string,
    status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED',
    reason?: string,
  ): Promise<AdminUserItem> => {
    const res = await api.patch(`/admin/users/${userId}/status`, { status, reason });
    return res.data;
  },
};

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'INVITED';
  isPlatformAdmin: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  activeSessionsCount: number;
  activeProjectsCount: number;
  organizations: Array<{
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    roleCode: string;
    roleName: string;
  }>;
}

export interface AdminUserDetails extends AdminUserItem {
  organizations: Array<{
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    organizationStatus: string;
    roleCode: string;
    roleName: string;
    memberStatus: string;
    joinedAt: string;
  }>;
  recentSessions: Array<{
    id: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    expiresAt: string;
  }>;
  projects: Array<{
    projectId: string;
    projectTitle: string;
    projectStatus: string;
    organizationId: string;
    role: string;
  }>;
}



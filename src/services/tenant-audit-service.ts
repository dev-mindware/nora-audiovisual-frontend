import { api } from './api';
import { InvestigativeAuditEvent } from '@/types/audit';

export interface TenantAuditLogsResponse {
  data: InvestigativeAuditEvent[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TenantAuditDetailsResponse {
  event: InvestigativeAuditEvent;
  relatedEvents: InvestigativeAuditEvent[];
}

export const tenantAuditService = {
  listAuditLogs: async (params?: Record<string, unknown>): Promise<TenantAuditLogsResponse> => {
    const res = await api.get('/audit', { params });
    const payload = res.data;
    if (payload?.data && payload?.meta) {
      return payload;
    }
    const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    return {
      data: items,
      meta: {
        page: Number(params?.page) || 1,
        limit: Number(params?.limit) || 50,
        total: items.length,
        totalPages: Math.ceil(items.length / (Number(params?.limit) || 50)) || 1,
      },
    };
  },

  getAuditLogDetails: async (id: string): Promise<TenantAuditDetailsResponse> => {
    const res = await api.get(`/audit/${id}`);
    return res.data;
  },
};

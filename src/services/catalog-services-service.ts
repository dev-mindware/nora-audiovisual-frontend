import { api } from './api';
import {
  CatalogService,
  CreateCatalogServicePayload,
  RequestPortalServicePayload,
} from '@/types';

export interface CatalogServiceFilters {
  category?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const catalogServicesService = {
  getAll: async (
    params: CatalogServiceFilters = {},
  ): Promise<{ data: CatalogService[]; total?: number; meta?: any }> => {
    const res = await api.get('/services', { params });
    const payload = res.data?.data || res.data;
    if (Array.isArray(payload)) {
      return { data: payload, total: payload.length };
    }
    return {
      data: payload.items || payload.data || [],
      total: payload.meta?.total ?? payload.total ?? (payload.items?.length || 0),
      meta: payload.meta,
    };
  },

  getById: async (id: string): Promise<CatalogService> => {
    const res = await api.get(`/services/${id}`);
    return res.data?.data || res.data;
  },

  create: async (data: CreateCatalogServicePayload): Promise<CatalogService> => {
    const res = await api.post('/services', data);
    return res.data?.data || res.data;
  },

  update: async (
    id: string,
    data: Partial<CreateCatalogServicePayload>,
  ): Promise<CatalogService> => {
    const res = await api.put(`/services/${id}`, data);
    return res.data?.data || res.data;
  },

  delete: async (id: string): Promise<CatalogService> => {
    const res = await api.delete(`/services/${id}`);
    return res.data?.data || res.data;
  },

  // Portal do Cliente
  getPortalServices: async (params?: { organizationId?: string }): Promise<CatalogService[]> => {
    const res = await api.get('/portal/services', { params });
    const payload = res.data?.data || res.data;
    return Array.isArray(payload) ? payload : payload.items || [];
  },

  requestPortalService: async (data: RequestPortalServicePayload): Promise<{
    success: boolean;
    message: string;
    projectId: string;
    budgetId: string;
    projectTitle: string;
  }> => {
    const res = await api.post('/portal/services/request', data);
    return res.data?.data || res.data;
  },
};

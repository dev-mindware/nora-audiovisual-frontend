import { api } from './api';

export interface ClientData {
  id?: string;
  name: string;
  legalName?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
}

export interface ClientFilters {
  search?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const clientsService = {
  getAll: async (params?: ClientFilters): Promise<{ data: ClientData[]; total?: number; meta?: any }> => {
    const res = await api.get('/clients', { params });
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
  getById: async (id: string) => {
    const res = await api.get(`/clients/${id}`);
    return res.data?.data || res.data;
  },
  addClient: async (data: ClientData) => {
    const res = await api.post('/clients', data);
    return res.data?.data || res.data;
  },
  updateClient: async (id: string, data: Partial<ClientData>) => {
    const res = await api.patch(`/clients/${id}`, data);
    return res.data?.data || res.data;
  },
  deleteClient: async (id: string) => {
    const res = await api.delete(`/clients/${id}`);
    return res.data;
  },
  toggleStatusClient: async (id: string) => {
    const res = await api.post(`/clients/${id}/archive`);
    return res.data?.data || res.data;
  },
  archive: async (id: string) => {
    const res = await api.post(`/clients/${id}/archive`);
    return res.data?.data || res.data;
  },
  restore: async (id: string) => {
    const res = await api.post(`/clients/${id}/restore`);
    return res.data?.data || res.data;
  },
  listContacts: async (id: string) => {
    const res = await api.get(`/clients/${id}/contacts`);
    return res.data?.data || res.data;
  },
  addContact: async (id: string, contact: { name: string; email?: string; phone?: string; role?: string }) => {
    const res = await api.post(`/clients/${id}/contacts`, contact);
    return res.data?.data || res.data;
  },
  listActivities: async (id: string) => {
    const res = await api.get(`/clients/${id}/activities`);
    return res.data?.data || res.data;
  },
  addActivity: async (id: string, activity: { type: string; title: string; description?: string }) => {
    const res = await api.post(`/clients/${id}/activities`, activity);
    return res.data?.data || res.data;
  },
};

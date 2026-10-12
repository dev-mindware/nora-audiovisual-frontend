import { api } from './api';
import { Budget, BudgetStatus, BudgetItem } from '@/types';

export interface BudgetFilters {
  status?: string;
  clientId?: string;
  projectId?: string;
  search?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateBudgetPayload {
  clientId: string;
  projectId?: string;
  discount?: number;
  estimatedTax?: number;
  validUntil?: string;
  notes?: string;
  items: Array<{
    category: string;
    description: string;
    quantity: number;
    unitCost?: number;
    unitPrice: number;
  }>;
}

export const budgetsService = {
  getAll: async (params: BudgetFilters = {}): Promise<{ data: Budget[]; total?: number; meta?: any }> => {
    const res = await api.get('/budgets', { params });
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

  getById: async (id: string): Promise<Budget> => {
    const res = await api.get(`/budgets/${id}`);
    return res.data?.data || res.data;
  },

  create: async (data: CreateBudgetPayload): Promise<Budget> => {
    const res = await api.post('/budgets', data);
    return res.data?.data || res.data;
  },

  changeStatus: async (id: string, status: BudgetStatus): Promise<Budget> => {
    const res = await api.post(`/budgets/${id}/status`, { status });
    return res.data?.data || res.data;
  },

  duplicate: async (id: string): Promise<Budget> => {
    const res = await api.post(`/budgets/${id}/duplicate`);
    return res.data?.data || res.data;
  },

  sendToClient: async (
    id: string,
  ): Promise<{
    success?: boolean;
    portalUrl?: string;
    publicPortalUrl?: string;
    emailSent?: boolean;
    recipientEmail?: string | null;
  }> => {
    const res = await api.post(`/budgets/${id}/send`);
    return res.data?.data || res.data;
  },

  downloadPdf: async (id: string, customFilename?: string): Promise<void> => {
    const res = await api.get(`/budgets/${id}/pdf/download`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = customFilename || `Orcamento_${id.slice(0, 8).toUpperCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

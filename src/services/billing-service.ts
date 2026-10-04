import { api } from './api';

export interface MindgestConfig {
  organizationId: string;
  mindgestAccountId: string | null;
  mindgestCompanyId: string | null;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastSyncAt: string | null;
  apiVersion: string;
  hasApiKey: boolean;
  hasWebhookSecret: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigureMindgestPayload {
  mindgestAccountId: string;
  mindgestCompanyId: string;
  apiKey: string;
  webhookSecret?: string;
}

export interface InvoiceRequest {
  id: string;
  organizationId: string;
  paymentId: string;
  status: 'PENDING' | 'SENT_TO_MINDGEST' | 'ISSUED' | 'FAILED' | 'CANCELLED';
  mindgestInvoiceId?: string | null;
  mindgestInvoiceNumber?: string | null;
  mindgestPdfUrl?: string | null;
  errorMessage?: string | null;
  notes?: string | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceRequestPayload {
  paymentId: string;
  notes?: string;
  dueDate?: string;
}

export const billingService = {
  getMindgestConfig: async (): Promise<MindgestConfig | null> => {
    try {
      const res = await api.get('/billing/integration/mindgest');
      return res.data?.data || res.data;
    } catch {
      return null;
    }
  },

  configureMindgest: async (payload: ConfigureMindgestPayload): Promise<MindgestConfig> => {
    const res = await api.post('/billing/integration/mindgest', payload);
    return res.data?.data || res.data;
  },

  createInvoiceRequest: async (payload: CreateInvoiceRequestPayload): Promise<InvoiceRequest> => {
    const res = await api.post('/billing/invoice-requests', payload);
    return res.data?.data || res.data;
  },

  listInvoiceRequests: async (params?: Record<string, unknown>): Promise<{ data: InvoiceRequest[]; total: number }> => {
    const res = await api.get('/billing/invoice-requests', { params });
    const payload = res.data?.data || res.data;
    return Array.isArray(payload) ? { data: payload, total: payload.length } : payload;
  },
};

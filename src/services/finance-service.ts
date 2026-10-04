import { api } from './api';
import {
  ProductionPayment,
  Expense,
  CreatePaymentDto,
  CreateExpenseDto,
  ProjectFinancialSummary,
} from '@/types';

export const financeService = {
  // --- Pagamentos e Recebimentos ---
  listPayments: async (projectId?: string): Promise<ProductionPayment[]> => {
    const res = await api.get('/finance/payments', {
      params: projectId ? { projectId } : undefined,
    });
    const payload = res.data?.data || res.data;
    return Array.isArray(payload) ? payload : [];
  },

  recordPayment: async (data: CreatePaymentDto): Promise<ProductionPayment> => {
    const res = await api.post('/finance/payments', data);
    return res.data?.data || res.data;
  },

  confirmPayment: async (paymentId: string): Promise<ProductionPayment> => {
    const res = await api.post(`/finance/payments/${paymentId}/confirm`);
    return res.data?.data || res.data;
  },

  // --- Despesas de Campo / Produção ---
  listExpenses: async (projectId?: string): Promise<Expense[]> => {
    const res = await api.get('/finance/expenses', {
      params: projectId ? { projectId } : undefined,
    });
    const payload = res.data?.data || res.data;
    return Array.isArray(payload) ? payload : [];
  },

  recordExpense: async (data: CreateExpenseDto): Promise<Expense> => {
    const res = await api.post('/finance/expenses', data);
    return res.data?.data || res.data;
  },

  approveExpense: async (expenseId: string): Promise<Expense> => {
    const res = await api.post(`/finance/expenses/${expenseId}/approve`);
    return res.data?.data || res.data;
  },

  rejectExpense: async (expenseId: string, reason?: string): Promise<Expense> => {
    const res = await api.post(`/finance/expenses/${expenseId}/reject`, { reason });
    return res.data?.data || res.data;
  },

  // --- Resumo Financeiro & Margem por Projeto ---
  getProjectSummary: async (projectId: string): Promise<ProjectFinancialSummary> => {
    const res = await api.get(`/finance/projects/${projectId}/summary`);
    return res.data?.data || res.data;
  },
};

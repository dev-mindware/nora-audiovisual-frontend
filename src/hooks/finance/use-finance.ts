import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '@/services/finance-service';
import { CreatePaymentDto, CreateExpenseDto, ProductionPayment } from '@/types';
import { SucessMessage, ErrorMessage } from '@/utils/messages';
import { getApiErrorMessage } from '@/utils';

export const FINANCE_QUERY_KEYS = {
  payments: (projectId?: string) => ['finance', 'payments', projectId || 'all'] as const,
  expenses: (projectId?: string) => ['finance', 'expenses', projectId || 'all'] as const,
  projectSummary: (projectId: string) => ['finance', 'project-summary', projectId] as const,
};

// --- Queries ---

export function usePayments(projectId?: string) {
  return useQuery({
    queryKey: FINANCE_QUERY_KEYS.payments(projectId),
    queryFn: () => financeService.listPayments(projectId),
    staleTime: 60 * 1000,
  });
}

export function useExpenses(projectId?: string) {
  return useQuery({
    queryKey: FINANCE_QUERY_KEYS.expenses(projectId),
    queryFn: () => financeService.listExpenses(projectId),
    staleTime: 60 * 1000,
  });
}

export function useProjectFinancialSummary(projectId?: string) {
  return useQuery({
    queryKey: FINANCE_QUERY_KEYS.projectSummary(projectId!),
    queryFn: () => financeService.getProjectSummary(projectId!),
    enabled: Boolean(projectId),
    staleTime: 60 * 1000,
  });
}

// --- Mutations ---

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentDto) => financeService.recordPayment(data),
    onSuccess: (payment: ProductionPayment) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'payments'] });
      if (payment.projectId) {
        queryClient.invalidateQueries({
          queryKey: FINANCE_QUERY_KEYS.projectSummary(payment.projectId),
        });
      }
      SucessMessage('Pagamento registado com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao registar pagamento.'));
    },
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => financeService.confirmPayment(paymentId),
    onSuccess: (payment: ProductionPayment) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'payments'] });
      if (payment.projectId) {
        queryClient.invalidateQueries({
          queryKey: FINANCE_QUERY_KEYS.projectSummary(payment.projectId),
        });
      }
      SucessMessage('Recebimento confirmado com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao confirmar pagamento.'));
    },
  });
}

export function useRecordExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseDto) => financeService.recordExpense(data),
    onSuccess: (expense) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] });
      if (expense.projectId) {
        queryClient.invalidateQueries({
          queryKey: FINANCE_QUERY_KEYS.projectSummary(expense.projectId),
        });
      }
      SucessMessage('Despesa de campo submetida com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao registar despesa.'));
    },
  });
}

export function useApproveExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => financeService.approveExpense(expenseId),
    onSuccess: (expense) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] });
      if (expense.projectId) {
        queryClient.invalidateQueries({
          queryKey: FINANCE_QUERY_KEYS.projectSummary(expense.projectId),
        });
      }
      SucessMessage('Despesa aprovada com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao aprovar despesa.'));
    },
  });
}

export function useRejectExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, reason }: { expenseId: string; reason?: string }) =>
      financeService.rejectExpense(expenseId, reason),
    onSuccess: (expense) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] });
      if (expense.projectId) {
        queryClient.invalidateQueries({
          queryKey: FINANCE_QUERY_KEYS.projectSummary(expense.projectId),
        });
      }
      SucessMessage('Despesa rejeitada.');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao rejeitar despesa.'));
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  budgetsService,
  CreateBudgetPayload,
  BudgetFilters,
} from '@/services/budgets-service';
import { BudgetStatus } from '@/types';
import { SucessMessage, ErrorMessage } from '@/utils/messages';
import { getApiErrorMessage } from '@/utils';

export const BUDGETS_QUERY_KEY = ['budgets'];

export function useBudgets(params?: BudgetFilters) {
  return useQuery({
    queryKey: [...BUDGETS_QUERY_KEY, params],
    queryFn: () => budgetsService.getAll(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useBudget(id?: string) {
  return useQuery({
    queryKey: [...BUDGETS_QUERY_KEY, 'detail', id],
    queryFn: () => budgetsService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBudgetPayload) => budgetsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
      SucessMessage('Orçamento comercial criado!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao criar orçamento.'));
    },
  });
}

export function useChangeBudgetStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BudgetStatus }) =>
      budgetsService.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
      SucessMessage('Estado do orçamento atualizado!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao alterar estado do orçamento.'));
    },
  });
}

export function useDuplicateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetsService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
      SucessMessage('Orçamento duplicado (Nova versão DRAFT).');
    },
  });
}

export function useSendBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetsService.sendToClient(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
      if (data?.emailSent && data?.recipientEmail) {
        SucessMessage(`Proposta e PDF enviados automaticamente por email para ${data.recipientEmail}!`);
      } else {
        SucessMessage('Proposta disponibilizada com link de aprovação no portal!');
      }
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao enviar proposta comercial.'));
    },
  });
}

export function useDownloadBudgetPdf() {
  return useMutation({
    mutationFn: ({ id, filename }: { id: string; filename?: string }) =>
      budgetsService.downloadPdf(id, filename),
    onSuccess: () => {
      SucessMessage('Download do orçamento em PDF iniciado!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Falha ao descarregar PDF do orçamento.'));
    },
  });
}

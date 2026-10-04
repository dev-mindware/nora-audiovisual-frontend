import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  billingService,
  ConfigureMindgestPayload,
  CreateInvoiceRequestPayload,
} from '@/services/billing-service';
import { SucessMessage, ErrorMessage } from '@/utils/messages';
import { getApiErrorMessage } from '@/utils';

export const MINDGEST_CONFIG_QUERY_KEY = ['billing', 'mindgest-config'];
export const INVOICE_REQUESTS_QUERY_KEY = ['billing', 'invoice-requests'];

export function useMindgestConfig() {
  return useQuery({
    queryKey: MINDGEST_CONFIG_QUERY_KEY,
    queryFn: () => billingService.getMindgestConfig(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useConfigureMindgest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConfigureMindgestPayload) =>
      billingService.configureMindgest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MINDGEST_CONFIG_QUERY_KEY });
      SucessMessage('Integração com Mindgest configurada com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(
        getApiErrorMessage(err, 'Erro ao configurar integração com o Mindgest.')
      );
    },
  });
}

export function useInvoiceRequests(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...INVOICE_REQUESTS_QUERY_KEY, params],
    queryFn: () => billingService.listInvoiceRequests(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateInvoiceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInvoiceRequestPayload) =>
      billingService.createInvoiceRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICE_REQUESTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      SucessMessage('Pedido de emissão de fatura enviado ao Mindgest!');
    },
    onError: (err) => {
      ErrorMessage(
        getApiErrorMessage(err, 'Erro ao solicitar emissão de fatura no Mindgest.')
      );
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  catalogServicesService,
  CatalogServiceFilters,
} from '@/services/catalog-services-service';
import {
  CreateCatalogServicePayload,
  RequestPortalServicePayload,
} from '@/types';
import { SucessMessage, ErrorMessage } from '@/utils/messages';
import { getApiErrorMessage } from '@/utils';
import { PROJECTS_QUERY_KEY } from '@/hooks/projects';
import { BUDGETS_QUERY_KEY } from '@/hooks/budgets';

export const SERVICES_QUERY_KEY = ['catalog-services'];
export const PORTAL_SERVICES_QUERY_KEY = ['portal-catalog-services'];

export function useServices(params?: CatalogServiceFilters) {
  return useQuery({
    queryKey: [...SERVICES_QUERY_KEY, params],
    queryFn: () => catalogServicesService.getAll(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useService(id?: string) {
  return useQuery({
    queryKey: [...SERVICES_QUERY_KEY, 'detail', id],
    queryFn: () => catalogServicesService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCatalogServicePayload) =>
      catalogServicesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
      SucessMessage('Serviço adicionado ao catálogo com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Falha ao cadastrar serviço.'));
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateCatalogServicePayload>;
    }) => catalogServicesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
      SucessMessage('Serviço atualizado com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Falha ao atualizar serviço.'));
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => catalogServicesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
      SucessMessage('Serviço desativado do catálogo.');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Falha ao desativar serviço.'));
    },
  });
}

// Hooks para o Portal do Cliente
export function usePortalServices(params?: { organizationId?: string }) {
  return useQuery({
    queryKey: [...PORTAL_SERVICES_QUERY_KEY, params],
    queryFn: () => catalogServicesService.getPortalServices(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useRequestPortalService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RequestPortalServicePayload) =>
      catalogServicesService.requestPortalService(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['portal'] });
      SucessMessage(res.message || 'Solicitação enviada com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(
        getApiErrorMessage(err, 'Falha ao submeter solicitação de serviço.'),
      );
    },
  });
}

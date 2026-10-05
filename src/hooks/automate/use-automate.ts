import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { automateService, CreateWorkflowPayload } from '@/services/automate-service';
import { SucessMessage, ErrorMessage } from '@/utils/messages';
import { getApiErrorMessage } from '@/utils';

export const AUTOMATE_QUERY_KEY = ['automate'];

export function useWorkflows() {
  return useQuery({
    queryKey: [...AUTOMATE_QUERY_KEY, 'workflows'],
    queryFn: () => automateService.listWorkflows(),
    staleTime: 60 * 1000,
  });
}

export function useWorkflowExecutions() {
  return useQuery({
    queryKey: [...AUTOMATE_QUERY_KEY, 'executions'],
    queryFn: () => automateService.listExecutions(),
    refetchInterval: 30 * 1000,
  });
}

export function useAutomationRoles() {
  return useQuery({
    queryKey: [...AUTOMATE_QUERY_KEY, 'roles'],
    queryFn: () => automateService.listRoles(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkflowPayload) => automateService.createWorkflow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTOMATE_QUERY_KEY });
      SucessMessage('Fluxo de automação criado com sucesso!');
    },
    onError: (err) => ErrorMessage(getApiErrorMessage(err, 'Erro ao criar fluxo de automação.')),
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => automateService.deleteWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTOMATE_QUERY_KEY });
      SucessMessage('Fluxo removido.');
    },
    onError: (err) => ErrorMessage(getApiErrorMessage(err, 'Erro ao remover fluxo.')),
  });
}

export function useToggleWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => automateService.setActive(id, active),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: AUTOMATE_QUERY_KEY });
      SucessMessage(vars.active ? 'Fluxo activado.' : 'Fluxo desactivado.');
    },
    onError: (err) => ErrorMessage(getApiErrorMessage(err, 'Erro ao alterar o estado do fluxo.')),
  });
}

/** Simulação (dry-run): não executa acções nem consome quota. */
export function useTestWorkflow() {
  return useMutation({
    mutationFn: (id: string) => automateService.testWorkflow(id),
    onError: (err) => ErrorMessage(getApiErrorMessage(err, 'Erro ao simular o fluxo.')),
  });
}

/** Execução real: o resultado (SUCCESS/PARTIAL/FAILED) vem da API, nunca é assumido. */
export function useExecuteWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => automateService.executeWorkflow(id),
    onSuccess: (execution) => {
      queryClient.invalidateQueries({ queryKey: [...AUTOMATE_QUERY_KEY, 'executions'] });
      if (execution?.status === 'SUCCESS') SucessMessage('Fluxo executado com sucesso.');
      else ErrorMessage(`Execução terminou como ${execution?.status}: ${execution?.error ?? 'ver histórico'}`);
    },
    onError: (err) => ErrorMessage(getApiErrorMessage(err, 'Erro ao executar o fluxo (verifique a quota mensal).')),
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantStore } from '@/stores/tenant';
import {
  kanbanSettingsService,
  CreateKanbanColumnPayload,
  UpdateKanbanColumnPayload,
  UpdateCardPropertiesPayload,
} from '@/services/kanban-settings-service';
import { OrganizationKanbanData } from '@/types';
import { toast } from 'sonner';

export const KANBAN_SETTINGS_QUERY_KEY = (orgId: string) => ['organization-kanban-settings', orgId] as const;

export function useOrganizationKanbanSettings() {
  const queryClient = useQueryClient();
  const activeOrganization = useTenantStore((s) => s.activeOrganization);
  const organizationId = activeOrganization?.id || '';

  const queryKey = KANBAN_SETTINGS_QUERY_KEY(organizationId);

  const query = useQuery<OrganizationKanbanData>({
    queryKey,
    queryFn: () => kanbanSettingsService.getSettings(organizationId),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const createColumnMutation = useMutation({
    mutationFn: (payload: CreateKanbanColumnPayload) =>
      kanbanSettingsService.createColumn(organizationId, payload),
    onSuccess: (newCol) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(`Coluna "${newCol.name}" criada com sucesso.`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Falha ao criar coluna.';
      toast.error(msg);
    },
  });

  const updateColumnMutation = useMutation({
    mutationFn: ({ columnId, payload }: { columnId: string; payload: UpdateKanbanColumnPayload }) =>
      kanbanSettingsService.updateColumn(organizationId, columnId, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(`Coluna "${updated.name}" atualizada.`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Falha ao atualizar coluna.';
      toast.error(msg);
    },
  });

  const reorderColumnsMutation = useMutation({
    mutationFn: (columnIds: string[]) =>
      kanbanSettingsService.reorderColumns(organizationId, columnIds),
    onMutate: async (newColumnIds) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<OrganizationKanbanData>(queryKey);

      if (previous) {
        const idToCol = new Map(previous.columns.map((c) => [c.id, c]));
        const reordered = newColumnIds
          .map((id, idx) => {
            const col = idToCol.get(id);
            return col ? { ...col, position: idx } : null;
          })
          .filter(Boolean) as typeof previous.columns;

        queryClient.setQueryData<OrganizationKanbanData>(queryKey, {
          ...previous,
          columns: reordered,
        });
      }

      return { previous };
    },
    onError: (err: any, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error('Erro ao reordenar colunas.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const archiveColumnMutation = useMutation({
    mutationFn: ({ columnId, targetColumnId }: { columnId: string; targetColumnId?: string }) =>
      kanbanSettingsService.archiveColumn(organizationId, columnId, targetColumnId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey });
      if (res.tasksMigrated > 0) {
        toast.success(`Coluna arquivada e ${res.tasksMigrated} tarefas migradas.`);
      } else {
        toast.success('Coluna arquivada com sucesso.');
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Falha ao arquivar coluna.';
      toast.error(msg);
    },
  });

  const updateCardPropertiesMutation = useMutation({
    mutationFn: (payload: UpdateCardPropertiesPayload) =>
      kanbanSettingsService.updateCardProperties(organizationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Preferências de exibição salvas.');
    },
    onError: (err: any) => {
      if (err.response?.status === 409) {
        toast.error('As configurações foram alteradas por outro utilizador. A recarregar dados...');
        queryClient.invalidateQueries({ queryKey });
      } else {
        const msg = err.response?.data?.message || 'Erro ao atualizar preferências do cartão.';
        toast.error(msg);
      }
    },
  });

  const resetToDefaultMutation = useMutation({
    mutationFn: () => kanbanSettingsService.resetToDefault(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Fluxo padrão audiovisual restaurado com sucesso.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erro ao restaurar fluxo padrão.';
      toast.error(msg);
    },
  });

  return {
    organizationId,
    data: query.data,
    settings: query.data?.settings,
    columns: query.data?.columns || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createColumn: createColumnMutation.mutateAsync,
    isCreating: createColumnMutation.isPending,
    updateColumn: updateColumnMutation.mutateAsync,
    isUpdating: updateColumnMutation.isPending,
    reorderColumns: reorderColumnsMutation.mutateAsync,
    isReordering: reorderColumnsMutation.isPending,
    archiveColumn: archiveColumnMutation.mutateAsync,
    isArchiving: archiveColumnMutation.isPending,
    updateCardProperties: updateCardPropertiesMutation.mutateAsync,
    isUpdatingCardProperties: updateCardPropertiesMutation.isPending,
    resetToDefault: resetToDefaultMutation.mutateAsync,
    isResetting: resetToDefaultMutation.isPending,
  };
}

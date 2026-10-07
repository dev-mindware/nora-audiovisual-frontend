import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deliverableTypesService,
  DeliverableTypeItem,
} from '@/services/deliverable-types-service';

export const DELIVERABLE_TYPES_QUERY_KEY = ['deliverable-types'];

export function useDeliverableTypes() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: DELIVERABLE_TYPES_QUERY_KEY,
    queryFn: () => deliverableTypesService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<DeliverableTypeItem, 'id' | 'createdAt' | 'isDefault'>) =>
      Promise.resolve(deliverableTypesService.create(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DELIVERABLE_TYPES_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<DeliverableTypeItem, 'id' | 'createdAt' | 'isDefault'>>;
    }) => Promise.resolve(deliverableTypesService.update(id, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DELIVERABLE_TYPES_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => Promise.resolve(deliverableTypesService.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DELIVERABLE_TYPES_QUERY_KEY });
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => Promise.resolve(deliverableTypesService.resetDefaults()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DELIVERABLE_TYPES_QUERY_KEY });
    },
  });

  return {
    types: query.data || [],
    isLoading: query.isLoading,
    createType: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateType: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteType: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    resetDefaults: resetMutation.mutateAsync,
    isResetting: resetMutation.isPending,
  };
}

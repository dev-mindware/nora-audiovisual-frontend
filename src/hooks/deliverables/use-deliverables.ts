import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deliverablesService,
  CreateDeliverablePayload,
  DeliverableFilters,
} from '@/services/deliverables-service';
import { SucessMessage, ErrorMessage } from '@/utils/messages';
import { getApiErrorMessage } from '@/utils';

export const DELIVERABLES_QUERY_KEY = ['deliverables'];

export function useDeliverablesList(filters: DeliverableFilters = {}) {
  return useQuery({
    queryKey: [...DELIVERABLES_QUERY_KEY, 'list', filters],
    queryFn: () => deliverablesService.listAll(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useProjectDeliverables(projectId?: string) {
  return useQuery({
    queryKey: [...DELIVERABLES_QUERY_KEY, 'project', projectId],
    queryFn: () => deliverablesService.listByProject(projectId!),
    enabled: Boolean(projectId),
  });
}

export function useVideoReview(reviewId?: string) {
  return useQuery({
    queryKey: [...DELIVERABLES_QUERY_KEY, 'review', reviewId],
    queryFn: () => deliverablesService.getVideoReview(reviewId!),
    enabled: Boolean(reviewId),
  });
}

export function useCreateDeliverable(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDeliverablePayload) =>
      deliverablesService.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DELIVERABLES_QUERY_KEY, 'project', projectId] });
      SucessMessage('Entregável criado com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao criar entregável.'));
    },
  });
}

export function usePublishDeliverable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deliverableId, options }: { deliverableId: string; options: { password?: string; expiresInDays?: number } }) =>
      deliverablesService.publish(deliverableId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DELIVERABLES_QUERY_KEY });
      SucessMessage('Entregável publicado com link seguro de aprovação!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao publicar entregável.'));
    },
  });
}

export function useAddReviewComment(reviewId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string; timecodeSeconds: number; authorName?: string }) =>
      deliverablesService.addReviewComment(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DELIVERABLES_QUERY_KEY, 'review', reviewId] });
      SucessMessage('Comentário com timecode adicionado!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao adicionar comentário no vídeo.'));
    },
  });
}

export function useResolveReviewComment(reviewId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deliverablesService.resolveComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DELIVERABLES_QUERY_KEY, 'review', reviewId] });
      SucessMessage('Nota técnica marcada como resolvida.');
    },
  });
}

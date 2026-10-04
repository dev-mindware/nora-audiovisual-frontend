import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService, ChatMessagePayload, AiActionPreviewPayload } from '@/services/ai-service';
import { SucessMessage, ErrorMessage } from '@/utils/messages';
import { getApiErrorMessage } from '@/utils';

export const AI_QUERY_KEY = ['ai'];

export function useAiBalance() {
  return useQuery({
    queryKey: [...AI_QUERY_KEY, 'balance'],
    queryFn: () => aiService.getBalance(),
    staleTime: 60 * 1000,
  });
}

export function useSendAiMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChatMessagePayload) => aiService.sendMessage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...AI_QUERY_KEY, 'balance'] });
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao comunicar com a Nora AI.'));
    },
  });
}

export function usePreviewAiAction() {
  return useMutation({
    mutationFn: (payload: AiActionPreviewPayload) => aiService.previewAction(payload),
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao processar estimativa da IA.'));
    },
  });
}

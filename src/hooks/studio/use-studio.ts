import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  studioService,
  CreateStudioBookingPayload,
  CreateStudioResourcePayload,
} from '@/services/studio-service';
import { SucessMessage, ErrorMessage } from '@/utils/messages';
import { getApiErrorMessage } from '@/utils';

export const STUDIO_QUERY_KEY = ['studio'];

export function useStudioResources() {
  return useQuery({
    queryKey: [...STUDIO_QUERY_KEY, 'resources'],
    queryFn: () => studioService.getResources(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudioBookings(params?: { resourceId?: string; status?: string } | string) {
  return useQuery({
    queryKey: [...STUDIO_QUERY_KEY, 'bookings', params],
    queryFn: () => studioService.getBookings(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateStudioBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStudioBookingPayload) => studioService.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...STUDIO_QUERY_KEY, 'bookings'] });
      SucessMessage('Reserva de estúdio efetuada com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao reservar espaço ou sobreposição de horários.'));
    },
  });
}

export function useCreateStudioResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStudioResourcePayload) => studioService.createResource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...STUDIO_QUERY_KEY, 'resources'] });
      SucessMessage('Espaço / Set cadastrado com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao cadastrar espaço de estúdio.'));
    },
  });
}

export function useUpdateStudioResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateStudioResourcePayload> }) =>
      studioService.updateResource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...STUDIO_QUERY_KEY, 'resources'] });
      SucessMessage('Espaço / Set actualizado com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao actualizar espaço de estúdio.'));
    },
  });
}

export function useDeleteStudioResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studioService.deleteResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...STUDIO_QUERY_KEY, 'resources'] });
      SucessMessage('Espaço / Set eliminado com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao eliminar espaço de estúdio.'));
    },
  });
}

export function useCancelStudioBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studioService.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...STUDIO_QUERY_KEY, 'bookings'] });
      SucessMessage('Marcação cancelada.');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao cancelar marcação.'));
    },
  });
}

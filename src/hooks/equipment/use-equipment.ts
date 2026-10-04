import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  equipmentService,
  EquipmentFilters,
  CreateEquipmentPayload,
} from '@/services/equipment-service';
import { SucessMessage, ErrorMessage } from '@/utils/messages';
import { getApiErrorMessage } from '@/utils';

export const EQUIPMENT_QUERY_KEY = ['equipment'];

export function useEquipmentList(filters: EquipmentFilters = {}) {
  return useQuery({
    queryKey: [...EQUIPMENT_QUERY_KEY, filters],
    queryFn: () => equipmentService.getAll(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useEquipmentDetail(id?: string) {
  return useQuery({
    queryKey: [...EQUIPMENT_QUERY_KEY, 'detail', id],
    queryFn: () => equipmentService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useEquipmentReservations(equipmentId?: string) {
  return useQuery({
    queryKey: [...EQUIPMENT_QUERY_KEY, 'reservations', equipmentId],
    queryFn: () => equipmentService.listReservations(equipmentId),
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEquipmentPayload) => equipmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_QUERY_KEY });
      SucessMessage('Equipamento cadastrado com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao cadastrar equipamento.'));
    },
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { equipmentId: string; projectId?: string; startDate: string; endDate: string }) =>
      equipmentService.createReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_QUERY_KEY });
      SucessMessage('Reserva de equipamento efetuada!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Conflito de agenda ou erro na reserva.'));
    },
  });
}

export function useCheckoutEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reservationId,
      initialCondition,
      notes,
    }: {
      reservationId: string;
      initialCondition?: string;
      notes?: string;
    }) => equipmentService.checkout(reservationId, { initialCondition, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_QUERY_KEY });
      SucessMessage('Check-out técnico realizado (Equipamento em uso).');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao realizar check-out.'));
    },
  });
}

export function useCheckinEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reservationId,
      returnCondition,
      damageNotes,
      notes,
    }: {
      reservationId: string;
      returnCondition?: string;
      damageNotes?: string;
      notes?: string;
    }) => equipmentService.checkin(reservationId, { returnCondition, damageNotes, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_QUERY_KEY });
      SucessMessage('Check-in concluído. Equipamento inspecionado e disponível.');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Erro ao realizar check-in.'));
    },
  });
}


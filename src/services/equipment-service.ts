import { api } from './api';
import { Equipment, EquipmentReservation, EquipmentCategory, EquipmentStatus } from '@/types';

export interface EquipmentFilters {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateEquipmentPayload {
  name: string;
  category: EquipmentCategory;
  code?: string;
  serialNumber?: string;
  ownershipType?: 'OWNED' | 'RENTED';
  status?: EquipmentStatus;
  condition?: string;
  location?: string;
  dailyRate?: number;
}

export const equipmentService = {
  getAll: async (params: EquipmentFilters = {}): Promise<{ data: Equipment[]; total?: number; meta?: any }> => {
    const res = await api.get('/equipment', { params });
    const payload = res.data?.data || res.data;
    if (Array.isArray(payload)) {
      return { data: payload, total: payload.length };
    }
    return {
      data: payload.items || payload.data || [],
      total: payload.meta?.total ?? payload.total ?? (payload.items?.length || 0),
      meta: payload.meta,
    };
  },

  getById: async (id: string): Promise<Equipment> => {
    const res = await api.get(`/equipment/${id}`);
    return res.data?.data || res.data;
  },

  create: async (data: CreateEquipmentPayload): Promise<Equipment> => {
    const res = await api.post('/equipment', data);
    return res.data?.data || res.data;
  },

  update: async (id: string, data: Partial<CreateEquipmentPayload>): Promise<Equipment> => {
    const res = await api.patch(`/equipment/${id}`, data);
    return res.data?.data || res.data;
  },

  listReservations: async (equipmentId?: string): Promise<EquipmentReservation[]> => {
    try {
      const res = await api.get('/equipment/reservations', { params: { equipmentId } });
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  createReservation: async (data: {
    equipmentId: string;
    projectId?: string;
    startDate?: string;
    endDate?: string;
    startsAt?: string;
    endsAt?: string;
    notes?: string;
  }): Promise<EquipmentReservation> => {
    const payload = {
      equipmentId: data.equipmentId,
      projectId: data.projectId,
      startsAt: data.startsAt || data.startDate,
      endsAt: data.endsAt || data.endDate,
      notes: data.notes,
    };
    const res = await api.post('/equipment/reservations', payload);
    return res.data?.data || res.data;
  },


  checkout: async (
    reservationId: string,
    payload?: { initialCondition?: string; notes?: string }
  ): Promise<{ success: boolean }> => {
    const res = await api.post(`/equipment/reservations/${reservationId}/checkout`, payload || {});
    return res.data;
  },

  checkin: async (
    reservationId: string,
    payload?: { returnCondition?: string; damageNotes?: string; notes?: string }
  ): Promise<{ success: boolean }> => {
    const res = await api.post(`/equipment/reservations/${reservationId}/checkin`, payload || {});
    return res.data;
  },
};


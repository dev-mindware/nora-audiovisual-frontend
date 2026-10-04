import { api } from './api';
import { StudioResource, StudioBooking, StudioResourceType } from '@/types';

export interface CreateStudioBookingPayload {
  resourceId: string;
  projectId?: string;
  clientId?: string;
  startTime: string;
  endTime: string;
}

export interface CreateStudioResourcePayload {
  name: string;
  type: StudioResourceType;
  hourlyRate?: number;
  dailyRate?: number;
  capacity?: number;
  description?: string;
}

export const studioService = {
  getResources: async (): Promise<StudioResource[]> => {
    try {
      const res = await api.get('/studio/resources');
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  createResource: async (data: CreateStudioResourcePayload): Promise<StudioResource> => {
    const res = await api.post('/studio/resources', data);
    return res.data?.data || res.data;
  },

  getBookings: async (params?: { resourceId?: string; status?: string } | string): Promise<StudioBooking[]> => {
    try {
      const queryParams = typeof params === 'string' ? { resourceId: params } : params;
      const res = await api.get('/studio/bookings', { params: queryParams });
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  createBooking: async (data: CreateStudioBookingPayload): Promise<StudioBooking> => {
    const res = await api.post('/studio/bookings', data);
    return res.data?.data || res.data;
  },

  cancelBooking: async (id: string): Promise<{ success: boolean }> => {
    const res = await api.post(`/studio/bookings/${id}/cancel`);
    return res.data;
  },
};

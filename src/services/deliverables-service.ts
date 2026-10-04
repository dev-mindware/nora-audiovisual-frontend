import { api } from './api';
import { Deliverable, VideoReview, ReviewComment, DeliverableType } from '@/types';

export interface DeliverableFilters {
  projectId?: string;
  status?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateDeliverablePayload {
  title: string;
  type?: DeliverableType;
  version?: number;
  notes?: string;
  assetIds?: string[];
  includedPhotosCount?: number;
  extraPhotoPrice?: number;
  allowExtraPurchase?: boolean;
}

export interface CreateReviewCommentPayload {
  reviewId: string;
  authorName: string;
  timecodeSeconds: number;
  content: string;
}

export const deliverablesService = {
  listAll: async (params: DeliverableFilters = {}): Promise<{ data: Deliverable[]; total?: number; meta?: any }> => {
    try {
      const res = await api.get('/deliverables', { params });
      const payload = res.data?.data || res.data;
      if (Array.isArray(payload)) {
        return { data: payload, total: payload.length };
      }
      return {
        data: payload.items || payload.data || [],
        total: payload.meta?.total ?? payload.total ?? (payload.items?.length || 0),
        meta: payload.meta,
      };
    } catch {
      return { data: [], total: 0 };
    }
  },

  listByProject: async (projectId: string): Promise<Deliverable[]> => {
    try {
      const res = await api.get(`/projects/${projectId}/deliverables`);
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  create: async (projectId: string, data: CreateDeliverablePayload): Promise<Deliverable> => {
    const res = await api.post(`/projects/${projectId}/deliverables`, data);
    return res.data?.data || res.data;
  },

  publish: async (deliverableId: string, options: { password?: string; expiresInDays?: number }): Promise<Deliverable> => {
    const res = await api.post(`/deliverables/${deliverableId}/publish`, options);
    return res.data?.data || res.data;
  },

  getVideoReview: async (reviewId: string): Promise<VideoReview> => {
    const res = await api.get(`/reviews/${reviewId}`);
    return res.data?.data || res.data;
  },

  addReviewComment: async (
    reviewId: string,
    data: { content: string; timecodeSeconds: number; authorName?: string }
  ): Promise<ReviewComment> => {
    const res = await api.post(`/reviews/${reviewId}/comments`, data);
    return res.data?.data || res.data;
  },

  resolveComment: async (commentId: string): Promise<{ success: boolean }> => {
    const res = await api.patch(`/reviews/comments/${commentId}/resolve`);
    return res.data;
  },
};

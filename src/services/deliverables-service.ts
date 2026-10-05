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

function formatTimecode(seconds: number): string {
  const total = Math.max(0, seconds || 0);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = (total % 60).toFixed(2).padStart(5, "0");
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec}`;
}

// A API devolve `text`/`status`; a UI trabalha com `content`/`resolved`.
function mapReviewComment(c: any): ReviewComment {
  return {
    id: c.id,
    reviewId: c.reviewId,
    authorName: c.authorName ?? c.author?.name ?? "",
    authorRole: c.authorRole,
    timecodeSeconds: c.timecodeSeconds,
    timecodeFormatted: c.timecodeFormatted ?? formatTimecode(c.timecodeSeconds),
    content: c.content ?? c.text ?? "",
    resolved: c.resolved ?? c.status === "RESOLVED",
    createdAt: c.createdAt,
  };
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
    // A API expõe os comentários da revisão em /reviews/video/:id/comments.
    const res = await api.get(`/reviews/video/${reviewId}/comments`);
    const raw = res.data?.data || res.data;
    const comments: ReviewComment[] = (Array.isArray(raw) ? raw : []).map(mapReviewComment);
    return { id: reviewId, comments } as VideoReview;
  },

  addReviewComment: async (
    reviewId: string,
    data: { content: string; timecodeSeconds: number; authorName?: string }
  ): Promise<ReviewComment> => {
    const res = await api.post(`/reviews/video/${reviewId}/comments`, {
      text: data.content,
      timecodeSeconds: data.timecodeSeconds,
    });
    return mapReviewComment(res.data?.data || res.data);
  },

  resolveComment: async (commentId: string): Promise<{ success: boolean }> => {
    const res = await api.patch(`/reviews/comments/${commentId}/resolve`);
    return res.data;
  },
};

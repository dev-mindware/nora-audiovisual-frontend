import { api } from './api';

export interface FileAsset {
  id: string;
  organizationId: string;
  projectId?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: 'SCRIPT' | 'AUDIO' | 'VIDEO_PROXY' | 'RAW' | 'DELIVERABLE' | 'DOCUMENT';
  url: string;
  createdAt: string;
  uploader?: {
    id: string;
    name: string;
  };
}

export interface PresignUploadDto {
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: string;
  projectId?: string;
}

export interface FileFilters {
  projectId?: string;
  fileType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const filesService = {
  presignUpload: async (dto: PresignUploadDto) => {
    const res = await api.post('/files/presign', dto);
    return res.data?.data || res.data;
  },

  completeUpload: async (dto: { fileAssetId: string }) => {
    const res = await api.post('/files/complete', dto);
    return res.data?.data || res.data;
  },

  getFile: async (id: string): Promise<FileAsset> => {
    const res = await api.get(`/files/${id}`);
    return res.data?.data || res.data;
  },

  deleteFile: async (id: string) => {
    const res = await api.delete(`/files/${id}`);
    return res.data;
  },

  listProjectFiles: async (projectId: string, params?: Record<string, unknown>): Promise<FileAsset[]> => {
    try {
      const res = await api.get(`/projects/${projectId}/files`, { params });
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : data?.files || data?.items || [];
    } catch {
      return [];
    }
  },

  listAllFiles: async (params?: FileFilters): Promise<{ data: FileAsset[]; total?: number; meta?: any }> => {
    try {
      const res = await api.get('/files', { params });
      const payload = res.data?.data || res.data;
      if (Array.isArray(payload)) {
        return { data: payload, total: payload.length };
      }
      return {
        data: payload.items || payload.data || payload.files || [],
        total: payload.meta?.total ?? payload.pagination?.total ?? (payload.items?.length || 0),
        meta: payload.meta || payload.pagination,
      };
    } catch {
      return {
        data: [],
        total: 0,
      };
    }
  },
};

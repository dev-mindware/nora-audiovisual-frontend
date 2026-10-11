import { api } from './api';
import {
  Category,
  CategoryScope,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/types';

export const categoriesService = {
  list: async (type?: CategoryScope, search?: string): Promise<Category[]> => {
    const params: Record<string, string> = {};
    if (type) params.type = type;
    if (search) params.search = search;
    const res = await api.get<Category[]>('/categories', { params });
    return res.data;
  },

  create: async (data: CreateCategoryPayload): Promise<Category> => {
    const res = await api.post<Category>('/categories', data);
    return res.data;
  },

  update: async (id: string, data: UpdateCategoryPayload): Promise<Category> => {
    const res = await api.patch<Category>(`/categories/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

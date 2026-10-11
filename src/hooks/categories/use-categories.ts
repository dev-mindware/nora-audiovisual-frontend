import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '@/services/categories-service';
import {
  CategoryScope,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/types';
import { toast } from 'sonner';

export const CATEGORIES_KEY = ['categories'];

export function useCategories(type?: CategoryScope, search?: string) {
  return useQuery({
    queryKey: [...CATEGORIES_KEY, type, search],
    queryFn: () => categoriesService.list(type, search),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryPayload) => categoriesService.create(data),
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success(`Categoria "${newCategory.name}" criada com sucesso!`);
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || 'Erro ao criar categoria personalizada.'
      );
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryPayload }) =>
      categoriesService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success(`Categoria "${updated.name}" atualizada!`);
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || 'Erro ao atualizar categoria.'
      );
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success('Categoria eliminada com sucesso!');
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || 'Erro ao eliminar categoria.'
      );
    },
  });
}

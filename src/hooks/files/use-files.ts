import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesService, FileAsset, PresignUploadDto, FileFilters } from '@/services/files-service';
import { toast } from 'sonner';

export function useFiles(filtersOrProjectId?: string | FileFilters) {
  const queryClient = useQueryClient();

  const isString = typeof filtersOrProjectId === 'string';
  const projectId = isString ? filtersOrProjectId : filtersOrProjectId?.projectId;
  const filters: FileFilters = isString ? { projectId } : (filtersOrProjectId || {});

  const filesQuery = useQuery({
    queryKey: ['files', filters],
    queryFn: async () => {
      if (projectId && isString) {
        return filesService.listProjectFiles(projectId);
      }
      const res = await filesService.listAllFiles(filters);
      return res.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, category }: { file: File; category: string }) => {
      // 1. Presign
      const presign = await filesService.presignUpload({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        category,
        projectId,
      });

      // 2. Upload to storage if uploadUrl exists
      if (presign?.uploadUrl) {
        await fetch(presign.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        });
      }

      // 3. Complete
      if (presign?.fileAssetId) {
        await filesService.completeUpload({ fileAssetId: presign.fileAssetId });
      }

      return presign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Ficheiro carregado com sucesso!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Falha no upload do ficheiro');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => filesService.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Ficheiro eliminado do armazenamento.');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Falha ao eliminar ficheiro');
    },
  });

  return {
    files: filesQuery.data || [],
    isLoading: filesQuery.isLoading,
    uploadFile: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    deleteFile: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

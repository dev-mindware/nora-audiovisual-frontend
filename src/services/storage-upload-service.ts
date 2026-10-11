import { api } from './api';
import axios from 'axios';

export interface PresignResponse {
  sessionId: string;
  uploadUrl: string;
  objectKey: string;
  expiresAt: string;
  headers?: Record<string, string>;
}

export interface UploadedAsset {
  id: string;
  name: string;
  fileType: 'VIDEO' | 'PHOTO' | 'AUDIO' | 'DOCUMENT';
  mimeType: string;
  sizeBytes: number;
  url?: string;
}

export const storageUploadService = {
  /**
   * Realiza o fluxo completo de carregamento direto no Cloudflare R2:
   * 1. Presign upload URL na API
   * 2. PUT binário diretamente no R2 com cálculo de progresso
   * 3. Complete upload na API, gerando e retornando o FileAsset
   */
  uploadFile: async (
    file: File,
    projectId?: string,
    onProgress?: (progressPercent: number) => void,
  ): Promise<UploadedAsset> => {
    // 1. Presign
    const presignRes = await api.post<PresignResponse>('/files/presign', {
      filename: file.name,
      sizeBytes: file.size,
      contentType: file.type || 'application/octet-stream',
      projectId: projectId || undefined,
    });

    const { sessionId, uploadUrl, headers = {} } = presignRes.data;

    // 2. PUT direto no Cloudflare R2 (sem passar o binário pesado pelo servidor NestJS)
    const uploadHeaders: Record<string, string> = {
      'Content-Type': file.type || 'application/octet-stream',
      ...headers,
    };

    await axios.put(uploadUrl, file, {
      headers: uploadHeaders,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    // 3. Confirmar conclusão
    const completeRes = await api.post<{ asset: UploadedAsset } | UploadedAsset>('/files/complete', {
      sessionId,
    });

    const data = completeRes.data as any;
    return data.asset || data;
  },
};

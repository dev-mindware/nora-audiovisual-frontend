export const resetAccessTokenCache = () => {
  // Invalidate any local auth token cache
};

import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useTenantStore } from '@/stores/tenant';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api';

export const api = axios.create({
  baseURL,
  withCredentials: true, // Importante: Fastify session cookies (__Host-nora_session)
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercetor de Request: Injeção de tenant ativo e headers operacionais
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Injeta x-organization-id se estiver selecionada na store
    const activeOrg = useTenantStore.getState().activeOrganization;
    if (activeOrg?.id) {
      config.headers.set('x-organization-id', activeOrg.id);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercetor de Response: Normalização de erros e tratamento de sessão
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const errorData = (error.response?.data as any);
    const errorCode = errorData?.code || errorData?.error?.code;

    // 401 Não Autorizado ou códigos explícitos de sessão expirada em rotas autenticadas
    const isSessionExpired =
      status === 401 ||
      errorCode === 'UNAUTHENTICATED' ||
      errorCode === 'SESSION_EXPIRED' ||
      errorCode === 'AUTHENTICATION_REQUIRED';

    if (isSessionExpired && !url.includes('/auth/login') && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('session:expired', { detail: { code: errorCode } }));

      const isAuthPage =
        window.location.pathname.startsWith('/auth') ||
        window.location.pathname.startsWith('/login');

      if (!isAuthPage) {
        window.location.href = '/login?expired=1';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

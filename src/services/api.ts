export const resetAccessTokenCache = () => {
  // Invalidate any local auth token cache
};

import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useTenantStore } from '@/stores/tenant';
import { API_URL } from '@/lib/api-url';

const baseURL = API_URL;

export const api = axios.create({
  baseURL,
  withCredentials: true, // Importante: Fastify session cookies (__Host-nora_session)
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercetor de Request: Injeção de tenant ativo, autenticação e headers operacionais
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Evita prefixo duplicado /api/api/... caso o chamador passe /api/... com baseURL já terminando em /api
    if (config.url && config.url.startsWith('/api/') && baseURL.endsWith('/api')) {
      config.url = config.url.replace(/^\/api/, '');
    }

    // Injeta x-organization-id se estiver selecionada na store
    const activeOrg = useTenantStore.getState().activeOrganization;
    if (activeOrg?.id) {
      config.headers.set('x-organization-id', activeOrg.id);
    }

    // Injeta token de autenticação (Bearer + x-session-token) para suportar CORS cross-origin
    if (typeof window !== 'undefined') {
      let token = localStorage.getItem('nora_token');
      if (!token || token === 'session_valid') {
        const match = document.cookie.match(/(?:^|;\s*)(?:nora_token|access_token)=([^;]+)/);
        token = match ? decodeURIComponent(match[1]) : null;
      }
      if (token && token !== 'session_valid') {
        config.headers.set('Authorization', `Bearer ${token}`);
        config.headers.set('x-session-token', token);
      }
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
      // Limpa credencial local imediatamente para evitar repetição em cascata
      localStorage.removeItem('nora_token');
      window.dispatchEvent(new CustomEvent('session:expired', { detail: { code: errorCode } }));

      const isAuthPage =
        window.location.pathname.startsWith('/auth') ||
        window.location.pathname.startsWith('/login');

      if (!isAuthPage) {
        window.location.href = '/auth/login?expired=1';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

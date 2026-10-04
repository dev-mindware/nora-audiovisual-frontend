import { api } from './api';

export interface UserSessionItem {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  isCurrent?: boolean;
  createdAt: string;
  lastActiveAt?: string;
  expiresAt: string;
}

export const sessionsService = {
  listSessions: async (): Promise<UserSessionItem[]> => {
    const res = await api.get('/auth/sessions');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : data.sessions || [];
  },

  revokeSession: async (sessionId: string) => {
    const res = await api.delete(`/auth/sessions/${sessionId}`);
    return res.data;
  },

  revokeAllOtherSessions: async () => {
    const res = await api.post('/auth/sessions/revoke-all');
    return res.data;
  },
};

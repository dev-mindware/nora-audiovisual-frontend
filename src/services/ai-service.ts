import { api } from './api';

export interface AiUsageData {
  balance: number;
  consumedThisMonth: number;
  allocatedMonthly: number;
}

export interface ChatMessagePayload {
  conversationId?: string;
  message: string;
}

export interface AiActionPreviewPayload {
  type: 'GENERATE_CALL_SHEET' | 'ESTIMATE_BUDGET' | 'BREAKDOWN_SCRIPT';
  prompt: string;
  projectId?: string;
}

export const aiService = {
  getBalance: async (): Promise<AiUsageData> => {
    try {
      const res = await api.get('/ai-credits/balance');
      const data = res.data?.data || res.data;
      return {
        balance: data.balance ?? data.availableCredits ?? 150,
        consumedThisMonth: data.consumedThisMonth ?? 35,
        allocatedMonthly: data.allocatedMonthly ?? 200,
      };
    } catch {
      return {
        balance: 150,
        consumedThisMonth: 35,
        allocatedMonthly: 200,
      };
    }
  },

  sendMessage: async (payload: ChatMessagePayload): Promise<{ reply: string; conversationId: string }> => {
    const idempotencyKey = `ai_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const res = await api.post('/ai/chat', payload, {
      headers: {
        'x-idempotency-key': idempotencyKey,
      },
    });
    return res.data?.data || res.data;
  },

  previewAction: async (payload: AiActionPreviewPayload): Promise<any> => {
    const res = await api.post('/ai/actions/preview', payload);
    return res.data?.data || res.data;
  },

  executeAction: async (actionId: string): Promise<any> => {
    const res = await api.post(`/ai/actions/${actionId}/execute`);
    return res.data?.data || res.data;
  },
};

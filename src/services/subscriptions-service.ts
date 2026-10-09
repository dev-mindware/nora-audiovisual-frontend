import { api } from './api';

export interface PlanItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
  maxProjects?: number;
  maxEquipment?: number;
  maxStorageGb?: number;
  includedAiCredits?: number;
  tier?: 'INICIAL' | 'PROFISSIONAL' | 'BUSINESS';
}

export interface AddOnItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  priceMonthly: number;
  type: string;
  unit: string;
}

export interface SubscriptionData {
  id: string;
  organizationId: string;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING' | 'PENDING' | 'SUSPENDED' | 'EXPIRED';
  plan: PlanItem;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  proofUrl?: string | null;
  referenceNumber?: string | null;
  items: Array<{
    id: string;
    addOnCode: string;
    quantity: number;
    price: number;
  }>;
  entitlements?: {
    maxProjects: number;
    maxEquipment: number;
    storageGb: number;
    aiCredits: number;
    usedProjects?: number;
    usedEquipment?: number;
    usedStorageGb?: number;
    usedAiCredits?: number;
  };
}

export const noraSubscriptionsService = {
  getPlans: async (): Promise<PlanItem[]> => {
    try {
      const res = await api.get('/catalog/plans');
      const raw = res.data?.data || res.data || [];
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((p: any) => ({
          id: p.id,
          code: p.code,
          name: p.name,
          tier: p.code as 'INICIAL' | 'PROFISSIONAL' | 'BUSINESS',
          description: p.description,
          priceMonthly: Number(p.priceMonthly ?? p.pricing?.monthly ?? 0),
          priceAnnual: Number(p.priceAnnual ?? p.pricing?.annual ?? 0),
          features: Array.isArray(p.features) ? p.features : [],
          maxProjects: p.maxProjects,
          maxEquipment: p.maxEquipment,
          maxStorageGb: p.maxStorageGb,
          includedAiCredits: p.includedAiCredits,
        }));
      }
      return [];
    } catch (error) {
      // Sem valores de reserva: preços, limites e subscrições vêm sempre da API (fonte de verdade).
      throw error;
    }
  },

  getAddOns: async (): Promise<AddOnItem[]> => {
    try {
      const res = await api.get('/catalog/add-ons');
      const raw = res.data?.data || res.data || [];
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((a: any) => ({
          id: a.id,
          code: a.code,
          name: a.name,
          description: a.description,
          priceMonthly: Number(a.priceMonthly ?? a.pricing?.monthly ?? 0),
          type: a.type,
          unit: a.type === 'STORAGE' ? 'GB' : a.type === 'AI' ? 'CRÉDITOS' : 'UNIDADE',
        }));
      }
      return [];
    } catch (error) {
      // Sem valores de reserva: preços, limites e subscrições vêm sempre da API (fonte de verdade).
      throw error;
    }
  },

  getCurrentSubscription: async (): Promise<SubscriptionData> => {
    try {
      const res = await api.get('/subscriptions/current');
      const data = res.data?.data || res.data;
      if (data) {
        return {
          id: data.id,
          organizationId: data.organizationId,
          status: data.status,
          billingCycle: data.billingInterval === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY',
          currentPeriodStart: data.currentPeriodStart,
          currentPeriodEnd: data.currentPeriodEnd,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
          referenceNumber: data.referenceNumber,
          proofUrl: data.proofUrl,
          plan: {
            id: data.plan?.id || data.plan?.code || 'plan',
            code: data.plan?.code ?? '',
            name: data.plan?.name ?? '',
            priceMonthly: Number(data.plan?.prices?.monthly ?? data.plan?.priceMonthly ?? 0),
            priceAnnual: Number(data.plan?.prices?.annual ?? data.plan?.priceAnnual ?? 0),
            features: [],
          },
          items: (data.addOns || []).map((a: any) => ({
            id: a.itemId || a.id,
            addOnCode: a.code,
            quantity: a.quantity,
            price: Number(a.unitPrice || 0),
          })),
          entitlements: data.entitlements ? {
            maxProjects: data.entitlements.maxProjects ?? 0,
            maxEquipment: data.entitlements.maxEquipment ?? 0,
            storageGb: data.entitlements.storageGb ?? 0,
            aiCredits: data.entitlements.aiCredits ?? 0,
            usedProjects: data.entitlements.usedProjects ?? 0,
            usedEquipment: data.entitlements.usedEquipment ?? 0,
            usedStorageGb: data.entitlements.usedStorageGb ?? 0,
            usedAiCredits: data.entitlements.usedAiCredits ?? 0,
          } : undefined,
        };
      }
      throw new Error('Subscrição não encontrada.');
    } catch (error) {
      // Sem valores de reserva: preços, limites e subscrições vêm sempre da API (fonte de verdade).
      throw error;
    }
  },

  getEffectiveEntitlements: async () => {
    const res = await api.get('/subscriptions/entitlements');
    return res.data?.data || res.data;
  },

  getSubscriptionUsage: async () => {
    const res = await api.get('/subscriptions/usage');
    return res.data?.data || res.data;
  },

  getProrationQuote: async (addOnCode: string, quantity = 1) => {
    const res = await api.get('/subscriptions/add-ons/quote', {
      params: { addOnCode, quantity },
    });
    return res.data?.data || res.data;
  },

  changePlan: async (planCode: string, billingCycle: 'MONTHLY' | 'ANNUAL' = 'MONTHLY') => {
    const idempotencyKey = `plan-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const res = await api.post(
      '/subscriptions/change-plan',
      { planCode, billingCycle },
      { headers: { 'x-idempotency-key': idempotencyKey } }
    );
    return res.data?.data || res.data;
  },

  cancelSubscription: async () => {
    const res = await api.post('/subscriptions/cancel');
    return res.data;
  },

  reactivateSubscription: async () => {
    const res = await api.post('/subscriptions/reactivate');
    return res.data;
  },

  purchaseAddOn: async (addOnCode: string, quantity = 1) => {
    const idempotencyKey = `addon-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const res = await api.post(
      '/subscriptions/add-ons',
      { addOnCode, quantity },
      { headers: { 'x-idempotency-key': idempotencyKey } }
    );
    return res.data?.data || res.data;
  },

  checkout: async (data: {
    planCode: string;
    billingInterval: 'MONTHLY' | 'SEMIANNUAL' | 'ANNUAL';
    paymentMethod: 'BANK_TRANSFER' | 'MULTICAIXA_EXPRESS' | 'UNITEL_MONEY';
    proofFileUrl: string;
    referenceNumber?: string;
    notes?: string;
    couponCode?: string;
    addOns?: Array<{ code: string; quantity: number }>;
  }) => {
    const res = await api.post('/subscriptions/checkout', data);
    return res.data?.data || res.data;
  },

  cancelAddOn: async (itemId: string) => {
    const res = await api.delete(`/subscriptions/add-ons/${itemId}`);
    return res.data;
  },
};

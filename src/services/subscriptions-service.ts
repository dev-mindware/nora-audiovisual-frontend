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
  /** Preços por ciclo de facturação (AOA, IVA incluído). */
  priceSemiannual?: number;
  /** Limites e funcionalidades do plano, tal como vêm da API (chaves `projects.max_active`, ...). */
  entitlements?: Record<string, number | boolean | 'UNLIMITED'>;
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
  entitlementsDelta?: Record<string, number | boolean | 'UNLIMITED'>;
  maxQuantity?: number;
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
    users?: number;
    usedUsers?: number;
  };
  trialEndsAt?: string | null;
}

type EntitlementMap = Record<string, number | boolean | 'UNLIMITED'>;

const num = (v: unknown) => (typeof v === 'number' ? v : undefined);

/** Texto legível para cada limite/funcionalidade de um plano (a API só envia números e booleanos). */
export function describeEntitlements(e: EntitlementMap = {}): string[] {
  const lines: string[] = [];
  const projects = num(e['projects.max_active']);
  if (projects !== undefined) lines.push(`Até ${projects} projectos activos em simultâneo`);
  const users = num(e['users.max']);
  if (users !== undefined) lines.push(`${users} utilizadores na equipa`);
  const equipment = e['equipment.max'];
  if (equipment === 'UNLIMITED') lines.push('Inventário de equipamentos ilimitado');
  else if (typeof equipment === 'number') lines.push(`Até ${equipment} equipamentos no inventário`);
  const storage = num(e['storage.gb']);
  if (storage !== undefined) lines.push(`${storage} GB de armazenamento`);
  if (e['client_portal.enabled']) lines.push('Portal do cliente com aprovações');
  if (e['advanced_reports.enabled']) lines.push('Relatórios avançados');
  if (e['insights.enabled']) lines.push('Nora Insights');
  if (e['automation.enabled']) lines.push('Nora Automate (automações)');
  if (e['ai.enabled']) {
    const grant = num(e['ai.monthly_grant']);
    lines.push(grant ? `Nora AI com ${grant} créditos/mês` : 'Nora AI');
  }
  return lines;
}

/** Descrição de um add-on a partir do que ele acrescenta ao plano. */
export function describeAddOnDelta(delta: EntitlementMap = {}): string {
  const parts: string[] = [];
  const storage = num(delta['storage.gb']);
  if (storage) parts.push(`+${storage} GB de armazenamento`);
  const users = num(delta['users.max']);
  if (users) parts.push(`+${users} utilizadores`);
  const projects = num(delta['projects.max_active']);
  if (projects) parts.push(`+${projects} projectos activos`);
  const equipment = delta['equipment.max'];
  if (equipment === 'UNLIMITED') parts.push('equipamentos ilimitados');
  else if (typeof equipment === 'number' && equipment) parts.push(`+${equipment} equipamentos`);
  if (delta['insights.enabled']) parts.push('indicadores avançados (Insights)');
  if (delta['advanced_reports.enabled']) parts.push('relatórios avançados');
  if (delta['automation.enabled']) parts.push('automações do fluxo de trabalho');
  if (delta['ai.enabled']) {
    const grant = num(delta['ai.monthly_grant']);
    parts.push(grant ? `assistente de IA com ${grant} créditos/mês` : 'assistente de IA');
  }
  return parts.length ? `Acrescenta ${parts.join(', ')}.` : '';
}

/** A API envia `{ 'projects.max_active': { value } }`; a página trabalha com campos simples. */
function mapEntitlements(raw: Record<string, { value?: unknown }>, usage?: { projects?: number; equipment?: number; members?: number }) {
  const value = (key: string) => {
    const v = raw[key]?.value;
    return typeof v === 'number' ? v : undefined;
  };
  const equipment = raw['equipment.max']?.value;
  return {
    maxProjects: value('projects.max_active') ?? 0,
    // 0 = sem limite (UNLIMITED): a página mostra "Ilimitado".
    maxEquipment: typeof equipment === 'number' ? equipment : 0,
    storageGb: value('storage.gb') ?? 0,
    aiCredits: value('ai.monthly_grant') ?? 0,
    users: value('users.max') ?? 0,
    usedProjects: usage?.projects,
    usedEquipment: usage?.equipment,
    usedUsers: usage?.members,
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
          entitlements: p.entitlements ?? {},
          priceSemiannual: Number(p.pricing?.semiannual ?? 0),
          features: Array.isArray(p.features) && p.features.length
            ? p.features
            : describeEntitlements(p.entitlements),
          maxProjects: num(p.entitlements?.['projects.max_active']),
          maxEquipment: num(p.entitlements?.['equipment.max']),
          maxStorageGb: num(p.entitlements?.['storage.gb']),
          includedAiCredits: num(p.entitlements?.['ai.monthly_grant']),
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
          description: a.description || describeAddOnDelta(a.entitlementsDelta),
          entitlementsDelta: a.entitlementsDelta ?? {},
          maxQuantity: a.maxQuantity,
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
          trialEndsAt: data.trialEndsAt ?? null,
          entitlements: data.entitlements ? mapEntitlements(data.entitlements, data.usage) : undefined,
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

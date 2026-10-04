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
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING' | 'PENDING' | 'SUSPENDED';
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
          features: p.features || (p.code === 'INICIAL' ? [
            'Até 5 Projetos Ativos',
            'Gestão de 50 Equipamentos',
            '50 GB Armazenamento Cloud',
            'Portal do Cliente com Aprovação',
            'Orçamentos Oficiais em Kwanzas (AOA)',
          ] : p.code === 'PROFISSIONAL' ? [
            'Até 20 Projetos Ativos',
            'Gestão de 200 Equipamentos',
            '250 GB Armazenamento Cloud',
            'Relatórios Avançados de Margem e Custos',
            'Portal do Cliente com Aprovações',
            'Equipa Técnica (até 10 utilizadores)',
          ] : [
            'Até 100 Projetos Ativos',
            'Equipamentos Ilimitados no Catálogo',
            '1.000 GB (1 TB) Armazenamento',
            'Equipa Técnica até 50 Utilizadores',
            'Relatórios Financeiros e Auditoria',
            'Suporte Dedicado & SLA Prioritário',
          ]),
          maxProjects: p.maxProjects,
          maxEquipment: p.maxEquipment,
          maxStorageGb: p.maxStorageGb,
          includedAiCredits: p.includedAiCredits,
        }));
      }
      return [];
    } catch {
      return [
        {
          id: 'plan-inicial',
          code: 'INICIAL',
          name: 'Nora Inicial',
          tier: 'INICIAL',
          description: 'Ideal para profissionais independentes e pequenas produtoras audiovisuais.',
          priceMonthly: 19900,
          priceAnnual: 199000,
          features: [
            'Até 5 Projetos Ativos',
            'Gestão de 50 Equipamentos',
            '50 GB Armazenamento Cloud',
            'Portal do Cliente com Aprovação',
            'Orçamentos comerciais em Kwanzas',
          ],
        },
        {
          id: 'plan-prof',
          code: 'PROFISSIONAL',
          name: 'Nora Profissional',
          tier: 'PROFISSIONAL',
          description: 'Para produtoras em crescimento com múltiplos projetos simultâneos e equipa técnica.',
          priceMonthly: 39900,
          priceAnnual: 399000,
          features: [
            'Até 20 Projetos Ativos',
            'Gestão de 200 Equipamentos',
            '250 GB Armazenamento Cloud',
            'Relatórios Avançados de Margem e Custos',
            'Equipa Técnica (até 10 utilizadores)',
            'Portal do Cliente com Revisão',
          ],
        },
        {
          id: 'plan-business',
          code: 'BUSINESS',
          name: 'Nora Business',
          tier: 'BUSINESS',
          description: 'Escala total para grandes produtoras audiovisuais com inventário e projetos massivos.',
          priceMonthly: 79900,
          priceAnnual: 799000,
          features: [
            'Até 100 Projetos Ativos',
            'Equipamentos Ilimitados no Catálogo',
            '1.000 GB (1 TB) Armazenamento Cloud',
            'Equipa Técnica até 50 Utilizadores',
            'Relatórios Financeiros e Auditoria',
            'Suporte Dedicado e SLA Prioritário',
          ],
        },
      ];
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
    } catch {
      return [
        {
          id: 'addon-insights',
          code: 'NORA_INSIGHTS',
          name: 'Nora Insights',
          description: 'Relatórios avançados de margem, rentabilidade por produção e análise de custos.',
          priceMonthly: 7900,
          type: 'FUNCTIONAL',
          unit: 'MÊS',
        },
        {
          id: 'addon-automate',
          code: 'NORA_AUTOMATE',
          name: 'Nora Automate',
          description: 'Automações avançadas de ordens de rodagem, notificações de call sheet e webhooks.',
          priceMonthly: 9900,
          type: 'FUNCTIONAL',
          unit: 'MÊS',
        },
        {
          id: 'addon-ai',
          code: 'NORA_AI',
          name: 'Nora AI +500 Créditos',
          description: 'Pacote de 500 créditos mensais para geração de call sheets, decupagem e orçamentos.',
          priceMonthly: 9900,
          type: 'FUNCTIONAL',
          unit: '500_CRÉDITOS',
        },
        {
          id: 'addon-storage',
          code: 'STORAGE_100GB',
          name: 'Armazenamento Extra +100 GB',
          description: '100 GB de armazenamento cloud de alta velocidade para cópias, proxies e masters.',
          priceMonthly: 4900,
          type: 'CAPACITY',
          unit: '100GB',
        },
        {
          id: 'addon-users',
          code: 'USERS_5',
          name: 'Assentos Adicionais +5 Utilizadores',
          description: '+5 membros na equipa técnica com permissões granulares e acesso simultâneo.',
          priceMonthly: 13900,
          type: 'CAPACITY',
          unit: '5_USERS',
        },
        {
          id: 'addon-equip-100',
          code: 'EQUIPMENT_100',
          name: 'Inventário de Equipamentos +100',
          description: 'Expansão de catálogo para mais 100 itens com códigos QR e manutenção.',
          priceMonthly: 4900,
          type: 'CAPACITY',
          unit: '100_ITEMS',
        },
      ];
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
            code: data.plan?.code || 'PROFISSIONAL',
            name: data.plan?.name || 'Nora Profissional',
            priceMonthly: Number(data.plan?.prices?.monthly || data.plan?.priceMonthly || 39900),
            priceAnnual: Number(data.plan?.prices?.annual || data.plan?.priceAnnual || 399000),
            features: [],
          },
          items: (data.addOns || []).map((a: any) => ({
            id: a.itemId || a.id,
            addOnCode: a.code,
            quantity: a.quantity,
            price: Number(a.unitPrice || 0),
          })),
          entitlements: data.entitlements ? {
            maxProjects: data.entitlements.maxProjects ?? 20,
            maxEquipment: data.entitlements.maxEquipment ?? 200,
            storageGb: data.entitlements.storageGb ?? 250,
            aiCredits: data.entitlements.aiCredits ?? 0,
            usedProjects: data.entitlements.usedProjects ?? 0,
            usedEquipment: data.entitlements.usedEquipment ?? 0,
            usedStorageGb: data.entitlements.usedStorageGb ?? 0,
            usedAiCredits: data.entitlements.usedAiCredits ?? 0,
          } : undefined,
        };
      }
      throw new Error('No data');
    } catch {
      return {
        id: 'sub-active-1',
        organizationId: 'org-demo',
        status: 'ACTIVE',
        billingCycle: 'MONTHLY',
        currentPeriodStart: new Date(Date.now() - 15 * 86400000).toISOString(),
        currentPeriodEnd: new Date(Date.now() + 15 * 86400000).toISOString(),
        cancelAtPeriodEnd: false,
        plan: {
          id: 'plan-prof',
          code: 'PROFISSIONAL',
          name: 'Nora Profissional',
          tier: 'PROFISSIONAL',
          priceMonthly: 39900,
          priceAnnual: 399000,
          maxProjects: 20,
          maxEquipment: 200,
          maxStorageGb: 250,
          includedAiCredits: 0,
          features: [],
        },
        items: [],
        entitlements: {
          maxProjects: 20,
          maxEquipment: 200,
          storageGb: 250,
          aiCredits: 0,
          usedProjects: 4,
          usedEquipment: 18,
          usedStorageGb: 32,
          usedAiCredits: 0,
        },
      };
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

export interface DeliverableTypeItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: 'VIDEO' | 'PHOTO' | 'AUDIO' | 'DOCUMENT' | 'OTHER';
  isDefault?: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'NORA_DELIVERABLE_TYPES';

export const DEFAULT_DELIVERABLE_TYPES: DeliverableTypeItem[] = [
  {
    id: 'dt-final-master',
    code: 'FINAL_MASTER',
    name: 'Master Final (4K / ProRes / H.264)',
    description: 'Versão final finalizada e aprovada para exibição comercial ou transmissão.',
    category: 'VIDEO',
    isDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dt-rough-cut',
    code: 'ROUGH_CUT',
    name: 'Copião / Primeiro Corte',
    description: 'Montagem inicial offline para validação de ritmo, narrativa e planos.',
    category: 'VIDEO',
    isDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dt-photoshoot',
    code: 'PHOTOSHOOT',
    name: 'Sessão Fotográfica / Proofing',
    description: 'Galeria de selecção e prova de fotografias com selecção pelo cliente.',
    category: 'PHOTO',
    isDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dt-teaser',
    code: 'TEASER',
    name: 'Teaser Promocional',
    description: 'Corte curto de antecipação (15s a 30s) para campanhas de divulgação.',
    category: 'VIDEO',
    isDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dt-trailer',
    code: 'TRAILER',
    name: 'Trailer Oficial',
    description: 'Versão cinematográfica ou promocional estendida da produção.',
    category: 'VIDEO',
    isDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dt-social-cut',
    code: 'SOCIAL_CUT',
    name: 'Corte para Redes Sociais (9:16 / Reels / TikTok)',
    description: 'Adaptação vertical orientada para Instagram Reels, Shorts e TikTok.',
    category: 'VIDEO',
    isDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dt-raw',
    code: 'RAW',
    name: 'Material Bruto / Rushes',
    description: 'Entrega de material técnico sem tratamento ou graduação de cor.',
    category: 'VIDEO',
    isDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export const deliverableTypesService = {
  getAll(): DeliverableTypeItem[] {
    if (typeof window === 'undefined') {
      return DEFAULT_DELIVERABLE_TYPES;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DELIVERABLE_TYPES));
        return DEFAULT_DELIVERABLE_TYPES;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_DELIVERABLE_TYPES;
    }
  },

  create(data: Omit<DeliverableTypeItem, 'id' | 'createdAt' | 'isDefault'>): DeliverableTypeItem {
    const current = this.getAll();
    const formattedCode = data.code
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9_]/g, '_');

    const newItem: DeliverableTypeItem = {
      id: `dt-${Date.now()}`,
      code: formattedCode,
      name: data.name.trim(),
      description: data.description?.trim(),
      category: data.category,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newItem, ...current];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    return newItem;
  },

  update(id: string, data: Partial<Omit<DeliverableTypeItem, 'id' | 'createdAt' | 'isDefault'>>): DeliverableTypeItem {
    const current = this.getAll();
    let updatedItem: DeliverableTypeItem | null = null;

    const nextList = current.map((item) => {
      if (item.id === id) {
        updatedItem = {
          ...item,
          ...data,
          code: data.code
            ? data.code.toUpperCase().trim().replace(/[^A-Z0-9_]/g, '_')
            : item.code,
          name: data.name !== undefined ? data.name.trim() : item.name,
          description: data.description !== undefined ? data.description?.trim() : item.description,
        };
        return updatedItem;
      }
      return item;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    }

    if (!updatedItem) {
      throw new Error('Tipo de entregável não encontrado.');
    }
    return updatedItem;
  },

  delete(id: string): void {
    const current = this.getAll();
    const target = current.find((item) => item.id === id);
    if (target?.isDefault) {
      throw new Error('Não é permitido eliminar um tipo padrão do sistema.');
    }
    const filtered = current.filter((item) => item.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  },

  resetDefaults(): DeliverableTypeItem[] {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DELIVERABLE_TYPES));
    }
    return DEFAULT_DELIVERABLE_TYPES;
  },
};

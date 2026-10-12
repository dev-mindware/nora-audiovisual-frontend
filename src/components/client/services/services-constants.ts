import { SortOption } from '@/components/custom/universal-table';
import { CatalogServiceCategory, Category } from '@/types';

export const CATEGORY_LABELS: Record<CatalogServiceCategory | string, string> = {
  VIDEO_PRODUCTION: 'Produção de Vídeo',
  PHOTOGRAPHY: 'Fotografia',
  POST_PRODUCTION: 'Pós-Produção',
  STUDIO_RENTAL: 'Aluguer de Estúdio',
  LIVE_STREAMING: 'Streaming / Directo',
  COMMERCIAL: 'Comercial & Ads',
  MUSIC_VIDEO: 'Videoclipe',
  CORPORATE: 'Corporativo',
  EVENT: 'Eventos',
  PODCAST: 'Podcast / Videocast',
  COLOR_GRADING: 'Color Grading',
  AUDIO_MASTERING: 'Áudio & Mix',
  DRONE_FOOTAGE: 'Drone Aéreo',
  OTHER: 'Geral & Outros',
};

export const BASE_CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'Todas as Categorias' },
  { value: 'COMMERCIAL', label: 'Comercial & Ads' },
  { value: 'MUSIC_VIDEO', label: 'Videoclipe' },
  { value: 'CORPORATE', label: 'Corporativo' },
  { value: 'EVENT', label: 'Eventos' },
  { value: 'PODCAST', label: 'Podcast' },
  { value: 'STUDIO_RENTAL', label: 'Aluguer Estúdio' },
  { value: 'COLOR_GRADING', label: 'Color Grading' },
  { value: 'AUDIO_MASTERING', label: 'Áudio & Mix' },
  { value: 'DRONE_FOOTAGE', label: 'Drone Aéreo' },
  { value: 'VIDEO_PRODUCTION', label: 'Produção Vídeo' },
  { value: 'PHOTOGRAPHY', label: 'Fotografia' },
  { value: 'POST_PRODUCTION', label: 'Pós-Produção' },
  { value: 'OTHER', label: 'Outros' },
];

export const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos os Estados' },
  { value: 'ACTIVE', label: 'Apenas Ativos' },
  { value: 'INACTIVE', label: 'Apenas Inativos' },
];

export const SORT_OPTIONS: SortOption[] = [
  { value: 'name', label: 'Nome do Serviço' },
  { value: 'price', label: 'Preço de Referência' },
  { value: 'createdAt', label: 'Data de Adição' },
];

/**
 * Constrói as opções de filtro unindo as categorias predefinidas com as personalizadas na BD.
 */
export function buildCombinedCategoryOptions(dbCategories: Category[] = []) {
  const list = [{ value: 'ALL', label: 'Todas as Categorias' }];
  const map = new Map<string, string>();

  BASE_CATEGORY_OPTIONS.filter((c) => c.value !== 'ALL').forEach((c) => {
    map.set(c.value, c.label);
  });

  dbCategories.forEach((c) => {
    const slug = c.slug || c.name;
    if (!map.has(slug)) {
      map.set(slug, c.name);
    }
  });

  map.forEach((label, value) => {
    list.push({ value, label });
  });

  return list;
}

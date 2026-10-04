import { NotionKanbanColor, KanbanCategory } from '@/types';

export const NOTION_KANBAN_COLORS: Record<
  NotionKanbanColor,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
    preview: string;
  }
> = {
  gray: {
    label: 'Cinza',
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-800 dark:text-zinc-200',
    border: 'border-zinc-300 dark:border-zinc-700',
    dot: 'bg-zinc-500',
    preview: '#71717a',
  },
  brown: {
    label: 'Castanho',
    bg: 'bg-amber-100/60 dark:bg-amber-950/40',
    text: 'text-amber-900 dark:text-amber-200',
    border: 'border-amber-300/80 dark:border-amber-800',
    dot: 'bg-amber-700',
    preview: '#92400e',
  },
  orange: {
    label: 'Laranja',
    bg: 'bg-orange-100/70 dark:bg-orange-950/40',
    text: 'text-orange-900 dark:text-orange-200',
    border: 'border-orange-300 dark:border-orange-800',
    dot: 'bg-orange-500',
    preview: '#f97316',
  },
  yellow: {
    label: 'Amarelo',
    bg: 'bg-yellow-100/70 dark:bg-yellow-950/40',
    text: 'text-yellow-900 dark:text-yellow-200',
    border: 'border-yellow-300 dark:border-yellow-800',
    dot: 'bg-yellow-500',
    preview: '#eab308',
  },
  green: {
    label: 'Verde',
    bg: 'bg-emerald-100/70 dark:bg-emerald-950/40',
    text: 'text-emerald-900 dark:text-emerald-200',
    border: 'border-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-600',
    preview: '#10b981',
  },
  blue: {
    label: 'Azul',
    bg: 'bg-blue-100/70 dark:bg-blue-950/40',
    text: 'text-blue-900 dark:text-blue-200',
    border: 'border-blue-300 dark:border-blue-800',
    dot: 'bg-blue-600',
    preview: '#3b82f6',
  },
  purple: {
    label: 'Roxo',
    bg: 'bg-purple-100/70 dark:bg-purple-950/40',
    text: 'text-purple-900 dark:text-purple-200',
    border: 'border-purple-300 dark:border-purple-800',
    dot: 'bg-purple-600',
    preview: '#a855f7',
  },
  pink: {
    label: 'Rosa',
    bg: 'bg-pink-100/70 dark:bg-pink-950/40',
    text: 'text-pink-900 dark:text-pink-200',
    border: 'border-pink-300 dark:border-pink-800',
    dot: 'bg-pink-500',
    preview: '#ec4899',
  },
  red: {
    label: 'Vermelho',
    bg: 'bg-red-100/70 dark:bg-red-950/40',
    text: 'text-red-900 dark:text-red-200',
    border: 'border-red-300 dark:border-red-800',
    dot: 'bg-red-500',
    preview: '#ef4444',
  },
};

export const KANBAN_CATEGORIES_METADATA: Record<
  KanbanCategory,
  {
    id: KanbanCategory;
    label: string;
    description: string;
  }
> = {
  TODO: {
    id: 'TODO',
    label: 'A Fazer',
    description: 'Trabalho planeado, backlog e etapas não iniciadas',
  },
  IN_PROGRESS: {
    id: 'IN_PROGRESS',
    label: 'Em Progresso',
    description: 'Trabalho activo, em gravação, rodagem, montagem ou revisão',
  },
  DONE: {
    id: 'DONE',
    label: 'Concluído',
    description: 'Etapas concluídas, aprovadas e entregues',
  },
};

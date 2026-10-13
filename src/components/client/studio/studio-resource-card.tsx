'use client';

import { StudioResource, StudioResourceType } from '@/types';
import { Button, ItemStatusBadge } from '@/components';
import {
  Building2,
  CalendarCheck,
  Users,
  Video,
  Mic,
  Tv,
  Clock,
  Pencil,
  Trash2,
  MoreVertical,
  AlertTriangle,
} from 'lucide-react';
import { hasOpeningHours, summarizeOpeningHours } from '@/lib/opening-hours';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const RESOURCE_TYPE_LABELS: Record<
  StudioResourceType,
  { label: string; icon: typeof Building2 }
> = {
  MAIN_STAGE: {
    label: 'Palco Principal / Estúdio A',
    icon: Building2,
  },
  SOUND_BOOTH: {
    label: 'Cabine de Som / Foley / Dobragem',
    icon: Mic,
  },
  CYCLORAMA: {
    label: 'Ciclorama Infinito (Chroma / Branco)',
    icon: Video,
  },
  EDIT_SUITE: {
    label: 'Ilha de Edição & Color Grading',
    icon: Tv,
  },
};

interface StudioResourceCardProps {
  resource: StudioResource;
  onEdit: (resource: StudioResource) => void;
  onDelete: (resource: StudioResource) => void;
  onSelectToBook: (resource: StudioResource) => void;
}

export function StudioResourceCard({
  resource,
  onEdit,
  onDelete,
  onSelectToBook,
}: StudioResourceCardProps) {
  const meta = RESOURCE_TYPE_LABELS[resource.type] || {
    label: resource.type,
    icon: Building2,
  };
  const IconComp = meta.icon;

  return (
    <div className="rounded-xs border border-border/70 bg-card p-5 transition-colors hover:border-foreground/30 flex flex-col justify-between shadow-xs">
      <div className="space-y-3">
        {/* Topo: Ícone, Status e Dropdown */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xs border border-border/60 bg-muted/40 text-foreground">
            <IconComp className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-1">
            <ItemStatusBadge status={resource.status} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-xs text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xs border-border">
                <DropdownMenuItem
                  onClick={() => onEdit(resource)}
                  className="text-xs cursor-pointer gap-2"
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  Editar Set
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(resource)}
                  className="text-xs cursor-pointer text-destructive focus:text-destructive gap-2"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  Eliminar Set
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Título e Descrição */}
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground leading-snug">
            {resource.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
            {resource.description}
          </p>
        </div>

        {/* Especificações Técnicas */}
        <div className="border-t border-border/60 pt-3 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="h-3 w-3" /> Lotação
            </span>
            <span className="font-mono text-foreground font-medium">
              {resource.capacity ? `${resource.capacity} pax` : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> Tarifa Horária
            </span>
            <span className="font-mono text-foreground font-medium">
              {resource.hourlyRate
                ? `${Number(resource.hourlyRate).toLocaleString('pt-AO')} Kz`
                : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CalendarCheck className="h-3 w-3" /> Tarifa Diária
            </span>
            <span className="font-mono text-foreground font-semibold">
              {resource.dailyRate
                ? `${Number(resource.dailyRate).toLocaleString('pt-AO')} Kz`
                : '—'}
            </span>
          </div>
        </div>

        {/* Disponibilidade para marcações dos clientes */}
        <div data-tour="studio-hours-summary">
          {hasOpeningHours(resource.openingHours) ? (
            <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <Clock className="mt-0.5 h-3 w-3 shrink-0" />
              <span>{summarizeOpeningHours(resource.openingHours)}</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => onEdit(resource)}
              className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600 hover:underline dark:text-amber-400"
            >
              <AlertTriangle className="h-3 w-3" /> Sem horário definido — definir disponibilidade
            </button>
          )}
        </div>
      </div>

      <Button
        onClick={() => onSelectToBook(resource)}
        className="mt-4 w-full rounded-xs bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-xs font-medium tracking-wide uppercase flex items-center justify-center gap-1.5 transition-colors"
      >
        <CalendarCheck className="h-3.5 w-3.5" /> Reservar Set
      </Button>
    </div>
  );
}

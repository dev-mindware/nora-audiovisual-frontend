'use client';

import { CatalogService } from '@/types';
import { Button, Badge } from '@/components';
import {
  Tag,
  MoreHorizontal,
  Edit,
  PowerOff,
  Power,
  Trash2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CATEGORY_LABELS } from './services-constants';

interface ServiceCardProps {
  service: CatalogService;
  onEdit: (service: CatalogService) => void;
  onToggleStatus: (service: CatalogService) => void;
  onDelete: (service: CatalogService) => void;
}

export function ServiceCard({
  service,
  onEdit,
  onToggleStatus,
  onDelete,
}: ServiceCardProps) {
  const categoryLabel = CATEGORY_LABELS[service.category] || service.category;

  return (
    <div className="relative flex flex-col justify-between rounded-xs border border-border bg-card p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all group">
      <div>
        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
            <Tag className="h-3 w-3 shrink-0" />
            <span className="truncate">{categoryLabel}</span>
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground opacity-60 group-hover:opacity-100 rounded-xs"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xs">
              <DropdownMenuItem onClick={() => onEdit(service)} className="text-xs cursor-pointer">
                <Edit className="h-3.5 w-3.5 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(service)} className="text-xs cursor-pointer">
                {service.isActive ? (
                  <>
                    <PowerOff className="h-3.5 w-3.5 mr-2 text-amber-500" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <Power className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                    Ativar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(service)}
                className="text-xs cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Título & Descrição */}
        <h3 className="font-semibold text-foreground text-base mt-3 leading-snug">
          {service.name}
        </h3>
        {service.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
            {service.description}
          </p>
        )}

        {/* Preço e Duração */}
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-xl font-bold text-foreground tracking-tight">
            {Number(service.price).toLocaleString('pt-AO')}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            {service.currency || 'AOA'}
          </span>
          {service.durationHours ? (
            <span className="text-xs text-muted-foreground ml-2">
              / ~{service.durationHours}h
            </span>
          ) : null}
        </div>

        {/* Destaques / Benefícios */}
        {service.benefits && service.benefits.length > 0 && (
          <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Destaques do Pacote
            </span>
            <ul className="space-y-1">
              {service.benefits.slice(0, 3).map((b: string, i: number) => (
                <li
                  key={i}
                  className="text-xs text-foreground/90 flex items-center gap-1.5"
                >
                  <Sparkles className="h-3 w-3 text-primary shrink-0" />
                  <span className="truncate">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Entregáveis Garantidos */}
        {service.deliverablesIncluded && service.deliverablesIncluded.length > 0 && (
          <div className="mt-3 space-y-1.5 border-t border-border/60 pt-2.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Entregáveis Garantidos
            </span>
            <ul className="space-y-1">
              {service.deliverablesIncluded.slice(0, 2).map((d: string, i: number) => (
                <li
                  key={i}
                  className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Rodapé do Card */}
      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3">
        <Badge
          variant={service.isActive ? 'default' : 'outline'}
          className={
            service.isActive
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 rounded-xs'
              : 'text-muted-foreground rounded-xs'
          }
        >
          {service.isActive ? 'Ativo no Portal' : 'Oculto'}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(service)}
          className="text-xs h-7 rounded-xs"
        >
          Editar
        </Button>
      </div>
    </div>
  );
}

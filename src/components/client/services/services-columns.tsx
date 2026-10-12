'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CatalogService } from '@/types';
import { Button, Badge } from '@/components';
import {
  Briefcase,
  Tag,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Edit,
  PowerOff,
  Power,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CATEGORY_LABELS } from './services-constants';

interface CreateServicesColumnsProps {
  onEdit: (service: CatalogService) => void;
  onToggleStatus: (service: CatalogService) => void;
  onDelete: (service: CatalogService) => void;
}

export function createServicesColumns({
  onEdit,
  onToggleStatus,
  onDelete,
}: CreateServicesColumnsProps): ColumnDef<CatalogService>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Pacote / Serviço',
      cell: ({ row }) => {
        const item = row.original;
        const categoryLabel = CATEGORY_LABELS[item.category] || item.category;

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xs bg-primary/10 text-primary">
              <Briefcase className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-foreground block text-sm truncate">
                {item.name}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-3 w-3 shrink-0" />
                  {categoryLabel}
                </span>
                {item.durationHours ? (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3 shrink-0" />
                      {item.durationHours}h estimadas
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: 'Preço Base (AOA)',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="font-semibold text-sm text-foreground">
            {Number(item.price).toLocaleString('pt-AO')} {item.currency || 'AOA'}
          </div>
        );
      },
    },
    {
      accessorKey: 'deliverablesIncluded',
      header: 'Entregáveis & Escopo',
      cell: ({ row }) => {
        const item = row.original;
        const count = item.deliverablesIncluded?.length || 0;
        return (
          <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
            {count > 0 ? (
              item.deliverablesIncluded.slice(0, 2).map((deliv, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 truncate max-w-[140px]"
                  title={deliv}
                >
                  <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{deliv}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Definido na proposta
              </span>
            )}
            {count > 2 ? (
              <span className="text-[10px] text-muted-foreground font-medium">
                +{count - 2}
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Visibilidade',
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge
            variant={isActive ? 'default' : 'outline'}
            className={
              isActive
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 rounded-xs'
                : 'text-muted-foreground rounded-xs'
            }
          >
            {isActive ? 'Ativo no Portal' : 'Oculto'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xs">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-xs">
                <DropdownMenuItem onClick={() => onEdit(item)} className="text-xs cursor-pointer">
                  <Edit className="h-3.5 w-3.5 mr-2" />
                  Editar Serviço
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus(item)} className="text-xs cursor-pointer">
                  {item.isActive ? (
                    <>
                      <PowerOff className="h-3.5 w-3.5 mr-2 text-amber-500" />
                      Ocultar do Portal
                    </>
                  ) : (
                    <>
                      <Power className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                      Ativar no Portal
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(item)}
                  className="text-xs cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Excluir Serviço
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}

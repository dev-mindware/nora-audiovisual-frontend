'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Loader2, X } from 'lucide-react';
import { useDashboardFilters } from '@/hooks/dashboard';
import type { DashboardRange } from '@/types';
import { cn } from '@/lib/utils';

export const DASHBOARD_PERIOD_OPTIONS: { label: string; value: DashboardRange }[] = [
  { label: 'Hoje', value: 'today' },
  { label: 'Últimos 7 dias', value: 'last_7_days' },
  { label: 'Últimos 30 dias', value: 'last_30_days' },
  { label: 'Este mês', value: 'month' },
  { label: 'Este trimestre', value: 'quarter' },
  { label: 'Este ano', value: 'year' },
];

interface DashboardPeriodSelectProps {
  isFetching?: boolean;
}

export function DashboardPeriodSelect({ isFetching = false }: DashboardPeriodSelectProps) {
  const { range, setRange } = useDashboardFilters();
  const activeRange = range || 'last_30_days';
  const isCustomOrNonDefault = activeRange !== 'last_30_days';

  // Filtrar qualquer opção "todos"
  const sanitizedOptions = React.useMemo(() => {
    return DASHBOARD_PERIOD_OPTIONS.filter(
      (opt) =>
        opt.label.toLowerCase() !== 'todos' &&
        opt.label.toLowerCase() !== 'tudo' &&
        opt.value !== 'custom'
    );
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      <Select
        value={activeRange}
        onValueChange={(val) => setRange(val as DashboardRange)}
      >
        <SelectTrigger
          className={cn(
            'w-[180px] shrink-0 rounded-none text-xs h-9 transition-colors',
            isCustomOrNonDefault
              ? 'border-primary text-primary bg-primary/10 hover:bg-primary/15 font-medium'
              : 'border-input text-muted-foreground bg-transparent hover:bg-muted/40 hover:text-foreground font-normal'
          )}
          aria-label="Período do dashboard"
        >
          <div className="flex items-center gap-2">
            {isFetching ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <Calendar
                className={cn(
                  'size-4',
                  isCustomOrNonDefault ? 'text-primary' : 'text-muted-foreground'
                )}
              />
            )}
            <SelectValue placeholder="Período" />
          </div>
        </SelectTrigger>
        <SelectContent align="end" className="rounded-none">
          {sanitizedOptions.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="text-xs rounded-none cursor-pointer"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isCustomOrNonDefault && (
        <button
          type="button"
          onClick={() => setRange('last_30_days')}
          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted/50 rounded-none transition-colors"
          title="Restaurar período padrão (30 dias)"
          aria-label="Restaurar período padrão (30 dias)"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

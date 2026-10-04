'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCw } from 'lucide-react';
import { useDashboardFilters } from '@/hooks/dashboard';
import type { DashboardRange } from '@/types';
import { cn } from '@/lib/utils';

const RANGES: { label: string; value: DashboardRange }[] = [
  { label: 'Hoje', value: 'today' },
  { label: 'Últimos 7 dias', value: 'last_7_days' },
  { label: 'Últimos 30 dias', value: 'last_30_days' },
  { label: 'Mês Atual', value: 'month' },
  { label: 'Trimestre', value: 'quarter' },
  { label: 'Ano', value: 'year' },
];

export function DashboardFilterBar() {
  const { range, setRange, resetFilters } = useDashboardFilters();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full bg-card p-2.5 rounded-none border border-border shadow-none">
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
        <span className="text-xs text-muted-foreground font-semibold px-2 flex items-center gap-1.5 shrink-0">
          <Calendar className="size-3.5 text-primary" />
          Período:
        </span>
        {RANGES.map((r) => {
          const isActive = range === r.value;
          return (
            <Button
              key={r.value}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setRange(r.value)}
              className={cn(
                'text-xs h-7 px-2.5 rounded-none shrink-0 transition-all font-medium',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {r.label}
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
          title="Repor filtros padrão"
        >
          <RefreshCw className="size-3" />
          Limpar
        </Button>
      </div>
    </div>
  );
}

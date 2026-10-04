'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { DashboardKpiItem } from '@/types';

export interface KpiMetricCardProps {
  item?: DashboardKpiItem;
  icon?: React.ReactNode;
  variant?: 'primary' | 'success' | 'destructive' | 'blue' | 'purple' | 'amber';
  className?: string;
}

const VARIANT_STYLES = {
  primary: 'bg-primary/10 text-primary group-hover:bg-primary/20',
  success: 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20',
  destructive: 'bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20',
  blue: 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20',
  amber: 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20',
};

export function KpiMetricCard({
  item,
  icon,
  variant = 'primary',
  className,
}: KpiMetricCardProps) {
  if (!item) return null;

  const formatValue = (val: number | string, format?: string) => {
    if (typeof val === 'string') return val;
    if (format === 'currency') {
      return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
        maximumFractionDigits: 0,
      }).format(val);
    }
    if (format === 'percentage') {
      return `${val}%`;
    }
    return new Intl.NumberFormat('pt-AO').format(val);
  };

  const isPositive = (item.change ?? 0) >= 0;

  return (
    <Card
      className={cn(
        'p-4 rounded-xs border border-border shadow-none relative overflow-hidden group hover:border-primary/40 transition-all bg-card flex flex-col justify-between min-h-[120px]',
        className
      )}
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
        <span className="truncate pr-2">{item.label}</span>
        {icon && (
          <div
            className={cn(
              'p-1.5 rounded-xs transition-colors shrink-0 flex items-center justify-center size-7',
              VARIANT_STYLES[variant]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="my-1">
        <div className="text-2xl font-semibold text-foreground tracking-tight truncate">
          {formatValue(item.value, item.format)}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1.5 border-t border-border">
        <span className="truncate text-[11px]">{item.description || 'Métrica consolidada'}</span>
        {item.change !== undefined && (
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] px-1.5 py-0 h-4 border-none font-semibold rounded-xs flex items-center gap-0.5',
              isPositive ? 'text-emerald-600 bg-emerald-500/10' : 'text-destructive bg-destructive/10'
            )}
          >
            {isPositive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {Math.abs(item.change)}%
          </Badge>
        )}
      </div>
    </Card>
  );
}

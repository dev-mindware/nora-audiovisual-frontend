'use client';

import React from 'react';
import { DynamicMetricCard } from '@/components';
import { formatCurrency } from '@/utils/format-currency';
import { icons } from 'lucide-react';
import type { DashboardKpiItem } from '@/types';

interface MindgestKpiGridProps {
  kpis: Record<string, DashboardKpiItem>;
}

const DEFAULT_ICONS: (keyof typeof icons)[] = [
  'Coins',
  'TrendingUp',
  'Sparkles',
  'Briefcase',
];

export function MindgestKpiGrid({ kpis }: MindgestKpiGridProps) {
  const entries = Object.entries(kpis || {});

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:grid-cols-4">
      {entries.slice(0, 4).map(([key, item], idx) => {
        let formattedValue: string = item.value?.toString() ?? '0';
        if (item.format === 'currency') {
          formattedValue = formatCurrency(Number(item.value || 0));
        } else if (item.format === 'percentage') {
          formattedValue = `${Number(item.value || 0)}%`;
        } else if (typeof item.value === 'number') {
          formattedValue = item.value.toLocaleString('pt-PT');
        }

        const iconName = DEFAULT_ICONS[idx % DEFAULT_ICONS.length];

        return (
          <DynamicMetricCard
            key={key}
            subtitle={item.label}
            title={formattedValue}
            icon={iconName}
            trend={{
              percent: item.change ?? 0,
              label: 'vs. período anterior',
            }}
          />
        );
      })}
    </div>
  );
}

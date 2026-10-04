'use client';

import { useMemo } from 'react';
import { defineChart, lineY, areaY } from '@tanstack/charts';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';
import { tooltip } from '@tanstack/charts/tooltip';
import { Chart } from '@tanstack/charts/react';
import type { DashboardEvolutionPoint } from '@/types';

export interface TanStackAreaChartProps {
  data: DashboardEvolutionPoint[];
  primaryKey?: string;
  secondaryKey?: string;
  height?: number;
  currency?: boolean;
}

export function TanStackAreaChart({
  data,
  primaryKey = 'revenue',
  secondaryKey = 'expenses',
  height = 260,
  currency = true,
}: TanStackAreaChartProps) {
  const chart = useMemo(() => {
    if (!data || data.length === 0) return null;

    const formatCurrencyShort = (val: number) => {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M Kz`;
      if (val >= 1000) return `${(val / 1000).toFixed(0)}k Kz`;
      return `${val} Kz`;
    };

    const marks: any[] = [];

    // Linha/Área Primária (ex: Receitas - Terracota Mindware)
    if (data.some((d) => d[primaryKey] !== undefined)) {
      marks.push(
        areaY(data, {
          x: (d: DashboardEvolutionPoint) => d.label,
          y: (d: DashboardEvolutionPoint) => Number(d[primaryKey] || 0),
          fill: 'rgba(224, 79, 22, 0.12)',
        }),
        lineY(data, {
          x: (d: DashboardEvolutionPoint) => d.label,
          y: (d: DashboardEvolutionPoint) => Number(d[primaryKey] || 0),
          stroke: '#E04F16',
          strokeWidth: 2.5,
          points: true,
        })
      );
    }

    // Linha Secundária (ex: Despesas - Vermelho Suave)
    if (data.some((d) => d[secondaryKey] !== undefined)) {
      marks.push(
        lineY(data, {
          x: (d: DashboardEvolutionPoint) => d.label,
          y: (d: DashboardEvolutionPoint) => Number(d[secondaryKey] || 0),
          stroke: '#ef4444',
          strokeWidth: 2,
          strokeDasharray: '4 4',
          points: true,
        })
      );
    }

    return defineChart({
      marks,
      scales: {
        x: {
          scale: () => scalePoint<string>().padding(0.2),
          grid: false,
        },
        y: {
          scale: scaleLinear,
          nice: true,
          grid: true,
          axis: {
            ticks: {
              format: (val: number) => (currency ? formatCurrencyShort(val) : val.toString()),
            },
          },
        },
      },
      tooltip,
    });
  }, [data, primaryKey, secondaryKey, currency]);

  if (!chart) return null;

  return (
    <div className="w-full flex justify-center items-center">
      <Chart
        definition={chart}
        height={height}
        ariaLabel="Gráfico de Evolução Analítica"
        className="w-full text-xs font-sans"
      />
    </div>
  );
}

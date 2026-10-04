'use client';

import { useMemo } from 'react';
import { defineChart, barY } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { Chart } from '@tanstack/charts/react';
import type { DashboardCapacityItem } from '@/types';

export interface TanStackBarChartProps {
  data: DashboardCapacityItem[];
  height?: number;
  color?: string;
}

export function TanStackBarChart({
  data,
  height = 240,
  color = '#E04F16',
}: TanStackBarChartProps) {
  const chart = useMemo(() => {
    if (!data || data.length === 0) return null;

    return defineChart({
      marks: [
        barY(data, {
          x: (d: DashboardCapacityItem) => d.label,
          y: (d: DashboardCapacityItem) => d.value,
          fill: color,
        }),
      ],
      scales: {
        x: {
          scale: () => scaleBand<string>().padding(0.28),
          grid: false,
        },
        y: {
          scale: scaleLinear,
          nice: true,
          grid: true,
          axis: {
            ticks: {
              format: (v: number) => Math.round(v).toString(),
            },
          },
        },
      },
      tooltip,
    });
  }, [data, color]);

  if (!chart) return null;

  return (
    <div className="w-full flex justify-center items-center">
      <Chart
        definition={chart}
        height={height}
        ariaLabel="Gráfico de Barras de Distribuição"
        className="w-full text-xs font-sans"
      />
    </div>
  );
}

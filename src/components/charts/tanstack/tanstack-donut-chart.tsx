'use client';

import { useMemo } from 'react';
import { defineChart } from '@tanstack/charts';
import { pie, polar, radialArc } from '@tanstack/charts/polar';
import { tooltip } from '@tanstack/charts/tooltip';
import { Chart } from '@tanstack/charts/react';
import type { DashboardDistributionSlice } from '@/types';

export interface TanStackDonutChartProps {
  data: DashboardDistributionSlice[];
  height?: number;
  innerRadiusRatio?: number;
}

const DEFAULT_PALETTE = ['#E04F16', '#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ec4899'];

export function TanStackDonutChart({
  data,
  height = 240,
  innerRadiusRatio = 0.58,
}: TanStackDonutChartProps) {
  const chartData = useMemo(() => {
    return (data || []).map((item, idx) => ({
      ...item,
      color: item.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length],
    }));
  }, [data]);

  const chart = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;

    const slices = pie(chartData, { value: 'value' });
    const labels = chartData.map((d) => d.label);
    const colors = chartData.map((d) => d.color);

    return defineChart({
      marks: [
        polar({
          inset: 8,
          radiusRatio: 0.88,
          marks: [
            radialArc(slices, {
              innerRadius: ({ radius }: { radius: number }) => radius * innerRadiusRatio,
              cornerRadius: 4,
              color: 'label',
              key: 'label',
            }),
          ],
          scales: {
            angle: null,
            radius: null,
          },
        }),
      ],
      scales: {
        x: null,
        y: null,
      },
      color: {
        domain: labels,
        range: colors,
      },
      tooltip,
    });
  }, [chartData, innerRadiusRatio]);

  const total = useMemo(() => {
    return (data || []).reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  if (!chart) return null;

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="w-full flex justify-center items-center">
        <Chart
          definition={chart}
          height={height}
          ariaLabel="Gráfico Donut de Composição"
          className="w-full"
        />
      </div>

      {/* Sincronização de Legendas Customizadas Mindware */}
      <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
        {chartData.map((slice, i) => {
          const percent = total > 0 ? Math.round((slice.value / total) * 100) : 0;
          return (
            <div key={i} className="flex items-center gap-2 overflow-hidden">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="truncate text-muted-foreground">{slice.label}</span>
              <span className="font-semibold text-foreground ml-auto">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Cell, Label, Pie, PieChart } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Icon,
  type ChartConfig,
} from '@/components';
import { OverviewLegendRow } from '../overview/overview-legend-row';
import { formatCurrencyCompact } from '@/utils/format-currency';
import { icons } from 'lucide-react';

export interface MindgestDonutSlice {
  key: string;
  label: string;
  value: number;
  color?: string;
  dotClassName?: string;
}

interface MindgestDonutChartProps {
  title: string;
  icon?: keyof typeof icons;
  slices: MindgestDonutSlice[];
  centerLabel?: string;
  isCurrency?: boolean;
}

const DEFAULT_COLORS = [
  'var(--primary)',
  '#3b82f6',
  '#a855f7',
  '#10b981',
  '#f59e0b',
  '#ef4444',
];

export function MindgestDonutChart({
  title,
  icon = 'ChartPie',
  slices,
  centerLabel = 'Total',
  isCurrency = false,
}: MindgestDonutChartProps) {
  const total = React.useMemo(() => {
    return slices.reduce((acc, curr) => acc + (curr.value || 0), 0);
  }, [slices]);

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      value: { label: centerLabel },
    };
    slices.forEach((s, idx) => {
      config[s.key] = {
        label: s.label,
        color: s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
      };
    });
    return config;
  }, [slices, centerLabel]);

  const preparedSlices = React.useMemo(() => {
    return slices.map((s, idx) => {
      const color = s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
      const percentage =
        total > 0 ? Math.round(((s.value || 0) / total) * 100) : 0;
      return {
        ...s,
        percentage,
        fill: `var(--color-${s.key})`,
        color,
      };
    });
  }, [slices, total]);

  return (
    <Card className="flex h-full flex-col gap-0 py-4">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon name={icon} className="size-4" />
          </span>
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-center px-4">
        {!slices || slices.length === 0 || total === 0 ? (
          <div className="flex h-[190px] flex-col items-center justify-center text-center text-xs text-muted-foreground p-4">
            <span className="font-medium">Sem distribuição registada</span>
            <span className="text-[11px] opacity-70 mt-1">Nenhum registo no período selecionado.</span>
          </div>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto h-[190px] w-full"
            >
            <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, item) => (
                    <div className="flex w-full flex-col gap-0.5">
                      <span className="font-medium text-foreground">
                        {item?.payload?.label}
                      </span>
                      <span className="text-muted-foreground">
                        {isCurrency
                          ? formatCurrencyCompact(Number(value || 0))
                          : `${Number(value || 0)} unidades`}
                        {total > 0 && ` (${item?.payload?.percentage}%)`}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={
                total === 0
                  ? [
                    {
                      key: 'empty',
                      label: 'Sem dados',
                      value: 1,
                      fill: 'var(--muted)',
                    },
                  ]
                  : preparedSlices
              }
              dataKey="value"
              nameKey="label"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={total === 0 ? 0 : 3}
              strokeWidth={0}
            >
              {total === 0 ? (
                <Cell
                  key="empty"
                  fill="currentColor"
                  className="text-muted/40"
                />
              ) : (
                preparedSlices.map((slice) => (
                  <Cell key={slice.key} fill={slice.fill} />
                ))
              )}
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !('cx' in viewBox)) return null;
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-2xl font-semibold"
                      >
                        {isCurrency
                          ? formatCurrencyCompact(total)
                          : total.toLocaleString('pt-PT')}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) + 20}
                        className="fill-muted-foreground text-xs"
                      >
                        {centerLabel}
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <ul className="mt-3 space-y-2">
          {preparedSlices.map((slice) => (
            <OverviewLegendRow
              key={slice.key}
              dotClassName=""
              label={slice.label}
              value={`${slice.percentage}%`}
              hint={
                isCurrency
                  ? formatCurrencyCompact(slice.value)
                  : slice.value.toLocaleString('pt-PT')
              }
            />
          ))}
        </ul>
        </>
        )}
      </CardContent>
    </Card>
  );
}

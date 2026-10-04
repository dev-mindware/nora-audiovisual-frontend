'use client';

import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  Icon,
  type ChartConfig,
} from '@/components';
import { formatAxisCurrency, formatCurrency } from '@/utils/format-currency';
import { icons } from 'lucide-react';

export interface MindgestAreaSeries {
  key: string;
  label: string;
  color: string;
}

interface MindgestAreaChartProps {
  title: string;
  description?: string;
  icon?: keyof typeof icons;
  data: Record<string, any>[];
  series: MindgestAreaSeries[];
  xAxisKey?: string;
  isCurrency?: boolean;
  height?: number;
}

export function MindgestAreaChart({
  title,
  description,
  icon = 'ChartLine',
  data,
  series,
  xAxisKey = 'label',
  isCurrency = true,
  height = 280,
}: MindgestAreaChartProps) {
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    for (const s of series) {
      config[s.key] = {
        label: s.label,
        color: s.color,
      };
    }
    return config;
  }, [series]);

  return (
    <Card className="flex h-full flex-col gap-0 py-4">
      <CardHeader className="flex flex-row items-start justify-between gap-2 px-4 pb-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon name={icon} className="size-4" />
            </span>
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-2 pt-2 sm:px-4">
        {!data || data.length === 0 ? (
          <div className="flex h-[240px] flex-col items-center justify-center text-center text-xs text-muted-foreground p-6">
            <span className="font-medium">Sem dados registados para este período</span>
            <span className="text-[11px] opacity-70 mt-1">Altere o intervalo de datas ou inicie novas atividades.</span>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto w-full"
            style={{ height: `${height}px` }}
          >
            <AreaChart
              data={data}
              margin={{ top: 14, right: 12, left: -4, bottom: 0 }}
            >
            <defs>
              {series.map((s) => (
                <linearGradient
                  key={s.key}
                  id={`fill-area-${s.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${s.key})`}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${s.key})`}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={isCurrency ? 65 : 40}
              tickMargin={4}
              tickFormatter={(value: number) =>
                isCurrency ? formatAxisCurrency(value) : value.toString()
              }
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name) => {
                    const found = series.find((s) => s.key === name);
                    const label = found?.label ?? name;
                    const numVal = Number(value || 0);
                    return (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium tabular-nums text-foreground">
                          {isCurrency
                            ? formatCurrency(numVal)
                            : numVal.toLocaleString('pt-PT')}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />

            {series.map((s) => (
              <Area
                key={s.key}
                dataKey={s.key}
                type="natural"
                fill={`url(#fill-area-${s.key})`}
                stroke={`var(--color-${s.key})`}
                strokeWidth={2}
              />
            ))}

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

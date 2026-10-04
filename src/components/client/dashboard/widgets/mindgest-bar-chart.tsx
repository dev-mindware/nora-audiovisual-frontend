'use client';

import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Icon,
  type ChartConfig,
} from '@/components';
import { icons } from 'lucide-react';

export interface MindgestBarItem {
  label: string;
  value: number;
}

interface MindgestBarChartProps {
  title: string;
  description?: string;
  icon?: keyof typeof icons;
  data: MindgestBarItem[];
  color?: string;
  height?: number;
}

export function MindgestBarChart({
  title,
  description,
  icon = 'ChartColumn',
  data,
  color = 'var(--primary)',
  height = 240,
}: MindgestBarChartProps) {
  const chartConfig = {
    value: {
      label: 'Quantidade',
      color,
    },
  } satisfies ChartConfig;

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
        <ChartContainer
          config={chartConfig}
          className="aspect-auto w-full"
          style={{ height: `${height}px` }}
        >
          <BarChart
            data={data}
            margin={{ top: 10, right: 12, left: -10, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={35}
              tickMargin={4}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/common/empty-state';
import { ChartSkeleton } from './chart-skeleton';
import { cn } from '@/lib/utils';

export interface TanStackChartContainerProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  height?: number;
  className?: string;
  children: React.ReactNode;
}

export function TanStackChartContainer({
  title,
  description,
  action,
  icon,
  isLoading = false,
  isEmpty = false,
  emptyTitle = 'Sem dados suficientes',
  emptyDescription = 'Não existem dados registados para este período.',
  emptyAction,
  height = 280,
  className,
  children,
}: TanStackChartContainerProps) {
  return (
    <Card className={cn('flex flex-col h-full rounded-2xl border-border/80 shadow-xs bg-card overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-5 pt-5">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            {icon && <span className="text-primary">{icon}</span>}
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-xs text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </CardHeader>

      <CardContent className="flex-1 px-4 pb-4 pt-2">
        {isLoading ? (
          <ChartSkeleton height={height} />
        ) : isEmpty ? (
          <div
            className="flex items-center justify-center w-full"
            style={{ height: `${height}px` }}
          >
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              action={emptyAction}
              className="border-none bg-transparent py-4"
            />
          </div>
        ) : (
          <div
            className="w-full relative"
            style={{ minHeight: `${height}px` }}
          >
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { ChartSkeleton } from '@/components/charts/tanstack/chart-skeleton';

export function DashboardLayoutSkeleton() {
  return (
    <div className="space-y-6 w-full animate-pulse">
      {/* 1. Header Banner Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full bg-card/60 p-6 rounded-3xl border border-border/60">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-7 w-56 rounded-lg" />
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>
          <Skeleton className="h-4 w-80 max-w-full rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      {/* 2. Filter Bar Skeleton */}
      <div className="flex items-center justify-between gap-3 w-full bg-card/40 p-3 rounded-2xl border border-border/40">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>

      {/* 3. 4 KPI Metric Cards Skeleton (1:1 geometry) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5 rounded-2xl border border-border/60 bg-card/60 min-h-[128px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="size-8 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-36 my-2" />
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3.5 w-12 rounded-full" />
            </div>
          </Card>
        ))}
      </div>

      {/* 4. Main Analytic Grid Skeleton (2/3 + 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left Column (2 Cols): Area / Line Chart Skeleton */}
        <div className="lg:col-span-2 bg-card/60 rounded-2xl border border-border/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-20" />
          </div>
          <ChartSkeleton height={260} />
        </div>

        {/* Right Column (1 Col): Donut Distribution Skeleton */}
        <div className="bg-card/60 rounded-2xl border border-border/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="size-6 rounded-md" />
          </div>
          <div className="flex items-center justify-center py-6">
            <Skeleton className="size-40 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      </div>

      {/* 5. Lower Grid: Urgent Items List Skeleton */}
      <div className="bg-card/60 rounded-2xl border border-border/60 p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-4 w-20" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border/20">
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

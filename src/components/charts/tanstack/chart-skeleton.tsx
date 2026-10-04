import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartSkeletonProps {
  height?: number | string;
  className?: string;
}

export function ChartSkeleton({ height = 280, className }: ChartSkeletonProps) {
  return (
    <div
      className={cn('w-full flex flex-col justify-between py-4 px-2 space-y-4', className)}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div className="flex items-center justify-between w-full">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex-1 w-full flex flex-col justify-around py-2">
        <div className="w-full h-px bg-muted/40" />
        <div className="w-full h-px bg-muted/40" />
        <div className="w-full h-px bg-muted/40" />
        <div className="w-full h-px bg-muted/40" />
      </div>
      <div className="flex items-center justify-between w-full pt-2">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  );
}

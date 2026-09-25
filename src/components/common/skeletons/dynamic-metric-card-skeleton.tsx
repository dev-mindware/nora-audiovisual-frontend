import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function DynamicMetricCardSkeleton({ className }: { className?: string }) {
    return (
        <Card className={cn("border shadow-none overflow-hidden py-1.5 sm:py-2 bg-gradient-to-t from-primary/[0.02] to-card animate-pulse", className)}>
            <CardContent className="p-2.5 sm:p-3 md:p-4">
                <div className="flex flex-col space-y-2 sm:space-y-3">
                    <div className="space-y-1 sm:space-y-2">
                        <div className="flex justify-between items-start gap-1.5">
                            <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 bg-muted/60" />
                            <Skeleton className="size-6 sm:size-8 rounded-md bg-muted/40" />
                        </div>
                        <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 bg-muted/50" />
                    </div>
                    <div className="mt-1 sm:mt-2 text-transparent">
                        <Skeleton className="h-3.5 sm:h-4 w-full bg-muted/30" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
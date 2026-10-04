"use client";

import {
    Icon,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components";
import {
    DASHBOARD_PERIODS,
    useDashboardPeriod,
} from "@/hooks/reports/use-dashboard-overview";
import type { DashboardPeriodType } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Selector de período do dashboard. Lê e escreve directamente no search param,
 * por isso pode ser montado no cabeçalho da página, longe dos gráficos.
 */
export function OverviewPeriodSelect() {
    const { period, setPeriod } = useDashboardPeriod();
    const isFiltered = Boolean(period);

    return (
        <Select
            value={period}
            onValueChange={(next) => setPeriod(next as DashboardPeriodType)}
        >
            <SelectTrigger
                className={cn(
                    "w-[170px] shrink-0 rounded-none transition-colors",
                    isFiltered
                        ? "border-primary text-primary bg-primary/10 hover:bg-primary/15 font-medium"
                        : "border-input text-muted-foreground bg-transparent hover:bg-muted/40 hover:text-foreground font-normal"
                )}
                aria-label="Período do dashboard"
            >
                <Icon
                    name="Calendar"
                    className={cn(
                        "size-4",
                        isFiltered ? "text-primary" : "text-muted-foreground"
                    )}
                />
                <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-none">
                {DASHBOARD_PERIODS.filter((opt) => opt.label.toLowerCase() !== "todos").map((option) => (
                    <SelectItem key={option.value} value={option.value} className="rounded-none">
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

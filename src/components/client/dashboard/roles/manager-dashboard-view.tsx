'use client';

import React from 'react';
import { TitleList, EmptyState } from '@/components';
import { useDashboardFilters, useRoleDashboardMetrics } from '@/hooks/dashboard';
import { DashboardLayoutSkeleton } from '../skeletons/dashboard-layout-skeleton';
import { cn } from '@/lib/utils';
import {
  DashboardPeriodSelect,
  MindgestKpiGrid,
  MindgestAreaChart,
  MindgestDonutChart,
  MindgestBarChart,
  MindgestUrgentItems,
  MindgestQuickActions,
} from '../widgets';

export function ManagerDashboardView() {
  const { filters } = useDashboardFilters();
  const { data, isLoading, isFetching, isError, refetch } = useRoleDashboardMetrics({
    ...filters,
    role: 'MANAGER',
  });

  if (isLoading) {
    return <DashboardLayoutSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="w-full p-8 text-center bg-card rounded-md border border-destructive/30 space-y-3">
        <p className="text-sm font-semibold text-destructive">
          Erro ao carregar o painel do estúdio.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-xs bg-primary text-primary-foreground rounded-md font-medium shadow-xs hover:bg-primary/90 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const areaSeries = [
    { key: 'occupancy', label: 'Taxa de Ocupação (%)', color: 'var(--primary)' },
    { key: 'revenue', label: 'Receita de Locação', color: '#10b981' },
  ];

  const donutSlices = (data.charts.distribution || []).map((d, idx) => ({
    key: `dist-man-${idx}`,
    label: d.label,
    value: d.value,
    color: d.color,
  }));

  const capacityData = (data.charts.capacityOrWorkload || []).map((c) => ({
    label: c.label,
    value: c.value,
  }));

  return (
    <div className={cn("flex flex-col gap-5 md:gap-6 transition-opacity duration-200", isFetching && "opacity-75")}>
      <TitleList
        title="Painel de Gestão de Estúdio"
        suTitle="Taxas de ocupação dos plateaus, reservas, faturamento da unidade e equipamentos"
      >
        <DashboardPeriodSelect isFetching={isFetching} />
      </TitleList>

      <MindgestKpiGrid kpis={data.kpis} />

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MindgestAreaChart
            title="Ocupação & Rentabilidade dos Plateaus"
            description="Percentual de ocupação diária e rendimento de estúdio"
            icon="Building2"
            data={data.charts.primaryEvolution}
            series={areaSeries}
            xAxisKey="label"
            isCurrency={true}
            height={280}
          />
        </div>
        <div>
          <MindgestDonutChart
            title="Sessões por Tipo"
            icon="ChartPie"
            slices={donutSlices}
            centerLabel="Sessões"
            isCurrency={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div>
          <MindgestUrgentItems
            title="Reservas da Semana"
            icon="Calendar"
            items={data.urgentItems}
            href="/studio"
            actionLabel="Ver estúdio"
            emptyMessage="Nenhuma reserva agendada para os próximos dias."
          />
        </div>
        <div>
          <MindgestBarChart
            title="Disponibilidade dos Estúdios"
            description="Horas ocupadas contra capacidade nominal de plateau"
            icon="Clock"
            data={capacityData}
            color="var(--primary)"
            height={240}
          />
        </div>
        <div>
          <MindgestQuickActions
            title="Ações do Estúdio"
            icon="Building"
            actions={data.quickActions}
          />
        </div>
      </div>
    </div>
  );
}

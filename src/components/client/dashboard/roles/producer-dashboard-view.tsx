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

export function ProducerDashboardView() {
  const { filters } = useDashboardFilters();
  const { data, isLoading, isFetching, isError, refetch } = useRoleDashboardMetrics({
    ...filters,
    role: 'PRODUCER',
  });

  if (isLoading) {
    return <DashboardLayoutSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="w-full p-8 text-center bg-card rounded-md border border-destructive/30 space-y-3">
        <p className="text-sm font-semibold text-destructive">
          Erro ao carregar o painel da produção.
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
    { key: 'sets', label: 'Diárias de Rodagem', color: 'var(--primary)' },
    { key: 'projectsActive', label: 'Projectos em Filmagem', color: '#3b82f6' },
  ];

  const donutSlices = (data.charts.distribution || []).map((d, idx) => ({
    key: `dist-prod-${idx}`,
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
        title="Painel do Produtor"
        suTitle="Gestão de diárias de rodagem, planos de produção e alocação de equipas"
      >
        <DashboardPeriodSelect isFetching={isFetching} />
      </TitleList>

      <MindgestKpiGrid kpis={data.kpis} />

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MindgestAreaChart
            title="Intensidade de Rodagens & Sets"
            description="Diárias agendadas e projectos simultâneos em set"
            icon="Clapperboard"
            data={data.charts.primaryEvolution}
            series={areaSeries}
            xAxisKey="label"
            isCurrency={false}
            height={280}
          />
        </div>
        <div>
          <MindgestDonutChart
            title="Produções por Etapa"
            icon="ChartPie"
            slices={donutSlices}
            centerLabel="Produções"
            isCurrency={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div>
          <MindgestUrgentItems
            title="Próximas Diárias & Rodagens"
            icon="Calendar"
            items={data.urgentItems}
            href="/studio"
            actionLabel="Ver agenda"
            emptyMessage="Nenhuma diária marcada para breve."
          />
        </div>
        <div>
          <MindgestBarChart
            title="Alocação de Material Técnico"
            description="Disponibilidade de kits de câmara, luz e maquinaria"
            icon="Camera"
            data={capacityData}
            color="var(--primary)"
            height={240}
          />
        </div>
        <div>
          <MindgestQuickActions
            title="Ações do Produtor"
            icon="Zap"
            actions={data.quickActions}
          />
        </div>
      </div>
    </div>
  );
}

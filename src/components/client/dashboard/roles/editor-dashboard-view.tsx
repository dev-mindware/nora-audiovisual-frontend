'use client';

import React from 'react';
import { TitleList, EmptyState } from '@/components';
import { useDashboardFilters, useRoleDashboardMetrics } from '@/hooks/dashboard';
import { DashboardLayoutSkeleton } from '../skeletons/dashboard-layout-skeleton';
import {
  DashboardPeriodSelect,
  MindgestKpiGrid,
  MindgestAreaChart,
  MindgestDonutChart,
  MindgestBarChart,
  MindgestUrgentItems,
  MindgestQuickActions,
} from '../widgets';

export function EditorDashboardView() {
  const { filters } = useDashboardFilters();
  const { data, isLoading, isError, refetch } = useRoleDashboardMetrics({
    ...filters,
    role: 'EDITOR',
  });

  if (isLoading) {
    return <DashboardLayoutSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="w-full p-8 text-center bg-card rounded-md border border-destructive/30 space-y-3">
        <p className="text-sm font-semibold text-destructive">
          Erro ao carregar o painel da pós-produção.
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
    { key: 'versions', label: 'Versões Exportadas', color: 'var(--primary)' },
  ];

  const donutSlices = (data.charts.distribution || []).map((d, idx) => ({
    key: `dist-ed-${idx}`,
    label: d.label,
    value: d.value,
    color: d.color,
  }));

  const capacityData = (data.charts.capacityOrWorkload || []).map((c) => ({
    label: c.label,
    value: c.value,
  }));

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <TitleList
        title="Painel de Pós-Produção"
        suTitle="Edição, gradação de cor, cortes em revisão e entregas finais"
      >
        <DashboardPeriodSelect />
      </TitleList>

      <MindgestKpiGrid kpis={data.kpis} />

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MindgestAreaChart
            title="Fluxo de Versões & Exportações"
            description="Cortes enviados e masters exportados nas últimas semanas"
            icon="Film"
            data={data.charts.primaryEvolution}
            series={areaSeries}
            xAxisKey="label"
            isCurrency={false}
            height={280}
          />
        </div>
        <div>
          <MindgestDonutChart
            title="Formatos de Entregáveis"
            icon="ChartPie"
            slices={donutSlices}
            centerLabel="Total Vídeos"
            isCurrency={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div>
          <MindgestUrgentItems
            title="Cortes Aguardando Aprovação"
            icon="Video"
            items={data.urgentItems}
            href="/deliverables"
            actionLabel="Ver cortes"
            emptyMessage="Nenhum entregável pendente de aprovação."
          />
        </div>
        <div>
          <MindgestBarChart
            title="Progresso das Ilhas de Edição"
            description="Alocação e status das estações de montagem e cor"
            icon="MonitorPlay"
            data={capacityData}
            color="var(--primary)"
            height={240}
          />
        </div>
        <div>
          <MindgestQuickActions
            title="Ações de Pós-Produção"
            icon="Sparkles"
            actions={data.quickActions}
          />
        </div>
      </div>
    </div>
  );
}

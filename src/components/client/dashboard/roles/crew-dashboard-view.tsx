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

export function CrewDashboardView() {
  const { filters } = useDashboardFilters();
  const { data, isLoading, isError, refetch } = useRoleDashboardMetrics({
    ...filters,
    role: 'CREW',
  });

  if (isLoading) {
    return <DashboardLayoutSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="w-full p-8 text-center bg-card rounded-md border border-destructive/30 space-y-3">
        <p className="text-sm font-semibold text-destructive">
          Erro ao carregar o painel da equipa técnica.
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
    { key: 'gearUsage', label: 'Carga de Equipamento (%)', color: 'var(--primary)' },
  ];

  const donutSlices = (data.charts.distribution || []).map((d, idx) => ({
    key: `dist-crew-${idx}`,
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
        title="Painel Técnico & Rodagem"
        suTitle="Gestão de material de câmara, iluminação, som e assistência de set"
      >
        <DashboardPeriodSelect />
      </TitleList>

      <MindgestKpiGrid kpis={data.kpis} />

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MindgestAreaChart
            title="Taxa de Utilização de Equipamentos"
            description="Intensidade de uso dos kits de filmagem ao longo das semanas"
            icon="Camera"
            data={data.charts.primaryEvolution}
            series={areaSeries}
            xAxisKey="label"
            isCurrency={false}
            height={280}
          />
        </div>
        <div>
          <MindgestDonutChart
            title="Estado do Inventário"
            icon="Boxes"
            slices={donutSlices}
            centerLabel="Total Itens"
            isCurrency={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div>
          <MindgestUrgentItems
            title="Material em Filmagem / Campo"
            icon="Camera"
            items={data.urgentItems}
            href="/equipment"
            actionLabel="Ver armazém"
            emptyMessage="Nenhum equipamento em campo atualmente."
          />
        </div>
        <div>
          <MindgestBarChart
            title="Disponibilidade Técnica"
            description="Kits prontos para reserva e manutenção técnica"
            icon="Wrench"
            data={capacityData}
            color="var(--primary)"
            height={240}
          />
        </div>
        <div>
          <MindgestQuickActions
            title="Ações Técnicas"
            icon="Wrench"
            actions={data.quickActions}
          />
        </div>
      </div>
    </div>
  );
}

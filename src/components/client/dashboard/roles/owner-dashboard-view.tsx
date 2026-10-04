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

export function OwnerDashboardView() {
  const { filters } = useDashboardFilters();
  const { data, isLoading, isFetching, isError, refetch } = useRoleDashboardMetrics({
    ...filters,
    role: 'OWNER',
  });

  if (isLoading) {
    return <DashboardLayoutSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="w-full p-8 text-center bg-card rounded-md border border-destructive/30 space-y-3">
        <p className="text-sm font-semibold text-destructive">
          Erro ao carregar o dashboard do proprietário.
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
    { key: 'revenue', label: 'Receita', color: 'var(--primary)' },
    { key: 'expenses', label: 'Despesas', color: 'var(--destructive)' },
    { key: 'profit', label: 'Lucro Líquido', color: '#22c55e' },
  ];

  const donutSlices = (data.charts.distribution || []).map((d, idx) => ({
    key: `dist-${idx}`,
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
      {/* 1. Cabeçalho com Título, Subtítulo e Selector de Período Dropdown no Lado Direito */}
      <TitleList
        title="Painel do Proprietário"
        suTitle="Resumo financeiro, rentabilidade líquida e pipeline de produções"
      >
        <DashboardPeriodSelect isFetching={isFetching} />
      </TitleList>

      {/* 2. 4 Cartões KPI no Padrão Mindgest */}
      <MindgestKpiGrid kpis={data.kpis} />

      {/* 4. Linha 1 de Gráficos (Evolução Financeira DRE + Donut de Linhas de Negócio) */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MindgestAreaChart
            title="Evolução Financeira & DRE"
            description="Faturamento bruto versus despesas operacionais e margem"
            icon="ChartLine"
            data={data.charts.primaryEvolution}
            series={areaSeries}
            xAxisKey="label"
            isCurrency={true}
            height={280}
          />
        </div>
        <div>
          <MindgestDonutChart
            title="Receita por Segmento"
            icon="ChartPie"
            slices={donutSlices}
            centerLabel="Total Kz"
            isCurrency={true}
          />
        </div>
      </div>

      {/* 5. Linha 2 de Cards (Orçamentos Pendentes, Capacidade de Material e Ações Rápidas) */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div>
          <MindgestUrgentItems
            title="Orçamentos em Negociação"
            icon="FileSpreadsheet"
            items={data.urgentItems}
            href="/commercial"
            actionLabel="Ver orçamentos"
            emptyMessage="Nenhum orçamento pendente de aprovação."
          />
        </div>
        <div>
          <MindgestBarChart
            title="Inventário de Equipamentos"
            description="Distribuição do parque de câmaras, óticas e iluminação"
            icon="Camera"
            data={capacityData}
            color="var(--primary)"
            height={240}
          />
        </div>
        <div>
          <MindgestQuickActions
            title="Ações do Proprietário"
            icon="Zap"
            actions={data.quickActions}
          />
        </div>
      </div>
    </div>
  );
}

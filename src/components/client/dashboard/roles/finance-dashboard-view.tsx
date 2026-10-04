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

export function FinanceDashboardView() {
  const { filters } = useDashboardFilters();
  const { data, isLoading, isError, refetch } = useRoleDashboardMetrics({
    ...filters,
    role: 'FINANCE',
  });

  if (isLoading) {
    return <DashboardLayoutSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="w-full p-8 text-center bg-card rounded-md border border-destructive/30 space-y-3">
        <p className="text-sm font-semibold text-destructive">
          Erro ao carregar o painel financeiro.
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
    { key: 'revenue', label: 'Entradas / Faturação', color: 'var(--primary)' },
    { key: 'expenses', label: 'Saídas / Custos', color: 'var(--destructive)' },
    { key: 'profit', label: 'Saldo Operacional', color: '#22c55e' },
  ];

  const donutSlices = (data.charts.distribution || []).map((d, idx) => ({
    key: `dist-fin-${idx}`,
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
        title="Painel Financeiro & Tesouraria"
        suTitle="Controlo de contas a pagar/receber, conciliação e fluxo de caixa"
      >
        <DashboardPeriodSelect />
      </TitleList>

      <MindgestKpiGrid kpis={data.kpis} />

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MindgestAreaChart
            title="Fluxo de Caixa & Custos Operacionais"
            description="Entradas liquidadas contra despesas e saídas de caixa"
            icon="CreditCard"
            data={data.charts.primaryEvolution}
            series={areaSeries}
            xAxisKey="label"
            isCurrency={true}
            height={280}
          />
        </div>
        <div>
          <MindgestDonutChart
            title="Centros de Custo"
            icon="ChartPie"
            slices={donutSlices}
            centerLabel="Total Kz"
            isCurrency={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div>
          <MindgestUrgentItems
            title="Faturas & Pagamentos Pendentes"
            icon="Receipt"
            items={data.urgentItems}
            href="/invoicing"
            actionLabel="Ver faturas"
            emptyMessage="Nenhuma fatura em aberto no período."
          />
        </div>
        <div>
          <MindgestBarChart
            title="Distribuição de Contas"
            description="Equilíbrio entre pagamentos pendentes e confirmados"
            icon="Wallet"
            data={capacityData}
            color="var(--primary)"
            height={240}
          />
        </div>
        <div>
          <MindgestQuickActions
            title="Ações Financeiras"
            icon="Banknote"
            actions={data.quickActions}
          />
        </div>
      </div>
    </div>
  );
}

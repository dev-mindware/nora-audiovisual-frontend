'use client';

import React from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { useDashboardFilters, useRoleDashboardMetrics } from '@/hooks/dashboard';
import { DashboardHeaderBanner } from '../widgets/dashboard-header-banner';
import { DashboardFilterBar } from '../widgets/dashboard-filter-bar';
import { KpiMetricCard } from '../widgets/kpi-metric-card';
import { UrgentItemsCard } from '../widgets/urgent-items-card';
import { DashboardLayoutSkeleton } from '../skeletons/dashboard-layout-skeleton';
import {
  TanStackChartContainer,
  TanStackAreaChart,
  TanStackDonutChart,
  TanStackBarChart,
} from '@/components/charts';
import { DollarSign, Clapperboard, Camera, Sparkles, TrendingUp, PieChart, BarChart2 } from 'lucide-react';
import type { Role } from '@/types';

interface RoleDashboardTemplateProps {
  forcedRole?: Role;
}

export function RoleDashboardTemplate({ forcedRole }: RoleDashboardTemplateProps) {
  const { user } = useAuth();
  const { filters } = useDashboardFilters();

  const effectiveRole = forcedRole || user?.role || 'OWNER';

  // Chamada 100% REAL ao backend via React Query
  const { data, isLoading, isError, refetch } = useRoleDashboardMetrics({
    ...filters,
    role: effectiveRole,
  });

  if (isLoading) {
    return <DashboardLayoutSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="w-full p-8 text-center bg-card rounded-2xl border border-destructive/30 space-y-3">
        <p className="text-sm font-semibold text-destructive">
          Não foi possível carregar as métricas do painel neste momento.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-xs bg-primary text-primary-foreground rounded-lg font-medium shadow-xs hover:bg-primary/90 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const kpiEntries = Object.entries(data.kpis || {});

  const getKpiIcon = (index: number) => {
    switch (index) {
      case 0:
        return <DollarSign className="size-4" />;
      case 1:
        return <Clapperboard className="size-4" />;
      case 2:
        return <Camera className="size-4" />;
      case 3:
      default:
        return <Sparkles className="size-4" />;
    }
  };

  const getKpiVariant = (index: number) => {
    const variants: ('primary' | 'success' | 'blue' | 'purple')[] = [
      'primary',
      'success',
      'blue',
      'purple',
    ];
    return variants[index % variants.length];
  };

  return (
    <div className="@container/main w-full space-y-6">
      {/* 1. Header com Saudação, Role e Atalhos Rápidos */}
      <DashboardHeaderBanner
        userName={user?.name}
        role={data.role}
        quickActions={data.quickActions}
      />

      {/* 2. Barra de Filtros Sincronizada na URL via Nuqs */}
      <DashboardFilterBar />

      {/* 3. Grid de KPIs (4 Cards com Formatação Especializada) */}
      <div className="grid grid-cols-1 @sm:grid-cols-2 @xl:grid-cols-4 gap-4 w-full">
        {kpiEntries.slice(0, 4).map(([key, item], idx) => (
          <KpiMetricCard
            key={key}
            item={item}
            icon={getKpiIcon(idx)}
            variant={getKpiVariant(idx)}
          />
        ))}
      </div>

      {/* 4. Gráficos Principais com TanStack Charts (Área/Evolução + Donut de Distribuição) */}
      <div className="grid grid-cols-1 @2xl:grid-cols-3 gap-6 w-full">
        {/* Gráfico de Evolução (2 Colunas) */}
        <div className="@2xl:col-span-2">
          <TanStackChartContainer
            title="Evolução do Período"
            description="Histórico temporal com agregação em tempo real do banco de dados"
            icon={<TrendingUp className="size-4" />}
            height={260}
            isEmpty={!data.charts.primaryEvolution || data.charts.primaryEvolution.length === 0}
            emptyTitle="Sem dados de evolução"
            emptyDescription="Ainda não existem registos suficientes para traçar a curva de tendência."
          >
            <TanStackAreaChart
              data={data.charts.primaryEvolution}
              primaryKey="revenue"
              secondaryKey="expenses"
              height={260}
            />
          </TanStackChartContainer>
        </div>

        {/* Gráfico de Donut / Distribuição (1 Coluna) */}
        <div className="@2xl:col-span-1">
          <TanStackChartContainer
            title="Composição & Categorias"
            description="Distribuição por rubrica ou tipo de serviço"
            icon={<PieChart className="size-4" />}
            height={260}
            isEmpty={!data.charts.distribution || data.charts.distribution.length === 0}
            emptyTitle="Sem dados de categorias"
            emptyDescription="Nenhum item categorizado no período selecionado."
          >
            <TanStackDonutChart
              data={data.charts.distribution}
              height={210}
            />
          </TanStackChartContainer>
        </div>
      </div>

      {/* 5. Seção de Capacidade / Carga de Trabalho (Opcional se fornecido pelo backend) */}
      {data.charts.capacityOrWorkload && data.charts.capacityOrWorkload.length > 0 && (
        <TanStackChartContainer
          title="Capacidade Operacional & Alocação"
          description="Volume de trabalho e disponibilidade de recursos"
          icon={<BarChart2 className="size-4" />}
          height={200}
        >
          <TanStackBarChart
            data={data.charts.capacityOrWorkload}
            height={200}
          />
        </TanStackChartContainer>
      )}

      {/* 6. Lista de Itens Urgentes & Pendências com Empty State Integrado */}
      <UrgentItemsCard
        items={data.urgentItems}
        title="Pendências Críticas & Itens em Aberto"
        emptyTitle="Tudo em dia!"
        emptyDescription="Não existem tarefas atrasadas, orçamentos pendentes ou aprovações em falta."
        viewAllHref="/projects"
      />
    </div>
  );
}

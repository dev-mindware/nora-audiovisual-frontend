'use client';

import React from 'react';
import Link from 'next/link';
import { TitleList, GenericTable, Column, ItemStatusBadge, Button } from '@/components';
import { useDashboardFilters, useRoleDashboardMetrics } from '@/hooks/dashboard';
import { useAdmin } from '@/hooks/admin';
import { TenantAdminItem } from '@/services/admin-service';
import { AdminMetricsCards } from '@/components/client/admin/admin-metrics-cards';
import { TenantDetailsModal } from '@/components/client/admin/tenants/tenant-details-modal';
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
import {
  HardDrive,
  ShieldCheck,
  Cpu,
  ArrowRight,
  ExternalLink,
  Building2,
  Activity,
} from 'lucide-react';

export function AdminDashboardView() {
  const { filters } = useDashboardFilters();
  const { data, isLoading, isError, refetch, isFetching } = useRoleDashboardMetrics({
    ...filters,
    role: 'ADMIN',
  });

  const {
    stats,
    isLoadingStats,
    tenants,
    isLoadingTenants,
    openTenantDetails,
  } = useAdmin();

  if (isLoading) {
    return <DashboardLayoutSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="w-full p-8 text-center bg-card rounded-xs border border-destructive/30 space-y-3">
        <p className="text-sm font-semibold text-destructive">
          Erro ao carregar o painel administrativo.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-xs bg-primary text-primary-foreground rounded-xs font-medium shadow-xs hover:bg-primary/90 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const areaSeries = [
    { key: 'revenue', label: 'Volume Facturado', color: 'var(--primary)' },
    { key: 'expenses', label: 'Despesas Globais', color: 'var(--destructive)' },
    { key: 'projectsActive', label: 'Projectos Concorrentes', color: '#3b82f6' },
  ];

  const donutSlices = (data.charts.distribution || []).map((d, idx) => ({
    key: `dist-admin-${idx}`,
    label: d.label,
    value: d.value,
    color: d.color,
  }));

  const capacityData = (data.charts.capacityOrWorkload || []).map((c) => ({
    label: c.label,
    value: c.value,
  }));

  const recentTenants = (tenants || []).slice(0, 5);

  const tenantColumns: Column<TenantAdminItem>[] = [
    {
      key: 'name',
      header: 'Produtora',
      render: (_, item) => (
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-foreground text-sm truncate">{item.name}</span>
          <span className="text-xs font-mono text-muted-foreground truncate">{item.slug}</span>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Responsável',
      render: (_, item) => (
        <div className="flex flex-col text-xs min-w-0">
          <span className="text-foreground font-medium truncate">{item.owner?.name || '—'}</span>
          <span className="text-muted-foreground font-mono truncate">{item.owner?.email}</span>
        </div>
      ),
    },
    {
      key: 'subscription',
      header: 'Plano',
      render: (_, item) => (
        <span className="font-semibold text-xs text-primary font-mono uppercase">
          {item.subscription?.planCode || 'INICIAL'}
        </span>
      ),
    },
    {
      key: 'metrics',
      header: 'Quotas & Recursos',
      render: (_, item) => (
        <div className="text-xs text-muted-foreground font-mono tabular-nums">
          {item.metrics?.membersCount || 0} membros • {item.metrics?.projectsCount || 0} proj • {item.metrics?.storageUsedGb || 0} GB
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (_, item) => <ItemStatusBadge status={item.status} />,
    },
    {
      key: 'action',
      header: 'Ação',
      render: (_, item) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => openTenantDetails(item)}
          className="text-xs h-7 px-2.5 rounded-none border-border hover:bg-primary/10 hover:text-primary gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          <span>Detalhes</span>
        </Button>
      ),
    },
  ];

  return (
    <div className={`flex flex-col gap-6 w-full transition-opacity duration-200 ${isFetching ? 'opacity-70' : 'opacity-100'}`}>
      {/* 1. Header & Live Period Filter */}
      <TitleList
        title="Painel de Administração"
        suTitle="Supervisão executiva da plataforma Nora, infraestrutura cloud e governança multi-tenant"
      >
        <DashboardPeriodSelect isFetching={isFetching} />
      </TitleList>

      {/* 2. Platform Architecture & Engine Pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border border-border bg-card/60 backdrop-blur rounded-xs text-xs">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </div>
          <span className="font-semibold text-foreground tracking-tight">
            Nora Cloud Engine • 99.98% Uptime Operacional
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-muted-foreground font-mono text-[11px]">
          <span className="flex items-center gap-1.5 px-2 py-0.5 border border-border bg-muted/30">
            <HardDrive className="h-3 w-3 text-amber-500" />
            R2/S3:{' '}
            {stats?.totalStorageTb != null
              ? stats.totalStorageTb.toFixed(2)
              : stats?.totalStorageGb != null
                ? (stats.totalStorageGb / 1024).toFixed(2)
                : '0.00'}{' '}
            TB
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 border border-border bg-muted/30">
            <Cpu className="h-3 w-3 text-primary" />
            Transcoder 720p: Ativo
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 border border-border bg-muted/30">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            Trial: 7 Dias
          </span>
        </div>
      </div>

      {/* 3. Executive Platform Global Metrics (MRR, Tenants, Storage, Users) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Métricas Globais da Plataforma
          </span>
          <Link href="/admin" className="text-xs text-primary hover:underline flex items-center gap-1 font-mono">
            Centro de Controlo <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <AdminMetricsCards stats={stats} isLoading={isLoadingStats} />
      </div>

      {/* 4. Filtered Period Operational KPIs */}
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
          Operações no Período Selecionado
        </span>
        <MindgestKpiGrid kpis={data.kpis} />
      </div>

      {/* 5. Dual-Engine Charts: Evolution & Plan/Operational Distribution */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MindgestAreaChart
            title="Actividade Operacional & Financeira"
            description="Acompanhamento consolidado de projectos activos e facturação"
            icon="Activity"
            data={data.charts.primaryEvolution}
            series={areaSeries}
            xAxisKey="label"
            isCurrency={true}
            height={280}
          />
        </div>
        <div>
          <MindgestDonutChart
            title="Distribuição Operacional"
            icon="ChartPie"
            slices={donutSlices}
            centerLabel="Total"
            isCurrency={false}
          />
        </div>
      </div>

      {/* 6. Operational Workloads & Admin Shortcuts */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div>
          <MindgestUrgentItems
            title="Projectos em Destaque"
            icon="FolderKanban"
            items={data.urgentItems}
            href="/projects"
            actionLabel="Ver projectos"
            emptyMessage="Nenhum projecto em estado crítico."
          />
        </div>
        <div>
          <MindgestBarChart
            title="Parque de Equipamentos"
            description="Equipamentos disponíveis, em filmagem ou manutenção"
            icon="Boxes"
            data={capacityData}
            color="var(--primary)"
            height={240}
          />
        </div>
        <div>
          <MindgestQuickActions
            title="Ações de Administração"
            icon="ShieldAlert"
            actions={data.quickActions}
          />
        </div>
      </div>

      {/* 7. Multi-Tenant Organizations Overview with Responsive Card/Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Produtoras &amp; Estúdios Ativos na Plataforma
          </h3>
          <Link href="/admin/tenants">
            <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
              Gerir todas ({tenants?.length || 0}) <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <GenericTable<TenantAdminItem>
          data={recentTenants}
          columns={tenantColumns}
          emptyMessage="Nenhuma produtora registada"
        />
      </div>

      <TenantDetailsModal />
    </div>
  );
}

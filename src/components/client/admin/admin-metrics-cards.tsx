'use client';

import { PlatformStats } from '@/services/admin-service';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DynamicMetricCard } from '@/components';

interface AdminMetricsCardsProps {
  stats?: PlatformStats | null;
  isLoading?: boolean;
}

export function AdminMetricsCards({ stats, isLoading = false }: AdminMetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Card key={`metric-skeleton-${idx}`} className="bg-card p-4 rounded-xs border border-border shadow-none space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-4 w-4 rounded-xs" />
            </div>
            <Skeleton className="h-6 w-28 mt-2" />
            <Skeleton className="h-3 w-32 mt-0.5" />
          </Card>
        ))}
      </div>
    );
  }

  const retentionPercent = stats?.totalTenants
    ? Math.round(((stats.activeTenants || 0) / stats.totalTenants) * 100)
    : 0;

  const storageDisplayTb = stats?.totalStorageTb != null
    ? stats.totalStorageTb.toFixed(2)
    : stats?.totalStorageGb != null
      ? (stats.totalStorageGb / 1024).toFixed(2)
      : '0.00';

  const formatKz = (val: number) =>
    new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
      <DynamicMetricCard
        subtitle="MRR Estimado"
        title={formatKz(stats?.mrrKz ?? 0)}
        icon="DollarSign"
        description="Receita recorrente mensal"
      />

      <DynamicMetricCard
        subtitle="Produtoras Ativas"
        title={`${stats?.activeTenants ?? 0} / ${stats?.totalTenants ?? 0}`}
        icon="Building2"
        description={`${retentionPercent}% de retenção`}
      />

      <DynamicMetricCard
        subtitle="Utilizadores Globais"
        title={stats?.totalUsers ?? 0}
        icon="Users"
        description="Membros na plataforma"
      />

      <DynamicMetricCard
        subtitle="Projectos na Plataforma"
        title={stats?.totalProjects ?? 0}
        icon="FolderKanban"
        description="Produções geridas"
      />

      <DynamicMetricCard
        subtitle="Armazenamento S3/R2"
        title={`${storageDisplayTb} TB`}
        icon="HardDrive"
        description="Footage, proxies e masters"
        className="sm:col-span-2 lg:col-span-1"
      />
    </div>
  );
}

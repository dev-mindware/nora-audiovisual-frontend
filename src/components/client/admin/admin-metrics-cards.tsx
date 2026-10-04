'use client';

import { DollarSign, Building2, Users, FolderKanban, HardDrive } from 'lucide-react';
import { PlatformStats } from '@/services/admin-service';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminMetricsCardsProps {
  stats?: PlatformStats | null;
  isLoading?: boolean;
}

export function AdminMetricsCards({ stats, isLoading = false }: AdminMetricsCardsProps) {
  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value);
  };

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
      <Card className="bg-card p-4 rounded-xs border border-border shadow-none">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>MRR Estimado</span>
          <DollarSign className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="text-lg font-semibold tabular-nums text-foreground mt-2">
          {formatKz(stats?.mrrKz ?? 0)}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">Receita recorrente mensal</div>
      </Card>

      <Card className="bg-card p-4 rounded-xs border border-border shadow-none">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>Produtoras Ativas</span>
          <Building2 className="h-4 w-4 text-primary" />
        </div>
        <div className="text-lg font-semibold tabular-nums text-foreground mt-2">
          {stats?.activeTenants ?? 0}{' '}
          <span className="text-xs font-normal text-muted-foreground">/ {stats?.totalTenants ?? 0}</span>
        </div>
        <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">
          {retentionPercent}% de retenção
        </div>
      </Card>

      <Card className="bg-card p-4 rounded-xs border border-border shadow-none">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>Utilizadores Totais</span>
          <Users className="h-4 w-4 text-primary" />
        </div>
        <div className="text-lg font-semibold tabular-nums text-foreground mt-2">
          {stats?.totalUsers ?? 0}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">Membros na plataforma</div>
      </Card>

      <Card className="bg-card p-4 rounded-xs border border-border shadow-none">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>Projetos em Rodagem</span>
          <FolderKanban className="h-4 w-4 text-purple-600" />
        </div>
        <div className="text-lg font-semibold tabular-nums text-foreground mt-2">
          {stats?.totalProjects ?? 0}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">Produções gerenciadas</div>
      </Card>

      <Card className="bg-card p-4 rounded-xs border border-border shadow-none sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>Armazenamento S3/R2</span>
          <HardDrive className="h-4 w-4 text-amber-600" />
        </div>
        <div className="text-lg font-semibold tabular-nums text-foreground mt-2">
          {storageDisplayTb} TB
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">Footage, proxies e masters</div>
      </Card>
    </div>
  );
}

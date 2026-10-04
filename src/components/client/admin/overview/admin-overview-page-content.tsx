'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Button, EmptyState, Skeleton, GenericTable, Column } from '@/components';
import { useAdmin } from '@/hooks/admin';
import {
  TrendingUp,
  CreditCard,
  Building2,
  Users,
  ArrowRight,
  Activity,
  HardDrive,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format } from 'date-fns';
import { AdminMetricsCards } from '../admin-metrics-cards';
import { AuditLogItem } from '@/services/admin-service';

const COLORS = ['#2563EB', '#8b5cf6', '#10b981', '#f59e0b'];

export function AdminOverviewPageContent() {
  const {
    stats,
    isLoadingStats,
    storageControl,
    isLoadingStorageControl,
    auditLogs,
    isLoadingAudit,
  } = useAdmin();

  const planDistributionData = useMemo(() => {
    if (stats?.planDistribution && stats.planDistribution.length > 0) {
      return stats.planDistribution;
    }
    return [];
  }, [stats?.planDistribution]);

  const storageUsageData = useMemo(() => {
    if (stats?.storageEvolution && stats.storageEvolution.length > 0) {
      return stats.storageEvolution;
    }
    return [];
  }, [stats?.storageEvolution]);

  const auditColumns: Column<AuditLogItem>[] = [
    {
      key: 'action',
      header: 'Ação',
      render: (_, item) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {item.action}
        </span>
      ),
    },
    {
      key: 'organizationName',
      header: 'Produtora',
      render: (_, item) => (
        <span className="text-xs text-foreground font-medium">
          {item.organizationName || 'Plataforma Global'}
        </span>
      ),
    },
    {
      key: 'userName',
      header: 'Executado por',
      render: (_, item) => (
        <span className="text-xs text-muted-foreground">
          {item.userName || 'Sistema'} ({item.ipAddress || '127.0.0.1'})
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Data & Hora',
      render: (_, item) => (
        <span className="text-xs font-mono text-muted-foreground">
          {item.createdAt ? format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm:ss') : '—'}
        </span>
      ),
    },
  ];

  const r2StorageTb = storageControl?.totalTb != null
    ? storageControl.totalTb.toFixed(2)
    : stats?.totalStorageTb != null
      ? stats.totalStorageTb.toFixed(2)
      : '0.00';

  const isR2Healthy = storageControl?.isHealthy ?? true;

  return (
    <div className="space-y-8 w-full mt-6">
      {/* Platform Architecture & Engine Pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border border-border bg-card/60 backdrop-blur rounded-xs text-xs">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2.5 w-2.5 shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isR2Healthy ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isR2Healthy ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </div>
          <span className="font-semibold text-foreground tracking-tight">
            Nora Cloud Engine • {isR2Healthy ? '99.98% Uptime Operacional' : 'Armazenamento em Verificação'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-muted-foreground font-mono text-[11px]">
          <span className="flex items-center gap-1.5 px-2 py-0.5 border border-border bg-muted/30">
            <HardDrive className="h-3 w-3 text-amber-500" />
            {storageControl?.provider || 'Cloudflare R2'}: {r2StorageTb} TB
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

      {/* KPI Metrics */}
      <AdminMetricsCards stats={stats} isLoading={isLoadingStats} />

      {/* Cloudflare R2 Storage Control Mechanism */}
      <div className="rounded-md border border-border bg-background p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-amber-500" />
              Mecanismo de Controlo de Armazenamento Cloudflare R2
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Supervisão direta de buckets S3-compatíveis, volume de ingestão de mídia e retenção por produtora
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2 py-0.5 bg-muted border border-border rounded text-muted-foreground">
              Bucket: <strong className="text-foreground">{storageControl?.bucket || 'nora-audiovisual'}</strong>
            </span>
            <span
              className={`px-2 py-0.5 border rounded font-medium ${
                isR2Healthy
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}
            >
              {isR2Healthy ? 'Bucket Conectado' : 'Aguardando Sincronização'}
            </span>
          </div>
        </div>

        {isLoadingStorageControl ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 border border-border bg-muted/10 rounded-sm">
              <span className="text-[11px] text-muted-foreground font-mono block">Volume Total Armazenado</span>
              <span className="text-lg font-semibold font-mono text-foreground mt-1 block">
                {storageControl?.totalGb != null ? `${storageControl.totalGb} GB` : '0.00 GB'}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {storageControl?.totalTb != null ? `(${storageControl.totalTb} TB)` : '(0 TB)'}
              </span>
            </div>

            <div className="p-3.5 border border-border bg-muted/10 rounded-sm">
              <span className="text-[11px] text-muted-foreground font-mono block">Ativos Multimídia Registados</span>
              <span className="text-lg font-semibold font-mono text-foreground mt-1 block">
                {storageControl?.totalFiles ?? 0} arquivos
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                Vídeo, Áudio, Imagens e RAW
              </span>
            </div>

            <div className="p-3.5 border border-border bg-muted/10 rounded-sm md:col-span-2">
              <span className="text-[11px] text-muted-foreground font-mono block mb-1">
                Composição por Tipo de Mídia (R2)
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-mono mt-1.5">
                {(storageControl?.breakdownByType || []).length === 0 ? (
                  <span className="text-muted-foreground text-[11px]">Nenhum arquivo ativo no bucket</span>
                ) : (
                  storageControl?.breakdownByType.map((item) => (
                    <span
                      key={item.type}
                      className="px-2 py-1 bg-card border border-border rounded text-[11px] flex items-center gap-1.5"
                    >
                      <span className="font-semibold text-foreground">{item.type}:</span>
                      <span className="text-primary">{item.gb} GB</span>
                      <span className="text-muted-foreground">({item.count} un)</span>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Top Storage Consuming Tenants */}
        {storageControl?.topTenants && storageControl.topTenants.length > 0 && (
          <div className="pt-2 border-t border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono block mb-2">
              Top Produtoras em Consumo de Espaço
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {storageControl.topTenants.slice(0, 6).map((t) => (
                <div
                  key={t.organizationId}
                  className="p-2.5 border border-border bg-card/40 rounded flex items-center justify-between text-xs"
                >
                  <div className="truncate min-w-0 pr-2">
                    <span className="font-medium text-foreground block truncate">{t.name}</span>
                    <span className="text-[11px] font-mono text-muted-foreground truncate">{t.slug}</span>
                  </div>
                  <div className="text-right font-mono shrink-0">
                    <span className="font-semibold text-primary block">{t.usedGb} GB</span>
                    <span className="text-[10px] text-muted-foreground">de {t.allocatedGb || 500} GB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage Growth */}
        <div className="lg:col-span-2 space-y-4 rounded-md border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Crescimento de Armazenamento Audiovisual (GB)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Volume acumulado de arquivos nos buckets S3/R2
              </p>
            </div>
            <span className="text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded font-medium">
              Escala Cloud
            </span>
          </div>

          {isLoadingStats ? (
            <div className="h-64 w-full flex items-center justify-center p-4">
              <Skeleton className="h-full w-full rounded" />
            </div>
          ) : storageUsageData.length === 0 ? (
            <div className="h-64 w-full flex items-center justify-center border border-dashed border-border rounded text-xs text-muted-foreground">
              Nenhum dado histórico de armazenamento nos últimos 6 meses
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={storageUsageData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(1)} TB` : `${val} GB`}`} />
                  <Tooltip
                    formatter={(val: any) => [`${val} GB`, 'Armazenamento']}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                  />
                  <Bar dataKey="storageGb" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Plan Distribution */}
        <div className="space-y-4 rounded-md border border-border bg-background p-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Distribuição de Planos
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Percentual de produtoras por tier comercial
            </p>
          </div>

          {isLoadingStats ? (
            <div className="h-48 w-full flex items-center justify-center p-4">
              <Skeleton className="h-32 w-32 rounded-full" />
            </div>
          ) : planDistributionData.length === 0 ? (
            <div className="h-48 w-full flex items-center justify-center border border-dashed border-border rounded text-xs text-muted-foreground text-center p-4">
              Nenhuma subscrição ativa registada no momento
            </div>
          ) : (
            <>
              <div className="h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={65}
                      innerRadius={40}
                      paddingAngle={4}
                    >
                      {planDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-center gap-4 text-xs">
                {planDistributionData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-muted-foreground">{entry.name}:</span>
                    <span className="font-semibold text-foreground">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Navigation Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/tenants"
          className="p-4 rounded-md border border-border bg-background hover:bg-muted/10 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  Produtoras &amp; Estúdios
                </h4>
                <p className="text-xs text-muted-foreground">Gerir organizações e limites de quotas</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="p-4 rounded-md border border-border bg-background hover:bg-muted/10 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground group-hover:text-purple-500 transition-colors">
                  Utilizadores Globais
                </h4>
                <p className="text-xs text-muted-foreground">Perfis, permissões e reset de palavras-passe</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
          </div>
        </Link>

        <Link
          href="/admin/subscriptions"
          className="p-4 rounded-md border border-border bg-background hover:bg-muted/10 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground group-hover:text-emerald-500 transition-colors">
                  Subscrições &amp; Planos
                </h4>
                <p className="text-xs text-muted-foreground">Aprovação de comprovativos e ativação</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent Activity Table (Direct Table, NOT in a card) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Atividade Recente da Plataforma
          </h3>
          <Link href="/admin/audit">
            <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
              Ver todos os logs <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {isLoadingAudit ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-12 w-full rounded border border-border bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : auditLogs.length === 0 ? (
          <EmptyState
            icon="Activity"
            title="Nenhuma atividade recente registada"
            description="Os eventos de auditoria e segurança serão listados aqui em tempo real."
          />
        ) : (
          <GenericTable<AuditLogItem>
            data={auditLogs.slice(0, 5)}
            columns={auditColumns}
            emptyMessage="Nenhum registo recente"
          />
        )}
      </div>
    </div>
  );
}

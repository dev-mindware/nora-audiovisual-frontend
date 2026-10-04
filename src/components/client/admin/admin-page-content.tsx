'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { UniversalTable } from '@/components/custom/universal-table';
import { Button, Badge, TitleList } from '@/components';
import { useAdmin } from '@/hooks/admin';
import { TenantAdminItem, AdminUserItem } from '@/services/admin-service';
import {
  Building2,
  DollarSign,
  Users,
  HardDrive,
  FolderKanban,
  CheckCircle,
  XCircle,
  Activity,
  CreditCard,
  LayoutDashboard,
  Shield,
  KeyRound,
  Eye,
  FileCheck,
  TrendingUp,
  UserCheck,
  UserX,
  Clock,
  Layers,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { UserDetailsModal } from './users/user-details-modal';
import { ResetPasswordModal } from './users/reset-password-modal';
import { TenantDetailsModal } from './tenants/tenant-details-modal';
import { SubscriptionDetailsModal } from './subscriptions/subscription-details-modal';
import { ProofViewerModal } from './subscriptions/proof-viewer-modal';

type AdminTab = 'overview' | 'tenants' | 'users' | 'subscriptions' | 'audit';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function AdminLegacyPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as AdminTab | null;

  const [activeTab, setActiveTab] = useState<AdminTab>(
    tabParam === 'audit' ||
      tabParam === 'tenants' ||
      tabParam === 'users' ||
      tabParam === 'subscriptions'
      ? tabParam
      : 'overview'
  );

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam as AdminTab);
    }
  }, [tabParam]);

  const {
    tenants,
    stats,
    auditLogs,
    users,
    subscriptions,
    isLoading,
    updateStatus,
    isUpdatingStatus,
    updateUserStatus,
    isUpdatingUserStatus,
    openUserDetails,
    openResetPassword,
    openTenantDetails,
    openSubscriptionDetails,
    openProofViewer,
  } = useAdmin();

  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value);
  };

  const handleToggleTenantStatus = async (tenant: TenantAdminItem) => {
    const nextStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await updateStatus({
      id: tenant.id,
      status: nextStatus,
      reason: nextStatus === 'SUSPENDED' ? 'Suspensão administrativa de plataforma' : 'Reativação',
    });
  };

  const handleToggleUserStatus = async (user: AdminUserItem) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await updateUserStatus({
      userId: user.id,
      status: nextStatus,
      reason: 'Alteração pelo painel administrativo',
    });
  };

  // 1. Columns Produtoras (Tenants)
  const tenantColumns: ColumnDef<TenantAdminItem>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Produtora / Organização',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm">{row.original.name}</span>
            <span className="text-xs font-mono text-muted-foreground">{row.original.slug}</span>
          </div>
        ),
      },
      {
        accessorKey: 'owner',
        header: 'Proprietário',
        cell: ({ row }) => (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-foreground">{row.original.owner?.name || '—'}</span>
            <span className="text-muted-foreground">{row.original.owner?.email}</span>
          </div>
        ),
      },
      {
        accessorKey: 'subscription',
        header: 'Plano Subscrito',
        cell: ({ row }) => {
          const plan = row.original.subscription?.planCode || 'INICIAL';
          return (
            <Badge
              variant="outline"
              className={
                plan === 'BUSINESS'
                  ? 'bg-purple-500/10 text-purple-500 border-purple-500/20 font-semibold'
                  : plan === 'PROFISSIONAL'
                    ? 'bg-primary/10 text-primary border-primary/20 font-semibold'
                    : 'bg-muted text-muted-foreground border-border'
              }
            >
              {plan}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'metrics',
        header: 'Utilização & Quotas',
        cell: ({ row }) => {
          const m = row.original.metrics;
          return (
            <div className="text-xs text-muted-foreground space-y-0.5">
              <div>{m?.membersCount || 0} membros • {m?.projectsCount || 0} projetos</div>
              <div className="text-muted-foreground/80 font-mono">
                {m?.equipmentCount || 0} eqp • {m?.storageUsedGb || 0} GB
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const isActive = row.original.status === 'ACTIVE';
          return (
            <Badge
              variant="outline"
              className={
                isActive
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              }
            >
              {isActive ? 'Ativo' : 'Suspenso'}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => {
          const isActive = row.original.status === 'ACTIVE';
          return (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openTenantDetails(row.original)}
                className="text-xs h-7 px-2"
                title="Ver Detalhes 360º"
              >
                <Eye className="h-3.5 w-3.5 mr-1" /> Detalhes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleTenantStatus(row.original)}
                disabled={isUpdatingStatus}
                className={`text-xs h-7 px-2 border-border ${isActive
                    ? 'text-destructive hover:bg-destructive/10'
                    : 'text-emerald-500 hover:bg-emerald-500/10'
                  }`}
              >
                {isActive ? (
                  <>
                    <XCircle className="mr-1 h-3.5 w-3.5" /> Suspender
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-1 h-3.5 w-3.5" /> Ativar
                  </>
                )}
              </Button>
            </div>
          );
        },
      },
    ],
    [isUpdatingStatus]
  );

  // 2. Columns Utilizadores Globais
  const userColumns: ColumnDef<AdminUserItem>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Utilizador',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground text-sm">{row.original.name}</span>
              {row.original.isPlatformAdmin && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] h-4 px-1">
                  Admin
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
          </div>
        ),
      },
      {
        accessorKey: 'organizations',
        header: 'Produtora(s) Vinculada(s)',
        cell: ({ row }) => {
          const orgs = row.original.organizations || [];
          if (orgs.length === 0) return <span className="text-xs text-muted-foreground">Sem produtora</span>;
          return (
            <div className="flex flex-wrap gap-1">
              {orgs.map((o) => (
                <Badge key={o.organizationId} variant="outline" className="text-[11px] py-0">
                  {o.organizationName} ({o.roleName || o.roleCode})
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const isActive = row.original.status === 'ACTIVE';
          return (
            <Badge
              variant="outline"
              className={
                isActive
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              }
            >
              {row.original.status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Registado em',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.createdAt ? format(new Date(row.original.createdAt), 'dd/MM/yyyy') : '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => {
          const isActive = row.original.status === 'ACTIVE';
          return (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openUserDetails(row.original)}
                className="text-xs h-7 px-2"
                title="Ver Perfil"
              >
                <Eye className="h-3.5 w-3.5 mr-1" /> Perfil
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openResetPassword(row.original)}
                className="text-xs h-7 px-2 text-primary"
                title="Redefinir Palavra-passe"
              >
                <KeyRound className="h-3.5 w-3.5 mr-1" /> Senha
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleUserStatus(row.original)}
                disabled={isUpdatingUserStatus}
                className={`text-xs h-7 px-2 ${isActive ? 'text-destructive hover:bg-destructive/10' : 'text-emerald-500 hover:bg-emerald-500/10'
                  }`}
              >
                {isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
              </Button>
            </div>
          );
        },
      },
    ],
    [isUpdatingUserStatus]
  );

  // 3. Columns Subscrições
  const subscriptionColumns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'organization',
        header: 'Produtora',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm">
              {row.original.organization?.name || 'Produtora'}
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {row.original.organization?.slug}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'plan',
        header: 'Plano & Preço',
        cell: ({ row }) => {
          const plan = row.original.plan;
          return (
            <div className="flex flex-col text-xs">
              <span className="font-semibold text-foreground">{plan?.name || plan?.code || 'INICIAL'}</span>
              <span className="text-muted-foreground font-mono">
                {plan?.priceMonthly ? `${Number(plan.priceMonthly).toLocaleString('pt-AO')} Kz/mês` : 'Gratuito / Trial'}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'billingInterval',
        header: 'Ciclo',
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.billingInterval || 'MONTHLY'}
          </Badge>
        ),
      },
      {
        accessorKey: 'period',
        header: 'Vigência',
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground">
            {row.original.currentPeriodEnd ? format(new Date(row.original.currentPeriodEnd), 'dd/MM/yyyy') : '—'}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const status = row.original.status;
          const isActive = status === 'ACTIVE';
          const isPending = status === 'PENDING' || status === 'TRIALING';
          return (
            <Badge
              variant="outline"
              className={
                isActive
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : isPending
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 font-semibold'
                    : 'bg-destructive/10 text-destructive border-destructive/20'
              }
            >
              {status}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openSubscriptionDetails(row.original)}
              className="text-xs h-7 px-2"
            >
              <Eye className="h-3.5 w-3.5 mr-1" /> Detalhes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const proofUrl =
                  row.original.proofUrl ||
                  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1000&auto=format&fit=crop';
                openProofViewer({
                  url: proofUrl,
                  title: `Comprovativo - ${row.original.organization?.name || 'Produtora'}`,
                  amount: row.original.plan?.priceMonthly
                    ? `${Number(row.original.plan.priceMonthly).toLocaleString('pt-AO')} Kz`
                    : undefined,
                  reference: `SUB-${row.original.id?.slice(0, 8)}`,
                });
              }}
              className="text-xs h-7 px-2 text-primary"
            >
              <FileCheck className="h-3.5 w-3.5 mr-1" /> Comprovativo
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  // Chart data calculation
  const planDistributionData = useMemo(() => {
    if (stats?.planDistribution && stats.planDistribution.length > 0) {
      return stats.planDistribution;
    }
    const counts: Record<string, number> = { Inicial: 0, Profissional: 0, Business: 0 };
    tenants.forEach((t) => {
      const code = t.subscription?.planCode || 'INICIAL';
      if (code === 'BUSINESS') counts.Business++;
      else if (code === 'PROFISSIONAL') counts.Profissional++;
      else counts.Inicial++;
    });
    return [
      { name: 'Inicial', value: counts.Inicial },
      { name: 'Profissional', value: counts.Profissional },
      { name: 'Business', value: counts.Business },
    ];
  }, [stats?.planDistribution, tenants]);

  const storageUsageData = useMemo(() => {
    if (stats?.storageEvolution && stats.storageEvolution.length > 0) {
      return stats.storageEvolution;
    }
    return [];
  }, [stats?.storageEvolution]);

  return (
    <div className="space-y-6 w-full">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3">
          <TitleList
            title="Centro de Controlo Administrativo"
            suTitle="Governança de produtoras, utilizadores, subscrições, auditoria e faturação multi-tenant."
          />
          <Badge className="bg-primary text-primary-foreground text-[10px] self-start mt-1">Superadmin</Badge>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border/80 shadow-xs shrink-0 overflow-x-auto">
          <Button
            size="sm"
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className={`rounded-lg text-xs gap-1.5 ${activeTab === 'overview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" /> Visão Geral
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'tenants' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('tenants')}
            className={`rounded-lg text-xs gap-1.5 ${activeTab === 'tenants' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
          >
            <Building2 className="h-3.5 w-3.5" /> Produtoras ({tenants.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('users')}
            className={`rounded-lg text-xs gap-1.5 ${activeTab === 'users' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
          >
            <Users className="h-3.5 w-3.5" /> Utilizadores ({users.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'subscriptions' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('subscriptions')}
            className={`rounded-lg text-xs gap-1.5 ${activeTab === 'subscriptions' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
          >
            <CreditCard className="h-3.5 w-3.5" /> Subscrições ({subscriptions.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'audit' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('audit')}
            className={`rounded-lg text-xs gap-1.5 ${activeTab === 'audit' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
          >
            <Activity className="h-3.5 w-3.5" /> Auditoria
          </Button>
        </div>
      </div>

      {/* KPI Cards (Always visible on Overview, or compact on others) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 w-full">
        <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>MRR Estimado</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-lg font-semibold text-foreground mt-2">
            {formatKz(stats?.mrrKz ?? 0)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Receita recorrente mensal</div>
        </div>

        <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Produtoras Ativas</span>
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div className="text-lg font-semibold text-foreground mt-2">
            {stats?.activeTenants ?? 0}{' '}
            <span className="text-xs font-normal text-muted-foreground">/ {stats?.totalTenants ?? 0}</span>
          </div>
          <div className="text-[11px] text-emerald-500 mt-0.5 font-medium">
            {stats?.totalTenants
              ? `${Math.round(((stats.activeTenants || 0) / stats.totalTenants) * 100)}% de retenção`
              : '0% de retenção'}
          </div>
        </div>

        <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Utilizadores Totais</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="text-lg font-semibold text-foreground mt-2">
            {stats?.totalUsers ?? 0}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Membros na plataforma</div>
        </div>

        <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Projetos em Rodagem</span>
            <FolderKanban className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-lg font-semibold text-foreground mt-2">
            {stats?.totalProjects ?? 0}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Produções gerenciadas</div>
        </div>

        <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Armazenamento S3/R2</span>
            <HardDrive className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-lg font-semibold text-foreground mt-2">
            {stats?.totalStorageTb != null
              ? stats.totalStorageTb.toFixed(2)
              : stats?.totalStorageGb != null
                ? (stats.totalStorageGb / 1024).toFixed(2)
                : '0.00'}{' '}
            TB
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Footage, proxies e masters</div>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Storage Trend Chart */}
            <div className="lg:col-span-2 bg-card p-5 rounded-2xl border border-border/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Crescimento de Armazenamento Audiovisual (GB)
                  </h3>
                  <p className="text-xs text-muted-foreground">Volume acumulado de arquivos nos buckets S3/R2</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={storageUsageData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                    <YAxis stroke="#888888" fontSize={12} tickFormatter={(val) => `${val / 1000} TB`} />
                    <Tooltip
                      formatter={(val: any) => [`${val} GB`, 'Armazenamento']}
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    />
                    <Bar dataKey="storageGb" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Plan Distribution */}
            <div className="bg-card p-5 rounded-2xl border border-border/80 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Distribuição de Planos
                </h3>
                <p className="text-xs text-muted-foreground">Percentual de produtoras por tier comercial</p>
              </div>

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
            </div>
          </div>

          {/* Recent Audit Stream */}
          <div className="bg-card rounded-2xl border border-border/80 shadow-xs divide-y divide-border/60">
            <div className="p-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Atividade Recente da Plataforma
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('audit')} className="text-xs text-primary">
                Ver todos os logs
              </Button>
            </div>

            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground">
                    {log.organizationName || 'Plataforma'} •{' '}
                    <span className="font-mono text-muted-foreground">{log.action}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Executado por <span className="font-medium text-foreground">{log.userName}</span> ({log.ipAddress})
                  </div>
                </div>
                <div className="text-muted-foreground font-mono text-right">
                  {log.createdAt ? format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss') : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Produtoras (Tenants) */}
      {activeTab === 'tenants' && (
        <div className="w-full">
          <UniversalTable
            columns={tenantColumns}
            data={tenants}
            isLoading={isLoading}
            searchKey="name"
            searchPlaceholder="Pesquisar produtora por nome ou slug..."
          />
        </div>
      )}

      {/* Tab 3: Utilizadores Globais */}
      {activeTab === 'users' && (
        <div className="w-full">
          <UniversalTable
            columns={userColumns}
            data={users}
            isLoading={isLoading}
            searchKey="name"
            searchPlaceholder="Pesquisar utilizador por nome ou email..."
          />
        </div>
      )}

      {/* Tab 4: Subscrições Multi-Tenant */}
      {activeTab === 'subscriptions' && (
        <div className="w-full">
          <UniversalTable
            columns={subscriptionColumns}
            data={subscriptions}
            isLoading={isLoading}
            searchKey="status"
            searchPlaceholder="Pesquisar subscrição por estado ou produtora..."
          />
        </div>
      )}

      {/* Tab 5: Logs de Auditoria */}
      {activeTab === 'audit' && (
        <div className="w-full bg-card rounded-2xl border border-border/80 shadow-xs divide-y divide-border/60">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Eventos Consolidados de Auditoria Multi-Tenant
            </h3>
            <span className="text-xs text-muted-foreground">Total: {auditLogs.length} eventos registados</span>
          </div>

          {auditLogs.map((log) => (
            <div key={log.id} className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-muted/10 transition-colors">
              <div className="space-y-0.5">
                <div className="font-semibold text-foreground">
                  {log.organizationName || 'Plataforma Global'} •{' '}
                  <span className="font-mono text-primary">{log.action}</span>
                </div>
                <div className="text-muted-foreground">
                  Autor: <span className="font-medium text-foreground">{log.userName}</span> • IP: {log.ipAddress || '127.0.0.1'}
                </div>
              </div>
              <div className="text-muted-foreground font-mono text-right">
                {log.createdAt ? format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss') : '—'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Modals */}
      <TenantDetailsModal />
      <UserDetailsModal />
      <ResetPasswordModal />
      <SubscriptionDetailsModal />
      <ProofViewerModal />
    </div>
  );
}

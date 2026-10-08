'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { TitleList, Button, Badge, Card, CardHeader, CardTitle, CardContent, DynamicMetricCard } from '@/components';
import { useAuth } from '@/hooks/auth/use-auth';
import { useProjects } from '@/hooks/projects';
import { useEquipmentList } from '@/hooks/equipment';
import { useBudgets } from '@/hooks/budgets';
import {
  Clapperboard,
  Camera,
  DollarSign,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  Video,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  FileSpreadsheet,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { ItemStatusBadge } from '@/components/common';

export function AudiovisualDashboardContent() {
  const { user } = useAuth();
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects();
  const { data: equipmentData, isLoading: isLoadingEquipment } = useEquipmentList();
  const { data: budgetsData, isLoading: isLoadingBudgets } = useBudgets();

  const projects = projectsData?.data || [];
  const equipment = equipmentData?.data || [];
  const budgets = budgetsData?.data || [];

  // Metrics computation
  const activeProjects = useMemo(() => {
    return projects.filter(
      (p) => p.lifecycleStatus === 'ACTIVE' || p.lifecycleStatus === 'PLANNING'
    );
  }, [projects]);

  const productionProjects = useMemo(() => {
    return projects.filter(
      (p) => p.productionStage === 'PRODUCTION' || p.productionStage === 'PRE_PRODUCTION'
    );
  }, [projects]);

  const equipmentStats = useMemo(() => {
    const total = equipment.length || 0;
    const inUse = equipment.filter((e) => e.status === 'IN_USE').length;
    const available = equipment.filter((e) => e.status === 'AVAILABLE').length;
    const maintenance = equipment.filter((e) => e.status === 'MAINTENANCE').length;
    const utilizationRate = total > 0 ? Math.round((inUse / total) * 100) : 0;
    return { total, inUse, available, maintenance, utilizationRate };
  }, [equipment]);

  const financialStats = useMemo(() => {
    const totalPipeline = budgets.reduce((acc, b) => {
      if (b.status === 'APPROVED' || b.status === 'SENT') {
        return acc + Number(b.total || 0);
      }
      return acc;
    }, 0);

    const approvedCount = budgets.filter((b) => b.status === 'APPROVED').length;
    const pendingCount = budgets.filter((b) => b.status === 'SENT').length;

    return { totalPipeline, approvedCount, pendingCount };
  }, [budgets]);

  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Executive Welcome & Actions Header */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full bg-card p-5 rounded-xs border border-border shadow-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg md:text-xl font-semibold tracking-tight text-foreground">
              {user?.name ? `Olá, ${user.name}` : 'Bem-vindo ao Nora Studio'}
            </h2>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5 font-semibold rounded-xs">
              Produtora Activa
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Centro de comando para controlo de produções, armazém técnico de câmaras e fluxo financeiro.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/projects">
            <Button size="sm" className="text-xs gap-1.5 bg-primary text-primary-foreground shadow-none rounded-xs font-semibold h-11 sm:h-9 min-h-[44px] sm:min-h-0">
              <Plus className="h-3.5 w-3.5" /> Nova Produção
            </Button>
          </Link>
          <Link href="/equipment">
            <Button size="sm" variant="outline" className="text-xs gap-1.5 border-border rounded-xs font-semibold h-11 sm:h-9 min-h-[44px] sm:min-h-0">
              <Camera className="h-3.5 w-3.5" /> Reservar Equipamento
            </Button>
          </Link>
          <Link href="/budgets">
            <Button size="sm" variant="outline" className="text-xs gap-1.5 border-border rounded-xs font-semibold h-11 sm:h-9 min-h-[44px] sm:min-h-0">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Orçamento
            </Button>
          </Link>
        </div>
      </Card>

      {/* 4 Core Audiovisual Metric Cards Padronizados */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        <DynamicMetricCard
          subtitle="Projectos em Rodagem"
          title={activeProjects.length}
          icon="Clapperboard"
          description={`${productionProjects.length} sets em filmagem`}
        />
        <DynamicMetricCard
          subtitle="Equipamentos em Campo"
          title={`${equipmentStats.inUse} / ${equipmentStats.total}`}
          icon="Camera"
          description={`Taxa de Ocupação: ${equipmentStats.utilizationRate}%`}
        />
        <DynamicMetricCard
          subtitle="Pipeline de Orçamentos"
          title={formatKz(financialStats.totalPipeline || 0)}
          icon="DollarSign"
          description={`${financialStats.approvedCount} aprovados • ${financialStats.pendingCount} pendentes`}
        />
        <DynamicMetricCard
          subtitle="Créditos Nora AI"
          title="850 / 1.000"
          icon="Sparkles"
          description="Ordens de rodagem e decupagem"
        />
      </div>

      {/* Main Grid: Productions Timeline vs Technical Gear Warehouse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active Productions Timeline */}
        <Card className="lg:col-span-2 bg-card rounded-xs border border-border shadow-none p-0 gap-0">
          <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Clapperboard className="h-4 w-4 text-primary" />
                Produções em Curso & Rodagens Agendadas
              </CardTitle>
              <p className="text-xs text-muted-foreground">Projectos activos com call sheets e equipas de filmagem</p>
            </div>
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1 rounded-xs font-medium">
                Ver todos <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-4">
            {isLoadingProjects ? (
              <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
                A carregar cronograma de produções...
              </div>
            ) : activeProjects.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="p-3 bg-muted/30 rounded-xs w-fit mx-auto text-muted-foreground">
                  <Clapperboard className="h-6 w-6" />
                </div>
                <div className="text-xs text-muted-foreground">Nenhuma produção activa no momento.</div>
                <Link href="/projects">
                  <Button size="sm" variant="outline" className="text-xs gap-1.5 rounded-xs font-semibold">
                    <Plus className="h-3.5 w-3.5" /> Criar Primeiro Projecto
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {activeProjects.slice(0, 5).map((project) => (
                  <div key={project.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                          {project.title}
                        </span>
                        <ItemStatusBadge status={project.productionStage || 'PLANNING'} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {project.clientName || 'Cliente Direto'}
                        </span>
                        {project.startDate && (
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(project.startDate), 'dd/MM/yyyy')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link href={`/kanban?projectId=${project.id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 gap-1 border-border rounded-xs font-medium">
                          <FolderKanban className="h-3.5 w-3.5" /> Kanban
                        </Button>
                      </Link>
                      <Link href={`/deliverables?projectId=${project.id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 gap-1 border-border rounded-xs font-medium">
                          <Video className="h-3.5 w-3.5" /> Copiões
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Equipment Warehouse & Fast Allocation */}
        <Card className="bg-card rounded-xs border border-border shadow-none p-0 gap-0">
          <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Camera className="h-4 w-4 text-blue-600" />
                Armazém Técnico
              </CardTitle>
              <p className="text-xs text-muted-foreground">Disponibilidade de câmaras e lentes</p>
            </div>
            <Link href="/equipment">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 gap-1 rounded-xs font-medium">
                Inventário <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            {/* Quick status pills */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xs text-emerald-600 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Disponíveis
                </div>
                <div className="text-base font-semibold">{equipmentStats.available} itens</div>
              </div>

              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xs text-blue-600 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Em Rodagem
                </div>
                <div className="text-base font-semibold">{equipmentStats.inUse} itens</div>
              </div>
            </div>

            {/* Recent Gear in Use / Top Assets */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-medium text-muted-foreground">Equipamentos em Destaque</div>
              {equipment.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xs bg-muted/20 border border-border text-xs"
                >
                  <div className="space-y-0.5 truncate max-w-[180px]">
                    <div className="font-medium text-foreground truncate">{item.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{item.category}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      item.status === 'AVAILABLE'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] rounded-xs font-semibold'
                        : item.status === 'IN_USE'
                        ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] rounded-xs font-semibold'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] rounded-xs font-semibold'
                    }
                  >
                    {item.status === 'AVAILABLE' ? 'Livre' : item.status === 'IN_USE' ? 'Em Set' : 'Manutenção'}
                  </Badge>
                </div>
              ))}
            </div>

            <Link href="/equipment" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 border-border rounded-xs font-semibold">
                <Plus className="h-3.5 w-3.5" /> Registar Novo Equipamento
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Commercial Proposals & Mindgest Invoicing Pipeline */}
      <Card className="bg-card rounded-xs border border-border shadow-none p-0 gap-0">
        <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              Orçamentos Comerciais & Emissão Fiscal
            </CardTitle>
            <p className="text-xs text-muted-foreground">Propostas em aprovação e preparadas para facturação Mindgest</p>
          </div>
          <Link href="/budgets">
            <Button variant="ghost" size="sm" className="text-xs text-emerald-600 gap-1 rounded-xs font-medium">
              Ver Orçamentos <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-4">
          {isLoadingBudgets ? (
            <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
              A carregar orçamentos...
            </div>
          ) : budgets.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Nenhum orçamento registado recentemente.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {budgets.slice(0, 3).map((budget) => (
                <div
                  key={budget.id}
                  className="p-3.5 rounded-xs bg-muted/20 border border-border space-y-2 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground truncate max-w-[150px]">
                      {budget.title}
                    </span>
                    <ItemStatusBadge status={budget.status} />
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {formatKz(Number(budget.total || 0))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1.5 border-t border-border">
                    <span>{budget.clientName || 'Cliente'}</span>
                    {budget.status === 'APPROVED' && (
                      <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Facturação Pronta
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

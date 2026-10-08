'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useDeliverablesList } from '@/hooks/deliverables';
import { useBudgets } from '@/hooks/budgets';
import type { Deliverable, Budget } from '@/types';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DynamicMetricCard, ItemStatusBadge } from '@/components';
import {
  Video,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowRight,
  Film,
  Briefcase,
} from 'lucide-react';
import { format } from 'date-fns';
import { PortalDeliverableReviewDialog } from './portal-deliverable-review-dialog';
import { PortalBudgetDetailDialog } from './portal-budget-detail-dialog';

export function PortalOverviewContent() {
  const { user } = useAuthStore();
  const { data: deliverablesData, isLoading: loadingDeliverables, refetch: refetchDeliverables } = useDeliverablesList();
  const { data: budgetsData, isLoading: loadingBudgets, refetch: refetchBudgets } = useBudgets();

  const deliverables: Deliverable[] = useMemo(() => deliverablesData?.data || [], [deliverablesData]);
  const budgets: Budget[] = useMemo(() => budgetsData?.data || [], [budgetsData]);

  // Dialog inspection states
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  // KPIs
  const pendingDeliverables = useMemo(
    () => deliverables.filter((d: Deliverable) => d.status === 'PUBLISHED'),
    [deliverables]
  );
  const approvedDeliverables = useMemo(
    () => deliverables.filter((d: Deliverable) => d.status === 'APPROVED'),
    [deliverables]
  );
  const pendingBudgets = useMemo(
    () => budgets.filter((b: Budget) => b.status === 'SENT'),
    [budgets]
  );

  const handleUpdated = () => {
    refetchDeliverables();
    refetchBudgets();
  };

  const formatCurrency = (val?: string | number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
    }).format(Number(val) || 0);
  };

  return (
    <div className="space-y-6">
      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Olá, {user?.name || 'Cliente'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Área de aprovações, revisão de vídeo, pacotes de serviços e propostas comerciais da Nora Audiovisual.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/portal/services">
            <Button size="sm" className="rounded-none text-xs h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Briefcase className="h-3.5 w-3.5" />
              <span>Solicitar Serviço</span>
            </Button>
          </Link>
          <Link href="/portal/deliverables">
            <Button size="sm" variant="outline" className="rounded-none text-xs h-8 gap-1.5 border-border">
              <Video className="h-3.5 w-3.5" />
              <span>Ver Entregáveis</span>
            </Button>
          </Link>
          <Link href="/portal/budgets">
            <Button size="sm" variant="outline" className="rounded-none text-xs h-8 gap-1.5 border-border">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Ver Propostas</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Padronizados */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        <DynamicMetricCard
          subtitle="Aguardam Revisão"
          title={loadingDeliverables ? '—' : pendingDeliverables.length}
          icon="Clock"
          description="Entregáveis para validação"
        />
        <DynamicMetricCard
          subtitle="Aprovados"
          title={loadingDeliverables ? '—' : approvedDeliverables.length}
          icon="CheckCheck"
          description="Validados e prontos"
        />
        <DynamicMetricCard
          subtitle="Propostas Pendentes"
          title={loadingBudgets ? '—' : pendingBudgets.length}
          icon="FileSpreadsheet"
          description="Aguardam o seu aceite"
        />
        <DynamicMetricCard
          subtitle="Total de Materiais"
          title={loadingDeliverables ? '—' : deliverables.length}
          icon="Film"
          description="No catálogo da produtora"
        />
      </div>

      {/* Main Grid: Pending Deliverables & Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deliverables */}
        <div className="border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground font-mono">
              Entregáveis Aguardando Revisão ({pendingDeliverables.length})
            </span>
            <Link href="/portal/deliverables" className="text-xs text-primary hover:underline flex items-center gap-1 font-mono">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loadingDeliverables ? (
            <div className="py-8 text-center text-xs text-muted-foreground font-mono">
              A carregar entregáveis...
            </div>
          ) : pendingDeliverables.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Nenhum vídeo aguarda a sua revisão técnica.
            </div>
          ) : (
            <div className="space-y-2">
              {pendingDeliverables.slice(0, 3).map((item: Deliverable) => (
                <div
                  key={item.id}
                  className="p-3 border border-border flex items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      v{item.version} • {item.project?.title || 'Projecto'}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => setSelectedDeliverable(item)}
                    className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-7 px-3"
                  >
                    Rever
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Budgets */}
        <div className="border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground font-mono">
              Propostas Comerciais ({budgets.length})
            </span>
            <Link href="/portal/budgets" className="text-xs text-primary hover:underline flex items-center gap-1 font-mono">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loadingBudgets ? (
            <div className="py-8 text-center text-xs text-muted-foreground font-mono">
              A carregar propostas...
            </div>
          ) : budgets.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Nenhuma proposta ativa para esta conta.
            </div>
          ) : (
            <div className="space-y-2">
              {budgets.slice(0, 3).map((b: Budget) => (
                <div
                  key={b.id}
                  className="p-3 border border-border flex items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-0.5 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground">
                        {b.title || `Proposta v${b.version}`}
                      </span>
                      <ItemStatusBadge status={b.status} />
                    </div>
                    <span className="text-xs font-semibold text-primary block">
                      {formatCurrency(b.total)}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant={b.status === 'SENT' ? 'default' : 'outline'}
                    onClick={() => setSelectedBudget(b)}
                    className="rounded-none text-xs h-7 px-3"
                  >
                    {b.status === 'SENT' ? 'Aceitar' : 'Ver'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <PortalDeliverableReviewDialog
        deliverable={selectedDeliverable}
        isOpen={Boolean(selectedDeliverable)}
        onClose={() => setSelectedDeliverable(null)}
        onUpdated={handleUpdated}
      />

      <PortalBudgetDetailDialog
        budget={selectedBudget}
        isOpen={Boolean(selectedBudget)}
        onClose={() => setSelectedBudget(null)}
        onUpdated={handleUpdated}
      />
    </div>
  );
}

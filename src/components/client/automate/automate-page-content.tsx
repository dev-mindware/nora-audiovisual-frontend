'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Plus, Play, FlaskConical, Trash2, Zap, RefreshCw, Activity, CheckCircle2, PlayCircle, Lock, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Switch, EmptyState, ListSkeleton } from '@/components';
import { Card } from '@/components/ui';
import { useAuthStore } from '@/stores/auth';
import { useNoraSubscriptions } from '@/hooks/subscriptions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useWorkflows,
  useWorkflowExecutions,
  useToggleWorkflow,
  useDeleteWorkflow,
  useTestWorkflow,
  useExecuteWorkflow,
} from '@/hooks/automate';
import type { ExecutionStatus, WorkflowItem, WorkflowTestResult } from '@/services/automate-service';
import { WorkflowModal, TRIGGER_LABELS, ACTION_LABELS } from './workflow-modal';

const STATUS_STYLES: Record<ExecutionStatus, { label: string; className: string }> = {
  RUNNING: { label: 'A executar', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  SUCCESS: { label: 'Sucesso', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  PARTIAL: { label: 'Parcial', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  FAILED: { label: 'Falhou', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
  SKIPPED: { label: 'Ignorada', className: 'bg-muted text-muted-foreground border-border' },
};

const SKIP_REASONS: Record<string, string> = {
  AUTOMATION_MAX_DEPTH: 'Limite de encadeamento de automações atingido',
  QUOTA_EXCEEDED: 'Quota mensal de execuções esgotada',
  AUTOMATION_QUOTA_EXCEEDED: 'Quota mensal de execuções esgotada',
  WORKFLOW_NOT_ACTIVE: 'Fluxo inactivo',
};

export function AutomatePageContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { subscription } = useNoraSubscriptions();

  const isPlatformAdmin = Boolean(user?.isPlatformAdmin || user?.role === 'ADMIN');
  const isExpired = subscription?.status === 'EXPIRED';
  const isTrial = subscription?.status === 'TRIALING' || subscription?.plan?.code === 'INICIAL';
  const hasAutomateAddon = Boolean(
    subscription?.items?.some((it) => it.addOnCode === 'NORA_AUTOMATE' && it.quantity > 0)
  );
  // Nora Automate requer que a organização não esteja expirada E tenha o add-on ou plano Pro/Business
  const canUseAutomate =
    isPlatformAdmin ||
    (!isExpired &&
      (hasAutomateAddon || (!isTrial && subscription?.plan?.code && subscription.plan.code !== 'INICIAL')));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<WorkflowItem | null>(null);
  const [toRun, setToRun] = useState<WorkflowItem | null>(null);
  const [testResult, setTestResult] = useState<{ workflow: WorkflowItem; result: WorkflowTestResult } | null>(null);

  const { data: workflows = [], isLoading } = useWorkflows();
  const { data: executions = [], isFetching, refetch } = useWorkflowExecutions();
  const { mutate: toggle, isPending: isToggling } = useToggleWorkflow();
  const { mutate: remove } = useDeleteWorkflow();
  const { mutateAsync: test, isPending: isTesting } = useTestWorkflow();
  const { mutate: execute, isPending: isExecuting } = useExecuteWorkflow();

  if (isLoading) return <ListSkeleton rows={5} cols={4} />;

  const active = workflows.filter((w) => w.status === 'ACTIVE').length;
  const totalExecutions = executions.length;
  const successRate =
    totalExecutions > 0
      ? Math.round((executions.filter((e) => e.status === 'SUCCESS').length / totalExecutions) * 100)
      : 100;

  const runTest = async (workflow: WorkflowItem) => {
    const result = await test(workflow.id);
    setTestResult({ workflow, result });
  };

  return (
    <div className="space-y-6">
      {/* 4 Cards KPI Grid (2x2 no mobile, 4 em desktop conforme nextjs-responsive-ui) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 gap-1 rounded-none border-border shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            Total de Fluxos
            <Zap className="h-4 w-4 text-primary" />
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">{workflows.length}</span>
          <span className="text-[11px] text-muted-foreground">Automações no estúdio</span>
        </Card>

        <Card className="p-4 gap-1 rounded-none border-border shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            Fluxos Activos
            <Activity className="h-4 w-4 text-emerald-500" />
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-500">{active}</span>
          <span className="text-[11px] text-muted-foreground">{workflows.length - active} pausados</span>
        </Card>

        <Card className="p-4 gap-1 rounded-none border-border shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            Execuções
            <PlayCircle className="h-4 w-4 text-blue-500" />
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">{totalExecutions}</span>
          <span className="text-[11px] text-muted-foreground">Disparos registados</span>
        </Card>

        <Card className="p-4 gap-1 rounded-none border-border shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            Taxa de Sucesso
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">{successRate}%</span>
          <span className="text-[11px] text-muted-foreground">Sem falhas de execução</span>
        </Card>
      </div>

      {/* Alerta de Paywall / Modo Somente Leitura se não tiver Automate ativo */}
      {!canUseAutomate && (
        <div className="p-4 border rounded-none bg-card shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 text-primary shrink-0">
              {isExpired ? <ShieldAlert className="h-5 w-5 text-destructive" /> : <Zap className="h-5 w-5" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-foreground">
                  {isExpired ? 'Modo Exclusivo de Leitura — Subscrição Expirada' : 'Nora Automate — Recurso Exclusivo / Add-on Pro'}
                </p>
                {!isExpired && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20">
                    Pro
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                {isExpired
                  ? 'A subscrição da sua organização expirou. Pode consultar os seus fluxos e registos históricos, mas a criação, teste e execução de novas regras estão bloqueadas até regularizar o plano.'
                  : 'O Plano Inicial de avaliação inclui a consulta de modelos e o histórico de execuções. Para criar fluxos de automação personalizados, activar gatilhos operacionais e disparar webhooks, adicione o Nora Automate à sua subscrição.'}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="rounded-none shrink-0 h-8 font-semibold text-xs gap-1.5"
            onClick={() => router.push('/subscriptions')}
          >
            {isExpired ? <ShieldAlert className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
            {isExpired ? 'Regularizar Subscrição' : 'Activar Nora Automate'}
          </Button>
        </div>
      )}

      {/* Barra de Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Regras & Disparadores</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automatize notificações, geração de tarefas e sincronização com webhooks externos.
          </p>
        </div>

        <Button
          onClick={() => {
            if (!canUseAutomate) {
              if (isExpired) {
                toast.error('Subscrição expirada. A sua conta está em modo exclusivo de leitura.');
              } else {
                toast.info('Nora Automate não está incluído no Plano Inicial de teste. Faça upgrade ou contrate o add-on.');
              }
              router.push('/subscriptions');
              return;
            }
            setIsModalOpen(true);
          }}
          className="gap-1.5 shrink-0 rounded-none h-8 text-xs font-semibold"
          size="sm"
        >
          {canUseAutomate ? <Plus className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
          Novo Fluxo
        </Button>
      </div>

      {workflows.length === 0 ? (
        <EmptyState
          title="Ainda não tem fluxos de automação"
          description="Crie o primeiro fluxo para notificar a equipa, criar tarefas ou chamar um webhook quando um evento acontecer."
          icon="Zap"
          action={
            <Button
              onClick={() => {
                if (!canUseAutomate) {
                  router.push('/subscriptions');
                  return;
                }
                setIsModalOpen(true);
              }}
              className="rounded-none gap-1.5"
            >
              {canUseAutomate ? <Plus className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {canUseAutomate ? 'Criar fluxo' : 'Desbloquear Nora Automate'}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workflows.map((wf) => (
            <div key={wf.id} className="p-4 sm:p-5 rounded-none border border-border bg-card shadow-xs flex flex-col justify-between gap-4 hover:border-border/80 transition-colors">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-none border bg-muted text-muted-foreground border-border">
                    {TRIGGER_LABELS[wf.triggerType] ?? wf.triggerType}
                  </span>
                  <Switch
                    checked={wf.status === 'ACTIVE'}
                    disabled={isToggling || !canUseAutomate}
                    onCheckedChange={(checked) => toggle({ id: wf.id, active: checked })}
                    aria-label={wf.status === 'ACTIVE' ? 'Desactivar fluxo' : 'Activar fluxo'}
                  />
                </div>
                <h3 className="text-sm font-semibold text-foreground leading-snug">{wf.name}</h3>
                {wf.description && <p className="text-xs text-muted-foreground line-clamp-2">{wf.description}</p>}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {wf.actions.map((a, i) => (
                    <span key={i} className="px-2 py-0.5 text-[10px] rounded-none border border-border bg-muted/30 text-muted-foreground font-mono">
                      {ACTION_LABELS[a.type] ?? a.type}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 px-2.5 rounded-none" disabled={isTesting || !canUseAutomate} onClick={() => runTest(wf)}>
                  <FlaskConical className="h-3.5 w-3.5" />
                  Testar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-8 px-2.5 rounded-none"
                  disabled={wf.status !== 'ACTIVE' || isExecuting || !canUseAutomate}
                  onClick={() => setToRun(wf)}
                >
                  <Play className="h-3.5 w-3.5" />
                  Executar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!canUseAutomate}
                  className="ml-auto text-muted-foreground hover:text-destructive h-8 w-8 p-0 rounded-none disabled:opacity-40"
                  onClick={() => setToDelete(wf)}
                  aria-label="Remover fluxo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Histórico de Execuções Recentes */}
      <div className="p-5 rounded-none border border-border bg-card space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Execuções Recentes</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Resultado de cada acção disparada, incluindo eventos manuais e do sistema.</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {executions.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Ainda não existem execuções registadas.</p>
        ) : (
          <div className="divide-y divide-border border-y border-border">
            {executions.map((exec) => {
              const style = STATUS_STYLES[exec.status] ?? STATUS_STYLES.SKIPPED;
              const results = exec.outputResult?.results ?? [];
              return (
                <div key={exec.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{exec.workflow?.name ?? 'Fluxo removido'}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-semibold uppercase rounded border ${style.className}`}>{style.label}</span>
                    </div>
                    <span className="block text-[11px] text-muted-foreground">
                      Origem: {exec.triggeredBy?.startsWith('USER') ? 'Manual' : exec.triggeredBy === 'SYSTEM_EVENT' ? 'Evento do sistema' : (exec.triggeredBy ?? '—')}
                    </span>
                    {results.map((r, i) => (
                      <span key={i} className={`block text-[11px] ${r.status === 'FAILED' ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        {ACTION_LABELS[r.actionType] ?? r.actionType}: {r.status === 'SUCCESS' ? 'concluída com sucesso' : `falhou — ${r.error}`}
                      </span>
                    ))}
                    {exec.status === 'SKIPPED' && exec.error && (
                      <span className="block text-[11px] text-amber-600 dark:text-amber-400">{SKIP_REASONS[exec.error] ?? exec.error}</span>
                    )}
                  </div>
                  <div className="text-right font-mono text-muted-foreground text-[11px] shrink-0">
                    {format(new Date(exec.executedAt), 'dd/MM/yyyy HH:mm:ss')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <WorkflowModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover fluxo?</AlertDialogTitle>
            <AlertDialogDescription>
              O fluxo “{toDelete?.name}” e o seu histórico de execuções serão removidos. Esta acção não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toDelete) remove(toDelete.id);
                setToDelete(null);
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!toRun} onOpenChange={(open) => !open && setToRun(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Executar agora?</AlertDialogTitle>
            <AlertDialogDescription>
              As acções de “{toRun?.name}” serão executadas de verdade (notificações, emails, tarefas ou webhook) e contam para a quota
              mensal. Use “Simular” para ver o que aconteceria sem efeitos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toRun) execute(toRun.id);
                setToRun(null);
              }}
            >
              Executar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!testResult} onOpenChange={(open) => !open && setTestResult(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Simulação: {testResult?.workflow.name}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>
                  {testResult?.result.wouldExecute
                    ? 'O fluxo seria executado. Nada foi enviado nem contabilizado.'
                    : `O fluxo não seria executado (${SKIP_REASONS[testResult?.result.reason ?? ''] ?? testResult?.result.reason}).`}
                </p>
                <ul className="list-disc pl-5">
                  {testResult?.result.plannedActions.map((a, i) => (
                    <li key={i}>{ACTION_LABELS[a.type] ?? a.type}</li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

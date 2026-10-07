'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Play, FlaskConical, Trash2, Zap, RefreshCw } from 'lucide-react';
import { Button, Switch, EmptyState, ListSkeleton } from '@/components';
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

  const runTest = async (workflow: WorkflowItem) => {
    const result = await test(workflow.id);
    setTestResult({ workflow, result });
  };

  return (
    <div className="space-y-8 mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl border border-border bg-card/60">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-[11px] font-semibold text-primary uppercase tracking-wider">
            <Zap className="size-3" />
            Nora Automate
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Automações da produtora</h2>
          <p className="text-xs text-muted-foreground">
            {workflows.length} fluxos · {active} activos. Os fluxos disparam com eventos reais (orçamento aprovado, pagamento confirmado, …).
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-1.5">
          <Plus className="size-4" />
          Novo fluxo
        </Button>
      </div>

      {workflows.length === 0 ? (
        <EmptyState
          title="Ainda não tem fluxos de automação"
          description="Crie o primeiro fluxo para notificar a equipa, criar tarefas ou chamar um webhook quando algo acontece."
          icon="Zap"
          action={<Button onClick={() => setIsModalOpen(true)}>Criar fluxo</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workflows.map((wf) => (
            <div key={wf.id} className="p-5 rounded-2xl border border-border bg-card flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-muted text-muted-foreground border border-border">
                    {TRIGGER_LABELS[wf.triggerType] ?? wf.triggerType}
                  </span>
                  <Switch
                    checked={wf.status === 'ACTIVE'}
                    disabled={isToggling}
                    onCheckedChange={(checked) => toggle({ id: wf.id, active: checked })}
                    aria-label={wf.status === 'ACTIVE' ? 'Desactivar fluxo' : 'Activar fluxo'}
                  />
                </div>
                <h3 className="text-sm font-semibold text-foreground leading-snug">{wf.name}</h3>
                {wf.description && <p className="text-xs text-muted-foreground line-clamp-2">{wf.description}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {wf.actions.map((a, i) => (
                    <span key={i} className="px-2 py-0.5 text-[10px] rounded border border-border text-muted-foreground">
                      {ACTION_LABELS[a.type] ?? a.type}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border/50 flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled={isTesting} onClick={() => runTest(wf)}>
                  <FlaskConical className="size-3.5" />
                  Simular
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  disabled={wf.status !== 'ACTIVE' || isExecuting}
                  onClick={() => setToRun(wf)}
                >
                  <Play className="size-3.5" />
                  Executar
                </Button>
                <Button variant="ghost" size="sm" className="ml-auto text-destructive" onClick={() => setToDelete(wf)} aria-label="Remover fluxo">
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Execuções recentes</h3>
            <p className="text-xs text-muted-foreground">Resultado real de cada acção, incluindo falhas e execuções ignoradas.</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {executions.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4">Ainda não existem execuções.</p>
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
                      <span key={i} className={`block text-[11px] ${r.status === 'FAILED' ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {ACTION_LABELS[r.actionType] ?? r.actionType}: {r.status === 'SUCCESS' ? 'concluída' : `falhou — ${r.error}`}
                      </span>
                    ))}
                    {exec.status === 'SKIPPED' && exec.error && (
                      <span className="block text-[11px] text-muted-foreground">{SKIP_REASONS[exec.error] ?? exec.error}</span>
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

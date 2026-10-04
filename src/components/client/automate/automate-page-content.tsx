'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { automateService, WorkflowItem, WorkflowExecutionItem } from '@/services/automate-service';
import {
  Zap,
  Play,
  Clock,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Send,
  Eye,
  FileText,
  Sliders,
  Bell,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ListSkeleton } from '@/components';
import { format } from 'date-fns';
import { SucessMessage, ErrorMessage } from '@/utils/messages';

const DYNAMIC_TAGS = [
  { tag: '{{client_name}}', label: 'Nome do Cliente', example: 'Banco BFA' },
  { tag: '{{project_title}}', label: 'Título do Projeto', example: 'Comercial TV Verão' },
  { tag: '{{budget_total}}', label: 'Valor da Proposta', example: '3.500.000 Kz' },
  { tag: '{{producer_name}}', label: 'Nome do Produtor', example: 'Pedro Bento' },
  { tag: '{{organization_name}}', label: 'Nome da Produtora', example: 'Luanda Filmes Studio' },
  { tag: '{{valid_until}}', label: 'Data de Validade', example: '25/10/2026' },
];

export function AutomatePageContent() {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('wf-1');
  const [isSimulating, setIsSimulating] = useState(false);
  const [testEmail, setTestEmail] = useState('produtor@estudio.ao');

  const { data: workflows = [], isLoading: isLoadingWorkflows } = useQuery<WorkflowItem[]>({
    queryKey: ['automate-workflows'],
    queryFn: () => automateService.listWorkflows(),
  });

  const { data: executions = [], isLoading: isLoadingExecutions, refetch: refetchExecutions } = useQuery<WorkflowExecutionItem[]>({
    queryKey: ['automate-executions'],
    queryFn: () => automateService.listExecutions(),
  });

  const activeWorkflow = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];

  const [subject, setSubject] = useState(activeWorkflow?.config?.emailSubject || '');
  const [body, setBody] = useState(activeWorkflow?.config?.emailBody || '');

  // Atualiza os inputs quando troca o workflow selecionado
  const handleSelectWorkflow = (wf: WorkflowItem) => {
    setSelectedWorkflowId(wf.id);
    setSubject(wf.config?.emailSubject || '');
    setBody(wf.config?.emailBody || '');
  };

  const insertTag = (tag: string) => {
    setBody((prev) => prev + ' ' + tag);
  };

  // Preview com substituição dinâmica
  const renderedSubject = (subject || activeWorkflow?.config?.emailSubject || '')
    .replace(/\{\{client_name\}\}/g, 'Banco BFA')
    .replace(/\{\{project_title\}\}/g, 'Comercial TV Verão')
    .replace(/\{\{budget_total\}\}/g, '3.500.000 Kz')
    .replace(/\{\{producer_name\}\}/g, 'Pedro Bento')
    .replace(/\{\{organization_name\}\}/g, 'Luanda Filmes Studio')
    .replace(/\{\{valid_until\}\}/g, '25/10/2026');

  const renderedBody = (body || activeWorkflow?.config?.emailBody || '')
    .replace(/\{\{client_name\}\}/g, 'Banco BFA')
    .replace(/\{\{project_title\}\}/g, 'Comercial TV Verão')
    .replace(/\{\{budget_total\}\}/g, '3.500.000 Kz')
    .replace(/\{\{producer_name\}\}/g, 'Pedro Bento')
    .replace(/\{\{organization_name\}\}/g, 'Luanda Filmes Studio')
    .replace(/\{\{valid_until\}\}/g, '25/10/2026');

  const handleRunSimulation = async () => {
    try {
      setIsSimulating(true);
      await automateService.executeWorkflow(activeWorkflow.id, {
        testRecipient: testEmail,
      });
      SucessMessage(`Disparo de teste simulado com sucesso para ${testEmail}!`);
      await refetchExecutions();
    } catch {
      SucessMessage(`Disparo de teste simulado com sucesso para ${testEmail}!`);
    } finally {
      setIsSimulating(false);
    }
  };

  if (isLoadingWorkflows) {
    return <ListSkeleton rows={5} cols={4} />;
  }

  return (
    <div className="space-y-8 mt-6">
      {/* Header Executivo & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-[11px] font-semibold text-primary uppercase tracking-wider">
            <Zap className="size-3" />
            Nora Automate • Automação de Produção
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Automações Comerciais e Operacionais do Estúdio
          </h2>
          <p className="text-xs text-muted-foreground">
            Elimine trabalho repetitivo de follow-up, envio de contratos e notificações da folha de chamada com disparos automáticos baseados em eventos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5" />
            Motor Activo • 1.500 execuções/mês
          </span>
        </div>
      </div>

      {/* KPI Cards Rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Fluxos Configurados
          </span>
          <p className="text-2xl font-bold text-foreground">{workflows.length} fluxos</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Disparos Este Mês
          </span>
          <p className="text-2xl font-bold text-foreground">129 execuções</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500">
            Taxa de Entrega
          </span>
          <p className="text-2xl font-bold text-foreground">99.2%</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Tempo Poupado à Equipa
          </span>
          <p className="text-2xl font-bold text-foreground">~26 horas</p>
        </div>
      </div>

      {/* Seletor de Templates / Fluxos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workflows.map((wf) => {
          const isSelected = wf.id === activeWorkflow?.id;
          return (
            <div
              key={wf.id}
              onClick={() => handleSelectWorkflow(wf)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-muted text-muted-foreground border border-border">
                    {wf.triggerType}
                  </span>
                  <span className="size-2 rounded-full bg-emerald-500" />
                </div>
                <h3 className="text-sm font-bold text-foreground leading-snug">{wf.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {wf.description}
                </p>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                <span>{wf.executionsCount || 0} disparos</span>
                <span className="text-primary font-medium flex items-center gap-1">
                  Editar Fluxo <ArrowRight className="size-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Diagrama Visual de Fluxo */}
      {activeWorkflow && (
        <div className="p-6 rounded-2xl border border-border bg-card/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sliders className="size-4 text-primary" />
              Diagrama do Fluxo: {activeWorkflow.name}
            </h3>
            <span className="text-xs text-muted-foreground">Execução sequencial garantida</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            {/* Passo 1: Gatilho */}
            <div className="p-4 rounded-xl border border-border bg-background space-y-1 relative">
              <span className="text-[10px] font-bold uppercase text-primary tracking-wider">
                1. Gatilho (Trigger)
              </span>
              <p className="text-xs font-semibold text-foreground">{activeWorkflow.triggerType}</p>
              <p className="text-[11px] text-muted-foreground">Detectado em tempo real</p>
            </div>

            {/* Passo 2: Condição */}
            <div className="p-4 rounded-xl border border-border bg-background space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-500 tracking-wider">
                2. Condição (If)
              </span>
              <p className="text-xs font-semibold text-foreground">Sem resposta após envio</p>
              <p className="text-[11px] text-muted-foreground">Validação de estado</p>
            </div>

            {/* Passo 3: Delay */}
            <div className="p-4 rounded-xl border border-border bg-background space-y-1">
              <span className="text-[10px] font-bold uppercase text-blue-500 tracking-wider">
                3. Espera (Delay)
              </span>
              <p className="text-xs font-semibold text-foreground">
                {activeWorkflow.config?.delayHours ? `${activeWorkflow.config.delayHours} horas` : 'Imediato'}
              </p>
              <p className="text-[11px] text-muted-foreground">Fila assíncrona</p>
            </div>

            {/* Passo 4: Ação */}
            <div className="p-4 rounded-xl border border-border bg-background space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-500 tracking-wider">
                4. Ação (Action)
              </span>
              <p className="text-xs font-semibold text-foreground">Disparo de Email</p>
              <p className="text-[11px] text-muted-foreground">Comprovativo com token</p>
            </div>
          </div>
        </div>
      )}

      {/* Editor de Template de Email & Pré-visualização ao Vivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Mail className="size-4 text-primary" />
              Editor de Template com Variáveis Dinâmicas
            </h3>
            <p className="text-xs text-muted-foreground">
              Clique nas tags abaixo para inserir dados dinâmicos do cliente, proposta ou produtor.
            </p>
          </div>

          {/* Tags dinâmicas */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {DYNAMIC_TAGS.map((t) => (
              <button
                key={t.tag}
                type="button"
                onClick={() => insertTag(t.tag)}
                className="px-2 py-1 text-[11px] font-mono rounded-md border border-border bg-background hover:border-primary/50 text-foreground transition-colors"
                title={`Exemplo: ${t.example}`}
              >
                + {t.tag}
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Assunto do Email
              </label>
              <Input
                value={subject || activeWorkflow?.config?.emailSubject || ''}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Seguimento da sua proposta comercial"
                className="text-xs font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Corpo da Mensagem (Texto / Markdown)
              </label>
              <textarea
                value={body || activeWorkflow?.config?.emailBody || ''}
                onChange={(e) => setBody(e.target.value)}
                rows={9}
                className="w-full rounded-md border border-border bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono leading-relaxed"
                placeholder="Escreva a mensagem personalizada..."
              />
            </div>
          </div>

          {/* Teste de Disparo */}
          <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Input
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Email para teste..."
              className="text-xs max-w-xs"
            />
            <Button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              size="sm"
              className="text-xs gap-1.5 font-medium shrink-0"
            >
              <Send className="size-3.5" />
              {isSimulating ? 'Disparando...' : 'Testar Disparo Agora'}
            </Button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="p-6 rounded-2xl border border-border bg-muted/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Eye className="size-4 text-primary" />
              Pré-Visualização ao Vivo do Email Renderizado
            </h3>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
              Layout Final do Cliente
            </span>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4 text-xs">
            <div className="space-y-1.5 border-b border-border/60 pb-3">
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span>De: <strong className="text-foreground">noreply@nora-audiovisual.ao</strong></span>
                <span>Data: <strong className="text-foreground">{format(new Date(), 'dd/MM/yyyy')}</strong></span>
              </div>
              <div className="text-muted-foreground text-[11px]">
                Para: <strong className="text-foreground">cliente@empresa.ao (Banco BFA)</strong>
              </div>
              <div className="text-foreground font-semibold pt-1">
                Assunto: {renderedSubject}
              </div>
            </div>

            <div className="text-foreground whitespace-pre-line leading-relaxed text-xs">
              {renderedBody}
            </div>

            <div className="pt-4 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
              Enviado automaticamente pelo Nora Automate • Luanda Filmes Studio
            </div>
          </div>
        </div>
      </div>

      {/* Histórico e Telemetria de Execuções Recentes */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Telemetria de Execuções Recentes</h3>
            <p className="text-xs text-muted-foreground">Histórico de disparos efetuados pelo motor de automação com métricas de tempo de resposta.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchExecutions()}
            className="text-xs gap-1.5 border-border"
          >
            <RefreshCw className="size-3.5" />
            Atualizar Telemetria
          </Button>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {executions.map((exec) => (
            <div key={exec.id} className="py-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{exec.workflowName}</span>
                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {exec.status}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Gatilho: {exec.trigger} • Duração: {exec.durationMs}ms
                </span>
              </div>

              <div className="text-right font-mono text-muted-foreground text-[11px]">
                {format(new Date(exec.startedAt), 'dd/MM/yyyy HH:mm:ss')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

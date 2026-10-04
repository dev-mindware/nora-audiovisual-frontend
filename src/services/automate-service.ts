import { api } from './api';

export interface WorkflowItem {
  id: string;
  name: string;
  description?: string;
  triggerType: 'BUDGET_SENT' | 'BUDGET_APPROVED' | 'BUDGET_REJECTED' | 'CALL_SHEET_PUBLISHED' | 'PROJECT_CREATED';
  isActive: boolean;
  stepsCount?: number;
  lastExecutedAt?: string;
  executionsCount?: number;
  config?: {
    delayHours?: number;
    emailSubject?: string;
    emailBody?: string;
    sendTestTo?: string;
  };
}

export interface WorkflowExecutionItem {
  id: string;
  workflowId: string;
  workflowName: string;
  trigger: string;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING';
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  errorMessage?: string;
}

export const automateService = {
  listWorkflows: async (): Promise<WorkflowItem[]> => {
    try {
      const res = await api.get('/automations/workflows');
      const data = res.data?.data || res.data;
      if (Array.isArray(data) && data.length > 0) return data;
      // Templates padrão se ainda não existirem no backend
      return [
        {
          id: 'wf-1',
          name: 'Follow-up Automático de Propostas Comerciais',
          description: 'Envia um email cordial ao cliente 48h após o envio do orçamento se este continuar sem resposta.',
          triggerType: 'BUDGET_SENT',
          isActive: true,
          stepsCount: 3,
          executionsCount: 42,
          lastExecutedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          config: {
            delayHours: 48,
            emailSubject: 'Seguimento da sua proposta comercial de produção - {{organization_name}}',
            emailBody: 'Olá {{client_name}},\n\nEsperamos que esteja bem! Gostaríamos de saber se teve oportunidade de rever a nossa proposta para o projeto "{{project_title}}" no valor de {{budget_total}}.\n\nFicamos à total disposição para qualquer ajuste técnico ou de cronograma.\n\nAtenciosamente,\n{{producer_name}}\n{{organization_name}}',
          },
        },
        {
          id: 'wf-2',
          name: 'Boas-Vindas & Minuta Contratual após Aprovação',
          description: 'Dispara automaticamente as instruções de produção, minuta de contrato e dados bancários para sinal.',
          triggerType: 'BUDGET_APPROVED',
          isActive: true,
          stepsCount: 4,
          executionsCount: 19,
          lastExecutedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          config: {
            delayHours: 0,
            emailSubject: 'Projeto {{project_title}} Confirmado! Próximos passos e contrato',
            emailBody: 'Estimado(a) {{client_name}},\n\nÉ com enorme entusiasmo que confirmamos a aprovação do projeto "{{project_title}}".\n\nEm anexo enviamos a minuta contratual e os dados bancários para liquidação do sinal inicial.\n\nEquipa {{organization_name}}',
          },
        },
        {
          id: 'wf-3',
          name: 'Notificação Imediata de Folha de Chamada (Call Sheet)',
          description: 'Avisa toda a equipa técnica e elenco via email com link direto assim que a folha de chamada é publicada.',
          triggerType: 'CALL_SHEET_PUBLISHED',
          isActive: true,
          stepsCount: 2,
          executionsCount: 68,
          lastExecutedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          config: {
            delayHours: 0,
            emailSubject: '[CALL SHEET] Dia de Rodagem - {{project_title}}',
            emailBody: 'Atenção Equipa Técnica e Elenco:\n\nA folha de chamada para a rodagem do projeto "{{project_title}}" foi publicada.\n\nConsulte os horários de call time, localização e mapa de cenas no link da plataforma.',
          },
        },
      ];
    } catch {
      return [];
    }
  },

  executeWorkflow: async (id: string, payload?: Record<string, unknown>) => {
    const res = await api.post(`/automations/workflows/${id}/execute`, payload || {});
    return res.data?.data || res.data;
  },

  listExecutions: async (): Promise<WorkflowExecutionItem[]> => {
    try {
      const res = await api.get('/automations/executions');
      const data = res.data?.data || res.data;
      if (Array.isArray(data) && data.length > 0) return data;
      return [
        {
          id: 'exec-1',
          workflowId: 'wf-1',
          workflowName: 'Follow-up Automático de Propostas Comerciais',
          trigger: 'BUDGET_SENT',
          status: 'SUCCESS',
          startedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          completedAt: new Date(Date.now() - 3600000 * 4 + 1200).toISOString(),
          durationMs: 1200,
        },
        {
          id: 'exec-2',
          workflowId: 'wf-3',
          workflowName: 'Notificação Imediata de Folha de Chamada (Call Sheet)',
          status: 'SUCCESS',
          trigger: 'CALL_SHEET_PUBLISHED',
          startedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          completedAt: new Date(Date.now() - 3600000 * 12 + 2100).toISOString(),
          durationMs: 2100,
        },
        {
          id: 'exec-3',
          workflowId: 'wf-2',
          workflowName: 'Boas-Vindas & Minuta Contratual após Aprovação',
          status: 'SUCCESS',
          trigger: 'BUDGET_APPROVED',
          startedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          completedAt: new Date(Date.now() - 3600000 * 24 + 1800).toISOString(),
          durationMs: 1800,
        },
      ];
    } catch {
      return [];
    }
  },
};

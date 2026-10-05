import { api } from './api';

export type WorkflowStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT';
export type WorkflowActionType = 'SEND_NOTIFICATION' | 'SEND_EMAIL' | 'CREATE_TASK' | 'WEBHOOK';
export type ExecutionStatus = 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'SKIPPED';

export interface WorkflowAction {
  type: WorkflowActionType;
  config: Record<string, unknown>;
}

export interface WorkflowItem {
  id: string;
  name: string;
  description?: string | null;
  triggerType: string;
  conditions?: unknown[] | null;
  actions: WorkflowAction[];
  status: WorkflowStatus;
  createdAt: string;
}

export interface ActionResult {
  actionType: string;
  status: 'SUCCESS' | 'FAILED';
  executedAt: string;
  error?: string;
}

export interface WorkflowExecutionItem {
  id: string;
  workflowId: string;
  workflow?: { id: string; name: string; triggerType: string };
  triggeredBy?: string | null;
  status: ExecutionStatus;
  error?: string | null;
  outputResult?: { results?: ActionResult[] } | null;
  executedAt: string;
}

export interface WorkflowTestResult {
  workflowId: string;
  dryRun: true;
  wouldExecute: boolean;
  reason: string | null;
  triggerType: string;
  plannedActions: { type: string }[];
}

export interface CreateWorkflowPayload {
  name: string;
  description?: string;
  triggerType: string;
  actions: WorkflowAction[];
  status?: WorkflowStatus;
}

export interface RoleOption {
  id: string;
  code: string;
  name: string;
}

const unwrap = <T>(res: { data: { data?: T } & T }): T => (res.data?.data ?? res.data) as T;

export const automateService = {
  listWorkflows: async (): Promise<WorkflowItem[]> => {
    const res = await api.get('/automations');
    const data = unwrap<WorkflowItem[]>(res);
    return Array.isArray(data) ? data : [];
  },

  createWorkflow: async (payload: CreateWorkflowPayload): Promise<WorkflowItem> => {
    const res = await api.post('/automations', payload);
    return unwrap<WorkflowItem>(res);
  },

  deleteWorkflow: async (id: string) => {
    const res = await api.delete(`/automations/${id}`);
    return unwrap(res);
  },

  setActive: async (id: string, active: boolean): Promise<WorkflowItem> => {
    const res = await api.post(`/automations/${id}/${active ? 'activate' : 'deactivate'}`);
    return unwrap<WorkflowItem>(res);
  },

  /** Simulação sem efeitos: devolve o que seria executado. */
  testWorkflow: async (id: string, inputPayload?: Record<string, unknown>): Promise<WorkflowTestResult> => {
    const res = await api.post(`/automations/${id}/test`, { inputPayload });
    return unwrap<WorkflowTestResult>(res);
  },

  /** Execução real das acções (consome quota mensal). */
  executeWorkflow: async (id: string, inputPayload?: Record<string, unknown>): Promise<WorkflowExecutionItem> => {
    const res = await api.post(`/automations/workflows/${id}/execute`, { inputPayload });
    return unwrap<WorkflowExecutionItem>(res);
  },

  listExecutions: async (workflowId?: string): Promise<WorkflowExecutionItem[]> => {
    const res = await api.get('/automations/executions', { params: workflowId ? { workflowId } : undefined });
    const data = unwrap<WorkflowExecutionItem[]>(res);
    return Array.isArray(data) ? data : [];
  },

  listRoles: async (): Promise<RoleOption[]> => {
    const res = await api.get('/roles');
    const data = unwrap<RoleOption[]>(res);
    return Array.isArray(data) ? data : [];
  },
};

import { z } from 'zod';

export const workflowTriggerOptions = [
  'PROJECT_CREATED',
  'BUDGET_APPROVED',
  'PAYMENT_CONFIRMED',
  'TASK_COMPLETED',
  'CALL_SHEET_PUBLISHED',
  'MANUAL',
] as const;

export const workflowActionTypes = ['SEND_NOTIFICATION', 'SEND_EMAIL', 'CREATE_TASK', 'WEBHOOK'] as const;

export const createWorkflowSchema = z
  .object({
    name: z.string().min(2, 'O nome do fluxo é obrigatório').max(255),
    description: z.string().max(1000).optional(),
    triggerType: z.enum(workflowTriggerOptions),
    actionType: z.enum(workflowActionTypes),
    // SEND_NOTIFICATION / SEND_EMAIL
    roleCodes: z.array(z.string()).optional(),
    title: z.string().max(255).optional(),
    message: z.string().max(2000).optional(),
    // CREATE_TASK
    taskDepartment: z.string().optional(),
    // WEBHOOK
    url: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    const needsRecipients = v.actionType === 'SEND_NOTIFICATION' || v.actionType === 'SEND_EMAIL';
    if (needsRecipients && (!v.roleCodes || v.roleCodes.length === 0)) {
      ctx.addIssue({ code: 'custom', path: ['roleCodes'], message: 'Seleccione pelo menos um perfil destinatário' });
    }
    if (v.actionType !== 'WEBHOOK' && !v.title?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['title'], message: 'Indique o título/assunto' });
    }
    if (v.actionType === 'WEBHOOK') {
      if (!v.url || !/^https:\/\//i.test(v.url)) {
        ctx.addIssue({ code: 'custom', path: ['url'], message: 'O webhook deve usar um URL HTTPS público' });
      }
    }
  });

export type CreateWorkflowFormData = z.infer<typeof createWorkflowSchema>;

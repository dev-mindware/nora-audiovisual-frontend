'use client';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, ButtonSubmit, Input, RHFSelect, Textarea, Checkbox } from '@/components/ui';
import { GlobalModal } from '@/components/modal';
import { useAuthStore } from '@/stores/auth';
import { useNoraSubscriptions } from '@/hooks/subscriptions';
import { useAutomationRoles, useCreateWorkflow } from '@/hooks/automate';
import { createWorkflowSchema, CreateWorkflowFormData } from '@/schemas';
import type { WorkflowAction } from '@/services/automate-service';
import { Zap } from 'lucide-react';

export const TRIGGER_LABELS: Record<string, string> = {
  PROJECT_CREATED: 'Projecto criado',
  BUDGET_APPROVED: 'Orçamento aprovado',
  PAYMENT_CONFIRMED: 'Pagamento confirmado',
  TASK_COMPLETED: 'Tarefa concluída',
  CALL_SHEET_PUBLISHED: 'Ordem de rodagem publicada',
  MANUAL: 'Manual (executado por si)',
};

export const ACTION_LABELS: Record<string, string> = {
  SEND_NOTIFICATION: 'Notificação interna',
  SEND_EMAIL: 'Email para a equipa',
  CREATE_TASK: 'Criar tarefa no projecto',
  WEBHOOK: 'Webhook externo (HTTPS)',
};

const TRIGGER_OPTIONS = Object.entries(TRIGGER_LABELS).map(([value, label]) => ({ value, label }));
const ACTION_OPTIONS = Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label }));

const DEPARTMENT_OPTIONS = [
  { value: 'PRODUCTION', label: 'Produção' },
  { value: 'DIRECTION', label: 'Realização' },
  { value: 'CAMERA', label: 'Imagem / Câmara' },
  { value: 'SOUND', label: 'Som' },
  { value: 'LIGHTING', label: 'Luz' },
  { value: 'EDITING', label: 'Edição' },
  { value: 'COLOR', label: 'Cor' },
  { value: 'ART', label: 'Arte' },
];

function buildAction(data: CreateWorkflowFormData): WorkflowAction {
  switch (data.actionType) {
    case 'SEND_NOTIFICATION':
      return { type: 'SEND_NOTIFICATION', config: { title: data.title, message: data.message ?? '', roleCodes: data.roleCodes } };
    case 'SEND_EMAIL':
      return { type: 'SEND_EMAIL', config: { subject: data.title, body: data.message ?? '', roleCodes: data.roleCodes } };
    case 'CREATE_TASK':
      return { type: 'CREATE_TASK', config: { title: data.title, department: data.taskDepartment ?? 'PRODUCTION' } };
    default:
      return { type: 'WEBHOOK', config: { url: data.url } };
  }
}

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkflowModal({ isOpen, onClose }: WorkflowModalProps) {
  const { user } = useAuthStore();
  const { subscription } = useNoraSubscriptions();
  const isPlatformAdmin = Boolean(user?.isPlatformAdmin || user?.role === 'ADMIN');
  const isExpired = subscription?.status === 'EXPIRED';
  const isTrial = subscription?.status === 'TRIALING' || subscription?.plan?.code === 'INICIAL';
  const hasAutomateAddon = Boolean(
    subscription?.items?.some((it) => it.addOnCode === 'NORA_AUTOMATE' && it.quantity > 0)
  );
  const canCreate =
    isPlatformAdmin ||
    (!isExpired &&
      (hasAutomateAddon || (!isTrial && subscription?.plan?.code && subscription.plan.code !== 'INICIAL')));

  const { mutateAsync: createWorkflow, isPending } = useCreateWorkflow();
  const { data: roles = [] } = useAutomationRoles();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateWorkflowFormData>({
    resolver: zodResolver(createWorkflowSchema),
    defaultValues: { triggerType: 'BUDGET_APPROVED', actionType: 'SEND_NOTIFICATION', roleCodes: [] },
  });

  const actionType = useWatch({ control, name: 'actionType' });
  const needsRecipients = actionType === 'SEND_NOTIFICATION' || actionType === 'SEND_EMAIL';

  const handleCancel = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: CreateWorkflowFormData) => {
    if (!canCreate) {
      toast.error('Nora Automate não está disponível para o plano atual.');
      return;
    }
    try {
      await createWorkflow({
        name: data.name,
        description: data.description || undefined,
        triggerType: data.triggerType,
        actions: [buildAction(data)],
        status: 'ACTIVE',
      });
      handleCancel();
    } catch {
      // toast tratado no hook
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleCancel}
      size="lg"
      title="Novo fluxo de automação"
      description="Defina quando o fluxo dispara e o que faz. As quotas e limites são aplicados pela API."
      icon={<Zap className="h-5 w-5" />}
      footer={
        <>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <ButtonSubmit form="workflow-form" isLoading={isPending} disabled={!canCreate}>
            Criar fluxo
          </ButtonSubmit>
        </>
      }
    >
      {!canCreate && (
        <div className="p-3 mb-4 bg-destructive/10 border border-destructive/20 text-xs text-destructive rounded-none">
          {isExpired
            ? 'A subscrição da sua organização expirou. A criação de novos fluxos está suspensa no modo exclusivo de leitura.'
            : 'Nora Automate não está incluído no seu plano atual (ou plano Inicial de teste). Actualize a subscrição ou contrate o add-on Nora Automate para criar fluxos.'}
        </div>
      )}
      <form id="workflow-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome do fluxo *"
          placeholder="Ex: Avisar financeiro quando o orçamento for aprovado"
          {...register('name')}
          error={errors.name?.message}
        />

        <Textarea label="Descrição" placeholder="Opcional" {...register('description')} error={errors.description?.message} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RHFSelect control={control} name="triggerType" label="Quando dispara" options={TRIGGER_OPTIONS} />
          <RHFSelect control={control} name="actionType" label="O que faz" options={ACTION_OPTIONS} />
        </div>

        {actionType !== 'WEBHOOK' && (
          <Input
            label={actionType === 'SEND_EMAIL' ? 'Assunto *' : 'Título *'}
            placeholder="Pode usar dados do evento: {{payload.total}}"
            {...register('title')}
            error={errors.title?.message}
          />
        )}

        {(actionType === 'SEND_NOTIFICATION' || actionType === 'SEND_EMAIL') && (
          <Textarea label="Mensagem" placeholder="Ex: O orçamento {{payload.budgetId}} foi aprovado." {...register('message')} error={errors.message?.message} />
        )}

        {actionType === 'CREATE_TASK' && (
          <RHFSelect control={control} name="taskDepartment" label="Departamento da tarefa" options={DEPARTMENT_OPTIONS} />
        )}

        {actionType === 'WEBHOOK' && (
          <Input label="URL do webhook (HTTPS) *" placeholder="https://exemplo.com/hooks/nora" {...register('url')} error={errors.url?.message} />
        )}

        {needsRecipients && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Destinatários (perfis) *</p>
            <Controller
              control={control}
              name="roleCodes"
              render={({ field }) => (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roles.map((role) => {
                    const checked = field.value?.includes(role.code) ?? false;
                    return (
                      <label key={role.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(next) =>
                            field.onChange(next ? [...(field.value ?? []), role.code] : (field.value ?? []).filter((c) => c !== role.code))
                          }
                        />
                        {role.name}
                      </label>
                    );
                  })}
                </div>
              )}
            />
            {errors.roleCodes?.message && <p className="text-xs text-destructive">{errors.roleCodes.message}</p>}
          </div>
        )}
      </form>
    </GlobalModal>
  );
}

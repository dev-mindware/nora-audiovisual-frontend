'use client';

import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ButtonSubmit,
  Input,
  GlobalModal,
  PaginatedSelect,
  RHFSelect,
} from '@/components';
import { useRecordPayment } from '@/hooks/finance';
import { useProjects } from '@/hooks/projects';
import { paymentSchema, PaymentFormData } from '@/schemas';
import { CreditCard, DollarSign, Hash } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultBudgetId?: string;
}

const PAYMENT_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Transferência Bancária' },
  { value: 'MULTICAIXA', label: 'Multicaixa Express / POS' },
  { value: 'CASH', label: 'Numerário / Caixa Direto' },
];

const PAYMENT_STATUSES = [
  { value: 'PAID', label: 'Liquidado / Pago (Confirmado)' },
  { value: 'PENDING', label: 'Pendente de Liquidação' },
  { value: 'PARTIALLY_PAID', label: 'Parcialmente Pago' },
];

export function RecordPaymentModal({
  isOpen,
  onClose,
  defaultProjectId,
  defaultBudgetId,
}: RecordPaymentModalProps) {
  const { mutateAsync: recordPayment, isPending } = useRecordPayment();

  const [projectSearch, setProjectSearch] = useState('');
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects({
    search: projectSearch,
  });

  const projectOptions = useMemo(
    () =>
      (projectsData?.data || []).map((p) => ({
        value: p.id,
        label: p.title,
        description: p.clientName || p.client?.name || undefined,
      })),
    [projectsData]
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      projectId: defaultProjectId || '',
      method: 'BANK_TRANSFER',
      status: 'PAID',
      reference: '',
    },
  });

  const handleCancel = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      await recordPayment({
        projectId: data.projectId || defaultProjectId || undefined,
        budgetId: defaultBudgetId || undefined,
        amount: data.amount,
        currency: 'AOA',
        method: data.method,
        status: data.status,
        reference: data.reference?.trim() || undefined,
      });

      handleCancel();
    } catch {
      // Erro tratado pelo hook
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleCancel}
      size="lg"
      title="Registar Recebimento / Pagamento"
      description="Liquidação financeira de propostas comerciais e parcelas de produção."
      icon={<CreditCard className="h-5 w-5" />}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isPending}
            className="min-h-[44px] sm:min-h-0"
          >
            Cancelar
          </Button>
          <ButtonSubmit
            form="record-payment-form"
            size="sm"
            isLoading={isPending}
            className="min-h-[44px] sm:min-h-0"
          >
            Registar Pagamento
          </ButtonSubmit>
        </>
      }
    >
      <form
        id="record-payment-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* Projecto */}
        {!defaultProjectId && (
          <Controller
            name="projectId"
            control={control}
            render={({ field }) => (
              <PaginatedSelect
                label="Projecto Vinculado (Opcional)"
                options={projectOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Nenhum / Pagamento Geral"
                isLoading={isLoadingProjects}
                searchValue={projectSearch}
                onSearchChange={setProjectSearch}
                searchPlaceholder="Pesquisar projecto..."
                pagination={{ page: 1, totalPages: 1 }}
                onPageChange={() => {}}
              />
            )}
          />
        )}

        {/* Método e Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RHFSelect
            name="method"
            control={control}
            label="Método de Liquidação *"
            options={PAYMENT_METHODS}
          />

          <RHFSelect
            name="status"
            control={control}
            label="Estado do Pagamento *"
            options={PAYMENT_STATUSES}
          />
        </div>

        {/* Valor */}
        <div className="space-y-1.5">
          <Input
            type="number"
            step="0.01"
            min="1"
            label="Valor Recebido (AOA) *"
            placeholder="Ex: 500000"
            startIcon="DollarSign"
            {...register('amount', { valueAsNumber: true })}
            error={errors.amount?.message}
            className="h-9 text-xs font-mono rounded-none"
          />
        </div>

        {/* Referência / Comprovativo Bancário */}
        <div className="space-y-1.5">
          <Input
            label="Referência Bancária / N.º Operação (Opcional)"
            placeholder="Ex: REF-MCX-9823472 ou N.º de Talão"
            startIcon="Hash"
            {...register('reference')}
            error={errors.reference?.message}
            className="h-9 text-xs font-mono rounded-none"
          />
        </div>
      </form>
    </GlobalModal>
  );
}

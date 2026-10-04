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
import { useRecordExpense } from '@/hooks/finance';
import { useProjects } from '@/hooks/projects';
import { expenseSchema, ExpenseFormData } from '@/schemas';
import { Receipt } from 'lucide-react';

interface RecordExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

const EXPENSE_CATEGORIES = [
  { value: 'FOOD', label: 'Alimentação & Catering' },
  { value: 'FUEL', label: 'Combustível & Transporte' },
  { value: 'RENTAL', label: 'Aluguer de Locação / Equipamento' },
  { value: 'PERMITS', label: 'Licenças & Taxas de Rodagem' },
  { value: 'FREELANCER', label: 'Cachês & Prestadores Externos' },
  { value: 'MISC', label: 'Diversos & Imprevistos de Campo' },
];

export function RecordExpenseModal({
  isOpen,
  onClose,
  defaultProjectId,
}: RecordExpenseModalProps) {
  const { mutateAsync: recordExpense, isPending } = useRecordExpense();

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
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      projectId: defaultProjectId || '',
      category: 'FOOD',
      date: new Date().toISOString().split('T')[0],
      description: '',
      receiptUrl: '',
    },
  });

  const handleCancel = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      await recordExpense({
        projectId: data.projectId,
        category: data.category,
        amount: data.amount,
        currency: 'AOA',
        date: data.date,
        description: data.description.trim(),
        receiptUrl: data.receiptUrl?.trim() || undefined,
      });

      handleCancel();
    } catch {
      // O erro já é tratado pelo hook
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleCancel}
      size="xl"
      title="Registar Despesa de Campo / Produção"
      description="Lançamento de custos reais de rodagem com comprovativo para auditoria e aprovação."
      icon={<Receipt className="h-5 w-5" />}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <ButtonSubmit
            form="record-expense-form"
            size="sm"
            isLoading={isPending}
          >
            Submeter Despesa
          </ButtonSubmit>
        </>
      }
    >
      <form
        id="record-expense-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* Projeto */}
        {!defaultProjectId && (
          <Controller
            name="projectId"
            control={control}
            render={({ field }) => (
              <div>
                <PaginatedSelect
                  label="Projeto Audiovisual *"
                  options={projectOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Selecione o projeto..."
                  isLoading={isLoadingProjects}
                  searchValue={projectSearch}
                  onSearchChange={setProjectSearch}
                  searchPlaceholder="Pesquisar projeto..."
                  pagination={{ page: 1, totalPages: 1 }}
                  onPageChange={() => {}}
                />
                {errors.projectId && (
                  <p className="text-[11px] text-destructive mt-1">
                    {errors.projectId.message}
                  </p>
                )}
              </div>
            )}
          />
        )}

        {/* Categoria & Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RHFSelect
            name="category"
            control={control}
            label="Categoria da Despesa *"
            options={EXPENSE_CATEGORIES}
          />

          <Input
            type="date"
            label="Data da Despesa *"
            startIcon="Calendar"
            {...register('date')}
            error={errors.date?.message}
            className="h-9 text-xs rounded-none"
          />
        </div>

        {/* Valor */}
        <div className="space-y-1.5">
          <Input
            type="number"
            step="0.01"
            min="1"
            label="Valor em Kwanzas (AOA) *"
            placeholder="Ex: 85000"
            startIcon="DollarSign"
            {...register('amount', { valueAsNumber: true })}
            error={errors.amount?.message}
            className="h-9 text-xs font-mono rounded-none"
          />
        </div>

        {/* Descrição */}
        <div className="space-y-1.5">
          <Input
            label="Descrição / Justificativo *"
            placeholder="Ex: Almoço da equipa de câmara no dia de rodagem em Talatona"
            startIcon="FileText"
            maxLength={255}
            {...register('description')}
            error={errors.description?.message}
            className="h-9 text-xs rounded-none"
          />
        </div>

        {/* URL do Comprovativo */}
        <div className="space-y-1.5">
          <Input
            label="URL do Comprovativo / Fatura (Opcional)"
            placeholder="https://storage.nora.ao/receipts/recibo-123.jpg"
            {...register('receiptUrl')}
            error={errors.receiptUrl?.message}
            className="h-9 text-xs rounded-none font-mono"
          />
          <p className="text-[11px] text-muted-foreground">
            Link direto para o ficheiro ou foto do recibo no Object Storage.
          </p>
        </div>
      </form>
    </GlobalModal>
  );
}

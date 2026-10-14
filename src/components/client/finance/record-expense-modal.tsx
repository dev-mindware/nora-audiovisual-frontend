'use client';

import { useMemo, useState, useRef } from 'react';
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
import { RHFInputCurrency } from '@/components/ui/input-currency';
import { useRecordExpense } from '@/hooks/finance';
import { useProjects } from '@/hooks/projects';
import { useCategories } from '@/hooks/categories';
import { CategoryCreateModal } from '@/components/client/categories';
import { storageUploadService } from '@/services/storage-upload-service';
import { expenseSchema, ExpenseFormData } from '@/schemas';
import {
  Receipt,
  UploadCloud,
  FileCheck2,
  Trash2,
  ExternalLink,
  Plus,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface RecordExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

const DEFAULT_EXPENSE_CATEGORIES = [
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
  const { data: customCategories = [] } = useCategories('EXPENSE');

  const [projectSearch, setProjectSearch] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const categoryOptions = useMemo(() => {
    const list = [...DEFAULT_EXPENSE_CATEGORIES];
    const existing = new Set(list.map((c) => c.value));
    customCategories.forEach((cat) => {
      const slug = cat.slug || cat.name;
      if (!existing.has(slug)) {
        list.push({ value: slug, label: cat.name });
      }
    });
    return list;
  }, [customCategories]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
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

  const receiptUrl = watch('receiptUrl');

  const handleCancel = () => {
    reset();
    setReceiptFileName(null);
    setUploadProgress(0);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingReceipt(true);
    setUploadProgress(10);

    try {
      setReceiptFileName(file.name);
      const asset = await storageUploadService.uploadFile(
        file,
        undefined,
        (progress: number) => setUploadProgress(progress)
      );

      const uploadedUrl = asset.url || '';
      setValue('receiptUrl', uploadedUrl, { shouldValidate: true });
      toast.success('Comprovativo carregado com sucesso no R2!');
    } catch (err: any) {
      toast.error(err?.message || 'Falha ao carregar ficheiro do comprovativo.');
      setReceiptFileName(null);
    } finally {
      setIsUploadingReceipt(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveReceipt = () => {
    setValue('receiptUrl', '');
    setReceiptFileName(null);
    setUploadProgress(0);
  };

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      await recordExpense({
        projectId: data.projectId,
        category: data.category as any,
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
    <>
      <GlobalModal
        isOpen={isOpen}
        onClose={handleCancel}
        size="lg"
        title="Registar Despesa de Campo / Produção"
        description="Lançamento de custos reais de rodagem com upload seguro de comprovativo no R2."
        icon={<Receipt className="h-5 w-5" />}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isPending || isUploadingReceipt}
              className="min-h-[44px] sm:min-h-0 rounded-xs"
            >
              Cancelar
            </Button>
            <ButtonSubmit
              form="record-expense-form"
              data-tour="expense-save"
              size="sm"
              isLoading={isPending}
              disabled={isUploadingReceipt}
              className="min-h-[44px] sm:min-h-0 rounded-xs"
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
          {/* Projecto */}
          {!defaultProjectId && (
            <div data-tour="expense-project">
            <Controller
              name="projectId"
              control={control}
              render={({ field }) => (
                <div>
                  <PaginatedSelect
                    label="Projecto Audiovisual *"
                    options={projectOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleccione o projecto..."
                    isLoading={isLoadingProjects}
                    searchValue={projectSearch}
                    onSearchChange={setProjectSearch}
                    searchPlaceholder="Pesquisar projecto..."
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
            </div>
          )}

          {/* Categoria & Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end" data-tour="expense-category">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">Categoria da Despesa *</span>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <Plus className="h-3 w-3" /> Nova
                </button>
              </div>
              <RHFSelect
                name="category"
                control={control}
                label=""
                options={categoryOptions}
              />
            </div>

            <Input
              type="date"
              label="Data da Despesa *"
              startIcon="Calendar"
              {...register('date')}
              error={errors.date?.message}
              className="h-9 text-xs rounded-xs"
            />
          </div>

          {/* Valor com Formatação Monetária AOA */}
          <div data-tour="expense-amount">
          <RHFInputCurrency
            control={control}
            name="amount"
            label="Valor em Kwanzas (AOA) *"
            placeholder="0,00"
            currency="Kz"
            startIcon="DollarSign"
            className="rounded-xs"
          />
          </div>

          {/* Descrição */}
          <Input
            label="Descrição / Justificativo *"
            placeholder="Ex: Almoço da equipa de câmara no dia de rodagem em Talatona"
            startIcon="FileText"
            maxLength={255}
            {...register('description')}
            error={errors.description?.message}
            className="h-9 text-xs rounded-xs"
          />

          {/* Upload de Comprovativo Real no Cloudflare R2 (sem URL de texto) */}
          <div className="space-y-1.5 pt-1" data-tour="expense-proof">
            <label className="text-xs font-medium text-foreground block">
              Comprovativo / Fatura (Upload Seguro R2)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploadingReceipt}
            />

            {receiptUrl ? (
              <div className="flex items-center justify-between p-3 rounded-xs border border-emerald-500/30 bg-emerald-500/5 transition-all">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xs bg-emerald-500/10 text-emerald-600">
                    <FileCheck2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {receiptFileName || 'Comprovativo Anexado'}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium">
                      Ficheiro gravado no Cloudflare R2
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-xs hover:bg-muted/50 transition-colors"
                    title="Ver Ficheiro"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={handleRemoveReceipt}
                    className="p-1.5 text-destructive/80 hover:text-destructive rounded-xs hover:bg-destructive/10 transition-colors"
                    title="Remover Comprovativo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !isUploadingReceipt && fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-4 border border-dashed rounded-xs cursor-pointer transition-colors ${
                  isUploadingReceipt
                    ? 'border-primary/50 bg-primary/5 cursor-wait'
                    : 'border-border/80 hover:border-primary/60 hover:bg-muted/30 bg-muted/10'
                }`}
              >
                {isUploadingReceipt ? (
                  <div className="flex flex-col items-center gap-2 text-center py-1">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-xs font-medium text-foreground">
                      A enviar comprovativo para o R2... ({uploadProgress}%)
                    </p>
                    <div className="w-36 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center gap-1">
                    <UploadCloud className="h-5 w-5 text-muted-foreground" />
                    <p className="text-xs font-medium text-foreground">
                      Clique para carregar o recibo / comprovativo
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Suporta PDF, JPEG, PNG ou WEBP (armazenamento Cloudflare R2)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </GlobalModal>

      <CategoryCreateModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        defaultScope="EXPENSE"
      />
    </>
  );
}

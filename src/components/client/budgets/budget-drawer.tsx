'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Button,
  ButtonSubmit,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import { InputCurrency, RHFInputCurrency } from '@/components/ui/input-currency';
import { PaginatedSelect } from '@/components/shared';
import { useCreateBudget } from '@/hooks/budgets';
import { clientsService, ClientData } from '@/services/clients-service';
import { useProjects } from '@/hooks/projects';
import { useCategories } from '@/hooks/categories';
import { CategoryCreateModal } from '@/components/client/categories';
import { ClientModal } from '@/components/client/crm';
import { budgetFormSchema, BudgetFormData } from '@/schemas';
import { formatCurrency } from '@/utils/format-currency';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  UserPlus,
  Sparkles,
  Calculator,
  Receipt,
  Layers,
  ArrowRight,
} from 'lucide-react';

const DEFAULT_CATEGORY_OPTIONS = [
  { label: 'Equipa Técnica & Direcção', value: 'CREW' },
  { label: 'Equipamento Audiovisual', value: 'EQUIPMENT' },
  { label: 'Estúdio / Set de Gravação', value: 'STUDIO' },
  { label: 'Pós-Produção & Montagem', value: 'POST_PRODUCTION' },
  { label: 'Logística & Transporte', value: 'TRANSPORT' },
  { label: 'Catering & Alimentação', value: 'CATERING' },
  { label: 'Outros Custos / Gerais', value: 'MISC' },
];

interface BudgetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BudgetDrawer({ isOpen, onClose }: BudgetDrawerProps) {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const { data: projectsData, isLoading: isLoadingProjects } = useProjects();
  const projects = projectsData?.data || [];
  const [projectSearch, setProjectSearch] = useState('');

  const { data: dbCategories = [] } = useCategories('SERVICE');

  const categoryOptions = useMemo(() => {
    if (dbCategories.length > 0) {
      return [
        ...DEFAULT_CATEGORY_OPTIONS,
        ...dbCategories.map((c) => ({
          label: c.name,
          value: c.slug || c.name,
        })),
      ];
    }
    return DEFAULT_CATEGORY_OPTIONS;
  }, [dbCategories]);

  const { mutateAsync: createBudget, isPending } = useCreateBudget();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema) as any,
    defaultValues: {
      clientId: '',
      projectId: '',
      discount: 0,
      notes: '',
      items: [], // Começa limpo sem mock data forçado!
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const loadClients = () => {
    setIsLoadingClients(true);
    clientsService
      .getAll()
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setClients(list.filter((c): c is ClientData & { id: string } => Boolean(c.id)));
      })
      .catch(() => setClients([]))
      .finally(() => setIsLoadingClients(false));
  };

  useEffect(() => {
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  const clientOptions = useMemo(() => {
    return clients
      .filter((c) =>
        clientSearch ? c.name.toLowerCase().includes(clientSearch.toLowerCase()) : true
      )
      .map((c) => ({
        label: c.name,
        value: c.id as string,
        description: c.email || c.taxId || undefined,
      }));
  }, [clients, clientSearch]);

  const projectOptions = useMemo(() => {
    const list = projects
      .filter((p) =>
        projectSearch ? p.title.toLowerCase().includes(projectSearch.toLowerCase()) : true
      )
      .map((p) => ({
        label: p.title,
        value: p.id,
      }));
    return [{ label: 'Orçamento Avulso (Novo Projecto)', value: '' }, ...list];
  }, [projects, projectSearch]);

  const items = watch('items') || [];
  const discount = Number(watch('discount')) || 0;

  const subtotal = items.reduce((acc, curr) => {
    const qty = Number(curr.quantity) || 0;
    const price = Number(curr.unitPrice) || 0;
    return acc + qty * price;
  }, 0);

  const total = Math.max(0, subtotal - discount);

  const handleCancel = () => {
    reset();
    onClose();
  };

  const handleAddItem = () => {
    append({
      category: 'CREW',
      description: '',
      quantity: 1,
      unitPrice: 0,
    });
  };

  const onSubmit = async (data: BudgetFormData) => {
    try {
      await createBudget({
        clientId: data.clientId,
        projectId: data.projectId || undefined,
        discount: Number(data.discount) || 0,
        notes: data.notes?.trim() || undefined,
        items: data.items.map((item) => ({
          category: item.category,
          description: item.description,
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
        })),
      });

      handleCancel();
    } catch {
      // toast in mutation
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-3xl md:max-w-4xl p-0 flex flex-col h-full bg-card border-l border-border"
        >
          {/* Header Fixo */}
          <SheetHeader className="px-6 py-4 border-b border-border bg-muted/20 shrink-0">
            <div className="flex items-center gap-2.5 text-primary">
              <FileSpreadsheet className="h-5 w-5" />
              <SheetTitle className="text-base font-semibold uppercase tracking-wider text-foreground">
                Elaboração de Proposta Comercial / Orçamento
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted-foreground">
              Componha serviços, diárias técnicas e alugueres com cálculo automatizado em Kwanzas (AOA).
            </SheetDescription>
          </SheetHeader>

          {/* Corpo Rolável */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            <form id="budget-drawer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Seção 1: Cliente e Projeto */}
              <div className="p-4 rounded-xs border border-border bg-background space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  1. Destinatário & Vínculo de Produção
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cliente com botão + Novo Cliente */}
                  <div className="space-y-1.5" data-tour="budget-client">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground">
                        Cliente / Agência <span className="text-destructive">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsClientModalOpen(true)}
                        className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        <UserPlus className="h-3 w-3" /> Novo Cliente
                      </button>
                    </div>
                    <Controller
                      control={control}
                      name="clientId"
                      render={({ field: { onChange, value } }) => (
                        <PaginatedSelect
                          value={value}
                          options={clientOptions}
                          onChange={onChange}
                          isLoading={isLoadingClients}
                          placeholder="Pesquise o cliente contratante..."
                          fullWidth
                          searchValue={clientSearch}
                          onSearchChange={setClientSearch}
                          searchPlaceholder="Digitar nome da empresa ou agência..."
                          error={errors.clientId?.message}
                          pagination={{ page: 1, totalPages: 1 }}
                          onPageChange={() => {}}
                        />
                      )}
                    />
                  </div>

                  {/* Projeto */}
                  <div className="space-y-1.5" data-tour="budget-project">
                    <label className="text-xs font-semibold text-foreground">
                      Projecto Associado (Opcional)
                    </label>
                    <Controller
                      control={control}
                      name="projectId"
                      render={({ field: { onChange, value } }) => (
                        <PaginatedSelect
                          value={value || ''}
                          options={projectOptions}
                          onChange={onChange}
                          isLoading={isLoadingProjects}
                          placeholder="Selecione um projecto em curso..."
                          fullWidth
                          searchValue={projectSearch}
                          onSearchChange={setProjectSearch}
                          searchPlaceholder="Pesquisar projecto..."
                          pagination={{ page: 1, totalPages: 1 }}
                          onPageChange={() => {}}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2: Itens Orçados */}
              <div className="p-4 rounded-xs border border-border bg-background space-y-4" data-tour="budget-items">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Layers className="h-4 w-4 text-primary" />
                    2. Discriminação de Custos & Serviços ({fields.length})
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                    className="h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/10 rounded-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> Adicionar Linha
                  </Button>
                </div>

                {errors.items && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.items.message}
                  </p>
                )}

                {fields.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-border rounded-xs bg-muted/10">
                    <p className="text-xs text-muted-foreground">
                      Nenhum item adicionado ao orçamento.
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddItem}
                      className="mt-3 text-xs gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" /> Inserir Primeiro Item
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field, index) => {
                      const itemQuantity = Number(watch(`items.${index}.quantity`)) || 1;
                      const itemUnitPrice = Number(watch(`items.${index}.unitPrice`)) || 0;
                      const itemTotal = itemQuantity * itemUnitPrice;

                      return (
                        <div
                          key={field.id}
                          className="p-3.5 rounded-xs border border-border/80 bg-muted/20 hover:border-border transition-all space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                              Item #{index + 1}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-semibold text-foreground font-mono">
                                Subtotal: {formatCurrency(itemTotal)}
                              </span>
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-1 rounded-xs hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                title="Remover Item"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            {/* Categoria */}
                            <div className="md:col-span-3 space-y-1">
                              <label className="text-[11px] font-medium text-foreground">
                                Categoria
                              </label>
                              <Controller
                                name={`items.${index}.category`}
                                control={control}
                                render={({ field: catField }) => (
                                  <Select
                                    value={catField.value}
                                    onValueChange={catField.onChange}
                                  >
                                    <SelectTrigger className="h-9 text-xs rounded-xs">
                                      <SelectValue placeholder="Categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categoryOptions.map((opt) => (
                                        <SelectItem
                                          key={opt.value}
                                          value={opt.value}
                                          className="text-xs"
                                        >
                                          {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            </div>

                            {/* Descrição */}
                            <div className="md:col-span-5 space-y-1">
                              <label className="text-[11px] font-medium text-foreground">
                                Descrição do Serviço / Recurso *
                              </label>
                              <Input
                                placeholder="Ex: Diária de Operador de Câmara FX3"
                                {...register(`items.${index}.description`)}
                                className="h-9 text-xs rounded-xs"
                              />
                            </div>

                            {/* Quantidade com type="quantity" */}
                            <div className="md:col-span-2 space-y-1">
                              <Controller
                                name={`items.${index}.quantity`}
                                control={control}
                                render={({ field: qtyField }) => (
                                  <Input
                                    type="quantity"
                                    label="Qtd."
                                    value={qtyField.value}
                                    onChange={(e: any) =>
                                      qtyField.onChange(Number(e.target.value) || 1)
                                    }
                                  />
                                )}
                              />
                            </div>

                            {/* Preço Unitário com InputCurrency */}
                            <div className="md:col-span-2 space-y-1">
                              <Controller
                                name={`items.${index}.unitPrice`}
                                control={control}
                                render={({ field: priceField }) => (
                                  <InputCurrency
                                    label="Preço Unit."
                                    value={priceField.value}
                                    onValueChange={(val) => priceField.onChange(val)}
                                    currency="Kz"
                                    className="h-9 text-xs"
                                  />
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Seção 3: Resumo Financeiro & Desconto */}
              <div className="p-4 rounded-xs border border-border bg-background space-y-4" data-tour="budget-summary">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  3. Fechamento Financeiro & Condições
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-3">
                    <RHFInputCurrency
                      name="discount"
                      control={control}
                      label="Desconto Comercial Aplicado (Kz)"
                      currency="Kz"
                      className="h-9 text-xs"
                    />

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">
                        Termos, Prazos & Notas do Orçamento
                      </label>
                      <Textarea
                        placeholder="Ex: 50% de sinal na adjudicação e 50% na entrega do master final. Proposta válida por 15 dias."
                        {...register('notes')}
                        rows={2}
                        className="text-xs rounded-xs"
                      />
                    </div>
                  </div>

                  {/* Card de Total Geral em Destaque */}
                  <div className="p-4 rounded-xs border border-primary/20 bg-primary/5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Subtotal Bruto:</span>
                      <span className="font-mono font-medium text-foreground">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Desconto Comercial:</span>
                      <span className="font-mono font-medium text-destructive">
                        - {formatCurrency(discount)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-primary/20 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                        Valor Total Líquido:
                      </span>
                      <span className="text-lg font-bold text-primary font-mono">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer Fixo */}
          <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-end gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isPending}
              className="text-xs h-9 px-4 rounded-xs"
            >
              Cancelar
            </Button>
            <ButtonSubmit
              form="budget-drawer-form"
              data-tour="budget-save"
              size="sm"
              isLoading={isPending}
              className="text-xs h-9 px-5 rounded-xs"
            >
              Emitir Proposta Comercial
            </ButtonSubmit>
          </div>
        </SheetContent>
      </Sheet>

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          loadClients();
        }}
      />
    </>
  );
}

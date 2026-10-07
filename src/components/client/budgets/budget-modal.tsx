'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ButtonSubmit,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { PaginatedSelect } from '@/components/shared';
import { GlobalModal } from '@/components/modal';
import { useCreateBudget } from '@/hooks/budgets';
import { clientsService, ClientData } from '@/services/clients-service';
import { useProjects } from '@/hooks/projects';
import { budgetFormSchema, BudgetFormData } from '@/schemas';
import { FileSpreadsheet, Plus, Trash2 } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { label: 'Equipa Técnica', value: 'CREW' },
  { label: 'Equipamento', value: 'EQUIPMENT' },
  { label: 'Estúdio / Set', value: 'STUDIO' },
  { label: 'Pós-Produção', value: 'POST_PRODUCTION' },
  { label: 'Logística / Transp.', value: 'TRANSPORT' },
  { label: 'Catering', value: 'CATERING' },
  { label: 'Outros', value: 'MISC' },
];

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BudgetModal({ isOpen, onClose }: BudgetModalProps) {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  const { data: projectsData, isLoading: isLoadingProjects } = useProjects();
  const projects = projectsData?.data || [];
  const [projectSearch, setProjectSearch] = useState('');

  const { mutateAsync: createBudget, isPending } = useCreateBudget();

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      clientId: '',
      projectId: '',
      discount: 0,
      items: [
        {
          category: 'CREW',
          description: 'Direcção de Fotografia & Operação de Câmara',
          quantity: 1,
          unitPrice: 250000,
        },
        {
          category: 'EQUIPMENT',
          description: 'Kit Cinema 4K + Objectivas Prime + Estabilizador',
          quantity: 1,
          unitPrice: 180000,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  useEffect(() => {
    if (isOpen) {
      setIsLoadingClients(true);
      clientsService
        .getAll()
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.data || [];
          setClients(list.filter((c): c is ClientData & { id: string } => Boolean(c.id)));
        })
        .catch(() => setClients([]))
        .finally(() => setIsLoadingClients(false));
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

  // Financial calculations
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

  const onSubmit = async (data: BudgetFormData) => {
    try {
      await createBudget({
        clientId: data.clientId,
        projectId: data.projectId || undefined,
        discount: Number(data.discount) || 0,
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : undefined,
        items: data.items.map((i) => ({
          category: i.category,
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
      });
      handleCancel();
    } catch {
      // toast handled in hook
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleCancel}
      size="2xl"
      title="Novo Orçamento Comercial"
      description="Construtor estruturado por rubricas audiovisuais e cálculo de propostas."
      icon={<FileSpreadsheet className="h-5 w-5" />}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="min-h-[44px] sm:min-h-0"
          >
            Cancelar
          </Button>
          <ButtonSubmit
            form="budget-form"
            isLoading={isPending}
            className="min-h-[44px] sm:min-h-0"
          >
            Gerar Orçamento
          </ButtonSubmit>
        </>
      }
    >
      <form id="budget-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Controller
            control={control}
            name="clientId"
            render={({ field: { onChange, value } }) => (
              <PaginatedSelect
                label="Cliente / Agência *"
                value={value}
                options={clientOptions}
                onChange={onChange}
                isLoading={isLoadingClients}
                placeholder="Seleccione um cliente..."
                fullWidth
                searchValue={clientSearch}
                onSearchChange={setClientSearch}
                searchPlaceholder="Pesquisar cliente..."
                error={errors.clientId?.message}
                pagination={{ page: 1, totalPages: 1 }}
                onPageChange={() => {}}
              />
            )}
          />

          <Controller
            control={control}
            name="projectId"
            render={({ field: { onChange, value } }) => (
              <PaginatedSelect
                label="Projecto Vinculado"
                value={value || ''}
                options={projectOptions}
                onChange={onChange}
                isLoading={isLoadingProjects}
                placeholder="Orçamento Avulso (Novo Projecto)"
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

        {/* Rubricas / Itens do Orçamento */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rubricas de Produção
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  category: 'CREW',
                  description: '',
                  quantity: 1,
                  unitPrice: 0,
                })
              }
              className="h-8 rounded-xl border-border text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5 text-primary" /> Adicionar Linha
            </Button>
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card p-3 shadow-xs"
              >
                <Controller
                  control={control}
                  name={`items.${index}.category`}
                  render={({ field: catField }) => (
                    <div className="w-36 shrink-0">
                      <Select
                        value={catField.value}
                        onValueChange={catField.onChange}
                      >
                        <SelectTrigger className="h-9 text-xs rounded-xl">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />

                <Input
                  placeholder="Descrição da rubrica"
                  {...register(`items.${index}.description`)}
                  className="flex-1 min-w-[140px] h-9 text-xs rounded-xl"
                  error={errors.items?.[index]?.description?.message}
                />

                <Input
                  type="number"
                  placeholder="Qtd"
                  min={1}
                  {...register(`items.${index}.quantity`)}
                  className="w-16 h-9 text-xs text-center rounded-xl"
                />

                <Input
                  type="number"
                  placeholder="Valor Unit. (Kz)"
                  min={0}
                  {...register(`items.${index}.unitPrice`)}
                  className="w-28 h-9 text-xs text-right rounded-xl"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive disabled:opacity-20 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {errors.items?.root && (
            <p className="text-xs text-destructive">{errors.items.root.message}</p>
          )}
        </div>

        {/* Resumo Financeiro */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-2 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal de Rubricas:</span>
            <span className="font-semibold text-foreground">{subtotal.toLocaleString('pt-AO')} Kz</span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Desconto Comercial (Kz):</span>
            <input
              type="number"
              min={0}
              {...register('discount')}
              className="w-28 rounded-xl border border-input bg-card px-2.5 py-1 text-right text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex justify-between text-sm font-semibold text-foreground border-t border-border/40 pt-2">
            <span>Total Orçamentado:</span>
            <span className="text-primary font-mono text-base">
              {total.toLocaleString('pt-AO', { maximumFractionDigits: 2 })} Kz
            </span>
          </div>
        </div>
      </form>
    </GlobalModal>
  );
}

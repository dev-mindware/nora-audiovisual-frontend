'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ButtonSubmit,
  Input,
  Textarea,
  RHFSelect,
} from '@/components/ui';
import { PaginatedSelect } from '@/components/shared';
import { GlobalModal } from '@/components/modal';
import { useCreateProject } from '@/hooks/projects';
import { useServices } from '@/hooks/services';
import { clientsService, ClientData } from '@/services/clients-service';
import { createProjectSchema, ProjectFormData } from '@/schemas';
import { ClientModal } from '@/components/client/crm';
import { Clapperboard, UserPlus, Clock, Sparkles, X, AlertCircle, Package2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DRAFT_STORAGE_KEY = 'nora_project_modal_draft';

export function ProjectModal({ isOpen, onClose }: ProjectModalProps) {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [isCreatingProvisionalClient, setIsCreatingProvisionalClient] = useState(false);

  const { mutateAsync: createProject, isPending } = useCreateProject();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      productionStage: 'PRE_PRODUCTION',
      lifecycleStatus: 'PLANNING',
    },
  });

  const formValues = watch();
  const isInitialMount = useRef(true);

  // 1. Carregar lista de clientes ao abrir
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

      // Restaurar rascunho anterior salvo se existir
      try {
        const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (rawDraft) {
          const draft = JSON.parse(rawDraft);
          if (draft && (draft.title || draft.clientId || draft.description)) {
            reset({
              title: draft.title || '',
              clientId: draft.clientId || '',
              productionStage: draft.productionStage || 'PRE_PRODUCTION',
              lifecycleStatus: draft.lifecycleStatus || 'PLANNING',
              startDate: draft.startDate || '',
              endDate: draft.endDate || '',
              description: draft.description || '',
            });
            setHasRestoredDraft(true);
          }
        }
      } catch {
        // Ignora erros de parsing
      }
    } else {
      setHasRestoredDraft(false);
    }
  }, [isOpen, reset]);

  // 2. Persistir rascunho automaticamente enquanto o utilizador preenche
  useEffect(() => {
    if (!isOpen) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    try {
      if (formValues.title || formValues.clientId || formValues.description) {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formValues));
      }
    } catch {
      // Ignora erro de cota de armazenamento
    }
  }, [formValues, isOpen]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
    reset({
      title: '',
      clientId: '',
      productionStage: 'PRE_PRODUCTION',
      lifecycleStatus: 'PLANNING',
      startDate: '',
      endDate: '',
      description: '',
    });
    setHasRestoredDraft(false);
    toast.info('Rascunho descartado.');
  };

  const { data: servicesData } = useServices({ isActive: true });
  const services = useMemo(() => servicesData?.data || [], [servicesData]);

  const serviceOptions = useMemo(() => {
    return [
      { label: 'Nenhum (Produção Sob Medida)', value: '' },
      ...services.map((s) => ({
        label: `${s.name} — ${new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(s.price))}`,
        value: s.id,
      })),
    ];
  }, [services]);

  const selectedServiceId = watch('serviceId');
  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId),
    [services, selectedServiceId]
  );

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

  const handleCancel = () => {
    onClose();
  };

  // Callback chamado quando um cliente novo for criado via ClientModal inline
  const handleClientCreated = (newClient: ClientData) => {
    if (!newClient?.id) return;
    setClients((prev) => {
      const exists = prev.some((c) => c.id === newClient.id);
      return exists ? prev : [newClient, ...prev];
    });
    setValue('clientId', newClient.id, { shouldValidate: true });
    setIsClientModalOpen(false);
    toast.success(`Cliente "${newClient.name}" associado ao projecto!`);
  };

  // Criar cliente provisório / pendente com 1 clique caso não tenha os dados completos
  const handleCreateProvisionalClient = async () => {
    const currentTitle = getValues('title')?.trim();
    const clientName = currentTitle ? `Cliente Provisório (${currentTitle})` : `Cliente Pendente - ${new Date().toLocaleDateString('pt-AO')}`;

    setIsCreatingProvisionalClient(true);
    try {
      const created = await clientsService.addClient({
        name: clientName,
        status: 'ACTIVE',
      });
      const clientObj = created?.data || created;
      if (clientObj?.id) {
        handleClientCreated(clientObj);
        setValue('lifecycleStatus', 'PLANNING');
        toast.success('Cliente provisório criado! O projecto ficará marcado como Planeamento.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao criar cliente provisório.');
    } finally {
      setIsCreatingProvisionalClient(false);
    }
  };

  const onSubmit = async (data: ProjectFormData, isPendingDraft = false) => {
    try {
      await createProject({
        title: data.title,
        clientId: data.clientId,
        serviceId: data.serviceId || undefined,
        productionStage: data.productionStage,
        lifecycleStatus: isPendingDraft ? 'PLANNING' : data.lifecycleStatus,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      });

      // Limpa rascunho após criação bem-sucedida
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // ignore
      }

      reset();
      onClose();
    } catch {
      // Erro tratado pela mutation
    }
  };

  return (
    <>
      <GlobalModal
        isOpen={isOpen}
        onClose={handleCancel}
        size="lg"
        title="Novo Projecto Audiovisual"
        description="Defina os parâmetros de produção, fase e cliente associado."
        icon={<Clapperboard className="h-5 w-5 text-primary" />}
        canClose
        footer={
          <div className="w-full min-w-0 flex flex-col gap-2.5">
            {hasRestoredDraft && (
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/30">
                <span className="flex items-center gap-1.5 text-primary text-[11px] font-medium">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  Rascunho recuperado
                </span>
                <button
                  type="button"
                  onClick={clearDraft}
                  className="text-muted-foreground hover:text-destructive text-[11px] underline transition-colors"
                >
                  Descartar rascunho
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 w-full min-w-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isPending}
                className="w-full sm:w-auto h-10 sm:h-9 px-4 text-xs font-medium"
              >
                Cancelar
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isPending || !formValues.title}
                onClick={handleSubmit((data) => onSubmit(data, true))}
                className="w-full sm:w-auto h-10 sm:h-9 px-3 text-xs font-medium gap-1.5 border border-border/60 hover:bg-muted"
                title="Salva o projecto no estado Planeamento para concluir mais tarde"
              >
                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">Guardar Pendente</span>
              </Button>

              <ButtonSubmit
                form="project-form"
                size="sm"
                isLoading={isPending}
                className="col-span-2 sm:col-auto sm:w-auto h-10 sm:h-9 px-5 text-xs font-semibold"
              >
                Criar Projecto
              </ButtonSubmit>
            </div>
          </div>
        }
      >
        <form id="project-form" onSubmit={handleSubmit((data) => onSubmit(data, false))} className="space-y-4">
          {/* Banner de Rascunho Restaurado */}
          {hasRestoredDraft && (
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Rascunho recuperado automaticamente. O seu progresso foi mantido.</span>
              </div>
              <button
                type="button"
                onClick={clearDraft}
                className="text-muted-foreground hover:text-foreground text-[11px] underline ml-2"
              >
                Limpar
              </button>
            </div>
          )}

          <Input
            label="Título da Produção *"
            placeholder="Ex: Comercial de Verão 2026 / Videoclipe"
            {...register('title')}
            error={errors.title?.message}
          />

          {/* Campo de Cliente com Botão "+ Registar Cliente" Integrado */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Cliente / Agência <span className="text-destructive">*</span>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsClientModalOpen(true)}
                className="h-7 px-2 text-xs text-primary border-primary/30 hover:bg-primary/10 gap-1.5"
              >
                <UserPlus className="h-3.5 w-3.5" />
                + Novo Cliente
              </Button>
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
                  placeholder={clients.length === 0 ? "Nenhum cliente cadastrado ainda..." : "Seleccione um cliente..."}
                  fullWidth
                  searchValue={clientSearch}
                  onSearchChange={setClientSearch}
                  searchPlaceholder="Pesquisar cliente por nome ou NIF..."
                  error={errors.clientId?.message}
                  pagination={{ page: 1, totalPages: 1 }}
                  onPageChange={() => {}}
                />
              )}
            />

            {/* Ação rápida se não tiver clientes */}
            {clients.length === 0 && !isLoadingClients && (
              <div className="flex items-center justify-between p-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Sem clientes? Crie um agora ou gere um cliente provisório.
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isCreatingProvisionalClient}
                  onClick={handleCreateProvisionalClient}
                  className="h-6 px-2 text-[11px] underline font-medium hover:bg-transparent"
                >
                  {isCreatingProvisionalClient ? 'A criar...' : 'Criar Cliente Provisório'}
                </Button>
              </div>
            )}
          </div>

          {/* Serviço do Catálogo com Geração Automática de Proposta */}
          <div className="space-y-1.5">
            <RHFSelect
              control={control}
              name="serviceId"
              label="Pacote / Serviço do Catálogo (Opcional)"
              options={serviceOptions}
            />

            {selectedService && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-1.5 text-xs text-foreground">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <Package2 className="h-4 w-4" />
                  <span>Proposta Comercial Automática Vinculada</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Ao criar este projecto, será gerada automaticamente uma proposta comercial de{' '}
                  <strong className="text-foreground">
                    {new Intl.NumberFormat('pt-AO', {
                      style: 'currency',
                      currency: 'AOA',
                      maximumFractionDigits: 0,
                    }).format(Number(selectedService.price))}
                  </strong>{' '}
                  (+ 14% IVA) associada ao cliente e ao projeto.
                </p>
                {selectedService.benefits && selectedService.benefits.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedService.benefits.map((b: string, i: number) => (
                      <span
                        key={i}
                        className="inline-block px-2 py-0.5 text-[10px] bg-background border border-border rounded-md font-medium text-muted-foreground"
                      >
                        ✓ {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <RHFSelect
              control={control}
              name="productionStage"
              label="Fase de Produção"
              options={[
                { label: 'Pré-Produção', value: 'PRE_PRODUCTION' },
                { label: 'Produção / Rodagem', value: 'PRODUCTION' },
                { label: 'Pós-Produção', value: 'POST_PRODUCTION' },
                { label: 'Revisão de Copião', value: 'REVIEW' },
                { label: 'Entregue', value: 'DELIVERED' },
              ]}
            />

            <RHFSelect
              control={control}
              name="lifecycleStatus"
              label="Estado Operacional"
              options={[
                { label: 'Planeamento (Pendente)', value: 'PLANNING' },
                { label: 'Em Curso (Activo)', value: 'ACTIVE' },
                { label: 'Proposta / Lead (Pendente)', value: 'LEAD' },
                { label: 'Concluído', value: 'COMPLETED' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              type="date"
              label="Início Previsto"
              {...register('startDate')}
              error={errors.startDate?.message}
            />
            <Input
              type="date"
              label="Entrega Prevista"
              {...register('endDate')}
              error={errors.endDate?.message}
            />
          </div>

          <div className="space-y-1.5">
            <Textarea
              label="Notas / Briefing"
              {...register('description')}
              rows={3}
              placeholder="Notas de direcção, especificações de entrega, formato..."
              error={errors.description?.message}
            />
          </div>
        </form>
      </GlobalModal>

      {/* Sub-modal de Criação de Cliente sem sair do fluxo de projecto */}
      {isClientModalOpen && (
        <ClientModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          onSuccess={handleClientCreated}
        />
      )}
    </>
  );
}

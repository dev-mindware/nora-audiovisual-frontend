'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { clientsService, ClientData } from '@/services/clients-service';
import { createProjectSchema, ProjectFormData } from '@/schemas';
import { Clapperboard } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectModal({ isOpen, onClose }: ProjectModalProps) {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const { mutateAsync: createProject, isPending } = useCreateProject();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      productionStage: 'PRE_PRODUCTION',
      lifecycleStatus: 'PLANNING',
    },
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

  const handleCancel = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      await createProject({
        title: data.title,
        clientId: data.clientId,
        productionStage: data.productionStage,
        lifecycleStatus: data.lifecycleStatus,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      });
      handleCancel();
    } catch {
      // Handled in mutation onError
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleCancel}
      size="lg"
      title="Novo Projecto Audiovisual"
      description="Defina os parâmetros de produção, fase e cliente associado."
      icon={<Clapperboard className="h-5 w-5" />}
      canClose
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
            form="project-form"
            isLoading={isPending}
            className="min-h-[44px] sm:min-h-0"
          >
            Criar Projecto
          </ButtonSubmit>
        </>
      }
    >
      <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Título da Produção *"
          placeholder="Ex: Comercial de Verão 2026 / Videoclipe"
          {...register('title')}
          error={errors.title?.message}
        />

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
              { label: 'Planeamento', value: 'PLANNING' },
              { label: 'Em Curso (Activo)', value: 'ACTIVE' },
              { label: 'Proposta / Lead', value: 'LEAD' },
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
  );
}

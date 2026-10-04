'use client';

import { useMemo, useState } from 'react';
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
import { useCreateDeliverable } from '@/hooks/deliverables';
import { useProjects } from '@/hooks/projects';
import { createDeliverableSchema, DeliverableFormData } from '@/schemas';
import { DeliverableType } from '@/types';
import { Video, Camera } from 'lucide-react';

interface DeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

export function DeliverableModal({ isOpen, onClose, defaultProjectId }: DeliverableModalProps) {
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects();
  const projects = projectsData?.data || [];
  const [projectSearch, setProjectSearch] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<DeliverableFormData>({
    resolver: zodResolver(createDeliverableSchema),
    defaultValues: {
      projectId: defaultProjectId || '',
      type: 'FINAL_MASTER',
      includedPhotosCount: 20,
      extraPhotoPrice: 2500,
      allowExtraPurchase: true,
    },
  });

  const selectedProjectId = watch('projectId') || defaultProjectId || '';
  const selectedType = watch('type');
  const isPhotoshoot = selectedType === 'PHOTOSHOOT';

  const { mutateAsync: createDeliverable, isPending } = useCreateDeliverable(selectedProjectId);

  const projectOptions = useMemo(() => {
    return projects
      .filter((p) =>
        projectSearch ? p.title.toLowerCase().includes(projectSearch.toLowerCase()) : true
      )
      .map((p) => ({
        label: p.title,
        value: p.id,
      }));
  }, [projects, projectSearch]);

  const handleCancel = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: DeliverableFormData) => {
    try {
      await createDeliverable({
        title: data.title,
        type: data.type as DeliverableType,
        notes: data.notes,
        includedPhotosCount: isPhotoshoot ? Number(data.includedPhotosCount) : undefined,
        extraPhotoPrice: isPhotoshoot ? Number(data.extraPhotoPrice) : undefined,
        allowExtraPurchase: isPhotoshoot ? data.allowExtraPurchase : undefined,
      });
      handleCancel();
    } catch {
      // Handled in mutation
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleCancel}
      size="md"
      title="Novo Entregável / Copião"
      description="Registe cortes, sessões de fotos ou master final para aprovação."
      icon={isPhotoshoot ? <Camera className="h-5 w-5" /> : <Video className="h-5 w-5" />}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <ButtonSubmit
            form="deliverable-form"
            isLoading={isPending}
          >
            Criar Entregável
          </ButtonSubmit>
        </>
      }
    >
      <form id="deliverable-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          control={control}
          name="projectId"
          render={({ field: { onChange, value } }) => (
            <PaginatedSelect
              label="Projeto Audiovisual *"
              value={value}
              options={projectOptions}
              onChange={onChange}
              isLoading={isLoadingProjects}
              placeholder="Selecione um projeto..."
              fullWidth
              searchValue={projectSearch}
              onSearchChange={setProjectSearch}
              searchPlaceholder="Pesquisar projeto..."
              error={errors.projectId?.message}
              pagination={{ page: 1, totalPages: 1 }}
              onPageChange={() => {}}
            />
          )}
        />

        <Input
          label="Título do Entregável *"
          placeholder="Ex: Corte do Diretor v2 / Ensaio Fotográfico Final"
          {...register('title')}
          error={errors.title?.message}
        />

        <RHFSelect
          control={control}
          name="type"
          label="Tipo de Entregável"
          options={[
            { label: 'Master Final (4K / ProRes)', value: 'FINAL_MASTER' },
            { label: 'Sessão Fotográfica (Fotos)', value: 'PHOTOSHOOT' },
            { label: 'Primeiro Corte / Copião', value: 'ROUGH_CUT' },
            { label: 'Teaser', value: 'TEASER' },
            { label: 'Trailer Oficial', value: 'TRAILER' },
            { label: 'Corte Redes Sociais (9:16 / 1:1)', value: 'SOCIAL_CUT' },
            { label: 'Material Bruto / Dailies', value: 'RAW' },
          ]}
        />

        {/* Photoshoot specific package parameters */}
        {isPhotoshoot && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-3">
            <div className="text-xs font-semibold text-primary flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5" /> Parâmetros do Pacote Fotográfico
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Fotos Incluídas no Contrato *"
                type="number"
                min={0}
                placeholder="20"
                {...register('includedPhotosCount')}
                error={errors.includedPhotosCount?.message}
              />
              <Input
                label="Preço por Foto Adicional (Kz) *"
                type="number"
                min={0}
                placeholder="2500"
                {...register('extraPhotoPrice')}
                error={errors.extraPhotoPrice?.message}
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Textarea
            label="Notas de Produção"
            {...register('notes')}
            rows={2}
            placeholder="Especificações de exportação, LUT aplicada, especificações..."
            error={errors.notes?.message}
          />
        </div>
      </form>
    </GlobalModal>
  );
}

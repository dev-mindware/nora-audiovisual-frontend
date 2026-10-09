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
import { useCreateDeliverable, useDeliverableTypes } from '@/hooks/deliverables';
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
  const { types: deliverableTypes } = useDeliverableTypes();

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
      hasWatermark: true,
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
        mediaUrl: data.mediaUrl,
        includedPhotosCount: isPhotoshoot ? Number(data.includedPhotosCount) : undefined,
        extraPhotoPrice: isPhotoshoot ? Number(data.extraPhotoPrice) : undefined,
        allowExtraPurchase: isPhotoshoot ? data.allowExtraPurchase : undefined,
        hasWatermark: data.hasWatermark,
      } as any);
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
            className="min-h-[44px] sm:min-h-0"
          >
            Cancelar
          </Button>
          <ButtonSubmit
            form="deliverable-form"
            isLoading={isPending}
            className="min-h-[44px] sm:min-h-0"
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
              label="Projecto Audiovisual *"
              value={value}
              options={projectOptions}
              onChange={onChange}
              isLoading={isLoadingProjects}
              placeholder="Seleccione um projecto..."
              fullWidth
              searchValue={projectSearch}
              onSearchChange={setProjectSearch}
              searchPlaceholder="Pesquisar projecto..."
              error={errors.projectId?.message}
              pagination={{ page: 1, totalPages: 1 }}
              onPageChange={() => {}}
            />
          )}
        />

        <Input
          label="Título do Entregável *"
          placeholder="Ex: Corte do Director v2 / Ensaio Fotográfico Final"
          {...register('title')}
          error={errors.title?.message}
        />

        <RHFSelect
          control={control}
          name="type"
          label="Tipo de Entregável"
          options={deliverableTypes.map((t) => ({
            label: t.name,
            value: t.code,
          }))}
        />

        <div className="space-y-1">
          <Input
            label="Ligação / URL do Ficheiro de Vídeo ou Média"
            placeholder="Ex: https://storage.../corte-v1.mp4"
            {...register('mediaUrl')}
            error={errors.mediaUrl?.message}
          />
          <p className="text-[11px] text-muted-foreground">
            O vídeo fica imediatamente disponível para revisão com comentários ancorados por timecode.
          </p>
        </div>

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

        <div className="flex items-center justify-between p-3 border border-border bg-muted/20">
          <div className="space-y-0.5">
            <label htmlFor="hasWatermark" className="text-xs font-medium text-foreground block cursor-pointer">
              Aplicar Marca d'Água de Prova Técnica
            </label>
            <p className="text-[11px] text-muted-foreground">
              Aplica marcação sutil nas fotos e vídeos para proteção durante a fase de revisão e parcelamento.
            </p>
          </div>
          <input
            id="hasWatermark"
            type="checkbox"
            {...register('hasWatermark')}
            className="h-4 w-4 rounded-none accent-primary cursor-pointer"
          />
        </div>

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

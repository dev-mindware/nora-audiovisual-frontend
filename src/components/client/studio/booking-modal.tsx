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
} from '@/components';
import { useCreateStudioBooking } from '@/hooks/studio';
import { useProjects } from '@/hooks/projects';
import { studioBookingSchema, StudioBookingFormData } from '@/schemas';
import { StudioResource } from '@/types';
import { Building2 } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: StudioResource | null;
}

export function StudioBookingModal({ isOpen, onClose, resource }: BookingModalProps) {
  const [projectSearch, setProjectSearch] = useState('');
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects({
    search: projectSearch,
  });
  const { mutateAsync: createBooking, isPending } = useCreateStudioBooking();

  const projectOptions = useMemo(
    () => [
      {
        value: '',
        label: 'Reserva Geral / Ensaio / Produção Externa',
      },
      ...(projectsData?.data || []).map((p) => ({
        value: p.id,
        label: p.title,
        description: p.clientName || p.client?.name || undefined,
      })),
    ],
    [projectsData]
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StudioBookingFormData>({
    resolver: zodResolver(studioBookingSchema),
    defaultValues: {
      projectId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
    },
  });

  const handleCancel = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: StudioBookingFormData) => {
    if (!resource) return;
    try {
      const startDateTime = new Date(`${data.date}T${data.startTime}:00`).toISOString();
      const endDateTime = new Date(`${data.date}T${data.endTime}:00`).toISOString();

      await createBooking({
        resourceId: resource.id,
        projectId: data.projectId || undefined,
        startTime: startDateTime,
        endTime: endDateTime,
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
      title={`Reservar ${resource?.name
          ? resource.name.length > 30
            ? `${resource.name.slice(0, 30)}...`
            : resource.name
          : "Espaço de Estúdio"
        }`}
      description="Marcação com validação em tempo real contra sobreposição de sets."
      icon={<Building2 className="h-5 w-5" />}
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
            form="studio-booking-form"
            size="sm"
            isLoading={isPending}
          >
            Confirmar Marcação
          </ButtonSubmit>
        </>
      }
    >
      <form
        id="studio-booking-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 pt-2"
      >
        <Controller
          name="projectId"
          control={control}
          render={({ field }) => (
            <PaginatedSelect
              label="Projeto / Produção Associada"
              options={projectOptions}
              value={field.value || ''}
              onChange={field.onChange}
              placeholder="Reserva Geral / Ensaio / Produção Externa"
              isLoading={isLoadingProjects}
              searchValue={projectSearch}
              onSearchChange={setProjectSearch}
              searchPlaceholder="Pesquisar projeto..."
              pagination={{ page: 1, totalPages: 1 }}
              onPageChange={() => { }}
            />
          )}
        />

        <Input
          type="date"
          label="Data de Ocupação *"
          startIcon="Calendar"
          className="rounded-none border-border"
          {...register('date')}
          error={errors.date?.message}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="time"
            label="Hora de Início *"
            startIcon="Clock"
            className="rounded-none border-border"
            {...register('startTime')}
            error={errors.startTime?.message}
          />
          <Input
            type="time"
            label="Hora de Término *"
            startIcon="Clock"
            className="rounded-none border-border"
            {...register('endTime')}
            error={errors.endTime?.message}
          />
        </div>
      </form>
    </GlobalModal>
  );
}

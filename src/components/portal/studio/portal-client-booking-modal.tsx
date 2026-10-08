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
import { StudioResource, StudioBooking } from '@/types';
import { Building2, AlertCircle, Clock, Calendar } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PortalClientBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: StudioResource[];
  defaultResource?: StudioResource | null;
  existingBookings?: StudioBooking[];
  onSuccess?: () => void;
}

export function PortalClientBookingModal({
  isOpen,
  onClose,
  resources,
  defaultResource,
  existingBookings = [],
  onSuccess,
}: PortalClientBookingModalProps) {
  const [selectedResourceId, setSelectedResourceId] = useState<string>(
    defaultResource?.id || resources[0]?.id || ''
  );
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const { data: projectsData, isLoading: isLoadingProjects } = useProjects();
  const { mutateAsync: createBooking, isPending } = useCreateStudioBooking();

  const selectedResource = useMemo(() => {
    return resources.find((r) => r.id === selectedResourceId) || defaultResource || resources[0];
  }, [resources, selectedResourceId, defaultResource]);

  const projectOptions = useMemo(
    () => [
      {
        value: '',
        label: 'Produção Geral / Ensaio / Sessão Externa',
      },
      ...(projectsData?.data || []).map((p) => ({
        value: p.id,
        label: p.title,
      })),
    ],
    [projectsData]
  );

  const resourceOptions = useMemo(
    () =>
      resources.map((r) => ({
        value: r.id,
        label: `${r.name} (${r.capacity} pax)`,
      })),
    [resources]
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<StudioBookingFormData>({
    resolver: zodResolver(studioBookingSchema),
    defaultValues: {
      projectId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '13:00',
    },
  });

  const watchedDate = watch('date');
  const watchedStartTime = watch('startTime');
  const watchedEndTime = watch('endTime');

  // Validação em tempo real contra sobreposição com horários já ocupados
  const checkOverlap = () => {
    if (!watchedDate || !watchedStartTime || !watchedEndTime || !selectedResource) {
      setConflictWarning(null);
      return false;
    }

    try {
      const startCandidate = new Date(`${watchedDate}T${watchedStartTime}:00`).getTime();
      const endCandidate = new Date(`${watchedDate}T${watchedEndTime}:00`).getTime();

      if (startCandidate >= endCandidate) {
        setConflictWarning('A hora de término deve ser posterior à hora de início.');
        return true;
      }

      const hasConflict = existingBookings.some((b) => {
        if (b.resourceId !== selectedResource.id) return false;
        if (b.status === 'CANCELLED') return false;

        const bStart = new Date(b.startTime).getTime();
        const bEnd = new Date(b.endTime).getTime();

        return startCandidate < bEnd && endCandidate > bStart;
      });

      if (hasConflict) {
        setConflictWarning(
          'Este espaço já possui uma reserva confirmada ou bloqueada no intervalo seleccionado. Por favor, escolha outro horário.'
        );
        return true;
      }

      setConflictWarning(null);
      return false;
    } catch {
      setConflictWarning(null);
      return false;
    }
  };

  const handleCancel = () => {
    reset();
    setConflictWarning(null);
    onClose();
  };

  const onSubmit = async (data: StudioBookingFormData) => {
    if (!selectedResource) return;
    if (checkOverlap()) return;

    try {
      const startDateTime = new Date(`${data.date}T${data.startTime}:00`).toISOString();
      const endDateTime = new Date(`${data.date}T${data.endTime}:00`).toISOString();

      await createBooking({
        resourceId: selectedResource.id,
        projectId: data.projectId || undefined,
        startTime: startDateTime,
        endTime: endDateTime,
      });

      handleCancel();
      if (onSuccess) onSuccess();
    } catch {
      // Erro tratado pela mutação
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleCancel}
      size="md"
      title="Solicitar Reserva de Estúdio"
      description="Seleccione o espaço e o intervalo de horário pretendido para a sua produção."
      icon={<Building2 className="h-5 w-5 text-primary" />}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="min-h-[44px] sm:min-h-0 text-xs rounded-none"
          >
            Cancelar
          </Button>
          <ButtonSubmit
            form="portal-studio-booking-form"
            isLoading={isPending}
            disabled={Boolean(conflictWarning)}
            className="min-h-[44px] sm:min-h-0 text-xs rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Submeter Pedido de Reserva
          </ButtonSubmit>
        </>
      }
    >
      <form id="portal-studio-booking-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {conflictWarning && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 text-xs text-destructive rounded-none">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{conflictWarning}</span>
          </div>
        )}

        {/* Escolha do Espaço */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Espaço de Estúdio / Set *
          </label>
          <Select
            value={selectedResourceId}
            onValueChange={(val) => {
              setSelectedResourceId(val);
              setConflictWarning(null);
            }}
          >
            <SelectTrigger className="w-full h-10 px-3 text-xs bg-background border border-border rounded-none">
              <SelectValue placeholder="Selecione o espaço de estúdio" />
            </SelectTrigger>
            <SelectContent>
              {resourceOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedResource?.description && (
            <p className="text-[11px] text-muted-foreground">
              {selectedResource.description}
            </p>
          )}
        </div>

        {/* Projecto */}
        <Controller
          control={control}
          name="projectId"
          render={({ field: { onChange, value } }) => (
            <PaginatedSelect
              label="Projecto da Sua Produção"
              value={value}
              options={projectOptions}
              onChange={onChange}
              isLoading={isLoadingProjects}
              placeholder="Seleccione o seu projecto..."
              fullWidth
              pagination={{ page: 1, totalPages: 1 }}
              onPageChange={() => {}}
            />
          )}
        />

        {/* Data */}
        <div className="space-y-1.5">
          <Input
            label="Data Pretendida *"
            type="date"
            {...register('date', { onChange: () => setTimeout(checkOverlap, 50) })}
            error={errors.date?.message}
            min={new Date().toISOString().split('T')[0]}
            className="rounded-none text-xs"
          />
        </div>

        {/* Horários */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Hora de Início *"
            type="time"
            {...register('startTime', { onChange: () => setTimeout(checkOverlap, 50) })}
            error={errors.startTime?.message}
            className="rounded-none text-xs"
          />

          <Input
            label="Hora de Término *"
            type="time"
            {...register('endTime', { onChange: () => setTimeout(checkOverlap, 50) })}
            error={errors.endTime?.message}
            className="rounded-none text-xs"
          />
        </div>

        {/* Resumo de Custos Orientativo */}
        {selectedResource && (
          <div className="p-3 bg-muted/20 border border-border text-xs space-y-1">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Taxa Horária de Referência:</span>
              <span className="font-mono font-semibold text-foreground">
                {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(
                  Number(selectedResource.hourlyRate || 0)
                )}/h
              </span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Capacidade Máxima:</span>
              <span className="font-mono text-foreground">{selectedResource.capacity} pessoas no set</span>
            </div>
          </div>
        )}
      </form>
    </GlobalModal>
  );
}

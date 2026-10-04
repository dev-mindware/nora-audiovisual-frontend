'use client';

import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ButtonSubmit,
  Input,
} from '@/components/ui';
import { PaginatedSelect } from '@/components/shared';
import { GlobalModal } from '@/components/modal';
import { useCreateReservation, useEquipmentReservations } from '@/hooks/equipment';
import { useProjects } from '@/hooks/projects';
import { Equipment } from '@/types';
import { reservationSchema, ReservationFormData } from '@/schemas';
import { CalendarRange, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
}

export function ReservationModal({ isOpen, onClose, equipment }: ReservationModalProps) {
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects();
  const projects = projectsData?.data || [];
  const [projectSearch, setProjectSearch] = useState('');

  const { data: reservations = [] } = useEquipmentReservations(equipment?.id);
  const { mutateAsync: createReservation, isPending } = useCreateReservation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Real-time conflict detection
  const conflictingReservations = useMemo(() => {
    if (!startDate || !endDate || !reservations || reservations.length === 0) return [];
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    if (isNaN(start) || isNaN(end) || start > end) return [];

    return reservations.filter((r) => {
      if (r.status === 'CANCELLED') return false;
      const rStart = new Date(r.startDate).getTime();
      const rEnd = new Date(r.endDate).getTime();
      return start <= rEnd && end >= rStart;
    });
  }, [startDate, endDate, reservations]);

  const hasConflict = conflictingReservations.length > 0;

  const projectOptions = useMemo(() => {
    const list = projects
      .filter((p) =>
        projectSearch ? p.title.toLowerCase().includes(projectSearch.toLowerCase()) : true
      )
      .map((p) => ({
        label: p.title,
        value: p.id,
      }));
    return [{ label: 'Uso Interno / Manutenção / Testes', value: '' }, ...list];
  }, [projects, projectSearch]);

  const handleCancel = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: ReservationFormData) => {
    if (!equipment) return;
    try {
      await createReservation({
        equipmentId: equipment.id,
        projectId: data.projectId || undefined,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
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
      size="md"
      title="Reservar Equipamento para Rodagem"
      description={
        equipment
          ? `Agendamento e verificação de conflitos de disponibilidade para ${equipment.name}.`
          : 'Agendamento de equipamento.'
      }
      icon={<CalendarRange className="h-5 w-5 text-primary" />}
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
            form="reservation-form"
            isLoading={isPending}
            disabled={hasConflict}
          >
            Confirmar Reserva
          </ButtonSubmit>
        </>
      }
    >
      <form id="reservation-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          control={control}
          name="projectId"
          render={({ field: { onChange, value } }) => (
            <PaginatedSelect
              label="Projeto Vinculado"
              value={value || ''}
              options={projectOptions}
              onChange={onChange}
              isLoading={isLoadingProjects}
              placeholder="Uso Interno / Manutenção / Testes"
              fullWidth
              searchValue={projectSearch}
              onSearchChange={setProjectSearch}
              searchPlaceholder="Pesquisar projeto..."
              pagination={{ page: 1, totalPages: 1 }}
              onPageChange={() => {}}
            />
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="datetime-local"
            label="Início da Reserva *"
            {...register('startDate')}
            error={errors.startDate?.message}
          />
          <Input
            type="datetime-local"
            label="Devolução Prevista *"
            {...register('endDate')}
            error={errors.endDate?.message}
          />
        </div>

        {/* Real-time conflict feedback */}
        {startDate && endDate && (
          <div>
            {hasConflict ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Conflito de Agendamento Detectado!</span>
                  <span>Este item já se encontra reservado no período selecionado:</span>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5">
                    {conflictingReservations.map((c) => (
                      <li key={c.id}>
                        {format(new Date(c.startDate), 'dd/MM HH:mm')} até {format(new Date(c.endDate), 'dd/MM HH:mm')}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Equipamento 100% disponível para o período selecionado.</span>
              </div>
            )}
          </div>
        )}
      </form>
    </GlobalModal>
  );
}

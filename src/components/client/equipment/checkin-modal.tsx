'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ButtonSubmit,
  Textarea,
  RHFSelect,
} from '@/components/ui';
import { GlobalModal } from '@/components/modal';
import { useCheckinEquipment, useEquipmentReservations } from '@/hooks/equipment';
import { Equipment } from '@/types';
import { checkinSchema, CheckinFormData } from '@/schemas';
import { ArrowDownLeft, Wrench, Camera } from 'lucide-react';

const CONDITION_OPTIONS = [
  { label: 'Excelente (Sem marcas)', value: 'EXCELLENT' },
  { label: 'Bom (Desgaste natural de set)', value: 'GOOD' },
  { label: 'Razoável (Necessita limpeza/calibração)', value: 'FAIR' },
  { label: 'Com Danos / Avariado (Requer Manutenção)', value: 'DAMAGED' },
];

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment;
  reservationId?: string;
}

export function CheckinModal({
  isOpen,
  onClose,
  equipment,
  reservationId: initialReservationId,
}: CheckinModalProps) {
  const { data: reservations = [] } = useEquipmentReservations(equipment.id);
  const { mutateAsync: checkin, isPending } = useCheckinEquipment();

  const activeRes = (reservations as any[]).find((r: any) => r.status === 'CHECKED_OUT') || (reservations as any[])[0];
  const targetReservationId = initialReservationId || activeRes?.id;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
  } = useForm<CheckinFormData>({
    resolver: zodResolver(checkinSchema),
    defaultValues: {
      returnCondition: 'EXCELLENT',
      notes: 'Equipamento devolvido limpo e com todos os acessórios conferidos.',
    },
  });

  const selectedCondition = watch('returnCondition');

  const handleCancel = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: CheckinFormData) => {
    try {
      await checkin({
        reservationId: targetReservationId,
        returnCondition: data.returnCondition,
        damageNotes: data.damageNotes,
        notes: data.notes,
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
      title="Check-in de Equipamento (Retorno ao Almoxarifado)"
      description="Conferência de itens retornados do set de filmagem."
      icon={<ArrowDownLeft className="h-5 w-5 text-emerald-500" />}
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
            form="checkin-form"
            isLoading={isPending}
          >
            Confirmar Devolução
          </ButtonSubmit>
        </>
      }
    >
      <form id="checkin-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Equipment Info Card */}
        <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border">
              <Camera className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="font-semibold text-foreground block">{equipment.name}</span>
              <span className="text-muted-foreground font-mono text-[11px]">{equipment.code || 'S/ Código'}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground text-[10px] block">Condição Inicial:</span>
            <span className="font-semibold text-foreground">{equipment.condition}</span>
          </div>
        </div>

        <RHFSelect
          control={control}
          name="returnCondition"
          label="Condição Verificada no Retorno *"
          options={CONDITION_OPTIONS}
        />

        {selectedCondition === 'DAMAGED' && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <Wrench className="h-4 w-4" /> Relatório de Danos / Avaria
            </div>
            <Textarea
              {...register('damageNotes')}
              rows={2}
              placeholder="Descreva o tipo de dano (riscos na lente, conector folgado, queda, impacto)..."
              className="text-xs rounded-xl"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Notas de Receção / Observações Técnicas</label>
          <Textarea
            {...register('notes')}
            rows={2}
            placeholder="Observações do técnico de equipamentos..."
            className="rounded-xl"
          />
        </div>
      </form>
    </GlobalModal>
  );
}

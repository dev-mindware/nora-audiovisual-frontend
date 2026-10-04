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
import { useCheckoutEquipment, useEquipmentReservations } from '@/hooks/equipment';
import { Equipment, EquipmentReservation } from '@/types';
import { checkoutSchema, CheckoutFormData } from '@/schemas';
import { ArrowUpRight, ShieldCheck, Camera } from 'lucide-react';

const CONDITION_OPTIONS = [
  { label: 'Excelente', value: 'EXCELLENT' },
  { label: 'Bom', value: 'GOOD' },
  { label: 'Razoável', value: 'FAIR' },
  { label: 'Com Danos / Desgaste', value: 'DAMAGED' },
];

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment;
  reservationId?: string;
}

export function CheckoutModal({
  isOpen,
  onClose,
  equipment,
  reservationId: initialReservationId,
}: CheckoutModalProps) {
  const { data: reservations = [] } = useEquipmentReservations(equipment.id);
  const { mutateAsync: checkout, isPending } = useCheckoutEquipment();

  const activeRes = (reservations as EquipmentReservation[]).find(
    (r: EquipmentReservation) => r.status === 'PENDING'
  ) || (reservations as EquipmentReservation[])[0];
  const targetReservationId = initialReservationId || activeRes?.id;

  const {
    register,
    handleSubmit,
    control,
    reset,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      initialCondition: 'EXCELLENT',
      notes: 'Equipamento inspecionado, limpo e testado antes do envio para o set.',
    },
  });

  const handleCancel = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      await checkout({
        reservationId: targetReservationId,
        initialCondition: data.initialCondition,
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
      title="Check-out de Equipamento (Saída de Set)"
      description="Inspeção de saída e vinculação à ordem de rodagem."
      icon={<ArrowUpRight className="h-5 w-5 text-amber-500" />}
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
            form="checkout-form"
            isLoading={isPending}
          >
            Confirmar Saída
          </ButtonSubmit>
        </>
      }
    >
      <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <span className="text-muted-foreground text-[10px] block">Estado Atual:</span>
            <span className="font-semibold text-emerald-600">{equipment.condition}</span>
          </div>
        </div>

        <RHFSelect
          control={control}
          name="initialCondition"
          label="Condição Verificada na Saída *"
          options={CONDITION_OPTIONS}
        />

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Notas de Verificação / Kit de Acessórios</label>
          <Textarea
            {...register('notes')}
            rows={3}
            placeholder="Ex: Cabos SDI, 2 baterias V-Mount, parasol e clamp inclusos na maleta."
            className="rounded-xl"
          />
        </div>

        <div className="rounded-xl border border-border/80 bg-muted/20 p-3 text-xs text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Ao confirmar, o status do item passará para EM USO no almoxarifado de rodagem.</span>
        </div>
      </form>
    </GlobalModal>
  );
}

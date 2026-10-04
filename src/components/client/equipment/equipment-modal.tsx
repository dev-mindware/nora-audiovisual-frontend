'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ButtonSubmit,
  Input,
  RHFSelect,
} from '@/components/ui';
import { GlobalModal } from '@/components/modal';
import { useCreateEquipment } from '@/hooks/equipment';
import { createEquipmentSchema, EquipmentFormData } from '@/schemas';
import { EquipmentCategory } from '@/types';
import { Camera } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { label: 'Câmara / Corpo', value: 'CAMERA' },
  { label: 'Lente / Ótica', value: 'LENS' },
  { label: 'Iluminação / Luz', value: 'LIGHTING' },
  { label: 'Áudio / Microfone', value: 'AUDIO' },
  { label: 'Grip / Tripé / Suporte', value: 'GRIP' },
  { label: 'Drone', value: 'DRONE' },
  { label: 'Acessório', value: 'ACCESSORY' },
];

const OWNERSHIP_OPTIONS = [
  { label: 'Próprio da Produtora', value: 'OWNED' },
  { label: 'Alugado / Externo', value: 'RENTED' },
];

const CONDITION_OPTIONS = [
  { label: 'Excelente', value: 'EXCELLENT' },
  { label: 'Bom', value: 'GOOD' },
  { label: 'Razoável', value: 'FAIR' },
  { label: 'Com Danos / Desgaste', value: 'DAMAGED' },
];

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EquipmentModal({ isOpen, onClose }: EquipmentModalProps) {
  const { mutateAsync: createEquipment, isPending } = useCreateEquipment();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(createEquipmentSchema),
    defaultValues: {
      category: 'CAMERA',
      ownershipType: 'OWNED',
      condition: 'EXCELLENT',
    },
  });

  const handleCancel = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: EquipmentFormData) => {
    try {
      await createEquipment({
        name: data.name,
        code: data.code,
        category: data.category as EquipmentCategory,
        serialNumber: data.serialNumber,
        ownershipType: data.ownershipType,
        condition: data.condition,
        location: data.location,
        dailyRate: data.dailyRate,
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
      size="lg"
      title="Novo Equipamento Audiovisual"
      description="Cadastre itens do inventário de estúdio, iluminação, câmaras e áudio."
      icon={<Camera className="h-5 w-5" />}
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
            form="equipment-form"
            isLoading={isPending}
          >
            Cadastrar Equipamento
          </ButtonSubmit>
        </>
      }
    >
      <form id="equipment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome do Equipamento *"
          placeholder="Ex: Sony FX3 Cinema Line / Arri SkyPanel S60-C"
          {...register('name')}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Código Interno / Barcode"
            placeholder="Ex: CAM-004"
            {...register('code')}
          />
          <Input
            label="Número de Série"
            placeholder="Ex: SN-84920412"
            {...register('serialNumber')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RHFSelect
            control={control}
            name="category"
            label="Categoria"
            options={CATEGORY_OPTIONS}
          />
          <RHFSelect
            control={control}
            name="ownershipType"
            label="Propriedade"
            options={OWNERSHIP_OPTIONS}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RHFSelect
            control={control}
            name="condition"
            label="Estado de Conservação"
            options={CONDITION_OPTIONS}
          />
          <Input
            type="number"
            label="Taxa Diária (Kz)"
            placeholder="0.00"
            min={0}
            {...register('dailyRate')}
          />
        </div>

        <Input
          label="Localização / Armazém"
          placeholder="Ex: Armazém A - Prateleira 3"
          {...register('location')}
        />
      </form>
    </GlobalModal>
  );
}

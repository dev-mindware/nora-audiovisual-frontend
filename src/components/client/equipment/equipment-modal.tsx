'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ButtonSubmit,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  RHFSelect,
  RHFInputCurrency,
} from '@/components/ui';
import { GlobalModal } from '@/components/modal';
import { useCreateEquipment } from '@/hooks/equipment';
import { useCategories } from '@/hooks/categories';
import {
  CategoryCreateModal,
  ManageCategoriesModal,
} from '@/components/client/categories';
import { createEquipmentSchema, EquipmentFormData } from '@/schemas';
import { EquipmentCategory, Category } from '@/types';
import { Camera, Plus } from 'lucide-react';

const FALLBACK_CATEGORY_OPTIONS = [
  { label: 'Câmara / Corpo', value: 'CAMERA' },
  { label: 'Lente / Óptica', value: 'LENS' },
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
  const { data: dbCategories = [] } = useCategories('EQUIPMENT');

  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

  const categoryOptions = useMemo(() => {
    if (dbCategories.length > 0) {
      return dbCategories.map((c) => ({
        label: c.name,
        value: c.slug || c.name,
      }));
    }
    return FALLBACK_CATEGORY_OPTIONS;
  }, [dbCategories]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(createEquipmentSchema),
    defaultValues: {
      category: 'CAMERA',
      ownershipType: 'OWNED',
      condition: 'EXCELLENT',
      dailyRate: 0,
    },
  });

  const handleCancel = () => {
    reset();
    onClose();
  };

  const handleCategoryCreated = (newCat: Category) => {
    setValue('category', newCat.slug || newCat.name);
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
    <>
      <GlobalModal
        isOpen={isOpen}
        onClose={handleCancel}
        size="lg"
        title="Novo Equipamento Audiovisual"
        description="Registe artigos do inventário de estúdio, iluminação, câmaras e áudio."
        icon={<Camera className="h-5 w-5 text-primary" />}
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="text-xs h-9 px-4"
            >
              Cancelar
            </Button>
            <ButtonSubmit
              form="equipment-form"
              size="sm"
              isLoading={isPending}
              className="text-xs h-9 px-4"
            >
              Registar Equipamento
            </ButtonSubmit>
          </div>
        }
      >
        <form id="equipment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome do Equipamento *"
            placeholder="Ex: Sony FX3 Cinema Line / Arri SkyPanel S60-C"
            {...register('name')}
            error={errors.name?.message}
            className="h-9 text-xs"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Código Interno / Barcode"
              placeholder="Ex: CAM-004"
              {...register('code')}
              className="h-9 text-xs"
            />
            <Input
              label="Número de Série"
              placeholder="Ex: SN-84920412"
              {...register('serialNumber')}
              className="h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Categoria com botão + Nova Categoria */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Categoria de Equipamento <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsCreateCategoryOpen(true)}
                    className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="h-3 w-3" /> Nova
                  </button>
                  <span className="text-muted-foreground/40 text-[10px]">•</span>
                  <button
                    type="button"
                    onClick={() => setIsManageCategoriesOpen(true)}
                    className="text-[11px] text-muted-foreground hover:text-foreground underline"
                  >
                    Gerir
                  </button>
                </div>
              </div>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full h-9 text-xs">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-[11px] text-destructive">{errors.category.message}</p>
              )}
            </div>

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
            <RHFInputCurrency
              name="dailyRate"
              control={control}
              label="Taxa Diária de Aluguer (Kz)"
              currency="Kz"
              className="h-9 text-xs"
            />
          </div>

          <Input
            label="Localização / Armazém"
            placeholder="Ex: Armazém A - Prateleira 3"
            {...register('location')}
            className="h-9 text-xs"
          />
        </form>
      </GlobalModal>

      <CategoryCreateModal
        isOpen={isCreateCategoryOpen}
        onClose={() => setIsCreateCategoryOpen(false)}
        type="EQUIPMENT"
        onSuccess={handleCategoryCreated}
      />

      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
        type="EQUIPMENT"
      />
    </>
  );
}

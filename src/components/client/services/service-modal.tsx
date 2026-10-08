'use client';

import { useState, useEffect } from 'react';
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
} from '@/components/ui';
import { GlobalModal } from '@/components/modal';
import { useCreateService, useUpdateService } from '@/hooks/services';
import {
  catalogServiceFormSchema,
  CatalogServiceFormData,
} from '@/schemas/catalog-service';
import { CatalogService, CatalogServiceCategory } from '@/types';
import { Briefcase, Plus, X, Sparkles, CheckCircle2 } from 'lucide-react';

const CATEGORY_OPTIONS: { label: string; value: CatalogServiceCategory }[] = [
  { label: 'Publicidade / Comercial', value: 'COMMERCIAL' },
  { label: 'Videoclipe Musical', value: 'MUSIC_VIDEO' },
  { label: 'Vídeo Institucional / Corporativo', value: 'CORPORATE' },
  { label: 'Cobertura de Evento', value: 'EVENT' },
  { label: 'Gravação de Podcast / Videocast', value: 'PODCAST' },
  { label: 'Aluguer de Estúdio / Diária', value: 'STUDIO_RENTAL' },
  { label: 'Color Grading & Finalização', value: 'COLOR_GRADING' },
  { label: 'Masterização / Mixagem de Áudio', value: 'AUDIO_MASTERING' },
  { label: 'Captação Aérea com Drone', value: 'DRONE_FOOTAGE' },
  { label: 'Outro Pacote Audiovisual', value: 'OTHER' },
];

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit?: CatalogService | null;
}

export function ServiceModal({
  isOpen,
  onClose,
  serviceToEdit,
}: ServiceModalProps) {
  const { mutateAsync: createService, isPending: isCreating } = useCreateService();
  const { mutateAsync: updateService, isPending: isUpdating } = useUpdateService();

  const isPending = isCreating || isUpdating;

  const [benefitInput, setBenefitInput] = useState('');
  const [deliverableInput, setDeliverableInput] = useState('');

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CatalogServiceFormData>({
    resolver: zodResolver(catalogServiceFormSchema) as any,
    defaultValues: {
      name: '',
      category: 'COMMERCIAL',
      description: '',
      price: 0,
      currency: 'AOA',
      durationHours: 8,
      benefits: [],
      deliverablesIncluded: [],
      isActive: true,
    },
  });

  const benefits = watch('benefits') || [];
  const deliverables = watch('deliverablesIncluded') || [];

  useEffect(() => {
    if (serviceToEdit && isOpen) {
      reset({
        name: serviceToEdit.name,
        category: serviceToEdit.category,
        description: serviceToEdit.description || '',
        price: serviceToEdit.price,
        currency: serviceToEdit.currency || 'AOA',
        durationHours: serviceToEdit.durationHours || 0,
        benefits: serviceToEdit.benefits || [],
        deliverablesIncluded: serviceToEdit.deliverablesIncluded || [],
        isActive: serviceToEdit.isActive,
      });
    } else if (!serviceToEdit && isOpen) {
      reset({
        name: '',
        category: 'COMMERCIAL',
        description: '',
        price: 0,
        currency: 'AOA',
        durationHours: 8,
        benefits: ['Captação em 4K Cinema', 'Equipa Técnica Especializada'],
        deliverablesIncluded: ['Vídeo Final Master', 'Corte Vertical para Redes'],
        isActive: true,
      });
    }
  }, [serviceToEdit, isOpen, reset]);

  const handleAddBenefit = () => {
    const trimmed = benefitInput.trim();
    if (trimmed && !benefits.includes(trimmed)) {
      setValue('benefits', [...benefits, trimmed]);
      setBenefitInput('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setValue(
      'benefits',
      benefits.filter((_, i) => i !== index),
    );
  };

  const handleAddDeliverable = () => {
    const trimmed = deliverableInput.trim();
    if (trimmed && !deliverables.includes(trimmed)) {
      setValue('deliverablesIncluded', [...deliverables, trimmed]);
      setDeliverableInput('');
    }
  };

  const handleRemoveDeliverable = (index: number) => {
    setValue(
      'deliverablesIncluded',
      deliverables.filter((_, i) => i !== index),
    );
  };

  const onSubmit = async (data: CatalogServiceFormData) => {
    try {
      const payload = {
        ...data,
        category: data.category as CatalogServiceCategory,
      };
      if (serviceToEdit) {
        await updateService({
          id: serviceToEdit.id,
          data: payload,
        });
      } else {
        await createService(payload);
      }
      onClose();
    } catch {
      // Error handled by mutation hook
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title={
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <span>
            {serviceToEdit ? 'Editar Serviço do Catálogo' : 'Novo Serviço no Catálogo'}
          </span>
        </div>
      }
      description="Configure pacotes de serviços padronizados para gerar propostas comerciais automáticas e permitir solicitações pelo Portal do Cliente."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome do Serviço */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-medium text-foreground">
              Nome do Pacote / Serviço <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Ex: Produção de Videoclipe Master"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-[11px] text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Categoria */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Categoria <span className="text-destructive">*</span>
            </label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Preço Base (AOA) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Preço Base de Referência (AOA) <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              min={0}
              step={1000}
              placeholder="Ex: 500000"
              {...register('price')}
              className={errors.price ? 'border-destructive' : ''}
            />
            {errors.price && (
              <p className="text-[11px] text-destructive">{errors.price.message}</p>
            )}
          </div>

          {/* Duração Estimada */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Duração Estimada (Horas)
            </label>
            <Input
              type="number"
              min={1}
              placeholder="Ex: 8"
              {...register('durationHours')}
            />
          </div>

          {/* Estado no Catálogo */}
          <div className="space-y-1.5 flex flex-col justify-end">
            <label className="text-xs font-medium text-foreground">
              Visibilidade no Catálogo
            </label>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/20">
                  <input
                    type="checkbox"
                    id="service-is-active"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="service-is-active"
                    className="text-xs cursor-pointer font-medium text-foreground select-none"
                  >
                    Ativo para Novos Projectos & Portal
                  </label>
                </div>
              )}
            />
          </div>
        </div>

        {/* Descrição */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Descrição Detalhada do Pacote
          </label>
          <textarea
            rows={3}
            className="w-full text-xs rounded-md border border-input bg-transparent px-3 py-2 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Descreva o escopo, metodologia de filmagem e diferenciais deste serviço..."
            {...register('description')}
          />
        </div>

        {/* Benefícios Inclusos */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Benefícios & Diferenciais Inclusos
            </label>
            <span className="text-[11px] text-muted-foreground">
              {benefits.length} adicionado(s)
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Captação em 4K Cinema com lentes Anamórficas"
              value={benefitInput}
              onChange={(e) => setBenefitInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddBenefit();
                }
              }}
              className="text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddBenefit}
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {benefits.map((b, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                <span>{b}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveBenefit(i)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {benefits.length === 0 && (
              <p className="text-[11px] text-muted-foreground italic">
                Nenhum benefício específico adicionado ainda.
              </p>
            )}
          </div>
        </div>

        {/* Entregáveis Inclusos */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Entregáveis Garantidos no Pacote
            </label>
            <span className="text-[11px] text-muted-foreground">
              {deliverables.length} adicionado(s)
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: 1x Vídeo Final Master 4K + 3x Versões Reduzidas para Reels"
              value={deliverableInput}
              onChange={(e) => setDeliverableInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddDeliverable();
                }
              }}
              className="text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDeliverable}
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {deliverables.map((d, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              >
                <span>{d}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDeliverable(i)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {deliverables.length === 0 && (
              <p className="text-[11px] text-muted-foreground italic">
                Nenhum entregável específico adicionado ainda.
              </p>
            )}
          </div>
        </div>

        {/* Rodapé / Ações */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={isPending}>
            {serviceToEdit ? 'Salvar Alterações' : 'Criar Serviço no Catálogo'}
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
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
  RHFInputCurrency,
} from '@/components/ui';
import { GlobalModal } from '@/components/modal';
import { useCreateService, useUpdateService } from '@/hooks/services';
import { useCategories } from '@/hooks/categories';
import {
  CategoryCreateModal,
  ManageCategoriesModal,
} from '@/components/client/categories';
import {
  catalogServiceFormSchema,
  CatalogServiceFormData,
} from '@/schemas/catalog-service';
import { CatalogService, Category } from '@/types';
import { Briefcase, Plus, X, Sparkles, CheckCircle2, Tags } from 'lucide-react';

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
  const { data: dbCategories = [] } = useCategories('SERVICE');

  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

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
      category: '',
      description: '',
      price: 0,
      currency: 'AOA',
      durationHours: 0,
      benefits: [],
      deliverablesIncluded: [],
      isActive: true,
    },
  });

  const categories = useMemo(() => {
    if (dbCategories.length > 0) {
      return dbCategories.map((c) => ({
        label: c.name,
        value: c.slug || c.name,
        color: c.color,
      }));
    }
    return [
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
  }, [dbCategories]);

  const benefits = watch('benefits') || [];
  const deliverables = watch('deliverablesIncluded') || [];

  useEffect(() => {
    if (isOpen) {
      if (serviceToEdit) {
        reset({
          name: serviceToEdit.name,
          category: serviceToEdit.category,
          description: serviceToEdit.description || '',
          price: Number(serviceToEdit.price) || 0,
          currency: serviceToEdit.currency || 'AOA',
          durationHours: serviceToEdit.durationHours ?? 0,
          benefits: serviceToEdit.benefits || [],
          deliverablesIncluded: serviceToEdit.deliverablesIncluded || [],
          isActive: serviceToEdit.isActive,
        });
      } else {
        reset({
          name: '',
          category: '',
          description: '',
          price: 0,
          currency: 'AOA',
          durationHours: 0,
          benefits: [],
          deliverablesIncluded: [],
          isActive: true,
        });
      }
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

  const handleCategoryCreated = (newCat: Category) => {
    setValue('category', newCat.slug || newCat.name);
  };

  const onSubmit = async (data: CatalogServiceFormData) => {
    try {
      const payload = {
        ...data,
        category: data.category,
      };
      if (serviceToEdit) {
        await updateService({
          id: serviceToEdit.id,
          data: payload as any,
        });
      } else {
        await createService(payload as any);
      }
      onClose();
    } catch {
      // Error handled by mutation hook
    }
  };

  return (
    <>
      <GlobalModal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        title={serviceToEdit ? 'Editar Serviço do Catálogo' : 'Novo Serviço no Catálogo'}
        description="Configure pacotes de serviços padronizados para gerar propostas comerciais automáticas e permitir solicitações pelo Portal do Cliente."
        icon={<Briefcase className="h-5 w-5 text-primary" />}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
              className="text-xs h-9 px-4"
            >
              Cancelar
            </Button>
            <ButtonSubmit
              form="catalog-service-form"
              data-tour="service-save"
              size="sm"
              isLoading={isPending}
              className="text-xs h-9 px-4"
            >
              {serviceToEdit ? 'Salvar Alterações' : 'Criar Serviço no Catálogo'}
            </ButtonSubmit>
          </>
        }
      >
        <form
          id="catalog-service-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Nome do Serviço */}
            <div className="space-y-1 sm:col-span-2" data-tour="service-name">
              <label className="text-xs font-semibold text-foreground">
                Nome do Pacote / Serviço <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Ex: Produção de Videoclipe Master"
                {...register('name')}
                error={errors.name?.message}
                className="h-9 text-xs"
              />
            </div>

            {/* Categoria com botão + Nova Categoria */}
            <div className="space-y-1" data-tour="service-category">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Categoria <span className="text-destructive">*</span>
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
                      {categories.map((opt) => (
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

            {/* Preço Base com InputCurrency formatado */}
            <div className="space-y-1" data-tour="service-price">
              <RHFInputCurrency
                name="price"
                control={control}
                label="Preço Base de Referência (Kz) *"
                currency="Kz"
                className="h-9 text-xs"
              />
            </div>

            {/* Duração Estimada com Input type="quantity" */}
            <div className="space-y-1" data-tour="service-duration">
              <Controller
                name="durationHours"
                control={control}
                render={({ field }) => (
                  <Input
                    type="quantity"
                    label="Duração Estimada (Horas)"
                    value={field.value ?? 0}
                    onChange={(e: any) => {
                      const val = Number(e.target.value);
                      field.onChange(isNaN(val) ? 0 : val);
                    }}
                  />
                )}
              />
            </div>

            {/* Estado no Catálogo */}
            <div className="space-y-1 flex flex-col justify-end" data-tour="service-visibility">
              <label className="text-xs font-semibold text-foreground">
                Visibilidade no Catálogo
              </label>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2 h-9 px-3 border border-border rounded-xs bg-muted/20">
                    <input
                      type="checkbox"
                      id="service-is-active"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 rounded-xs border-border text-primary focus:ring-primary accent-primary"
                    />
                    <label
                      htmlFor="service-is-active"
                      className="text-xs cursor-pointer font-medium text-foreground select-none"
                    >
                      Ativo no Catálogo Público & Portal
                    </label>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Descrição do Pacote
            </label>
            <textarea
              rows={2}
              className="w-full text-xs rounded-xs border border-border bg-transparent px-3 py-1.5 shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden "
              placeholder="Descreva o escopo, metodologia de filmagem e diferenciais..."
              {...register('description')}
            />
          </div>

          {/* Benefícios Inclusos */}
          <div className="space-y-1.5 border-t border-border/60 pt-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Benefícios & Diferenciais
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
                className="text-xs h-8"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddBenefit}
                className="shrink-0 h-8 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5 min-h-[24px]">
              {benefits.map((b, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-xs bg-primary/10 text-primary border border-primary/20"
                >
                  <span>{b}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(i)}
                    className="hover:text-destructive transition-colors ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Entregáveis Inclusos */}
          <div className="space-y-1.5 border-t border-border/60 pt-3" data-tour="service-deliverables">
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
                placeholder="Ex: 1x Vídeo Final Master 4K + 3x Versões para Reels"
                value={deliverableInput}
                onChange={(e) => setDeliverableInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDeliverable();
                  }
                }}
                className="text-xs h-8"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDeliverable}
                className="shrink-0 h-8 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5 min-h-[24px]">
              {deliverables.map((d, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                >
                  <span>{d}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDeliverable(i)}
                    className="hover:text-destructive transition-colors ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </form>
      </GlobalModal>

      <CategoryCreateModal
        isOpen={isCreateCategoryOpen}
        onClose={() => setIsCreateCategoryOpen(false)}
        type="SERVICE"
        onSuccess={handleCategoryCreated}
      />

      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
        type="SERVICE"
      />
    </>
  );
}

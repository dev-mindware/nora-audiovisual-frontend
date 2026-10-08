'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  ButtonSubmit,
  Input,
} from '@/components/ui';
import { GlobalModal } from '@/components/modal';
import { useRequestPortalService } from '@/hooks/services';
import { useAuthStore } from '@/stores';
import { CatalogService } from '@/types';
import {
  Briefcase,
  Calendar,
  MapPin,
  Sparkles,
  CheckCircle2,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';

const portalServiceRequestSchema = z.object({
  projectTitle: z
    .string()
    .min(3, 'Indique um título ou assunto para a solicitação (mín. 3 caracteres)'),
  clientName: z.string().optional(),
  clientEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  clientPhone: z.string().optional(),
  requestedDate: z.string().optional(),
  notes: z.string().optional(),
});

type PortalServiceRequestFormData = z.infer<typeof portalServiceRequestSchema>;

interface PortalServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: CatalogService | null;
}

export function PortalServiceRequestModal({
  isOpen,
  onClose,
  service,
}: PortalServiceRequestModalProps) {
  const { user } = useAuthStore();
  const { mutateAsync: requestService, isPending } = useRequestPortalService();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PortalServiceRequestFormData>({
    resolver: zodResolver(portalServiceRequestSchema),
    defaultValues: {
      projectTitle: '',
      clientName: user?.name || '',
      clientEmail: user?.email || '',
      clientPhone: user?.phone || '',
      requestedDate: '',
      notes: '',
    },
  });

  if (!service) return null;

  const onSubmit = async (data: PortalServiceRequestFormData) => {
    try {
      await requestService({
        serviceId: service.id,
        projectTitle: data.projectTitle,
        clientName: data.clientName || user?.name || 'Cliente Portal',
        clientEmail: data.clientEmail || user?.email,
        clientPhone: data.clientPhone,
        requestedDate: data.requestedDate || undefined,
        notes: data.notes || undefined,
      });
      reset();
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
          <span>Solicitar Proposta de Serviço</span>
        </div>
      }
      description="Envie os detalhes da sua produção para a nossa equipa gerar a proposta comercial e reservar a equipa técnica."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
        {/* Resumo do Pacote Selecionado */}
        <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold">
                Pacote Audiovisual
              </span>
              <h4 className="text-base font-bold text-foreground">
                {service.name}
              </h4>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-base font-bold text-primary">
                {Number(service.price).toLocaleString('pt-AO')} {service.currency || 'AOA'}
              </span>
              {service.durationHours ? (
                <div className="text-[11px] text-muted-foreground flex items-center sm:justify-end gap-1">
                  <Clock className="h-3 w-3" />
                  ~{service.durationHours}h estimadas
                </div>
              ) : null}
            </div>
          </div>

          {/* Destaques rápidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {service.deliverablesIncluded && service.deliverablesIncluded.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase">
                  Entregáveis Inclusos:
                </span>
                <ul className="space-y-0.5">
                  {service.deliverablesIncluded.slice(0, 2).map((deliv, idx) => (
                    <li
                      key={idx}
                      className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      <span className="truncate">{deliv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {service.benefits && service.benefits.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase">
                  Vantagens Técnicas:
                </span>
                <ul className="space-y-0.5">
                  {service.benefits.slice(0, 2).map((ben, idx) => (
                    <li
                      key={idx}
                      className="text-foreground/80 flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3 w-3 text-primary shrink-0" />
                      <span className="truncate">{ben}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Formulário de Solicitação */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Nome do Projecto / Evento <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Ex: Videoclipe Oficial Álbum 2026 ou Campanha Dia das Mães"
              {...register('projectTitle')}
              className={errors.projectTitle ? 'border-destructive' : ''}
            />
            {errors.projectTitle && (
              <p className="text-[11px] text-destructive">
                {errors.projectTitle.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Data Pretendida para Gravação / Início
              </label>
              <Input type="date" {...register('requestedDate')} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Contacto Telefónico / WhatsApp
              </label>
              <Input
                placeholder="Ex: +244 923 000 000"
                {...register('clientPhone')}
              />
            </div>
          </div>

          {/* Dados do Solicitante se não logado */}
          {!user && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Seu Nome Completo
                </label>
                <Input
                  placeholder="Ex: João Silva"
                  {...register('clientName')}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Email para Contacto
                </label>
                <Input
                  type="email"
                  placeholder="Ex: joao@empresa.ao"
                  {...register('clientEmail')}
                  className={errors.clientEmail ? 'border-destructive' : ''}
                />
                {errors.clientEmail && (
                  <p className="text-[11px] text-destructive">
                    {errors.clientEmail.message}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Observações, Referências ou Necessidades Especiais
            </label>
            <textarea
              rows={3}
              placeholder="Descreva detalhes específicos do seu projeto, links de referência de vídeo ou requisitos de estúdio..."
              className="w-full text-xs rounded-md border border-input bg-transparent px-3 py-2 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register('notes')}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/15 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <span>
            Ao submeter esta solicitação, será criado um lead com proposta comercial
            preliminar vinculada. A nossa equipa entrará em contacto para afinar os
            detalhes e formalizar o orçamento.
          </span>
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <ButtonSubmit isLoading={isPending}>
            Enviar Solicitação de Pacote
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}

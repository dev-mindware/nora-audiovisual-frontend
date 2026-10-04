'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  ButtonSubmit,
  Input,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui';
import { GlobalModal } from '@/components/modal';
import { useCreateCallSheet, usePublishCallSheet } from '@/hooks/projects';
import { CallSheet } from '@/types';
import { SucessMessage } from '@/utils/messages';
import {
  Calendar,
  Clock,
  MapPin,
  Hospital,
  CloudSun,
  Users,
  Plus,
  Trash2,
  Send,
  Printer,
  Share2,
} from 'lucide-react';

import { createCallSheetSchema, CallSheetFormData } from '@/schemas';

interface CallSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle?: string;
  viewCallSheet?: CallSheet | null;
}

export function CallSheetModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  viewCallSheet,
}: CallSheetModalProps) {
  const isViewMode = Boolean(viewCallSheet);
  const { mutateAsync: createCallSheet, isPending: isCreating } = useCreateCallSheet(projectId);
  const { mutateAsync: publishCallSheet, isPending: isPublishing } = usePublishCallSheet(projectId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CallSheetFormData>({
    resolver: zodResolver(createCallSheetSchema),
    defaultValues: {
      title: 'Dia 1 - Rodagem Principal',
      shootDate: new Date().toISOString().split('T')[0],
      generalCallTime: '07:30',
      location: 'Estúdio Principal / Set Exterior',
      weatherForecast: 'Céu limpo, 28°C com brisa suave',
      nearestHospital: 'Hospital Central de Luanda - Linha Direta: 112 / +244 923 000 000',
      crewMembers: [
        { name: '', role: 'Diretor / Realizador', callTime: '07:00', phone: '' },
        { name: '', role: 'Diretor de Fotografia', callTime: '07:00', phone: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'crewMembers',
  });

  const onSubmit = async (data: CallSheetFormData) => {
    try {
      await createCallSheet({
        title: data.title,
        shootDate: data.shootDate,
        generalCallTime: data.generalCallTime,
        location: data.location,
        weatherForecast: data.weatherForecast,
        nearestHospital: data.nearestHospital,
        crewMembers: data.crewMembers,
      });
      reset();
      onClose();
    } catch {
      // handled by hook toast
    }
  };

  const handlePublish = async (callSheetId: string) => {
    try {
      await publishCallSheet({
        callSheetId,
        data: { notifyCrew: true, customMessage: 'A folha de rodagem foi atualizada e confirmada.' },
      });
      onClose();
    } catch {
      // handled by hook toast
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/portal/call-sheet?id=${viewCallSheet?.id || ''}&project=${projectId}`;
    navigator.clipboard.writeText(url);
    SucessMessage('Link da Folha de Rodagem copiado para a equipa técnica!');
  };

  const modalFooter = isViewMode && viewCallSheet ? (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handlePrint}
      >
        <Printer className="mr-1.5 h-3.5 w-3.5" />
        Imprimir / PDF
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleShareLink}
        title="Copiar link direto para envio via WhatsApp à equipa de set"
      >
        <Share2 className="mr-1.5 h-3.5 w-3.5" />
        Link de Campo
      </Button>
      {viewCallSheet.status !== 'PUBLISHED' && (
        <Button
          type="button"
          size="sm"
          onClick={() => handlePublish(viewCallSheet.id)}
          disabled={isPublishing}
        >
          <Send className="mr-1.5 h-3.5 w-3.5" />
          {isPublishing ? 'A Publicar...' : 'Publicar & Notificar Equipa'}
        </Button>
      )}
      <Button type="button" variant="outline" size="sm" onClick={onClose}>
        Fechar
      </Button>
    </>
  ) : (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
      >
        Cancelar
      </Button>
      <ButtonSubmit
        form="call-sheet-form"
        isLoading={isCreating}
      >
        Criar Folha de Rodagem
      </ButtonSubmit>
    </>
  );

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? `Folha de Rodagem — ${viewCallSheet?.title}` : 'Nova Folha de Rodagem (Call Sheet)'}
      description={
        isViewMode
          ? `Produção: ${projectTitle || 'Projeto'} • Escalação oficial de horários e segurança de set.`
          : 'Preencha os dados operacionais, localização, alertas meteorológicos e chamada da equipa.'
      }
      size="3xl"
      footer={modalFooter}
      headerExtra={
        isViewMode && viewCallSheet ? (
          <Badge
            variant="outline"
            className={
              viewCallSheet.status === 'PUBLISHED'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold'
            }
          >
            {viewCallSheet.status === 'PUBLISHED' ? 'PUBLICADA' : 'RASCUNHO'}
          </Badge>
        ) : undefined
      }
    >

        {isViewMode && viewCallSheet ? (
          <div className="space-y-6 py-4 print:p-0">
            {/* Call Sheet Header Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium uppercase tracking-wider">Data de Rodagem</span>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {new Date(viewCallSheet.shootDate).toLocaleDateString('pt-PT', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <div className="flex items-center gap-2 text-foreground pt-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">
                    Chamada Geral (Crew Call): {viewCallSheet.generalCallTime}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium uppercase tracking-wider">Localização do Set</span>
                </div>
                <p className="text-sm font-semibold text-foreground leading-snug">{viewCallSheet.location}</p>
                {viewCallSheet.weatherForecast && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CloudSun className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>{viewCallSheet.weatherForecast}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency & Hospital Banner */}
            {viewCallSheet.nearestHospital && (
              <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-700 dark:text-rose-400">
                <Hospital className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold uppercase tracking-wider block text-rose-800 dark:text-rose-300">
                    Hospital de Emergência Mais Próximo
                  </span>
                  <span className="text-muted-foreground">{viewCallSheet.nearestHospital}</span>
                </div>
              </div>
            )}

            {/* Crew Call Schedule */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Escalação e Horários da Equipa (Crew Call Times)
              </h4>
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <Table className="min-w-full text-left text-xs">
                  <TableHeader className="bg-muted/50 font-semibold text-muted-foreground">
                    <TableRow>
                      <TableHead className="px-4 py-3">Profissional</TableHead>
                      <TableHead className="px-4 py-3">Departamento / Função</TableHead>
                      <TableHead className="px-4 py-3">Horário de Chamada</TableHead>
                      <TableHead className="px-4 py-3">Contacto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border">
                    {(viewCallSheet.crewMembers && viewCallSheet.crewMembers.length > 0) ? (
                      viewCallSheet.crewMembers.map((member, idx) => (
                        <TableRow key={idx} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="px-4 py-3 font-semibold text-foreground">{member.name}</TableCell>
                          <TableCell className="px-4 py-3 text-muted-foreground">{member.role}</TableCell>
                          <TableCell className="px-4 py-3 font-mono font-semibold text-primary">{member.callTime}</TableCell>
                          <TableCell className="px-4 py-3 text-muted-foreground">{member.phone || '—'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="px-4 py-6 text-center text-muted-foreground italic">
                          Nenhum membro detalhado individualmente. Chamada geral às {viewCallSheet.generalCallTime}.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <form id="call-sheet-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Título / Dia da Folha de Rodagem *</label>
                <Input
                  {...register('title')}
                  placeholder="Ex: Dia 1 - Rodagem Estúdio e Exteriores"
                  className="bg-card border-border text-foreground"
                />
                {errors.title && <span className="text-xs text-destructive">{errors.title.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Data de Rodagem *</label>
                <Input type="date" {...register('shootDate')} className="bg-card border-border text-foreground" />
                {errors.shootDate && <span className="text-xs text-destructive">{errors.shootDate.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Horário Chamada Geral (Crew Call) *</label>
                <Input type="time" {...register('generalCallTime')} className="bg-card border-border text-foreground" />
                {errors.generalCallTime && <span className="text-xs text-destructive">{errors.generalCallTime.message}</span>}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Localização do Set / Endereço *</label>
                <Input
                  {...register('location')}
                  placeholder="Ex: Rua Rainha Ginga, Edifício Mindware, Luanda"
                  className="bg-card border-border text-foreground"
                />
                {errors.location && <span className="text-xs text-destructive">{errors.location.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Previsão Meteorológica</label>
                <Input
                  {...register('weatherForecast')}
                  placeholder="Ex: Céu limpo, 29°C, vento moderado"
                  className="bg-card border-border text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Hospital de Emergência e Contactos</label>
                <Input
                  {...register('nearestHospital')}
                  placeholder="Ex: Hospital Militar Principal / 112"
                  className="bg-card border-border text-foreground"
                />
              </div>
            </div>

            {/* Crew call slots */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Escalação de Horários por Função
                  </h4>
                  <p className="text-xs text-muted-foreground">Adicione os membros com chamada antecipada ou especial.</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => append({ name: '', role: '', callTime: '07:30', phone: '' })}
                  className="h-8 border-border text-muted-foreground hover:text-foreground"
                >
                  <Plus className="mr-1 h-3.5 w-3.5 text-primary" /> Adicionar Linha
                </Button>
              </div>

              <div className="space-y-2">
                {fields.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-2 bg-card p-2 rounded-xl border border-border">
                    <Input
                      {...register(`crewMembers.${idx}.name` as const)}
                      placeholder="Nome do profissional"
                      className="h-8 text-xs border-border"
                    />
                    <Input
                      {...register(`crewMembers.${idx}.role` as const)}
                      placeholder="Função (Ex: DoP, Som)"
                      className="h-8 text-xs border-border"
                    />
                    <Input
                      type="time"
                      {...register(`crewMembers.${idx}.callTime` as const)}
                      className="h-8 text-xs w-28 border-border"
                    />
                    <Input
                      {...register(`crewMembers.${idx}.phone` as const)}
                      placeholder="Telemóvel"
                      className="h-8 text-xs w-36 border-border"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(idx)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        )}
    </GlobalModal>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { useStudioResources, useStudioBookings, useCancelStudioBooking } from '@/hooks/studio';
import { useAuthStore } from '@/stores';
import { StudioResource, StudioBooking, StudioResourceType } from '@/types';
import { Button, Badge } from '@/components';
import { PortalClientBookingModal } from './portal-client-booking-modal';
import {
  Building2,
  Calendar as CalendarIcon,
  Clock,
  Lock,
  Plus,
  Video,
  Mic,
  Tv,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sparkles,
} from 'lucide-react';
import { format, isSameDay, addDays, subDays } from 'date-fns';
import { pt } from 'date-fns/locale';

const RESOURCE_TYPE_LABELS: Record<StudioResourceType, { label: string; icon: typeof Building2 }> = {
  MAIN_STAGE: {
    label: 'Palco Principal / Estúdio A',
    icon: Building2,
  },
  SOUND_BOOTH: {
    label: 'Cabine de Som / Foley / ADR',
    icon: Mic,
  },
  CYCLORAMA: {
    label: 'Ciclorama Infinito (Chroma / Branco)',
    icon: Video,
  },
  EDIT_SUITE: {
    label: 'Ilha de Edição & Color Grading',
    icon: Tv,
  },
};

const DEFAULT_RESOURCES: StudioResource[] = [
  {
    id: 'stage-1',
    organizationId: 'demo',
    name: 'Palco Central Nora (Soundstage)',
    type: 'MAIN_STAGE' as StudioResourceType,
    capacity: 35,
    hourlyRate: 45000,
    dailyRate: 350000,
    status: 'AVAILABLE',
    description: '300m² climatizado com grelha de iluminação DMX e isolamento acústico para cinema.',
  },
  {
    id: 'cyclo-1',
    organizationId: 'demo',
    name: 'Ciclorama Verde / Branco 12m',
    type: 'CYCLORAMA' as StudioResourceType,
    capacity: 15,
    hourlyRate: 30000,
    dailyRate: 220000,
    status: 'AVAILABLE',
    description: 'Ciclorama em curva de 3 lados ideal para publicidade, chroma key e videoclipes.',
  },
  {
    id: 'booth-1',
    organizationId: 'demo',
    name: 'Cabine de Dobragem & ADR',
    type: 'SOUND_BOOTH' as StudioResourceType,
    capacity: 4,
    hourlyRate: 25000,
    dailyRate: 180000,
    status: 'AVAILABLE',
    description: 'Cabine acústica flutuante tratada para gravação de voz-off, dobragens e foley.',
  },
  {
    id: 'suite-1',
    organizationId: 'demo',
    name: 'Ilha Master DaVinci Resolve',
    type: 'EDIT_SUITE' as StudioResourceType,
    capacity: 6,
    hourlyRate: 20000,
    dailyRate: 150000,
    status: 'AVAILABLE',
    description: 'Monitorização Flanders Scientific 4K HDR e superfície de controlo para graduação de cor.',
  },
];

export function PortalStudioPageContent() {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedResourceId, setSelectedResourceId] = useState<string>('ALL');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [targetResourceForBooking, setTargetResourceForBooking] = useState<StudioResource | null>(null);

  const { data: resourcesData, isLoading: loadingResources } = useStudioResources();
  const { data: bookingsData, isLoading: loadingBookings, refetch: refetchBookings } = useStudioBookings();
  const { mutateAsync: cancelBooking, isPending: isCancelling } = useCancelStudioBooking();

  const resources: StudioResource[] = useMemo(() => {
    return resourcesData && resourcesData.length > 0 ? resourcesData : DEFAULT_RESOURCES;
  }, [resourcesData]);

  const allBookings: StudioBooking[] = useMemo(() => {
    return bookingsData || [];
  }, [bookingsData]);

  // Função estrita de identificação de titularidade da reserva
  const isUserBooking = (booking: StudioBooking): boolean => {
    if (!user) return false;
    const b = booking as any;
    if (b.userId && b.userId === user.id) return true;
    if (b.clientId && (user as any).clientId && b.clientId === (user as any).clientId) return true;
    if (booking.clientName && user.name && booking.clientName.toLowerCase().trim() === user.name.toLowerCase().trim()) return true;
    return false;
  };

  // Reservas activas pertencentes exclusivamente a este cliente
  const myBookings = useMemo(() => {
    return allBookings.filter((b) => isUserBooking(b));
  }, [allBookings, user]);

  // Reservas do dia seleccionado para exibir na agenda
  const dayBookings = useMemo(() => {
    return allBookings.filter((b) => {
      if (b.status === 'CANCELLED') return false;
      if (selectedResourceId !== 'ALL' && b.resourceId !== selectedResourceId) return false;
      const bDate = new Date(b.startTime);
      return isSameDay(bDate, selectedDate);
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [allBookings, selectedDate, selectedResourceId]);

  const handleOpenBooking = (res?: StudioResource) => {
    setTargetResourceForBooking(res || null);
    setIsBookingModalOpen(true);
  };

  const handleCancelMyBooking = async (bookingId: string) => {
    if (confirm('Tem a certeza que deseja cancelar a sua solicitação de reserva?')) {
      try {
        await cancelBooking(bookingId);
        refetchBookings();
      } catch (err: any) {
        alert(err.message || 'Falha ao cancelar reserva.');
      }
    }
  };

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Apresentação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Agenda & Reservas de Estúdio
            </h1>
            <Badge variant="outline" className="text-[10px] rounded-none bg-primary/10 text-primary border-primary/30 font-mono">
              Sets Climatizados Nora
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Consulte a disponibilidade de palcos, cicloramas e ilhas técnicas, e solicite horários para a sua equipa.
          </p>
        </div>

        <Button
          onClick={() => handleOpenBooking()}
          className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 text-xs font-semibold gap-1.5 px-4 min-h-[44px] sm:min-h-0"
        >
          <Plus className="h-4 w-4" /> Solicitar Reserva
        </Button>
      </div>

      {/* Cartões dos Espaços Disponíveis */}
      <div>
        <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-primary" /> Espaços & Infra-estrutura Técnica
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {resources.map((res) => {
            const IconComponent = RESOURCE_TYPE_LABELS[res.type]?.icon || Building2;
            const isSelected = selectedResourceId === res.id;

            return (
              <div
                key={res.id}
                className={`flex flex-col justify-between border p-4 transition-all rounded-none ${
                  isSelected
                    ? 'border-primary ring-1 ring-primary bg-primary/5'
                    : 'border-border bg-card hover:border-border/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-muted/30 border border-border">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono rounded-none">
                      {res.capacity} pax
                    </Badge>
                  </div>

                  <h3 className="text-xs font-semibold text-foreground mt-3 leading-snug">
                    {res.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                    {res.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-[10px] text-muted-foreground font-mono">Taxa Horária:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatCurrency(Number(res.hourlyRate || 0))}/h
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <Button
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedResourceId(isSelected ? 'ALL' : res.id)}
                      className="flex-1 h-8 min-h-[36px] text-[11px] rounded-none"
                    >
                      {isSelected ? 'Ver Todos' : 'Ver Horários'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleOpenBooking(res)}
                      className="h-8 min-h-[36px] px-2.5 text-[11px] rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
                      title="Reservar este espaço"
                    >
                      Reservar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grade da Agenda Diária com Privacidade Rigorosa */}
      <div className="border border-border bg-card p-4 rounded-none space-y-4">
        {/* Selector de Data */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate((prev) => subDays(prev, 1))}
              className="h-9 w-9 rounded-none border-border"
              title="Dia anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 px-3 py-1.5 border border-border bg-background">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground capitalize">
                {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: pt })}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate((prev) => addDays(prev, 1))}
              className="h-9 w-9 rounded-none border-border"
              title="Próximo dia"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className="text-xs h-9 text-muted-foreground hover:text-foreground rounded-none"
            >
              Hoje
            </Button>
          </div>

          {/* Aviso Explícito de Confidencialidade e Privacidade Industrial */}
          <div className="flex items-center gap-2 px-2.5 py-1 text-[11px] text-muted-foreground border border-border bg-muted/20">
            <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Privacidade garantida: produções de terceiros são apresentadas apenas como indisponíveis.</span>
          </div>
        </div>

        {/* Visualizador de Ocupação do Dia */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground">
            <span>Ocupação do Estúdio para esta Data ({dayBookings.length} agendamentos)</span>
            {selectedResourceId !== 'ALL' && (
              <span className="text-xs text-primary font-normal">
                Filtrado por: {resources.find((r) => r.id === selectedResourceId)?.name}
              </span>
            )}
          </div>

          {dayBookings.length === 0 ? (
            <div className="p-8 border border-dashed border-border text-center space-y-2 bg-background">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
              <p className="text-xs font-semibold text-foreground">
                Todos os horários estão disponíveis nesta data!
              </p>
              <p className="text-[11px] text-muted-foreground">
                Não existem bloqueios nem reservas marcadas. Aproveite para agendar a sua rodagem.
              </p>
              <Button
                size="sm"
                onClick={() => handleOpenBooking()}
                className="mt-2 text-xs rounded-none bg-primary text-primary-foreground hover:bg-primary/90 h-9"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Marcar Horário Agora
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {dayBookings.map((b) => {
                const isMine = isUserBooking(b);
                const startTimeStr = format(new Date(b.startTime), 'HH:mm');
                const endTimeStr = format(new Date(b.endTime), 'HH:mm');
                const resourceName = b.resourceName || (b as any).resource?.name || 'Espaço de Estúdio';

                if (isMine) {
                  // RESERVA DO CLIENTE: Exibição completa e transparente
                  return (
                    <div
                      key={b.id}
                      className="p-3 border border-primary/50 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 border border-primary/20 text-primary shrink-0">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-foreground">
                              {b.projectTitle || (b as any).project?.title || 'Sua Reserva de Produção'}
                            </span>
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 rounded-none">
                              Sua Produção
                            </Badge>
                            <Badge variant="outline" className="text-[10px] rounded-none">
                              {b.status === 'CONFIRMED' ? 'Confirmada' : 'Pendente de Aprovação'}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {resourceName} • <Clock className="inline h-3 w-3 mr-1" />
                            {startTimeStr} às {endTimeStr}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelMyBooking(b.id)}
                          disabled={isCancelling}
                          className="h-8 text-[11px] text-destructive hover:bg-destructive/10 rounded-none border-border"
                        >
                          Cancelar Pedido
                        </Button>
                      </div>
                    </div>
                  );
                }

                // RESERVA DE TERCEIROS: PROTECÇÃO ABSOLUTA DE DADOS
                return (
                  <div
                    key={b.id}
                    className="p-3 border border-border border-dashed bg-muted/20 flex items-center justify-between gap-2 text-muted-foreground"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted border border-border shrink-0">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">
                            Horário Ocupado / Indisponível
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-muted border border-border">
                            Privado
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {resourceName} • <Clock className="inline h-3 w-3 mr-1" />
                          {startTimeStr} às {endTimeStr}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                      Indisponível para reserva
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Histórico: "Minhas Reservas Solicitadas" */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-primary" /> As Minhas Solicitações de Estúdio ({myBookings.length})
        </h2>

        <div className="border border-border bg-card divide-y divide-border">
          {myBookings.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Ainda não realizou nenhuma solicitação de reserva de estúdio com a sua conta.
            </div>
          ) : (
            myBookings.map((b) => (
              <div
                key={b.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">
                      {b.projectTitle || (b as any).project?.title || 'Produção Particular'}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-muted text-muted-foreground border border-border">
                      {b.resourceName || (b as any).resource?.name || 'Estúdio'}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] rounded-none ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          : b.status === 'CANCELLED'
                          ? 'bg-destructive/10 text-destructive border-destructive/30'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                      }`}
                    >
                      {b.status === 'CONFIRMED'
                        ? 'Confirmada'
                        : b.status === 'CANCELLED'
                        ? 'Cancelada'
                        : 'Aguardando Confirmação'}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-1">
                    Data: <span className="font-semibold text-foreground">{format(new Date(b.startTime), 'dd/MM/yyyy')}</span> •{' '}
                    Horário: {format(new Date(b.startTime), 'HH:mm')} às {format(new Date(b.endTime), 'HH:mm')}
                  </p>
                </div>

                {b.status === 'PENDING' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelMyBooking(b.id)}
                    className="h-8 text-xs text-destructive hover:bg-destructive/10 rounded-none border-border self-end sm:self-center"
                  >
                    Cancelar Solicitação
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Reserva para o Cliente */}
      <PortalClientBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        resources={resources}
        defaultResource={targetResourceForBooking}
        existingBookings={allBookings}
        onSuccess={() => refetchBookings()}
      />
    </div>
  );
}

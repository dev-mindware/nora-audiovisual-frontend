'use client';

import { useState, useMemo } from 'react';
import { useStudioResources, useStudioBookings, useCancelStudioBooking, useStudioFilters } from '@/hooks/studio';
import { Button, Badge } from '@/components';
import { FilterPopover } from '@/components/shared';
import { StudioResource, StudioResourceType } from '@/types';
import { StudioBookingModal } from './booking-modal';
import {
  Building2,
  CalendarCheck,
  Users,
  Video,
  Mic,
  Tv,
  Clock,
  Layers,
  CheckCircle2,
  CalendarRange,
} from 'lucide-react';

const RESOURCE_TYPE_OPTIONS = [
  { value: 'MAIN_STAGE', label: 'Palco Principal / Estúdio A' },
  { value: 'SOUND_BOOTH', label: 'Cabine de Som / Foley' },
  { value: 'CYCLORAMA', label: 'Ciclorama Infinito' },
  { value: 'EDIT_SUITE', label: 'Ilha de Edição' },
];

const BOOKING_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

const RESOURCE_TYPE_LABELS: Record<StudioResourceType, { label: string; icon: typeof Building2 }> = {
  MAIN_STAGE: {
    label: 'Palco Principal / Estúdio A',
    icon: Building2,
  },
  SOUND_BOOTH: {
    label: 'Cabine de Som / Foley / Dobragem',
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
    description: '300m² climatizado com grelha de iluminação DMX e isolamento acústico.',
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
    description: 'Ciclorama em curva de 3 lados ideal para publicidade e efeitos VFX.',
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
    description: 'Cabine flutuante tratada para captação de vozes, foley e mix estéreo.',
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
    description: 'Monitorização calibrada Flanders Scientific 4K HDR e console color.',
  },
];

export function StudioPageContent() {
  const [selectedResource, setSelectedResource] = useState<StudioResource | null>(null);

  const {
    resourceType,
    bookingStatus,
    resourceId,
    setResourceType,
    setBookingStatus,
  } = useStudioFilters();

  const { data: rawResources = [], isLoading: loadingResources } = useStudioResources();
  const { data: bookings = [], isLoading: loadingBookings } = useStudioBookings({
    resourceId: resourceId || undefined,
    status: bookingStatus && bookingStatus !== 'ALL' ? bookingStatus : undefined,
  });
  const { mutate: cancelBooking } = useCancelStudioBooking();

  const sourceResources = rawResources.length > 0 ? rawResources : DEFAULT_RESOURCES;

  const resources = useMemo(() => {
    if (!resourceType || resourceType === 'ALL') return sourceResources;
    return sourceResources.filter((r) => r.type === resourceType);
  }, [sourceResources, resourceType]);

  // Estatísticas minimalistas de estúdio
  const stats = useMemo(() => {
    const totalSets = sourceResources.length;
    const availableSets = sourceResources.filter((r) => r.status === 'AVAILABLE').length;
    const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING').length;
    const totalCapacity = sourceResources.reduce((acc, curr) => acc + (curr.capacity || 0), 0);

    return { totalSets, availableSets, activeBookings, totalCapacity };
  }, [sourceResources, bookings]);

  return (
    <div className="space-y-6">
      {/* Resumo de Operações Minimalista */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-none border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Espaços Totais</span>
            <Layers className="h-4 w-4 text-muted-foreground/60" />
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {stats.totalSets}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Sets e ilhas de edição</span>
        </div>

        <div className="rounded-none border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Disponíveis</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600/70 dark:text-emerald-400/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {stats.availableSets}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block">Prontos para rodagem</span>
        </div>

        <div className="rounded-none border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Ocupação / Agenda</span>
            <CalendarRange className="h-4 w-4 text-primary/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {stats.activeBookings}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Marcações ativas</span>
        </div>

        <div className="rounded-none border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Capacidade Total</span>
            <Users className="h-4 w-4 text-muted-foreground/60" />
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {stats.totalCapacity} <span className="text-xs font-normal text-muted-foreground">pax</span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Elenco e equipa técnica</span>
        </div>
      </div>

      {/* Grid de Espaços / Recursos */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/50">
          <div>
            <h2 className="text-sm font-semibold tracking-tight uppercase text-foreground">
              Espaços & Sets de Gravação
            </h2>
            <p className="text-xs text-muted-foreground">
              Configurações acústicas, cicloramas e equipamentos dedicados por set
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FilterPopover
              icon="Tag"
              label="Tipo de Espaço"
              options={RESOURCE_TYPE_OPTIONS}
              value={resourceType || null}
              onChange={(val) => setResourceType(val || '')}
            />
            {Boolean(resourceType) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResourceType('')}
                className="rounded-none text-xs text-muted-foreground hover:text-foreground h-10 px-2"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {loadingResources ? (
            <div className="col-span-4 py-12 text-center text-xs text-muted-foreground border border-border/50 bg-card">
              A carregar espaços do estúdio...
            </div>
          ) : (
            resources.map((res) => {
              const meta = RESOURCE_TYPE_LABELS[res.type] || {
                label: res.type,
                icon: Building2,
              };
              const IconComp = meta.icon;

              return (
                <div
                  key={res.id}
                  className="rounded-none border border-border/70 bg-card p-5 transition-colors hover:border-foreground/30 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-border/60 bg-muted/40 text-foreground">
                        <IconComp className="h-4 w-4" />
                      </div>
                      <Badge
                        variant="outline"
                        className="rounded-none border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5"
                      >
                        {res.status === 'AVAILABLE' ? 'Disponível' : res.status}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold tracking-tight text-foreground leading-snug">
                        {res.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                        {res.description}
                      </p>
                    </div>

                    {/* Especificações Técnicas */}
                    <div className="border-t border-border/60 pt-3 space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3 w-3" /> Lotação
                        </span>
                        <span className="font-mono text-foreground font-medium">
                          {res.capacity ? `${res.capacity} pax` : '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" /> Tarifa Horária
                        </span>
                        <span className="font-mono text-foreground font-medium">
                          {res.hourlyRate ? `${Number(res.hourlyRate).toLocaleString('pt-AO')} Kz` : '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CalendarCheck className="h-3 w-3" /> Tarifa Diária
                        </span>
                        <span className="font-mono text-foreground font-semibold">
                          {res.dailyRate ? `${Number(res.dailyRate).toLocaleString('pt-AO')} Kz` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setSelectedResource(res)}
                    className="mt-4 w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-xs font-medium tracking-wide uppercase flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CalendarCheck className="h-3.5 w-3.5" /> Reservar Set
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Agenda & Histórico de Ocupação */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/50">
          <div>
            <h2 className="text-sm font-semibold tracking-tight uppercase text-foreground">
              Agenda de Ocupação & Reservas
            </h2>
            <p className="text-xs text-muted-foreground">
              Controlo de calendário e ocupações ativas dos sets e cabines
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FilterPopover
              icon="CircleDot"
              label="Estado da Marcação"
              options={BOOKING_STATUS_OPTIONS}
              value={bookingStatus || null}
              onChange={(val) => setBookingStatus(val || '')}
            />
            {Boolean(bookingStatus) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBookingStatus('')}
                className="rounded-none text-xs text-muted-foreground hover:text-foreground h-10 px-2"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-none border border-border/70 bg-card overflow-hidden">
          {loadingBookings ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              A consultar disponibilidade da agenda...
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-14 text-center">
              <CalendarCheck className="mx-auto h-7 w-7 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium text-foreground">Nenhuma marcação encontrada</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Todos os sets, cicloramas e ilhas de edição estão livres no período selecionado.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {bookings.map((b) => {
                const linkedResource = sourceResources.find((r) => r.id === b.resourceId);
                const resourceMeta = linkedResource ? RESOURCE_TYPE_LABELS[linkedResource.type] : null;

                return (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-border/60 bg-muted/30 text-foreground">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold tracking-tight text-foreground">
                            {b.resourceName || linkedResource?.name || 'Set de Gravação'}
                          </span>
                          {resourceMeta && (
                            <Badge variant="outline" className="rounded-none border-border/60 text-[10px] px-1.5 py-0">
                              {resourceMeta.label.split('/')[0].trim()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {b.projectTitle ? `Projecto: ${b.projectTitle}` : 'Reserva Directa de Estúdio'} •{' '}
                          <span className="font-mono text-foreground/80">
                            {new Date(b.startTime).toLocaleDateString('pt-PT')} ({new Date(b.startTime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })})
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Badge
                        variant="outline"
                        className={`rounded-none text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 ${b.status === 'CONFIRMED'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : b.status === 'PENDING'
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'border-destructive/30 bg-destructive/10 text-destructive'
                          }`}
                      >
                        {b.status === 'CONFIRMED' ? 'Confirmado' : b.status === 'PENDING' ? 'Pendente' : 'Cancelado'}
                      </Badge>
                      {b.status !== 'CANCELLED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelBooking(b.id)}
                          className="rounded-none text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2.5 transition-colors"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <StudioBookingModal
        isOpen={Boolean(selectedResource)}
        onClose={() => setSelectedResource(null)}
        resource={selectedResource}
      />
    </div>
  );
}

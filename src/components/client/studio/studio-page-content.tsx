'use client';

import { useState, useMemo } from 'react';
import {
  useStudioResources,
  useStudioBookings,
  useCancelStudioBooking,
  useDeleteStudioResource,
  useStudioFilters,
} from '@/hooks/studio';
import { Button } from '@/components';
import { FilterPopover } from '@/components/shared';
import { StudioResource } from '@/types';
import { useOpenFromQuery } from '@/hooks/common/use-open-from-query';
import { StudioBookingModal } from './booking-modal';
import { StudioResourceModal } from './studio-resource-modal';
import { StudioResourceCard } from './studio-resource-card';
import { StudioMetrics } from './studio-metrics';
import { StudioBookingRow } from './studio-booking-row';
import { CalendarCheck, Plus } from 'lucide-react';

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

export function StudioPageContent() {
  const [selectedResource, setSelectedResource] = useState<StudioResource | null>(null);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<StudioResource | null>(null);
  useOpenFromQuery('new', {
    '1': () => {
      setEditingResource(null);
      setIsResourceModalOpen(true);
    },
  });

  const {
    resourceType,
    bookingStatus,
    setResourceType,
    setBookingStatus,
  } = useStudioFilters();

  const { data: dbResources, isLoading: loadingResources } = useStudioResources();
  const { data: dbBookings, isLoading: loadingBookings } = useStudioBookings();

  const { mutate: cancelBooking } = useCancelStudioBooking();
  const { mutate: deleteResource } = useDeleteStudioResource();

  const sourceResources = useMemo(() => dbResources ?? [], [dbResources]);

  const resources = useMemo(() => {
    if (!resourceType) return sourceResources;
    return sourceResources.filter((r) => r.type === resourceType);
  }, [sourceResources, resourceType]);

  const bookings = useMemo(() => {
    const list = dbBookings || [];
    if (!bookingStatus) return list;
    return list.filter((b) => b.status === bookingStatus);
  }, [dbBookings, bookingStatus]);

  const stats = useMemo(() => {
    const totalSets = sourceResources.length;
    const availableSets = sourceResources.filter((r) => r.status === 'AVAILABLE' || (r.status as string) === 'ACTIVE').length;
    const activeBookings = (dbBookings || []).filter((b) => b.status === 'CONFIRMED').length;
    const totalCapacity = sourceResources.reduce((acc, r) => acc + (r.capacity || 0), 0);
    return { totalSets, availableSets, activeBookings, totalCapacity };
  }, [sourceResources, dbBookings]);

  const handleDeleteResource = (res: StudioResource) => {
    if (confirm(`Tem a certeza que deseja eliminar o espaço "${res.name}"?`)) {
      deleteResource(res.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Cards de Métricas Padronizados */}
      <div data-tour="studio-metrics">
      <StudioMetrics
        totalSets={stats.totalSets}
        availableSets={stats.availableSets}
        activeBookings={stats.activeBookings}
        totalCapacity={stats.totalCapacity}
      />
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
          <div className="flex items-center gap-2" data-tour="studio-actions">
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
                className="rounded-xs text-xs text-muted-foreground hover:text-foreground h-9 px-2"
              >
                Limpar
              </Button>
            )}

            <Button
              data-tour="studio-create"
              onClick={() => {
                setEditingResource(null);
                setIsResourceModalOpen(true);
              }}
              size="sm"
              className="rounded-xs bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-xs font-medium tracking-wide uppercase px-3.5 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Novo Set / Espaço
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4" data-tour="studio-resources">
          {loadingResources ? (
            <div className="col-span-full py-12 text-center text-xs text-muted-foreground border border-border/50 bg-card rounded-xs">
              A carregar espaços do estúdio...
            </div>
          ) : resources.length === 0 ? (
            <div className="col-span-full rounded-xs border border-dashed border-border bg-card py-12 text-center">
              <p className="text-sm font-medium text-foreground">Ainda não tem espaços no estúdio</p>
              <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                Crie o primeiro set e defina os dias e horas em que os clientes podem marcar sessões.
              </p>
              <Button
                size="sm"
                className="mt-4 h-9 gap-1.5 rounded-xs px-3.5 text-xs font-medium uppercase tracking-wide"
                onClick={() => {
                  setEditingResource(null);
                  setIsResourceModalOpen(true);
                }}
              >
                <Plus className="h-3.5 w-3.5" /> Criar o primeiro espaço
              </Button>
            </div>
          ) : (
            resources.map((res) => (
              <StudioResourceCard
                key={res.id}
                resource={res}
                onEdit={(item) => {
                  setEditingResource(item);
                  setIsResourceModalOpen(true);
                }}
                onDelete={handleDeleteResource}
                onSelectToBook={(item) => setSelectedResource(item)}
              />
            ))
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
                className="rounded-xs text-xs text-muted-foreground hover:text-foreground h-9 px-2"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-xs border border-border/70 bg-card overflow-hidden shadow-xs" data-tour="studio-bookings">
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
              {bookings.map((b) => (
                <StudioBookingRow
                  key={b.id}
                  booking={b}
                  linkedResource={sourceResources.find((r) => r.id === b.resourceId)}
                  onCancel={(id) => cancelBooking(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <StudioBookingModal
        isOpen={Boolean(selectedResource)}
        onClose={() => setSelectedResource(null)}
        resource={selectedResource}
      />

      <StudioResourceModal
        isOpen={isResourceModalOpen}
        onClose={() => {
          setIsResourceModalOpen(false);
          setEditingResource(null);
        }}
        resource={editingResource}
      />
    </div>
  );
}

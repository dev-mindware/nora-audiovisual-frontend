'use client';

import { StudioBooking, StudioResource } from '@/types';
import { Button, Badge, ItemStatusBadge } from '@/components';
import { Building2 } from 'lucide-react';
import { RESOURCE_TYPE_LABELS } from './studio-resource-card';

interface StudioBookingRowProps {
  booking: StudioBooking;
  linkedResource?: StudioResource;
  onCancel: (bookingId: string) => void;
}

export function StudioBookingRow({
  booking,
  linkedResource,
  onCancel,
}: StudioBookingRowProps) {
  const resourceMeta = linkedResource
    ? RESOURCE_TYPE_LABELS[linkedResource.type]
    : null;

  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/20 transition-colors">
      <div className="flex items-start sm:items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xs border border-border/60 bg-muted/30 text-foreground">
          <Building2 className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              {booking.resourceName || linkedResource?.name || 'Set de Gravação'}
            </span>
            {resourceMeta && (
              <Badge
                variant="outline"
                className="rounded-xs border-border/60 text-[10px] px-1.5 py-0 font-normal"
              >
                {resourceMeta.label.split('/')[0].trim()}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {booking.projectTitle
              ? `Projecto: ${booking.projectTitle}`
              : 'Reserva Directa de Estúdio'}{' '}
            •{' '}
            <span className="font-mono text-foreground/80">
              {start.toLocaleDateString('pt-PT')} (
              {start.toLocaleTimeString('pt-PT', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              -{' '}
              {end.toLocaleTimeString('pt-PT', {
                hour: '2-digit',
                minute: '2-digit',
              })}
              )
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        <ItemStatusBadge status={booking.status} />
        {booking.status !== 'CANCELLED' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancel(booking.id)}
            className="rounded-xs text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2.5 transition-colors"
          >
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}

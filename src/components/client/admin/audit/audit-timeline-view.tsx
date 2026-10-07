'use client';

import { InvestigativeAuditEvent, AuditSeverity } from '@/types/audit';
import { format } from 'date-fns';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  Laptop,
  Smartphone,
  Tablet,
  Bot,
  User,
  Building2,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface AuditTimelineViewProps {
  logs: InvestigativeAuditEvent[];
  onSelectEvent: (event: InvestigativeAuditEvent) => void;
}

const SEVERITY_DOT: Record<AuditSeverity, string> = {
  CRITICAL: 'bg-red-500 ring-red-500/20',
  HIGH: 'bg-amber-500 ring-amber-500/20',
  MEDIUM: 'bg-orange-500 ring-orange-500/20',
  LOW: 'bg-blue-500 ring-blue-500/20',
  INFO: 'bg-muted-foreground ring-muted/50',
};

export function AuditTimelineView({ logs, onSelectEvent }: AuditTimelineViewProps) {
  if (logs.length === 0) {
    return null;
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
      {logs.map((log) => {
        const dotClass = SEVERITY_DOT[log.severity] || SEVERITY_DOT.INFO;
        const DeviceIcon =
          log.device?.deviceType === 'MOBILE'
            ? Smartphone
            : log.device?.deviceType === 'TABLET'
            ? Tablet
            : log.device?.deviceType === 'BOT'
            ? Bot
            : Laptop;

        return (
          <div key={log.id} className="relative group">
            {/* Timeline Indicator Dot */}
            <div
              className={`absolute -left-[27px] top-3 size-3 rounded-full ring-4 transition-transform group-hover:scale-125 ${dotClass}`}
            />

            {/* Event Card */}
            <div
              onClick={() => onSelectEvent(log)}
              className="p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/40 hover:border-border/80 transition-all cursor-pointer shadow-xs space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {log.action}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-muted text-muted-foreground border border-border">
                    {log.category}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                  <Clock className="size-3" />
                  {log.createdAt ? format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss') : '—'}
                </div>
              </div>

              {/* Meta information row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="size-3.5 text-primary" />
                  <span className="font-medium text-foreground">
                    {log.actor?.name || 'Sistema Nora'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-muted-foreground" />
                  <span>{log.organization?.name || 'Plataforma Global'}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <DeviceIcon className="size-3.5 text-muted-foreground" />
                  <span className="truncate max-w-[200px]">
                    {log.device?.formattedUserAgent || 'Dispositivo Desconhecido'}
                  </span>
                </div>
              </div>

              {/* Changes Preview or Target */}
              {log.changes?.changedFields && log.changes.changedFields.length > 0 && (
                <div className="pt-2 border-t border-border/40 flex items-center gap-2 text-xs">
                  <ArrowRight className="size-3 text-primary" />
                  <span className="text-muted-foreground">Alterou:</span>
                  <div className="flex flex-wrap gap-1">
                    {log.changes.changedFields.map((f) => (
                      <span
                        key={f}
                        className="px-1.5 py-0.2 text-[10px] font-mono rounded bg-primary/10 text-primary border border-primary/20"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

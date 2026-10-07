'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { InvestigativeAuditEvent, AuditSeverity } from '@/types/audit';
import { format } from 'date-fns';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Laptop,
  Smartphone,
  Tablet,
  Bot,
  Globe,
  User,
  Building2,
  Clock,
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileCode2,
  ExternalLink,
} from 'lucide-react';
import { SucessMessage } from '@/utils/messages';

interface AuditInvestigationDrawerProps {
  event: InvestigativeAuditEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onFilterCorrelation?: (correlationId: string) => void;
}

const SEVERITY_CONFIG: Record<
  AuditSeverity,
  { label: string; badgeClass: string; icon: any }
> = {
  CRITICAL: {
    label: 'Crítico',
    badgeClass: 'bg-red-500/10 text-red-500 border-red-500/20',
    icon: ShieldAlert,
  },
  HIGH: {
    label: 'Alta',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    icon: AlertTriangle,
  },
  MEDIUM: {
    label: 'Média',
    badgeClass: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    icon: AlertTriangle,
  },
  LOW: {
    label: 'Baixa',
    badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: Info,
  },
  INFO: {
    label: 'Informativo',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    icon: Info,
  },
};

export function AuditInvestigationDrawer({
  event,
  isOpen,
  onClose,
  onFilterCorrelation,
}: AuditInvestigationDrawerProps) {
  const [copiedJson, setCopiedJson] = useState(false);
  const [showTechnicalJson, setShowTechnicalJson] = useState(false);

  if (!event) return null;

  const severity = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.INFO;
  const SeverityIcon = severity.icon;

  const DeviceIcon =
    event.device.deviceType === 'MOBILE'
      ? Smartphone
      : event.device.deviceType === 'TABLET'
      ? Tablet
      : event.device.deviceType === 'BOT'
      ? Bot
      : Laptop;

  const copyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    setCopiedJson(true);
    SucessMessage('Payload técnico copiado para a área de transferência');
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto p-6 bg-card border-l border-border"
      >
        <SheetHeader className="space-y-2 pb-4 border-b border-border">
          <div className="flex items-center justify-between gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md border ${severity.badgeClass}`}
            >
              <SeverityIcon className="size-3.5" />
              {severity.label}
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {event.createdAt ? format(new Date(event.createdAt), 'dd/MM/yyyy HH:mm:ss') : '—'}
            </span>
          </div>

          <SheetTitle className="text-lg font-semibold font-mono text-foreground break-all">
            {event.action}
          </SheetTitle>

          <SheetDescription className="text-xs text-muted-foreground">
            Investigação aprofundada do acontecimento, ator responsável, contexto de infraestrutura e alterações.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Card: Actor & Organization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Actor */}
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <User className="size-3.5 text-primary" />
                Ator Responsável
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {event.actor?.name || 'Sistema Nora'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {event.actor?.email || 'noreply@nora-audiovisual.ao'}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-muted text-foreground border border-border">
                    {event.actor?.role || 'SYSTEM'}
                  </span>
                  {event.actor?.isPlatformAdmin && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded bg-primary/10 text-primary border border-primary/20">
                      ADMIN GLOBAL
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Organization */}
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Building2 className="size-3.5 text-primary" />
                Produtora / Contexto
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {event.organization?.name || 'Plataforma Global Nora'}
                </p>
                <p className="text-xs font-mono text-muted-foreground">
                  {event.organization?.slug ? `@${event.organization.slug}` : 'Escopo de Sistema'}
                </p>
                {event.target && (
                  <div className="mt-2 pt-2 border-t border-border/50 text-xs">
                    <span className="text-muted-foreground">Alvo: </span>
                    <span className="font-semibold text-foreground">
                      {event.target.type} {event.target.name ? `(${event.target.name})` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card: Device, Network & Session */}
          <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Laptop className="size-3.5 text-primary" />
              Dispositivo, Rede & Sessão
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground">Dispositivo & Navegador:</span>
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <DeviceIcon className="size-4 text-primary shrink-0" />
                  <span className="truncate">{event.device?.formattedUserAgent || 'Desconhecido'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground">Endereço IP:</span>
                <div className="flex items-center gap-2 font-mono text-foreground">
                  <Globe className="size-4 text-muted-foreground shrink-0" />
                  <span>{event.network?.ip || '127.0.0.1'}</span>
                </div>
              </div>

              {event.request?.correlationId && (
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-muted-foreground">Correlation ID / Request:</span>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background border border-border">
                    <span className="font-mono text-[11px] truncate text-foreground">
                      {event.request.correlationId}
                    </span>
                    {onFilterCorrelation && (
                      <button
                        onClick={() => onFilterCorrelation(event.request.correlationId!)}
                        className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 shrink-0"
                      >
                        Filtrar Cadeia
                        <ExternalLink className="size-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card: Diff Antes vs Depois (se aplicável) */}
          {event.changes && (
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <ArrowRight className="size-3.5 text-primary" />
                  Alterações Detetadas (Antes vs. Depois)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {event.changes.changedFields?.length || 0} campo(s) modificado(s)
                </span>
              </div>

              <div className="space-y-2 mt-2">
                {event.changes.changedFields && event.changes.changedFields.length > 0 ? (
                  event.changes.changedFields.map((field) => {
                    const beforeVal = event.changes?.before?.[field];
                    const afterVal = event.changes?.after?.[field];
                    return (
                      <div
                        key={field}
                        className="p-2.5 rounded-lg border border-border/80 bg-background space-y-1.5 text-xs"
                      >
                        <span className="font-mono font-semibold text-primary">{field}</span>
                        <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                          <div className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 overflow-x-auto">
                            <span className="text-[9px] uppercase font-semibold text-muted-foreground block mb-0.5">
                              Antes:
                            </span>
                            {beforeVal !== undefined ? JSON.stringify(beforeVal) : '—'}
                          </div>
                          <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 overflow-x-auto">
                            <span className="text-[9px] uppercase font-semibold text-muted-foreground block mb-0.5">
                              Depois:
                            </span>
                            {afterVal !== undefined ? JSON.stringify(afterVal) : '—'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Dados de delta registados diretamente no payload de metadados.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Technical JSON Accordion */}
          <div className="pt-2 border-t border-border">
            <button
              onClick={() => setShowTechnicalJson(!showTechnicalJson)}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-medium text-foreground transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileCode2 className="size-4 text-primary" />
                Inspecionar Payload Técnico em JSON
              </span>
              {showTechnicalJson ? (
                <ChevronUp className="size-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-4 text-muted-foreground" />
              )}
            </button>

            {showTechnicalJson && (
              <div className="mt-3 relative">
                <button
                  onClick={copyPayload}
                  className="absolute top-2 right-2 px-2.5 py-1 text-xs rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {copiedJson ? (
                    <>
                      <Check className="size-3 text-emerald-500" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      Copiar JSON
                    </>
                  )}
                </button>
                <pre className="p-4 rounded-xl bg-muted/50 border border-border text-[11px] font-mono text-foreground overflow-x-auto max-h-72">
                  {JSON.stringify(event, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

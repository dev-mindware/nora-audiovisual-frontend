'use client';

import { useEffect, useState, useTransition } from 'react';
import { TitleList } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { sessionsService, UserSessionItem } from '@/services/sessions-service';
import { parseApiError } from '@/lib/api-error';
import { ErrorMessage, SucessMessage } from '@/utils';
import {
  Laptop,
  Smartphone,
  Globe,
  Clock,
  ShieldAlert,
  Loader2,
  Trash2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';

export function SessionsPageContent() {
  const [sessions, setSessions] = useState<UserSessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [, startTransition] = useTransition();

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await sessionsService.listSessions();
      setSessions(data);
    } catch (err) {
      const parsed = parseApiError(err);
      ErrorMessage(parsed.message || 'Falha ao carregar as sessões ativas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startTransition(() => {
      fetchSessions();
    });
  }, []);

  const handleRevoke = async (id: string) => {
    try {
      setRevokingId(id);
      await sessionsService.revokeSession(id);
      SucessMessage('Sessão revogada com sucesso.');
      await fetchSessions();
    } catch (err) {
      const parsed = parseApiError(err);
      ErrorMessage(parsed.message || 'Erro ao revogar sessão.');
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAllOther = async () => {
    try {
      setIsRevokingAll(true);
      await sessionsService.revokeAllOtherSessions();
      SucessMessage('Todas as outras sessões foram encerradas.');
      await fetchSessions();
    } catch (err) {
      const parsed = parseApiError(err);
      ErrorMessage(parsed.message || 'Erro ao encerrar outras sessões.');
    } finally {
      setIsRevokingAll(false);
    }
  };

  const getDeviceIcon = (ua?: string) => {
    if (!ua) return <Globe className="h-4 w-4 text-primary" />;
    const lower = ua.toLowerCase();
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) {
      return <Smartphone className="h-4 w-4 text-primary" />;
    }
    return <Laptop className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Cabeçalho */}
      <TitleList
        title="Sessões Ativas & Segurança"
        subtitle="Dispositivos e navegadores atualmente autenticados na sua conta."
      >
        <Button
          variant="outline"
          onClick={handleRevokeAllOther}
          disabled={isRevokingAll || sessions.length <= 1}
          className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-semibold h-9 px-4"
        >
          {isRevokingAll ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> A revogar...
            </>
          ) : (
            <>
              <ShieldAlert className="mr-1.5 h-3.5 w-3.5" /> Terminar Outras Sessões
            </>
          )}
        </Button>
      </TitleList>

      {/* Lista Minimalista de Sessões */}
      <div className="rounded-none border border-border/70 bg-card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border/50">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted/40" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-48 bg-muted/40" />
                    <div className="h-3 w-32 bg-muted/20" />
                  </div>
                </div>
                <div className="h-7 w-24 bg-muted/30" />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-foreground">Nenhuma sessão encontrada</p>
            <p className="text-xs text-muted-foreground mt-1">
              Não existem registos de sessões ativas no momento.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {sessions.map((session) => {
              const isRevoking = revokingId === session.id;

              return (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-border/70 bg-muted/30 text-foreground">
                      {getDeviceIcon(session.userAgent)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tracking-tight text-foreground truncate max-w-sm sm:max-w-md">
                          {session.userAgent || 'Navegador / Cliente Nora'}
                        </span>
                        {session.isCurrent && (
                          <Badge
                            variant="outline"
                            className="rounded-none border-primary/30 bg-primary/10 text-primary text-[10px] font-mono uppercase tracking-wider px-2 py-0.5"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3 inline" /> Sessão Atual
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-0.5">
                        <span className="font-mono text-foreground/80">
                          IP: {session.ipAddress || '127.0.0.1'}
                        </span>
                        <span>•</span>
                        <span className="font-mono flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground/70" />
                          Iniciada em {format(new Date(session.createdAt), 'dd/MM/yyyy HH:mm')}
                        </span>
                        {session.expiresAt && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-muted-foreground">
                              Expira em {format(new Date(session.expiresAt), 'dd/MM/yyyy HH:mm')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {session.isCurrent ? (
                      <span className="text-xs text-muted-foreground italic px-2">
                        Dispositivo em utilização
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isRevoking}
                        onClick={() => handleRevoke(session.id)}
                        className="rounded-none text-xs h-8 px-3 border-border text-destructive hover:bg-destructive/10"
                      >
                        {isRevoking ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Terminar Sessão
                          </>
                        )}
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
  );
}

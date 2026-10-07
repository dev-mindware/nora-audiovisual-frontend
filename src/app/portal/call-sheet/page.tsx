'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { projectsService } from '@/services/projects-service';
import { CallSheet } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  MapPin,
  CloudSun,
  Hospital,
  Printer,
  AlertCircle,
  Clapperboard,
  Users,
  Phone,
} from 'lucide-react';
import { format } from 'date-fns';

function CallSheetContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [callSheet, setCallSheet] = useState<CallSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Identificador da Folha de Rodagem não fornecido.');
      setLoading(false);
      return;
    }

    projectsService
      .getCallSheet(id)
      .then((data) => {
        setCallSheet(data);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Falha ao carregar a folha de rodagem.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="border border-border p-12 text-center text-xs font-mono text-muted-foreground">
        A carregar folha de rodagem oficial...
      </div>
    );
  }

  if (error || !callSheet) {
    return (
      <div className="border border-dashed border-destructive/50 p-12 text-center space-y-3 bg-card">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
        <h2 className="text-base font-semibold text-foreground">Folha de Rodagem Indisponível</h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          {error || 'Não foi possível encontrar a folha de rodagem solicitada ou o link expirou.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action bar (hidden when printing) */}
      <div className="flex items-center justify-between border-b border-border pb-4 print:hidden">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="rounded-none border-primary/40 bg-primary/10 text-primary text-[10px] font-mono uppercase"
          >
            Folha de Rodagem Oficial
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            {callSheet.status === 'PUBLISHED' ? 'Publicada & Em Vigor' : callSheet.status}
          </span>
        </div>

        <Button
          onClick={handlePrint}
          size="sm"
          variant="outline"
          className="rounded-none gap-2 text-xs border-border"
        >
          <Printer className="h-3.5 w-3.5" />
          Imprimir / Guardar PDF
        </Button>
      </div>

      {/* Main Document Box */}
      <Card className="rounded-none border-border bg-card shadow-lg print:border-none print:shadow-none">
        <CardHeader className="border-b border-border p-6 bg-muted/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Clapperboard className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold tracking-tight text-foreground uppercase">
                  {callSheet.title}
                </h1>
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                {callSheet.projectTitle ? `Projecto: ${callSheet.projectTitle} • ` : ''}
                Escalação de Horários e Segurança de Set
              </p>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-muted-foreground uppercase block">Data de Gravação</span>
              <span className="text-sm font-semibold text-foreground">
                {callSheet.shootDate ? format(new Date(callSheet.shootDate), 'dd/MM/yyyy') : 'A definir'}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6 text-xs">
          {/* Key Schedule Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 border border-border/80">
            <div>
              <span className="text-[10px] text-muted-foreground font-mono uppercase block flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-primary" />
                Horário da Chamada Geral (Call Time)
              </span>
              <span className="text-2xl font-semibold font-mono text-primary mt-1 block">
                {callSheet.generalCallTime}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-muted-foreground font-mono uppercase block flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-primary" />
                Locação Principal
              </span>
              <p className="text-sm font-semibold text-foreground mt-1">
                {callSheet.location || 'Estúdio Nora Audiovisual'}
              </p>
            </div>
          </div>

          {/* Safety & Hospital */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {callSheet.nearestHospital && (
              <div className="border border-border p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Hospital className="h-4 w-4 text-destructive" />
                  <span>Hospital Mais Próximo / Emergência</span>
                </div>
                <p className="text-muted-foreground font-mono text-[11px]">
                  {callSheet.nearestHospital}
                </p>
              </div>
            )}

            {callSheet.weatherForecast && (
              <div className="border border-border p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <CloudSun className="h-4 w-4 text-amber-500" />
                  <span>Previsão Meteorológica</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  {callSheet.weatherForecast}
                </p>
              </div>
            )}
          </div>

          {/* Crew Members Escalation */}
          {callSheet.crewMembers && callSheet.crewMembers.length > 0 && (
            <div className="border border-border p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Convocatória de Elenco & Equipa Técnica ({callSheet.crewMembers.length})
                </h3>
              </div>

              <div className="divide-y divide-border">
                {callSheet.crewMembers.map((member, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-4 font-mono text-[11px]">
                    <div>
                      <span className="font-semibold text-foreground">{member.name}</span>
                      <span className="text-muted-foreground ml-2">({member.role})</span>
                    </div>

                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="text-primary font-semibold">{member.callTime}</span>
                      {member.phone && (
                        <span className="flex items-center gap-1 text-[10px]">
                          <Phone className="h-3 w-3" />
                          {member.phone}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CallSheetPage() {
  return (
    <Suspense
      fallback={
        <div className="border border-border p-12 text-center text-xs font-mono text-muted-foreground">
          A preparar folha de rodagem...
        </div>
      }
    >
      <CallSheetContent />
    </Suspense>
  );
}

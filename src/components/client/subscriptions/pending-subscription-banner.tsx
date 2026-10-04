'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, FileText } from 'lucide-react';

interface PendingSubscriptionBannerProps {
  planName: string;
  billingCycle: string;
  referenceNumber?: string | null;
  proofUrl?: string | null;
  onOpenProof?: () => void;
}

export function PendingSubscriptionBanner({
  planName,
  billingCycle,
  referenceNumber,
  proofUrl,
  onOpenProof,
}: PendingSubscriptionBannerProps) {
  return (
    <div className="relative overflow-hidden p-5 rounded-xs bg-muted/40 border border-border shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-9 w-9 rounded-xs bg-muted text-foreground flex items-center justify-center shrink-0 mt-0.5 border border-border">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-foreground">
                Subscrição a Aguardar Validação de Comprovativo
              </h4>
              <Badge variant="outline" className="text-[10px]">
                PENDENTE
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O seu pedido de ativação do plano <span className="font-semibold text-foreground">{planName}</span> ({billingCycle === 'ANNUAL' ? 'Ciclo Anual' : 'Ciclo Mensal'}) foi submetido com sucesso. A equipa financeira está a validar o pagamento.
            </p>
            {referenceNumber && (
              <div className="text-[11px] text-muted-foreground font-mono">
                Referência: <span className="font-semibold text-primary">{referenceNumber}</span>
              </div>
            )}
          </div>
        </div>

        {proofUrl && (
          <div className="shrink-0 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (onOpenProof) {
                  onOpenProof();
                } else if (proofUrl.startsWith('data:') || proofUrl.startsWith('http')) {
                  const win = window.open();
                  win?.document.write(`<iframe src="${proofUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                }
              }}
              className="text-xs rounded-xs"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              Ver Comprovativo Enviado
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

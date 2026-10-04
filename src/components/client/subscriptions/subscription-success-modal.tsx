'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';

interface SubscriptionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  referenceNumber: string;
}

export function SubscriptionSuccessModal({
  isOpen,
  onClose,
  referenceNumber,
}: SubscriptionSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-card border-border text-foreground text-center shadow-2xl">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-semibold text-foreground">
              Subscrição Submetida com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              O seu comprovativo de pagamento foi enviado para validação administrativa.
            </DialogDescription>
          </DialogHeader>

          <div className="w-full p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Referência da Operação:</span>
              <span className="font-mono font-semibold text-primary">{referenceNumber}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Estado Atual:</span>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-semibold text-[10px]">
                Aguardando Aprovação
              </Badge>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Tempo Estimado de Validação:</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" /> Até 2 horas úteis
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Assim que a equipa de faturação confirmar o crédito bancário, a sua subscrição será ativada e todas as quotas e funcionalidades contratadas serão libertadas imediatamente.
          </p>

          <Button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 text-xs shadow-xs"
          >
            Entendido, Voltar ao Painel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

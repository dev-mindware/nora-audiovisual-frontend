'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Badge,
} from '@/components';
import { useCreateInvoiceRequest, useMindgestConfig } from '@/hooks/billing';
import { Budget } from '@/types';
import { FileCheck, ShieldCheck, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface MindgestInvoiceModalProps {
  budget: Budget | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MindgestInvoiceModal({
  budget,
  isOpen,
  onClose,
}: MindgestInvoiceModalProps) {
  const { data: config } = useMindgestConfig();
  const { mutateAsync: createInvoiceRequest, isPending } = useCreateInvoiceRequest();

  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');

  if (!budget) return null;

  const isConnected = config?.connectionStatus === 'CONNECTED';

  const handleEmitInvoice = async () => {
    try {
      await createInvoiceRequest({
        paymentId: budget.id, // Utiliza o ID do orçamento aprovado como referência do pagamento
        notes: notes.trim() || `Orçamento #${budget.title || budget.id.slice(0, 8)} - ${budget.clientName || 'Cliente'}`,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      onClose();
    } catch {
      // O hook já emite a mensagem de erro
    }
  };

  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-6 space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <FileCheck className="h-5 w-5" />
            <DialogTitle className="text-lg font-semibold">Emitir Fatura no Mindgest</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Disparo de emissão de fatura comercial com assinatura digital AGT.
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4" /> Integração Mindgest Desconectada
            </div>
            <p className="text-muted-foreground">
              A sua organização ainda não configurou as credenciais do Mindgest. Aceda às configurações para conectar a sua empresa emissora.
            </p>
            <Link href="/settings?tab=mindgest" onClick={onClose}>
              <Button size="sm" variant="outline" className="text-xs mt-1 border-amber-500/30 text-amber-500">
                Configurar Mindgest Agora <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Budget Summary Card */}
            <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{budget.title || `Orçamento #${budget.id.slice(0, 8)}`}</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                  Aprovado
                </Badge>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Cliente:</span>
                <span className="font-medium text-foreground">{budget.clientName || 'Cliente Direto'}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono">{formatKz(Number(budget.subtotal || 0))}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Impostos / Retenções:</span>
                <span className="font-mono">{formatKz(Number(budget.estimatedTax || 0))}</span>
              </div>
              <div className="flex items-center justify-between text-foreground font-semibold pt-2 border-t border-border/40 text-sm">
                <span>Total a Faturar:</span>
                <span className="font-mono text-emerald-500">{formatKz(Number(budget.total || 0))}</span>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-2">
              <label className="font-semibold text-foreground">Data de Vencimento</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-foreground">Notas da Fatura (Opcional)</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Pagamento referente a rodagem de filme publicitário..."
                className="text-xs"
              />
            </div>

            <div className="p-3 bg-muted/10 rounded-xl border border-border/40 flex items-center gap-2 text-muted-foreground text-[11px]">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>O documento gerado terá hash SAF-T e QRCode emitidos pelo Mindgest.</span>
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending} className="text-xs">
            Cancelar
          </Button>
          {isConnected && (
            <Button
              size="sm"
              onClick={handleEmitInvoice}
              disabled={isPending}
              className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isPending ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> A emitir no Mindgest...
                </>
              ) : (
                <>
                  <FileCheck className="h-3.5 w-3.5" /> Confirmar &amp; Emitir Fatura
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

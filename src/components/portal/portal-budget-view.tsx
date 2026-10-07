'use client';

import { useState, useEffect } from 'react';
import { portalService, PortalBudget, AcceptBudgetPayload } from '@/services/portal-service';
import {
  ButtonSubmit,
  Input,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui';
import {
  FileCheck,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  Calendar,
  Building,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface PortalBudgetViewProps {
  token: string;
}

export function PortalBudgetView({ token }: PortalBudgetViewProps) {
  const [budget, setBudget] = useState<PortalBudget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Acceptance form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    portalService
      .viewBudget(token)
      .then((data) => setBudget(data))
      .catch((err) => {
        setError(err?.response?.data?.message || 'Proposta comercial não encontrada ou expirada.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail) {
      toast.error('Preencha seu nome e email para validação formal do aceite.');
      return;
    }

    setIsAccepting(true);
    try {
      const res = await portalService.acceptBudget(token, {
        clientName,
        clientEmail,
        notes,
      });
      toast.success(res.message || 'Proposta aceite com sucesso!');
      const updated = await portalService.viewBudget(token);
      setBudget(updated);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Falha ao aceitar proposta.');
    } finally {
      setIsAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-muted-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary border-t-transparent mb-4" />
        <p className="text-sm font-semibold">A carregar proposta comercial...</p>
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
        <Card className="max-w-md w-full p-8 text-center shadow-xs border-destructive/20">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xs bg-destructive/10 text-destructive mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-semibold text-foreground mb-2">Proposta Indisponível</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mb-6">{error || 'O link da proposta comercial expirou.'}</CardDescription>
        </Card>
      </div>
    );
  }

  const isApproved = budget.status === 'ACCEPTED' || budget.status === 'APPROVED';

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              <FileCheck className="h-4 w-4" /> Proposta Comercial Audiovisual
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Orçamento de Produção (v{budget.version})
            </h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground/70" />
              Destinatário: <span className="font-semibold text-foreground">{budget.clientName}</span>
              {budget.validUntil && (
                <>
                  {' '}• Válido até:{' '}
                  <span className="font-semibold text-foreground">
                    {new Date(budget.validUntil).toLocaleDateString('pt-PT')}
                  </span>
                </>
              )}
            </p>
          </div>

          <Badge
            variant="outline"
            className="py-1 px-3 text-sm font-semibold"
          >
            {isApproved ? 'Aceite Confirmado' : 'Aguarda Aceite'}
          </Badge>
        </div>

        {/* Line Items Table */}
        <Card className="p-0 gap-0 overflow-hidden shadow-xs">
          <Table className="min-w-full text-left text-xs">
            <TableHeader className="bg-muted/40 font-semibold text-muted-foreground">
              <TableRow>
                <TableHead className="px-5 py-3.5">Categoria / Linha de Produção</TableHead>
                <TableHead className="px-5 py-3.5">Descrição Técnica</TableHead>
                <TableHead className="px-5 py-3.5 text-center">Qtd</TableHead>
                <TableHead className="px-5 py-3.5 text-right">Preço Unitário</TableHead>
                <TableHead className="px-5 py-3.5 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60">
              {budget.items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/20">
                  <TableCell className="px-5 py-4 font-semibold text-foreground">{item.category}</TableCell>
                  <TableCell className="px-5 py-4 text-muted-foreground">{item.description}</TableCell>
                  <TableCell className="px-5 py-4 text-center font-mono">{item.quantity}</TableCell>
                  <TableCell className="px-5 py-4 text-right font-mono text-muted-foreground">
                    {item.unitPrice.toLocaleString('pt-AO')} Kz
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right font-mono font-semibold text-foreground">
                    {(item.quantity * item.unitPrice).toLocaleString('pt-AO')} Kz
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals Summary Footer */}
          <CardFooter className="border-t border-border bg-muted/20 p-6 flex-col items-stretch space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold text-foreground">{budget.subtotal.toLocaleString('pt-AO')} Kz</span>
            </div>
            {budget.discount > 0 && (
              <div className="flex justify-between text-primary">
                <span>Desconto Comercial:</span>
                <span className="font-mono font-semibold">-{budget.discount.toLocaleString('pt-AO')} Kz</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold text-foreground pt-2 border-t border-border">
              <span>Total da Proposta:</span>
              <span className="font-mono text-lg text-primary">{budget.total.toLocaleString('pt-AO')} Kz</span>
            </div>
          </CardFooter>
        </Card>

        {/* Acceptance Section */}
        {isApproved ? (
          <Card className="p-6 shadow-xs flex flex-row items-start gap-4 border-border bg-muted/20">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xs bg-muted text-primary">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-foreground">Proposta Comercial Aceite</CardTitle>
              <CardDescription className="text-xs mt-1">
                O aceite formal foi registado e a equipa de produção foi notificada para inicializar os preparativos do
                projecto.
              </CardDescription>
            </div>
          </Card>
        ) : (
          <Card className="p-6 shadow-xs gap-0">
            <CardHeader className="p-0 pb-4 flex flex-row items-center gap-2 space-y-0 text-primary">
              <ShieldCheck className="h-5 w-5" />
              <CardTitle className="text-base font-semibold text-foreground">Aceite Formal da Proposta</CardTitle>
            </CardHeader>
            <CardDescription className="text-xs text-muted-foreground mb-6">
              Ao confirmar, a proposta é formalmente aceite pelo cliente para adjudicação e alocação de equipa/equipamento.
            </CardDescription>

            <form onSubmit={handleAccept} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">Nome do Responsável *</label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Carlos Mendes"
                    className="bg-background border-border text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Email Corporativo *</label>
                  <Input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Ex: carlos@empresa.ao"
                    className="bg-background border-border text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Observações / NIF de Facturação (Opcional)</label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Facturar em nome da Empresa X, NIF 540000000"
                  className="bg-background border-border text-sm"
                />
              </div>

              <div className="pt-2">
                <ButtonSubmit
                  isLoading={isAccepting}
                  className="w-full shadow-xs font-semibold"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Aceitar Proposta Comercial
                </ButtonSubmit>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

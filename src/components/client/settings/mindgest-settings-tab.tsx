'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Badge,
  TitleList,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components';
import { useMindgestConfig, useConfigureMindgest } from '@/hooks/billing';
import {
  FileCheck,
  Building2,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { format } from 'date-fns';

export function MindgestSettingsTab() {
  const { data: config, isLoading } = useMindgestConfig();
  const { mutateAsync: configureMindgest, isPending } = useConfigureMindgest();

  const [accountId, setAccountId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');

  useEffect(() => {
    if (config) {
      if (config.mindgestAccountId) setAccountId(config.mindgestAccountId);
      if (config.mindgestCompanyId) setCompanyId(config.mindgestCompanyId);
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId.trim() || !companyId.trim() || !apiKey.trim()) {
      return;
    }
    await configureMindgest({
      mindgestAccountId: accountId.trim(),
      mindgestCompanyId: companyId.trim(),
      apiKey: apiKey.trim(),
      webhookSecret: webhookSecret.trim() || undefined,
    });
  };

  const isConnected = config?.connectionStatus === 'CONNECTED';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Integração Fiscal Mindgest (Software Certificado AGT)
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Conecte a sua conta Mindgest para emissão automática de Faturas, Recibos e Faturas-Recibo certificadas.
          </p>
        </div>

        <Badge
          variant="outline"
          className="text-xs px-2.5 py-1"
        >
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Conexão Ativa
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <XCircle className="h-3.5 w-3.5" /> Não Conectado
            </span>
          )}
        </Badge>
      </div>

      {/* Info Card */}
      <Card className="p-5 gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-muted text-primary rounded-xs shrink-0 mt-0.5">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-foreground">
              Como funciona o fluxo de facturação no Nora Audiovisual?
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              O Nora gere os seus orçamentos comerciais, projectos e reservas. Assim que um cliente aprovar a proposta e o pagamento for registado, o Nora solicita ao <strong>Mindgest</strong> a geração da factura com assinatura criptográfica e hash SAF-T oficial da Administração Geral Tributária (AGT).
            </CardDescription>
          </div>
        </div>

        {config?.lastSyncAt && (
          <div className="text-xs text-muted-foreground pt-2 border-t border-border flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Última sincronização bem-sucedida:</span>
            <span className="font-mono text-foreground">
              {format(new Date(config.lastSyncAt), 'dd/MM/yyyy HH:mm:ss')}
            </span>
          </div>
        )}
      </Card>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-0 gap-0 shadow-xs">
          <CardHeader className="p-6 pb-4 border-b border-border">
            <CardTitle className="text-sm font-semibold text-foreground">Credenciais da API do Mindgest</CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Mindgest Account ID
                </label>
                <Input
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="Ex: acc_01j7xyz..."
                  className="text-xs"
                  required
                />
                <p className="text-[11px] text-muted-foreground">ID da sua conta institucional no Mindgest.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Mindgest Company ID
                </label>
                <Input
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  placeholder="Ex: cmp_8213..."
                  className="text-xs"
                  required
                />
                <p className="text-[11px] text-muted-foreground">ID da empresa emissora fiscal (NIF registado).</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-primary" />
                Chave de API (Secret Key)
              </label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={config?.hasApiKey ? '•••••••••••••••••••••••• (Já configurada)' : 'mindgest_live_sk_...'}
                className="text-xs font-mono"
                required={!config?.hasApiKey}
              />
              <p className="text-[11px] text-muted-foreground">
                Gerada em <em>Mindgest &gt; Configurações &gt; Desenvolvedores &gt; Chaves de API</em>.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                Segredo do Webhook (Opcional)
              </label>
              <Input
                type="password"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder={config?.hasWebhookSecret ? '••••••••••••••••' : 'whsec_...'}
                className="text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Para validação segura de callbacks quando faturas forem impressas ou anuladas no Mindgest.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between p-6 pt-4 border-t border-border">
            <a
              href="https://mindgest.ao"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Aceder ao portal Mindgest <ExternalLink className="h-3 w-3" />
            </a>

            <Button
              type="submit"
              disabled={isPending || isLoading}
              className="text-xs gap-1.5 bg-primary text-primary-foreground"
            >
              {isPending ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> A testar conexão...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Guardar &amp; Testar Integração
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

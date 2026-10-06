'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Copy } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Input,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui';
import { authService } from '@/services/auth-service';
import { getApiErrorMessage } from '@/utils';

type Step = 'idle' | 'confirm' | 'recovery' | 'disable';

export function MfaSettingsCard() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('idle');
  const [setup, setSetup] = useState<{ secret: string; otpauthUri: string } | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const status = useQuery({ queryKey: ['mfa-status'], queryFn: authService.getMfaStatus });
  const enabled = status.data?.enabled ?? false;

  const reset = () => {
    setStep('idle');
    setSetup(null);
    setCode('');
    setPassword('');
  };

  const startSetup = useMutation({
    mutationFn: authService.setupMfa,
    onSuccess: (data) => {
      setSetup(data);
      setStep('confirm');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Não foi possível iniciar a configuração do MFA.')),
  });

  const confirm = useMutation({
    mutationFn: () => authService.enableMfa(code),
    onSuccess: (data) => {
      setRecoveryCodes(data.recoveryCodes);
      setStep('recovery');
      setSetup(null);
      setCode('');
      queryClient.invalidateQueries({ queryKey: ['mfa-status'] });
      toast.success('MFA activado com sucesso.');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Código inválido.')),
  });

  const disable = useMutation({
    mutationFn: () => authService.disableMfa({ password, code }),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['mfa-status'] });
      toast.success('MFA desactivado.');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Não foi possível desactivar o MFA.')),
  });

  return (
    <Card className="p-0 gap-0">
      <CardHeader className="p-6 pb-4 border-b border-border flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold text-foreground">Autenticação de Dois Fatores (MFA)</CardTitle>
        </div>
        <Badge variant={enabled ? 'default' : 'outline'}>{enabled ? 'Activo' : 'Opcional'}</Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <CardDescription className="text-xs leading-relaxed">
          Exige um código da aplicação autenticadora (Google Authenticator, Authy, 1Password…) ao iniciar sessão.
        </CardDescription>

        {step === 'idle' && !enabled && (
          <Button variant="outline" onClick={() => startSetup.mutate()} disabled={startSetup.isPending || status.isLoading}>
            {startSetup.isPending ? 'A preparar...' : 'Configurar MFA'}
          </Button>
        )}

        {step === 'idle' && enabled && (
          <Button variant="outline" onClick={() => setStep('disable')}>
            Desactivar MFA
          </Button>
        )}

        {step === 'confirm' && setup && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="rounded-lg border border-border bg-white p-3">
                <QRCodeSVG value={setup.otpauthUri} size={160} />
              </div>
              <div className="space-y-2 text-xs">
                <p>1. Leia o QR code na aplicação autenticadora.</p>
                <p>2. Ou introduza esta chave manualmente:</p>
                <div className="flex items-center gap-2">
                  <code className="rounded bg-muted px-2 py-1 font-mono text-[11px] break-all">{setup.secret}</code>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => navigator.clipboard?.writeText(setup.secret)}
                    aria-label="Copiar chave"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p>3. Escreva abaixo o código de 6 dígitos para confirmar.</p>
              </div>
            </div>
            <div className="flex gap-2 max-w-xs">
              <Input
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                autoComplete="one-time-code"
              />
              <Button onClick={() => confirm.mutate()} disabled={code.length !== 6 || confirm.isPending}>
                Confirmar
              </Button>
              <Button variant="ghost" onClick={reset}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {step === 'recovery' && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-foreground">
              Guarde estes códigos de recuperação num local seguro. Cada um só pode ser usado uma vez e não voltarão a ser mostrados.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {recoveryCodes.map((c) => (
                <code key={c} className="rounded bg-muted px-2 py-1 text-center font-mono text-xs">
                  {c}
                </code>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigator.clipboard?.writeText(recoveryCodes.join('\n'))}>
                Copiar códigos
              </Button>
              <Button
                onClick={() => {
                  setRecoveryCodes([]);
                  setStep('idle');
                }}
              >
                Já guardei os códigos
              </Button>
            </div>
          </div>
        )}

        {step === 'disable' && (
          <div className="space-y-3 max-w-md">
            <p className="text-xs text-muted-foreground">
              Para desactivar, confirme a palavra-passe e um código MFA (ou um código de recuperação).
            </p>
            <Input type="password" placeholder="Palavra-passe" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <Input placeholder="Código MFA ou de recuperação" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="one-time-code" />
            <div className="flex gap-2">
              <Button variant="destructive" onClick={() => disable.mutate()} disabled={!password || code.length < 6 || disable.isPending}>
                Desactivar
              </Button>
              <Button variant="ghost" onClick={reset}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

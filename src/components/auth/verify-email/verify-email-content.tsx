'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { Button } from '@/components';
import { CheckCircle2, AlertCircle, Loader2, MailCheck, ArrowRight } from 'lucide-react';
import { ErrorMessage, SucessMessage } from '@/utils/messages';
import { parseApiError } from '@/lib/api-error';

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>(
    token ? 'verifying' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const [resendEmail, setResendEmail] = useState('');

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    async function verify() {
      try {
        await api.post('/auth/verify-email', { token });
        if (isMounted) {
          setStatus('success');
          SucessMessage('Email verificado com sucesso!');
        }
      } catch (err) {
        if (isMounted) {
          const parsed = parseApiError(err);
          setStatus('error');
          setErrorMessage(parsed.message || 'O link de verificação é inválido ou expirou.');
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) {
      ErrorMessage('Por favor insira o seu email profissional.');
      return;
    }

    try {
      setIsResending(true);
      await api.post('/auth/resend-verification', { email: resendEmail });
      SucessMessage('Novo link de verificação enviado! Verifique a sua caixa de correio.');
    } catch (err) {
      const parsed = parseApiError(err);
      ErrorMessage(parsed.message || 'Erro ao reenviar verificação.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto my-auto flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
          {status === 'verifying' && <Loader2 className="h-7 w-7 animate-spin text-primary" />}
          {status === 'success' && <CheckCircle2 className="h-7 w-7 text-emerald-500" />}
          {status === 'error' && <AlertCircle className="h-7 w-7 text-destructive" />}
          {status === 'idle' && <MailCheck className="h-7 w-7 text-primary" />}
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {status === 'verifying' && 'A validar o seu email...'}
            {status === 'success' && 'Email Verificado!'}
            {status === 'error' && 'Link Inválido ou Expirado'}
            {status === 'idle' && 'Verificação de Email'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {status === 'verifying' && 'Por favor aguarde um instante enquanto autenticamos o seu endereço.'}
            {status === 'success' && 'A sua conta encontra-se agora totalmente ativada na plataforma.'}
            {status === 'error' && (errorMessage || 'Não foi possível confirmar o email com este token.')}
            {status === 'idle' && 'Insira o seu email para reenviar um novo link de ativação.'}
          </p>
        </div>
      </div>

      {status === 'success' && (
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => router.push('/projects')}
            className="w-full bg-primary text-primary-foreground font-semibold rounded-xl h-11"
          >
            Aceder ao Painel <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {(status === 'error' || status === 'idle') && (
        <form onSubmit={handleResend} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Email da Conta</label>
            <input
              type="email"
              placeholder="admin@produtora.ao"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isResending}
            className="w-full bg-primary text-primary-foreground font-semibold rounded-xl h-11"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> A reenviar...
              </>
            ) : (
              'Reenviar Link de Verificação'
            )}
          </Button>

          <div className="text-center pt-2">
            <Link href="/auth/login" className="text-xs text-muted-foreground hover:text-foreground">
              Voltar ao Início de Sessão
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

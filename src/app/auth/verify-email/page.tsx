import { Suspense } from 'react';
import Link from 'next/link';
import { Clapperboard, CheckCircle, ShieldCheck } from 'lucide-react';
import { HeroImageSide } from '@/components/auth/_components';
import { ThemeToggle } from '@/components/theme-toggle';
import { VerifyEmailContent } from '@/components/auth/verify-email/verify-email-content';

export const metadata = {
  title: 'Verificar Email | Nora Audiovisual',
  description: 'Confirmação e ativação de endereço de email na plataforma Nora Audiovisual.',
};

export default function VerifyEmailPage() {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Coluna Esquerda: Verificação */}
      <div className="flex flex-col justify-between bg-background px-6 py-8 sm:px-12 sm:py-12 lg:px-16 lg:py-16">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <Clapperboard className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Nora <span className="text-primary">Audiovisual</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Validação de Identidade</span>
          </div>
        </div>

        <Suspense fallback={<div className="text-center text-sm text-muted-foreground">A carregar verificação...</div>}>
          <VerifyEmailContent />
        </Suspense>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-6">
          <span>&copy; {new Date().getFullYear()} Nora Audiovisual & Estúdios Lda.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">Termos</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link>
          </div>
        </div>
      </div>

      {/* Coluna Direita: Imagem de Hero */}
      <HeroImageSide
        source="/auth-cinema-production.jpg"
        title="Garantia de segurança e autenticidade para a sua produtora."
        subtitle="A validação de email assegura a integridade das comunicações contratuais, orçamentos assinados e notificações críticas de estúdio."
        badge="NORA AUDIOVISUAL — IDENTIDADE"
        features={[
          {
            icon: <CheckCircle className="h-4 w-4 text-primary shrink-0" />,
            label: "Canal Verificado de Notificações",
          },
          {
            icon: <ShieldCheck className="h-4 w-4 text-primary shrink-0" />,
            label: "Conformidade e Proteção de Dados",
          },
        ]}
      />
    </div>
  );
}

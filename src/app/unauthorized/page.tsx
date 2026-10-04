'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/common/brand-logo';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, Home, Building2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/auth';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-12 relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.06),rgba(0,0,0,0))] pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-6 relative z-10">
        {/* Brand Logo Oficial */}
        <div className="flex justify-center mb-2">
          <BrandLogo variant="symbol" size="lg" priority />
        </div>

        {/* Emblema de Segurança */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/10 text-xs font-semibold uppercase tracking-wider text-red-500">
          <ShieldAlert className="size-3.5" />
          Acesso Restrito • Governança RBAC
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Permissões Insuficientes
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O seu perfil ativo ({user?.role || 'Membro'}) ou o plano atual da produtora não possui privilégios de acesso a esta área restrita da plataforma.
          </p>
        </div>

        {/* Ações Claras */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            asChild
            className="w-full sm:w-auto font-medium gap-2 shadow-xs"
          >
            <Link href="/dashboard">
              <Home className="size-4" />
              Painel Principal
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto font-medium gap-2 border-border"
          >
            <ArrowLeft className="size-4" />
            Voltar Atrás
          </Button>
        </div>

        <div className="pt-6 border-t border-border/50 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <Link
            href="/settings?tab=profile"
            className="hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <Building2 className="size-3.5" />
            Alternar Produtora
          </Link>
          <span>•</span>
          <Link
            href="/subscriptions"
            className="hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            Planos &amp; Upgrades
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/common/brand-logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Compass } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-12 relative overflow-hidden select-none">
      {/* Elemento de fundo geométrico sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.08),rgba(0,0,0,0))] pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-6 relative z-10">
        {/* Brand Logo Oficial */}
        <div className="flex justify-center mb-2">
          <BrandLogo variant="symbol" size="lg" priority />
        </div>

        {/* 404 Visual badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Compass className="size-3.5 text-primary" />
          Erro 404 • Não Encontrado
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Página Inexistente
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O endereço que tentou aceder não existe, foi movido ou já não se encontra disponível na plataforma Nora Audiovisual.
          </p>
        </div>

        {/* Ações Rápidas */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            asChild
            className="w-full sm:w-auto font-medium gap-2 shadow-xs"
          >
            <Link href="/dashboard">
              <Home className="size-4" />
              Ir para o Dashboard
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto font-medium gap-2 border-border"
          >
            <ArrowLeft className="size-4" />
            Voltar à Página Anterior
          </Button>
        </div>

        <div className="pt-8 border-t border-border/50 text-[11px] text-muted-foreground font-mono">
          Nora Audiovisual Studio • Sistema Operacional Criativo
        </div>
      </div>
    </div>
  );
}

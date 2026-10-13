'use client';

import { Button, Badge } from '@/components';
import { Globe, Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface ServicesBannerProps {
  orgSlug: string;
}

export function ServicesCatalogBanner({ orgSlug }: ServicesBannerProps) {
  const handleCopyPublicLink = () => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}/catalog/${orgSlug}`;
      navigator.clipboard.writeText(fullUrl);
      toast.success('Link do catálogo público copiado com sucesso!');
    }
  };

  return (
    <div data-tour="services-banner" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xs border border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xs bg-primary/10 text-primary shrink-0">
          <Globe className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              Catálogo Público da Produtora
            </span>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold rounded-xs">
              Página Pública Dedicada
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            A sua organização possui um link público próprio para partilhar com clientes e divulgar pacotes comerciais.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyPublicLink}
          className="text-xs gap-1.5 h-8 border-border rounded-xs"
        >
          <Copy className="h-3.5 w-3.5" />
          Copiar Link
        </Button>
        <Button
          asChild
          size="sm"
          className="text-xs gap-1.5 h-8 bg-primary text-primary-foreground rounded-xs"
        >
          <Link href={`/catalog/${orgSlug}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            Ver Página Pública
          </Link>
        </Button>
      </div>
    </div>
  );
}

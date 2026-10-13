'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Compass } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useOnboardingChecklist } from '@/hooks/onboarding/use-onboarding-checklist';
import { useOnboardingTour } from '@/hooks/onboarding/use-onboarding-tour';
import type { OnboardingChecklistItem } from '@/services/onboarding-service';

function withTour(href: string, tourId?: string) {
  if (!tourId) return href;
  return `${href}${href.includes('?') ? '&' : '?'}tour=${tourId}`;
}

/**
 * Lista de "Primeiros passos" para quem gere a produtora. Os itens concluem-se sozinhos
 * quando o resultado existe; cada um abre a página certa e arranca o seu guia.
 * Desaparece quando o essencial está feito.
 */
export function GettingStartedCard() {
  const router = useRouter();
  const { data } = useOnboardingChecklist();
  const { startTour, canAccessTour } = useOnboardingTour('setup');

  if (!data) return null;

  const required = data.items.filter((item) => !item.optional);
  const requiredDone = required.filter((item) => item.done).length;
  if (requiredDone === required.length) return null;

  const percent = Math.round((requiredDone / required.length) * 100);
  const nextId = required.find((item) => !item.done)?.id;

  return (
    <Card className="gap-0 p-4" data-tour="dashboard-checklist">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Compass className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold leading-tight">Primeiros passos</h2>
            <p className="text-xs text-muted-foreground">
              {requiredDone} de {required.length} concluídos — a produtora fica pronta a receber pedidos.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={percent} className="h-1.5 w-28" />
          {canAccessTour && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => void startTour('normal')}
            >
              Ver guia geral
            </Button>
          )}
        </div>
      </div>

      <ul className="grid gap-1.5 md:grid-cols-2">
        {data.items.map((item: OnboardingChecklistItem) => (
          <li
            key={item.id}
            className={cn(
              'flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors',
              item.done ? 'border-border/60 bg-muted/30' : 'border-border bg-card',
              item.id === nextId && 'border-primary/50 ring-1 ring-primary/20',
            )}
          >
            <span
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-full border',
                item.done
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-muted-foreground/40',
              )}
              aria-hidden
            >
              {item.done && <Check className="size-3" />}
            </span>

            <Link
              href={withTour(item.href, item.done ? undefined : item.tourId)}
              className="min-w-0 flex-1"
            >
              <span
                className={cn(
                  'block truncate text-sm font-medium',
                  item.done && 'text-muted-foreground line-through',
                )}
              >
                {item.title}
                {item.optional && (
                  <span className="ml-1.5 text-[10px] font-normal uppercase text-muted-foreground">
                    opcional
                  </span>
                )}
              </span>
              {!item.done && (
                <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
              )}
            </Link>

            {!item.done && (
              <Button
                type="button"
                variant={item.id === nextId ? 'default' : 'ghost'}
                size="sm"
                className="h-7 shrink-0 gap-1 px-2 text-xs"
                onClick={() => router.push(withTour(item.href, item.tourId))}
              >
                {item.tourId ? 'Começar' : 'Abrir'}
                <ChevronRight className="size-3" />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

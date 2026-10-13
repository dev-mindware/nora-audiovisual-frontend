'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Permite que atalhos (dashboard, notificações) abram diretamente um formulário: `/finance?new=payment`.
 * Executa a ação correspondente uma única vez e limpa o parâmetro do URL, para um refresh não reabrir o modal.
 */
export function useOpenFromQuery(param: string, actions: Record<string, () => void>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const handled = useRef<string | null>(null);

  const value = searchParams.get(param);

  useEffect(() => {
    if (!value || handled.current === value) return;
    const action = actions[value];
    if (!action) return;

    handled.current = value;
    action();

    const next = new URLSearchParams(searchParams.toString());
    next.delete(param);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
}

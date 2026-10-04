'use client';

import { usePathname } from 'next/navigation';
import { RouteProtector } from '@/contexts';
import { PortalNavbar } from '@/components/portal/portal-navbar';
import { SidebarInset } from '@/components/ui/sidebar';
import { Role } from '@/types';
import Link from 'next/link';
import { ShieldCheck, Building2 } from 'lucide-react';
import { useTenantStore } from '@/stores/tenant';

const ALLOWED_PORTAL_ROLES: Role[] = [
  'CLIENT',
  'OWNER',
  'ADMIN',
  'MANAGER',
  'PRODUCER',
  'EDITOR',
  'CREW',
  'FINANCE',
  'MEMBER',
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeOrganization } = useTenantStore();

  // Links públicos assinados por token (/portal/deliverables/view/... ou /portal/budgets/view/...)
  const isPublicTokenView = pathname.includes('/view/');

  if (isPublicTokenView) {
    return <>{children}</>;
  }

  return (
    <RouteProtector allowed={ALLOWED_PORTAL_ROLES} checkPlan={false}>
      <SidebarInset className="bg-background flex flex-1 flex-col min-w-0 w-full min-h-screen">
        <PortalNavbar />

        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>

        <footer className="w-full border-t border-border bg-card/20 py-4 text-xs text-muted-foreground mt-auto">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <div className="flex items-center gap-2 font-mono">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Ambiente Seguro & Auditado — Nora Audiovisual Produções</span>
              </div>

              {activeOrganization && (
                <div className="flex items-center gap-2 px-2.5 py-1 text-xs text-muted-foreground border border-border/60 bg-muted/20 rounded-none font-mono">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate max-w-[200px]">{activeOrganization.name}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1">
              <Link href="/terms" className="hover:text-foreground transition-colors">Termos de Revisão</Link>
              <span className="text-border">|</span>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link>
              <span className="text-border">|</span>
              <span>&copy; {new Date().getFullYear()} Todos os direitos reservados</span>
            </div>
          </div>
        </footer>
      </SidebarInset>
    </RouteProtector>
  );
}

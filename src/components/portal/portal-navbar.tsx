'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Clapperboard, Video, FileSpreadsheet, LayoutDashboard, LogOut, Building2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components';
import { useAuthStore } from '@/stores';
import { useTenantStore } from '@/stores/tenant';

export function PortalNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { clearTenant } = useTenantStore();

  const handleLogout = async () => {
    try {
      clearTenant();
      await logout();
    } catch {
      router.replace('/auth/login');
    }
  };

  const navLinks = [
    {
      name: 'Visão Geral',
      shortName: 'Geral',
      href: '/portal',
      icon: LayoutDashboard,
      active: pathname === '/portal',
    },
    {
      name: 'Agenda do Estúdio',
      shortName: 'Estúdio',
      href: '/portal/studio',
      icon: Building2,
      active: pathname.startsWith('/portal/studio'),
    },
    {
      name: 'Entregáveis & Copiões',
      shortName: 'Entregáveis',
      href: '/portal/deliverables',
      icon: Video,
      active: pathname.startsWith('/portal/deliverables'),
    },
    {
      name: 'Propostas Comerciais',
      shortName: 'Propostas',
      href: '/portal/budgets',
      icon: FileSpreadsheet,
      active: pathname.startsWith('/portal/budgets'),
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/portal" className="flex items-center gap-3 group">
              <BrandLogo variant="symbol" size="sm" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  NORA <span className="text-primary font-normal">AUDIOVISUAL</span>
                </span>
                <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-mono">
                  Portal do Cliente
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Tabs - Mindware Clean Style */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-none border transition-all ${link.active
                      ? 'border-primary/50 bg-primary/10 text-primary font-semibold shadow-xs'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side: User & Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="hidden sm:flex flex-col text-right border-l border-border pl-3">
              <span className="text-xs font-semibold text-foreground truncate max-w-[150px]">
                {user?.name || 'Cliente'}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {user?.role === 'CLIENT' ? 'Cliente Revisor' : user?.role || 'Acesso Portal'}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="rounded-none border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-xs px-2.5 h-8 gap-1.5"
              title="Terminar Sessão"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around border-t border-border py-2 gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 min-h-[38px] text-xs rounded-none border transition-colors ${link.active
                    ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="sm:hidden">{link.shortName}</span>
                <span className="hidden sm:inline">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

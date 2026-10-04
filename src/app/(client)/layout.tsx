'use client';

import { AppSidebar } from '@/components/templates/global-sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { BreadcrumbProvider } from '@/components/ui/breadcrumb-context';
import { RouteProtector } from '@/contexts';
import { NotificationDetail } from '@/components/shared/notifications';
import { TrialBanner } from '@/components/shared/trial-banner';
import { Role } from '@/types';

const ALLOWED_ROLES: Role[] = ['OWNER', 'ADMIN', 'MANAGER', 'PRODUCER', 'FINANCE', 'CREW', 'CLIENT', 'MEMBER'];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteProtector allowed={ALLOWED_ROLES} checkPlan={false}>
      <AppSidebar />
      <SidebarInset className="bg-background flex flex-1 flex-col min-w-0">
        <TrialBanner />
        <BreadcrumbProvider>
          {children}
        </BreadcrumbProvider>
      </SidebarInset>
      <NotificationDetail />
    </RouteProtector>
  );
}

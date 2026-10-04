'use client';

import { RouteProtector } from '@/contexts';
import { Role } from '@/types';

const ADMIN_ALLOWED_ROLES: Role[] = ['ADMIN'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteProtector allowed={ADMIN_ALLOWED_ROLES} checkPlan={false}>
      {children}
    </RouteProtector>
  );
}

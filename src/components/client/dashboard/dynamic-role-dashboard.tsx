'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/auth/use-auth';
import { DashboardLayoutSkeleton } from './skeletons/dashboard-layout-skeleton';

const OwnerDashboardView = dynamic(
  () => import('./roles/owner-dashboard-view').then((m) => m.OwnerDashboardView),
  { loading: () => <DashboardLayoutSkeleton /> }
);
const ManagerDashboardView = dynamic(
  () => import('./roles/manager-dashboard-view').then((m) => m.ManagerDashboardView),
  { loading: () => <DashboardLayoutSkeleton /> }
);
const ProducerDashboardView = dynamic(
  () => import('./roles/producer-dashboard-view').then((m) => m.ProducerDashboardView),
  { loading: () => <DashboardLayoutSkeleton /> }
);
const FinanceDashboardView = dynamic(
  () => import('./roles/finance-dashboard-view').then((m) => m.FinanceDashboardView),
  { loading: () => <DashboardLayoutSkeleton /> }
);
const EditorDashboardView = dynamic(
  () => import('./roles/editor-dashboard-view').then((m) => m.EditorDashboardView),
  { loading: () => <DashboardLayoutSkeleton /> }
);
const CrewDashboardView = dynamic(
  () => import('./roles/crew-dashboard-view').then((m) => m.CrewDashboardView),
  { loading: () => <DashboardLayoutSkeleton /> }
);
const AdminDashboardView = dynamic(
  () => import('./roles/admin-dashboard-view').then((m) => m.AdminDashboardView),
  { loading: () => <DashboardLayoutSkeleton /> }
);

export function DynamicRoleDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const role = (user?.role || 'OWNER').toUpperCase();

  useEffect(() => {
    if (role === 'CLIENT') {
      router.replace('/portal');
    }
  }, [role, router]);

  if (role === 'CLIENT') {
    return <DashboardLayoutSkeleton />;
  }

  switch (role) {
    case 'OWNER':
      return <OwnerDashboardView />;
    case 'MANAGER':
      return <ManagerDashboardView />;
    case 'PRODUCER':
      return <ProducerDashboardView />;
    case 'FINANCE':
      return <FinanceDashboardView />;
    case 'EDITOR':
      return <EditorDashboardView />;
    case 'CREW':
    case 'MEMBER':
      return <CrewDashboardView />;
    case 'ADMIN':
      return <AdminDashboardView />;
    default:
      return <ProducerDashboardView />;
  }
}

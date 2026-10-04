import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  role?: string;
}

interface TenantState {
  activeOrganization: Organization | null;
  organizations: Organization[];
  setActiveOrganization: (org: Organization | null) => void;
  setOrganizations: (orgs: Organization[]) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      activeOrganization: null,
      organizations: [],
      setActiveOrganization: (org) => set({ activeOrganization: org }),
      setOrganizations: (orgs) => set({ organizations: orgs }),
      clearTenant: () => set({ activeOrganization: null, organizations: [] }),
    }),
    {
      name: 'nora-tenant-storage',
    }
  )
);

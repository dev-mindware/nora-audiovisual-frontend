import { Company, Store } from "./company";
import type { Subscription } from "./subscription";

export type Role = 'ADMIN' | 'OWNER' | 'MANAGER' | 'PRODUCER' | 'FINANCE' | 'EDITOR' | 'CREW' | 'CLIENT' | 'MEMBER' | 'CASHIER';

export interface NoraOrganization {
  id: string;
  name: string;
  legalName?: string | null;
  slug?: string | null;
  taxId?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NoraMembership {
  organizationId: string;
  organizationName?: string;
  roleId?: string;
  status: string;
}

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  status?: string;
  isPlatformAdmin?: boolean;
  activeOrganization?: NoraOrganization | null;
  memberships?: NoraMembership[];
  phone?: string;
  barcode?: string | null;
  company?: Company;
  store?: Store;
  subscription?: Subscription;
};

export interface LoginResponse {
  message?: string;
  data: {
    user: User;
    role?: { id: string; code: string; name: string } | null;
    activeOrganization: NoraOrganization | null;
    organizations?: NoraMembership[];
    memberships: NoraMembership[];
  };
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
}

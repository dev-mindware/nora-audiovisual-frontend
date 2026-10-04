export interface Subscription {
  id: string;
  organizationId?: string;
  status: SubscriptionStatus;
  trialEndsAt?: string | null;
  periodStartsAt?: string | null;
  periodEndsAt?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  canceledAt?: string | null;
  cancelAtPeriodEnd?: boolean;
  createdAt?: string;
  updatedAt?: string;
  billingInterval: string;
  paymentProvider?: string;
  providerClientId?: string;
  providerSubscriptionId?: string;
  billingPeriodInMonths?: string | null;
  proofUrl?: string | null;
  referenceNumber?: string | null;
  plan: Plan;
  entitlements?: SubscriptionEntitlements;
}

export type PlanType = "INICIAL" | "PROFISSIONAL" | "BUSINESS" | "Base" | "Smart" | "Pro";

export const PLAN_HIERARCHY: Record<PlanType, number> = {
  INICIAL: 0,
  PROFISSIONAL: 1,
  BUSINESS: 2,
  Base: 0,
  Smart: 1,
  Pro: 2,
};

export enum SubscriptionStatus {
  TRIALING = "TRIALING",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELED = "CANCELED",
  EXPIRED = "EXPIRED",
  PENDING = "PENDING",
  SUSPENDED = "SUSPENDED",
}

export interface Plan {
  id: string;
  code?: string;
  name: PlanType | string;
  priceMonthly: string;
  priceAnnual?: string | number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  order: number;
  maxUsers: number;
  maxStores?: number;
  maxProjects?: number;
  maxEquipment?: number;
  maxStorageGb?: number;
  includedAiCredits?: number;
  trialPeriodInDays?: number;
  features: Features;
}

export interface Features {
  hasPos: boolean;
  canExportSaft: boolean;
  hasStock: boolean;
  hasInvoices: boolean;
  hasReporting: boolean;
  hasSuppliers: boolean;
  hasAppearance?: boolean;
  hasPrintFormats?: boolean;
  hasClientPortal?: boolean;
  hasStudioBooking?: boolean;
  hasFrameReview?: boolean;
  hasAutomations?: boolean;
  hasAdvancedReports?: boolean;
  hasCallSheets?: boolean;
  hasAiAssistant?: boolean;
}

export interface SubscriptionEntitlements {
  maxProjects?: number;
  maxEquipment?: number;
  storageGb?: number;
  aiCredits?: number;
  usedProjects?: number;
  usedEquipment?: number;
  usedStorageGb?: number;
  usedAiCredits?: number;
}

export interface CheckoutPayload {
  planCode: string;
  billingInterval: "MONTHLY" | "SEMIANNUAL" | "ANNUAL";
  paymentMethod: "BANK_TRANSFER" | "MULTICAIXA_EXPRESS" | "UNITEL_MONEY";
  proofFileUrl: string;
  referenceNumber?: string;
  notes?: string;
  couponCode?: string;
  addOns?: Array<{ code: string; quantity: number }>;
}

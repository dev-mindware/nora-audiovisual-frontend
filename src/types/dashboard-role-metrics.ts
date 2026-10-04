export type DashboardRange =
  | 'today'
  | 'last_7_days'
  | 'last_30_days'
  | 'month'
  | 'quarter'
  | 'year'
  | 'custom';

export interface DashboardFilterParams {
  range?: DashboardRange;
  from?: string;
  to?: string;
  studioId?: string;
  role?: string;
}

export interface DashboardKpiItem {
  value: number | string;
  label: string;
  format?: 'currency' | 'percentage' | 'number';
  change?: number;
  description?: string;
}

export interface DashboardEvolutionPoint {
  label: string;
  revenue?: number;
  expenses?: number;
  profit?: number;
  projectsActive?: number;
  sets?: number;
  occupancy?: number;
  versions?: number;
  gearUsage?: number;
  [key: string]: string | number | undefined;
}

export interface DashboardDistributionSlice {
  label: string;
  value: number;
  color?: string;
}

export interface DashboardCapacityItem {
  label: string;
  value: number;
}

export interface DashboardUrgentItem {
  id: string;
  title: string;
  subtitle?: string;
  status: string;
  date?: string;
  type?: 'project' | 'budget' | 'shoot' | 'payment' | 'deliverable' | 'gear';
}

export interface DashboardQuickAction {
  label: string;
  href: string;
  icon: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

export interface RoleDashboardData {
  role: string;
  period: {
    range: DashboardRange;
    from: string;
    to: string;
  };
  kpis: Record<string, DashboardKpiItem>;
  charts: {
    primaryEvolution: DashboardEvolutionPoint[];
    distribution: DashboardDistributionSlice[];
    capacityOrWorkload?: DashboardCapacityItem[];
  };
  urgentItems: DashboardUrgentItem[];
  quickActions: DashboardQuickAction[];
  generatedAt: string;
}

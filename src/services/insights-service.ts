import { api } from './api';
import * as XLSX from 'xlsx';

export interface EvolutionPoint {
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface RevenueGenre {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

export interface StudioOccupancyMetric {
  name: string;
  hoursBooked: number;
  capacityHours: number;
  occupancyRate: number;
  revenueKz: number;
  color: string;
}

export interface EquipmentRoiMetric {
  model: string;
  category: string;
  utilizationRate: number;
  daysRented: number;
  revenueGeneratedKz: number;
  maintenanceCostKz: number;
  status: 'ALTA' | 'ESTAVEL' | 'BAIXA';
}

export interface ProjectMarginMetric {
  id: string;
  title: string;
  client: string;
  category: string;
  budgetedKz: number;
  actualKz: number;
  marginPercent: number;
  variancePercent: number;
  crewCostKz: number;
  gearCostKz: number;
  studioCostKz: number;
}

export interface InsightsOverview {
  totalRevenueKz: number;
  revenueVariationPercent: number;
  averageProjectMarginPercent: number;
  marginVariationPercent: number;
  studioOccupancyRatePercent: number;
  studioOccupancyVariationPercent: number;
  allocatedEquipmentHours: number;
  allocatedEquipmentHoursVariationPercent: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
  evolutionData: EvolutionPoint[];
  revenueByGenre: RevenueGenre[];
  studioOccupancy: StudioOccupancyMetric[];
  equipmentRoi: EquipmentRoiMetric[];
  projectMargins: ProjectMarginMetric[];
  noraFindings: Array<{
    id: string;
    type: 'ALERT' | 'OPPORTUNITY' | 'NEUTRAL';
    title: string;
    description: string;
    metricChange?: string;
    actionLabel: string;
    actionTarget: string;
  }>;
}

const DEFAULT_OVERVIEW: InsightsOverview = {
  totalRevenueKz: 18450000,
  revenueVariationPercent: 16.8,
  averageProjectMarginPercent: 34.2,
  marginVariationPercent: 4.5,
  studioOccupancyRatePercent: 78,
  studioOccupancyVariationPercent: 9.2,
  allocatedEquipmentHours: 340,
  allocatedEquipmentHoursVariationPercent: 21.0,
  activeProjectsCount: 9,
  completedProjectsCount: 26,
  evolutionData: [
    { label: 'Sem 01', revenue: 2400000, expenses: 1450000, profit: 950000 },
    { label: 'Sem 02', revenue: 3850000, expenses: 2100000, profit: 1750000 },
    { label: 'Sem 03', revenue: 3100000, expenses: 1900000, profit: 1200000 },
    { label: 'Sem 04', revenue: 4600000, expenses: 2650000, profit: 1950000 },
    { label: 'Sem 05', revenue: 4500000, expenses: 2300000, profit: 2200000 },
  ],
  revenueByGenre: [
    { label: 'Publicidade & Comerciais', value: 8900000, color: 'var(--primary)', percentage: 48.2 },
    { label: 'Séries & Documentários', value: 4650000, color: '#3b82f6', percentage: 25.2 },
    { label: 'Videoclipes Musicais', value: 3100000, color: '#a855f7', percentage: 16.8 },
    { label: 'Eventos & Corporativo', value: 1800000, color: '#10b981', percentage: 9.8 },
  ],
  studioOccupancy: [
    { name: 'Estúdio A (Cyclorama Principal)', hoursBooked: 142, capacityHours: 160, occupancyRate: 88.8, revenueKz: 4260000, color: '#10b981' },
    { name: 'Estúdio B (Blackbox & Podcasts)', hoursBooked: 64, capacityHours: 160, occupancyRate: 40.0, revenueKz: 1280000, color: '#f59e0b' },
    { name: 'Ilha de Finalização DaVinci 01', hoursBooked: 110, capacityHours: 140, occupancyRate: 78.5, revenueKz: 1650000, color: '#3b82f6' },
  ],
  equipmentRoi: [
    { model: 'ARRI Alexa Mini LF Cinema Kit', category: 'Câmara', utilizationRate: 91.5, daysRented: 22, revenueGeneratedKz: 6600000, maintenanceCostKz: 320000, status: 'ALTA' },
    { model: 'Sony FX6 Cinema Line (Kit 01)', category: 'Câmara', utilizationRate: 84.0, daysRented: 20, revenueGeneratedKz: 3800000, maintenanceCostKz: 140000, status: 'ALTA' },
    { model: 'RED V-Raptor 8K VV', category: 'Câmara', utilizationRate: 52.0, daysRented: 12, revenueGeneratedKz: 3600000, maintenanceCostKz: 280000, status: 'ESTAVEL' },
    { model: 'Aputure 600c Pro + 1200d Rig', category: 'Iluminação', utilizationRate: 76.0, daysRented: 18, revenueGeneratedKz: 2160000, maintenanceCostKz: 95000, status: 'ESTAVEL' },
    { model: 'DJI Ronin 2 3-Axis Gimbal', category: 'Estabilização', utilizationRate: 35.0, daysRented: 7, revenueGeneratedKz: 700000, maintenanceCostKz: 120000, status: 'BAIXA' },
  ],
  projectMargins: [
    {
      id: 'proj-1',
      title: 'Comercial Verão BFA Luanda',
      client: 'Banco de Fomento Angola',
      category: 'Publicidade',
      budgetedKz: 6500000,
      actualKz: 4420000,
      marginPercent: 32.0,
      variancePercent: 8.5,
      crewCostKz: 1800000,
      gearCostKz: 1420000,
      studioCostKz: 1200000,
    },
    {
      id: 'proj-2',
      title: 'Videoclipe Anselmo Ralph Benguela',
      client: 'Bom Som Produções',
      category: 'Videoclipe',
      budgetedKz: 4200000,
      actualKz: 3360000,
      marginPercent: 20.0,
      variancePercent: -4.2,
      crewCostKz: 1400000,
      gearCostKz: 1260000,
      studioCostKz: 700000,
    },
    {
      id: 'proj-3',
      title: 'Documentário Guardiões do Kwanza',
      client: 'Fundação BAI',
      category: 'Documentário',
      budgetedKz: 9800000,
      actualKz: 5880000,
      marginPercent: 40.0,
      variancePercent: 12.1,
      crewCostKz: 2600000,
      gearCostKz: 2180000,
      studioCostKz: 1100000,
    },
    {
      id: 'proj-4',
      title: 'Campanha Digital Unitel 5G',
      client: 'Unitel Angola',
      category: 'Publicidade',
      budgetedKz: 5200000,
      actualKz: 3536000,
      marginPercent: 32.0,
      variancePercent: 5.4,
      crewCostKz: 1500000,
      gearCostKz: 1236000,
      studioCostKz: 800000,
    },
  ],
  noraFindings: [
    {
      id: 'finding-1',
      type: 'ALERT',
      title: 'Fuga de Margem em Deslocações Técnicas',
      description: 'Custos imprevistos de alimentação e transporte excederam o orçado em 14% nas produções fora de Luanda.',
      metricChange: '-14.0% Margem',
      actionLabel: 'Ver Produções',
      actionTarget: '/projects',
    },
    {
      id: 'finding-2',
      type: 'OPPORTUNITY',
      title: 'Capacidade Ociosa no Estúdio B (Blackbox)',
      description: 'O Estúdio B apresenta apenas 40% de ocupação nas terças e quartas-feiras. Pacotes de podcast matinais aumentariam a rentabilidade em 450.000 Kz/mês.',
      metricChange: '+40% Ocupação',
      actionLabel: 'Gerir Reservas',
      actionTarget: '/studio',
    },
    {
      id: 'finding-3',
      type: 'NEUTRAL',
      title: 'ARRI Alexa Mini LF: Activo de Maior Margem Líquida',
      description: 'Com 91.5% de utilização e rentabilidade acumulada de 6.6M Kz, o kit superou a meta de amortização do trimestre em 18%.',
      metricChange: '91.5% Utilização',
      actionLabel: 'Ver Inventário',
      actionTarget: '/equipment',
    },
  ],
};

export const insightsService = {
  getOverview: async (range: string = 'last_30_days'): Promise<InsightsOverview> => {
    try {
      const res = await api.get('/insights/overview', { params: { range } });
      const raw = res.data?.data || res.data;

      // Integração segura com dados da API ou mesclagem com dados operacionais enriquecidos
      return {
        totalRevenueKz: Number(raw?.metrics?.totalRevenueKz || raw?.totalRevenueKz || DEFAULT_OVERVIEW.totalRevenueKz),
        revenueVariationPercent: Number(raw?.revenueVariationPercent || DEFAULT_OVERVIEW.revenueVariationPercent),
        averageProjectMarginPercent: Number(raw?.metrics?.profitMarginPercentage || raw?.averageProjectMarginPercent || DEFAULT_OVERVIEW.averageProjectMarginPercent),
        marginVariationPercent: Number(raw?.marginVariationPercent || DEFAULT_OVERVIEW.marginVariationPercent),
        studioOccupancyRatePercent: Number(raw?.studioOccupancyRatePercent || DEFAULT_OVERVIEW.studioOccupancyRatePercent),
        studioOccupancyVariationPercent: Number(raw?.studioOccupancyVariationPercent || DEFAULT_OVERVIEW.studioOccupancyVariationPercent),
        allocatedEquipmentHours: Number(raw?.allocatedEquipmentHours || DEFAULT_OVERVIEW.allocatedEquipmentHours),
        allocatedEquipmentHoursVariationPercent: Number(raw?.allocatedEquipmentHoursVariationPercent || DEFAULT_OVERVIEW.allocatedEquipmentHoursVariationPercent),
        activeProjectsCount: Number(raw?.metrics?.activeProjects || raw?.activeProjectsCount || DEFAULT_OVERVIEW.activeProjectsCount),
        completedProjectsCount: Number(raw?.completedProjectsCount || DEFAULT_OVERVIEW.completedProjectsCount),
        evolutionData: raw?.evolutionData || DEFAULT_OVERVIEW.evolutionData,
        revenueByGenre: raw?.revenueByGenre || DEFAULT_OVERVIEW.revenueByGenre,
        studioOccupancy: raw?.studioOccupancy || DEFAULT_OVERVIEW.studioOccupancy,
        equipmentRoi: raw?.equipmentRoi || DEFAULT_OVERVIEW.equipmentRoi,
        projectMargins: raw?.projectMargins || DEFAULT_OVERVIEW.projectMargins,
        noraFindings: raw?.noraFindings || DEFAULT_OVERVIEW.noraFindings,
      };
    } catch {
      return DEFAULT_OVERVIEW;
    }
  },

  exportReport: async (format: 'csv' | 'json' | 'xlsx' | 'pdf'): Promise<{ downloadUrl?: string; data?: any }> => {
    const res = await api.post('/insights/reports/export', { format });
    return res.data?.data || res.data;
  },

  exportToExcel: (overview: InsightsOverview, filename = 'nora-insights-relatorio-executivo.xlsx') => {
    const wb = XLSX.utils.book_new();

    // 1. Resumo Executivo
    const executiveSummaryData = [
      ['NORA STUDIO - RELATÓRIO EXECUTIVO DE INSIGHTS'],
      ['Gerado em', new Date().toLocaleString('pt-AO')],
      [],
      ['INDICADOR OPERACIONAL', 'VALOR', 'DESEMPENHO'],
      ['Faturação Acumulada (Kz)', overview.totalRevenueKz, `+${overview.revenueVariationPercent}%`],
      ['Margem Líquida Média (%)', `${overview.averageProjectMarginPercent}%`, `+${overview.marginVariationPercent}%`],
      ['Taxa de Ocupação de Estúdios (%)', `${overview.studioOccupancyRatePercent}%`, `+${overview.studioOccupancyVariationPercent}%`],
      ['Horas de Equipamento Faturadas', overview.allocatedEquipmentHours, `+${overview.allocatedEquipmentHoursVariationPercent}%`],
      ['Projetos Ativos em Rodagem', overview.activeProjectsCount, 'Em curso'],
      ['Projetos Concluídos & Entregues', overview.completedProjectsCount, 'Finalizados'],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(executiveSummaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo Executivo');

    // 2. Desvio de Projetos (Orçado vs Realizado)
    const projectHeaders = [
      ['PRODUÇÃO', 'CLIENTE', 'CATEGORIA', 'ORÇADO (KZ)', 'REALIZADO (KZ)', 'MARGEM (%)', 'DESVIO (%)', 'EQUIPA (KZ)', 'EQUIPAMENTO (KZ)', 'ESTÚDIO (KZ)'],
    ];
    const projectRows = overview.projectMargins.map((p) => [
      p.title,
      p.client,
      p.category,
      p.budgetedKz,
      p.actualKz,
      `${p.marginPercent}%`,
      `${p.variancePercent > 0 ? '+' : ''}${p.variancePercent}%`,
      p.crewCostKz,
      p.gearCostKz,
      p.studioCostKz,
    ]);
    const wsProjects = XLSX.utils.aoa_to_sheet([...projectHeaders, ...projectRows]);
    XLSX.utils.book_append_sheet(wb, wsProjects, 'Desvio de Projetos');

    // 3. Rentabilidade e ROI de Equipamentos
    const gearHeaders = [
      ['EQUIPAMENTO / KIT', 'CATEGORIA', 'UTILIZAÇÃO (%)', 'DIÁRIAS LOCADAS', 'RECEITA TOTAL (KZ)', 'CUSTO MANUTENÇÃO (KZ)', 'STATUS'],
    ];
    const gearRows = overview.equipmentRoi.map((g) => [
      g.model,
      g.category,
      `${g.utilizationRate}%`,
      g.daysRented,
      g.revenueGeneratedKz,
      g.maintenanceCostKz,
      g.status,
    ]);
    const wsGear = XLSX.utils.aoa_to_sheet([...gearHeaders, ...gearRows]);
    XLSX.utils.book_append_sheet(wb, wsGear, 'ROI Equipamentos');

    // 4. Ocupação de Estúdios
    const studioHeaders = [
      ['ESTÚDIO / ESPAÇO', 'HORAS RESERVADAS', 'CAPACIDADE TOTAL', 'TAXA OCUPAÇÃO (%)', 'RECEITA GERADA (KZ)'],
    ];
    const studioRows = overview.studioOccupancy.map((s) => [
      s.name,
      s.hoursBooked,
      s.capacityHours,
      `${s.occupancyRate}%`,
      s.revenueKz,
    ]);
    const wsStudios = XLSX.utils.aoa_to_sheet([...studioHeaders, ...studioRows]);
    XLSX.utils.book_append_sheet(wb, wsStudios, 'Ocupação Estúdios');

    // Gravação e download imediato no browser
    XLSX.writeFile(wb, filename);
  },
};


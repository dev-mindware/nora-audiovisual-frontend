import { PlanType } from "@/types";

export type PlanBenefit = {
  icon: string;
  title: string;
  description: string;
};

export type PlanFeatureGroup = {
  features: string[];
};

export const mindMessageLimitByPlan: Record<PlanType, number> = {
  INICIAL: 100,
  PROFISSIONAL: 500,
  BUSINESS: 2000,
  Base: 100,
  Smart: 500,
  Pro: 2000,
};

export const includedInAllPlans: PlanBenefit[] = [
  {
    icon: "Clapperboard",
    title: "Gestão Operacional de Produções",
    description:
      "Acompanhamento de rodagens, call sheets, equipas e cronogramas em tempo real.",
  },
  {
    icon: "Camera",
    title: "Catálogo Técnico de Equipamentos",
    description:
      "Registo de câmaras, lentes, iluminação e deteção de conflitos de reserva.",
  },
  {
    icon: "FileSpreadsheet",
    title: "Orçamentação Audiovisual",
    description:
      "Elaboração de propostas comerciais e pipelines de custos de produção.",
  },
  {
    icon: "Sparkles",
    title: "Nora AI Audiovisual",
    description:
      "Assistente para decupagem de roteiros e ordens de rodagem inteligentes.",
  },
];

export const planFeatureMatrix: Record<string, PlanFeatureGroup> = {
  INICIAL: {
    features: [
      "Até 5 Projectos Activos em Simultâneo",
      "Até 50 Equipamentos no Catálogo",
      "50 GB de Armazenamento Cloud",
      "Call Sheets & Folhas de Rodagem Digitais",
      "Portal do Cliente com Visualização Básica",
      "100 Créditos Nora AI Mensais",
    ],
  },
  PROFISSIONAL: {
    features: [
      "Até 20 Projectos Activos em Simultâneo",
      "Até 200 Equipamentos com Deteção de Conflitos",
      "250 GB de Armazenamento Cloud",
      "Client Portal & Timecode Review Player",
      "Integração Fiscal Mindgest (Facturação AGT)",
      "Gestão de Sets & Calendário de Estúdio",
      "Relatórios Financeiros Avançados",
      "500 Créditos Nora AI Mensais",
    ],
  },
  BUSINESS: {
    features: [
      "Projectos e Equipamentos Ilimitados",
      "1 TB de Armazenamento Cloud de Alta Velocidade",
      "Multi-set & Gestão de Pós-Produção Completa",
      "Kanbans por Departamento (Câmara, Som, Luz, Arte)",
      "Automação de Facturação & Multi-utilizador Avançado",
      "Suporte Prioritário & SLA Dedicado",
      "2.000 Créditos Nora AI Mensais",
    ],
  },
  // Aliases de compatibilidade
  Base: {
    features: [
      "Até 5 Projectos Activos em Simultâneo",
      "Até 50 Equipamentos no Catálogo",
      "50 GB de Armazenamento Cloud",
      "Call Sheets & Folhas de Rodagem Digitais",
      "100 Créditos Nora AI Mensais",
    ],
  },
  Smart: {
    features: [
      "Até 20 Projectos Activos em Simultâneo",
      "Até 200 Equipamentos com Deteção de Conflitos",
      "250 GB de Armazenamento Cloud",
      "Client Portal & Timecode Review Player",
      "Integração Fiscal Mindgest (Facturação AGT)",
      "500 Créditos Nora AI Mensais",
    ],
  },
  Pro: {
    features: [
      "Projectos e Equipamentos Ilimitados",
      "1 TB de Armazenamento Cloud",
      "Gestão de Estúdios e Sets Avançada",
      "Integração Fiscal Mindgest e Automações",
      "2.000 Créditos Nora AI Mensais",
    ],
  },
};

export function getPlanFeatureGroups(planType: PlanType | string): PlanFeatureGroup {
  if (planType === "INICIAL" || planType === "Base") {
    return planFeatureMatrix.INICIAL;
  }
  if (planType === "PROFISSIONAL" || planType === "Smart") {
    return planFeatureMatrix.PROFISSIONAL;
  }
  if (planType === "BUSINESS" || planType === "Pro" || planType === "ESTUDIO") {
    return planFeatureMatrix.BUSINESS;
  }
  return planFeatureMatrix.PROFISSIONAL;
}

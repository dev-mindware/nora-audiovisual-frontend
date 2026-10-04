import { getPlanFeatureGroups } from "@/constants/plan-features";
import { Plan, PlanType } from "@/types";

export function getPlanFeatures(plan: Plan): string[] {
  const planName = (plan.name as PlanType) || (plan.code as PlanType) || "PROFISSIONAL";
  const { features } = getPlanFeatureGroups(planName);

  const planLimits: (string | false | undefined)[] = [
    plan.maxUsers > 0 ? `Até ${plan.maxUsers} utilizadores na produtora` : "Utilizadores ilimitados",
    plan.maxProjects && plan.maxProjects > 0 ? `Até ${plan.maxProjects} projetos em simultâneo` : undefined,
    plan.maxEquipment && plan.maxEquipment > 0 ? `Até ${plan.maxEquipment} equipamentos no inventário` : undefined,
    plan.maxStorageGb && plan.maxStorageGb > 0 ? `${plan.maxStorageGb} GB de armazenamento cloud` : undefined,
    plan.includedAiCredits && plan.includedAiCredits > 0 ? `${plan.includedAiCredits} créditos Nora AI incluídos` : undefined,
  ];

  const dynamicFeatures = [
    ...planLimits,
    plan.features?.hasClientPortal && "Portal do Cliente com aprovação de copião",
    plan.features?.hasFrameReview && "Leitor de vídeo com notas e timecode",
    plan.features?.hasStudioBooking && "Gestão e reservas de palcos e estúdios",
    plan.features?.hasInvoices && "Emissão fiscal integrada via Mindgest AGT",
    plan.features?.hasCallSheets && "Exportação e partilha mobile de Call Sheets",
  ].filter((feature): feature is string => Boolean(feature));

  return [
    ...dynamicFeatures,
    ...features,
  ].filter((feature, index, list) => list.indexOf(feature) === index);
}

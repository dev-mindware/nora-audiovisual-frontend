import { ItemStatus } from "@/types";
import { Badge } from "@/components/ui";

interface StatusBadgeProps {
  status: ItemStatus | string;
  className?: string;
}

export function ItemStatusBadge({ status, className }: StatusBadgeProps) {
  let statusStyles: string;
  const normalized = status ? String(status).toUpperCase() : "";

  switch (normalized) {
    case "ACTIVE":
    case "APPROVED":
    case "ACCEPTED":
    case "PAID":
    case "PUBLISHED":
    case "CONFIRMED":
    case "AVAILABLE":
    case "COMPLETED":
    case "DELIVERED":
    case "CONVERTED_TO_PROJECT":
    case "NO_SET":
      statusStyles =
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300/40 dark:border-emerald-800/60";
      break;

    case "LEAD":
    case "SENT":
    case "PROCESSING":
    case "IN_REVIEW":
    case "POST_PRODUCTION":
    case "IN_USE":
    case "EM_CAMPO":
      statusStyles =
        "bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border-sky-300/40 dark:border-sky-800/60";
      break;

    case "PENDING":
    case "PENDENTE":
    case "AGUARDA_CLIENTE":
    case "PARTIAL":
    case "PLANNING":
    case "TRIAL":
    case "TRIALING":
    case "OUT_OF_STOCK":
    case "DRAFT":
    case "RESERVED":
    case "PRE_PRODUCTION":
    case "REVISION_REQUIRED":
    case "REVISION_REQUESTED":
    case "CHANGES_REQUESTED":
      statusStyles =
        "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300/40 dark:border-amber-800/60";
      break;

    case "ARCHIVED":
    case "EXPIRED":
    case "UNAVAILABLE":
      statusStyles =
        "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300 border-zinc-300/40 dark:border-zinc-700/60";
      break;

    case "SUSPENDED":
    case "INACTIVE":
    case "REJECTED":
    case "CANCELLED":
    case "CANCELED":
    case "BLOCKED":
    case "MAINTENANCE":
    case "FAILED":
    case "PAST_DUE":
    case "UNPAID":
    default:
      statusStyles =
        "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300/40 dark:border-rose-800/60";
      break;
  }

  return (
    <Badge variant="secondary" className={`${statusStyles} ${className || ""}`}>
      {displayStatusLabel(status)}
    </Badge>
  );
}

export const statusMap: Record<string, string> = {
  // Estados Gerais & Assinaturas
  ACTIVE: "Em Curso",
  INACTIVE: "Inativo",
  OUT_OF_STOCK: "Sem Stock",
  SUSPENDED: "Suspenso",
  TRIAL: "Período de Teste",
  TRIALING: "Período de Teste",
  PENDING: "Pendente",
  BLOCKED: "Bloqueado",
  INVITED: "Convidado",
  PAST_DUE: "Em Atraso",
  UNPAID: "Não Pago",

  // Ciclo de Vida de Projetos & Produção
  PLANNING: "Planeamento",
  LEAD: "Proposta / Lead",
  COMPLETED: "Concluído",
  ARCHIVED: "Arquivado",
  CANCELLED: "Cancelado",
  CANCELED: "Cancelado",
  IN_PROGRESS: "Em Produção",
  PRE_PRODUCTION: "Pré-Produção",
  PRODUCTION: "Rodagem / Produção",
  POST_PRODUCTION: "Pós-Produção",
  REVIEW: "Revisão Técnica",
  DELIVERED: "Entregue",

  // Propostas & Orçamentos (Budgets)
  DRAFT: "Rascunho",
  SENT: "Proposta Enviada",
  APPROVED: "Aprovado",
  ACCEPTED: "Aceite Formal",
  REJECTED: "Recusado",
  REVISION_REQUIRED: "Revisão Solicitada",
  REVISION_REQUESTED: "Revisão Solicitada",
  CONVERTED_TO_PROJECT: "Convertido em Projeto",
  EXPIRED: "Expirado",
  AGUARDA_CLIENTE: "Aguardando Cliente",
  PENDENTE: "Pendente",

  // Entregáveis & Vídeos
  IN_REVIEW: "Em Revisão",
  CHANGES_REQUESTED: "Melhorias Solicitadas",
  PUBLISHED: "Publicado",
  ROUGH_CUT: "Primeiro Corte",
  FINE_CUT: "Corte Fino",
  FINAL_DELIVERY: "Entrega Final",
  TEASER: "Teaser",
  TRAILER: "Trailer",
  PHOTOSHOOT: "Sessão Fotográfica",

  // Estúdio & Equipamentos
  AVAILABLE: "Disponível",
  RESERVED: "Reservado",
  IN_USE: "Em Campo",
  MAINTENANCE: "Em Manutenção",
  UNAVAILABLE: "Indisponível",
  CONFIRMED: "Confirmado",
  NO_SET: "No Set",
  EM_CAMPO: "Em Campo",

  // Finanças (Despesas & Pagamentos)
  PAID: "Liquidado",
  PROCESSING: "Em Processamento",
  FAILED: "Falhado",
  PARTIAL: "Parcialmente Pago",
  OVERDUE: "Vencido",
  REFUNDED: "Reembolsado",
};

export const displayStatusLabel = (status: ItemStatus | string): string => {
  if (!status) return "----";
  const upper = String(status).toUpperCase();
  return statusMap[upper] || String(status);
};

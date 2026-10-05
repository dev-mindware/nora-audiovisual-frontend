import { ItemStatus } from "@/types";
import { Badge } from "@/components/ui";

interface StatusBadgeProps {
  status: ItemStatus | string;
}

export function ItemStatusBadge({ status }: StatusBadgeProps) {
  let statusStyles: string;
  const normalized = status ? String(status).toUpperCase() : "";

  switch (normalized) {
    case "ACTIVE":
    case "APPROVED":
    case "PAID":
      statusStyles =
        "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200 border-green-200 dark:border-green-800";
      break;
    case "PENDING":
    case "TRIAL":
    case "TRIALING":
    case "OUT_OF_STOCK":
      statusStyles =
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800";
      break;
    case "SUSPENDED":
    case "INACTIVE":
    case "REJECTED":
    case "CANCELLED":
    case "CANCELED":
    case "BLOCKED":
    default:
      statusStyles =
        "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200 border-red-200 dark:border-red-800";
      break;
  }

  return (
    <Badge variant="secondary" className={statusStyles}>
      {displayStatusLabel(status)}
    </Badge>
  );
}

export const statusMap: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  OUT_OF_STOCK: "Sem stock",
  SUSPENDED: "Suspenso",
  TRIAL: "Trial",
  TRIALING: "Trial",
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  CANCELLED: "Cancelado",
  CANCELED: "Cancelado",
  BLOCKED: "Bloqueado",
  INVITED: "Convidado",
};

export const displayStatusLabel = (status: ItemStatus | string): string => {
  if (!status) return "----";
  const upper = String(status).toUpperCase();
  return statusMap[upper] || String(status);
};

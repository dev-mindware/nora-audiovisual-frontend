"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { parseRawDate } from "@/utils";
import { NotificationType } from "@/types";
import { Icon, Button } from "@/components";
import { icons } from "lucide-react";

interface NotificationItemProps {
  notification: NotificationType;
  onClick: () => void;
  onDelete: () => void;
}

interface NotificationBadgeConfig {
  label: string;
  icon: keyof typeof icons;
  className: string;
}

const NOTIFICATION_STYLES: Record<
  string,
  { icon: keyof typeof icons; colorClass: string; iconClass: string }
> = {
  AI_ALERT: {
    icon: "Sparkles",
    colorClass: "bg-purple-500/10 border border-purple-500/20",
    iconClass: "text-purple-400",
  },
  AI: {
    icon: "Sparkles",
    colorClass: "bg-purple-500/10 border border-purple-500/20",
    iconClass: "text-purple-400",
  },
  AUTOMATE: {
    icon: "Zap",
    colorClass: "bg-amber-500/10 border border-amber-500/20",
    iconClass: "text-amber-400",
  },
  FINANCE: {
    icon: "Receipt",
    colorClass: "bg-sky-500/10 border border-sky-500/20",
    iconClass: "text-sky-400",
  },
  TAX: {
    icon: "FileCheck",
    colorClass: "bg-emerald-500/10 border border-emerald-500/20",
    iconClass: "text-emerald-400",
  },
  FISCAL: {
    icon: "FileCheck",
    colorClass: "bg-emerald-500/10 border border-emerald-500/20",
    iconClass: "text-emerald-400",
  },
  TRIAL: {
    icon: "Clock",
    colorClass: "bg-indigo-500/10 border border-indigo-500/20",
    iconClass: "text-indigo-400",
  },
  BILLING: {
    icon: "CreditCard",
    colorClass: "bg-indigo-500/10 border border-indigo-500/20",
    iconClass: "text-indigo-400",
  },
  CALL_SHEET: {
    icon: "Clapperboard",
    colorClass: "bg-orange-500/10 border border-orange-500/20",
    iconClass: "text-orange-400",
  },
  DEADLINE: {
    icon: "CalendarClock",
    colorClass: "bg-rose-500/10 border border-rose-500/20",
    iconClass: "text-rose-400",
  },
  STUDIO: {
    icon: "Video",
    colorClass: "bg-blue-500/10 border border-blue-500/20",
    iconClass: "text-blue-400",
  },
  SUCCESS: {
    icon: "CircleCheck",
    colorClass: "bg-emerald-500/10 border border-emerald-500/20",
    iconClass: "text-emerald-400",
  },
  WARNING: {
    icon: "CircleAlert",
    colorClass: "bg-amber-500/10 border border-amber-500/20",
    iconClass: "text-amber-400",
  },
  ERROR: {
    icon: "OctagonAlert",
    colorClass: "bg-destructive/10 border border-destructive/20",
    iconClass: "text-destructive",
  },
  INFO: {
    icon: "Info",
    colorClass: "bg-muted/30 border border-border/40",
    iconClass: "text-foreground",
  },
  DEFAULT: {
    icon: "Bell",
    colorClass: "bg-primary/10 border border-primary/20",
    iconClass: "text-primary",
  },
};

export function NotificationItem({
  notification,
  onClick,
  onDelete,
}: NotificationItemProps) {
  let timeAgo = "";
  try {
    const date = notification.createdAt
      ? parseRawDate(notification.createdAt)
      : new Date();
    timeAgo = formatDistanceToNow(date, {
      addSuffix: true,
      locale: ptBR,
    });
  } catch {
    timeAgo = "recentemente";
  }

  const normalizedType = String(notification.type || "").toUpperCase();
  const titleUpper = (notification.title || "").toUpperCase();
  const messageUpper = (notification.message || "").toUpperCase();

  // Detectores de Badges
  const isAiAlert =
    Boolean(notification.isAiAlert) ||
    normalizedType === "AI_ALERT" ||
    normalizedType === "AI" ||
    titleUpper.includes("NORA AI") ||
    titleUpper.includes("MIND AI") ||
    titleUpper.includes("INTELIGÊNCIA ARTIFICIAL");

  const isAutomate =
    normalizedType === "AUTOMATE" ||
    titleUpper.includes("NORA AUTOMATE") ||
    titleUpper.includes("WORKFLOW") ||
    titleUpper.includes("FLUXO DE AUTOMAÇÃO");

  const isFinance =
    normalizedType === "FINANCE" ||
    titleUpper.includes("DESPESA") ||
    titleUpper.includes("RECEITA") ||
    titleUpper.includes("FLUXO DE CAIXA") ||
    messageUpper.includes("DESPESA REGISTADA");

  const isFiscal =
    normalizedType === "TAX" ||
    normalizedType === "FISCAL" ||
    titleUpper.includes("AGT") ||
    titleUpper.includes("FACTURA-RECIBO") ||
    titleUpper.includes("SAFT") ||
    titleUpper.includes("MINDGEST FISCAL");

  const isTrial =
    normalizedType === "TRIAL" ||
    titleUpper.includes("TRIAL") ||
    titleUpper.includes("AVALIAÇÃO GRATUITA") ||
    titleUpper.includes("MODO SOMENTE LEITURA");

  let badge: NotificationBadgeConfig | null = null;

  if (isAiAlert) {
    badge = {
      label: "Nora AI",
      icon: "Sparkles",
      className: "border-purple-500/25 bg-purple-500/10 text-purple-400",
    };
  } else if (isAutomate) {
    badge = {
      label: "Nora Automate",
      icon: "Zap",
      className: "border-amber-500/25 bg-amber-500/10 text-amber-400",
    };
  } else if (isFiscal) {
    badge = {
      label: "Mindgest Fiscal AGT",
      icon: "FileCheck",
      className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
    };
  } else if (isFinance) {
    badge = {
      label: "Finanças",
      icon: "Receipt",
      className: "border-sky-500/25 bg-sky-500/10 text-sky-400",
    };
  } else if (isTrial) {
    badge = {
      label: "Avaliação Nora",
      icon: "Clock",
      className: "border-indigo-500/25 bg-indigo-500/10 text-indigo-400",
    };
  }

  // Resolução de estilo do ícone
  let styleKey = normalizedType;
  if (isAiAlert) styleKey = "AI_ALERT";
  else if (isAutomate) styleKey = "AUTOMATE";
  else if (isFiscal) styleKey = "FISCAL";
  else if (isFinance) styleKey = "FINANCE";
  else if (isTrial) styleKey = "TRIAL";

  const style = NOTIFICATION_STYLES[styleKey] || NOTIFICATION_STYLES.DEFAULT;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-4 transition-colors duration-150 relative cursor-pointer hover:bg-muted/40 rounded-none border-b border-border/20",
        !notification.isRead ? "bg-primary/[0.04] dark:bg-primary/[0.06]" : "",
        isAiAlert && "border-l-2 border-l-purple-500",
        isAutomate && "border-l-2 border-l-amber-500",
        isFinance && "border-l-2 border-l-sky-500"
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-none flex items-center justify-center relative",
          style.colorClass
        )}
      >
        <Icon name={style.icon} className={cn("w-4 h-4", style.iconClass)} />
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {badge && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none border text-[10px] font-semibold shrink-0 uppercase tracking-wide",
                  badge.className
                )}
              >
                <Icon name={badge.icon} className="w-2.5 h-2.5" />
                {badge.label}
              </span>
            )}
            <h4
              className={cn(
                "text-sm line-clamp-1",
                !notification.isRead
                  ? "font-semibold text-foreground"
                  : "font-medium text-muted-foreground"
              )}
            >
              {notification.title}
            </h4>
          </div>
          {!notification.isRead && (
            <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-none mt-1.5" />
          )}
        </div>

        <p
          className={cn(
            "text-sm line-clamp-2 mt-1",
            !notification.isRead ? "text-foreground/90" : "text-muted-foreground"
          )}
        >
          {notification.message}
        </p>

        <p className="text-xs text-muted-foreground mt-2">{timeAgo}</p>
      </div>

      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-none hover:bg-destructive/15 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Icon name="Trash2" className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

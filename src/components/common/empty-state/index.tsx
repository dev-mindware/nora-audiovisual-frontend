import React from "react";
import { icons } from "lucide-react";
import { Icon } from "../icon";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: keyof typeof icons | string | React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "Nenhum resultado encontrado",
  description = "Não foram encontrados registos com os critérios especificados.",
  icon = "FolderSearch",
  action,
  children,
  className,
}: EmptyStateProps) {
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === "string") {
      return <Icon name={icon as keyof typeof icons} className="w-8 h-8 text-muted-foreground/80" />;
    }
    return <Icon name="FolderSearch" className="w-8 h-8 text-muted-foreground/80" />;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full py-12 px-6 text-center border border-dashed border-border/80 rounded-2xl bg-card/50 space-y-3",
        className
      )}
    >
      <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 text-muted-foreground flex items-center justify-center">
        {renderIcon()}
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {(action || children) && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          {action}
          {children}
        </div>
      )}
    </div>
  );
}

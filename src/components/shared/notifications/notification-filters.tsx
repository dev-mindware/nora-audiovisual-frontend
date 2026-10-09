"use client";
import {
  Button,
  Input,
  Icon,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components";
import { cn } from "@/lib/utils";

export type NotificationFilterType =
  | "all"
  | "AI_ALERT"
  | "AUTOMATE"
  | "FINANCE"
  | "FISCAL"
  | "INFO"
  | "WARNING"
  | "ERROR"
  | "SUCCESS";

interface NotificationFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: "all" | "read" | "unread";
  setFilterStatus: (value: "all" | "read" | "unread") => void;
  filterType: NotificationFilterType;
  setFilterType: (value: NotificationFilterType) => void;
  compact?: boolean;
}

const STATUS_LABELS: Record<"all" | "read" | "unread", string> = {
  all: "Todas",
  read: "Lidas",
  unread: "Não Lidas",
};

const TYPE_LABELS: Record<NotificationFilterType, string> = {
  all: "Todos os tipos",
  AI_ALERT: "Nora AI",
  AUTOMATE: "Nora Automate",
  FINANCE: "Finanças & Tesouraria",
  FISCAL: "Mindgest Fiscal AGT",
  INFO: "Informações",
  SUCCESS: "Sucesso / Validações",
  WARNING: "Avisos & Prazos",
  ERROR: "Erros",
};

export function NotificationFilters({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  compact = false,
}: NotificationFiltersProps) {
  const isStatusFiltered = filterStatus !== "all";
  const isTypeFiltered = filterType !== "all";

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="relative w-full sm:max-w-md">
        <Icon
          name="Search"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          placeholder="Buscar notificações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-background rounded-none"
        />
      </div>

      <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "border gap-2 shrink-0 transition-colors rounded-none font-semibold text-xs",
                isStatusFiltered && "border-primary text-primary bg-primary/5 hover:bg-primary/10"
              )}
            >
              <Icon name="ListFilter" className="h-4 w-4" />
              {isStatusFiltered ? STATUS_LABELS[filterStatus] : "Estado"}
              {isStatusFiltered && (
                <span className="ml-1 flex h-2 w-2 bg-primary rounded-none" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px] rounded-none">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Filtrar por estado
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(["unread", "read"] as const).map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                className="rounded-none cursor-pointer"
                checked={filterStatus === status}
                onCheckedChange={() => setFilterStatus(filterStatus === status ? "all" : status)}
              >
                {STATUS_LABELS[status]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "border gap-2 shrink-0 transition-colors rounded-none font-semibold text-xs",
                isTypeFiltered && "border-primary text-primary bg-primary/5 hover:bg-primary/10"
              )}
            >
              <Icon name="Tag" className="h-4 w-4" />
              {isTypeFiltered ? TYPE_LABELS[filterType] : "Tipo de alerta"}
              {isTypeFiltered && (
                <span className="ml-1 flex h-2 w-2 bg-primary rounded-none" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px] rounded-none">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Filtrar por módulo / tipo
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(
              [
                "AI_ALERT",
                "AUTOMATE",
                "FINANCE",
                "FISCAL",
                "INFO",
                "SUCCESS",
                "WARNING",
                "ERROR",
              ] as const
            ).map((type) => (
              <DropdownMenuCheckboxItem
                key={type}
                className="rounded-none cursor-pointer"
                checked={filterType === type}
                onCheckedChange={() => setFilterType(filterType === type ? "all" : type)}
              >
                {TYPE_LABELS[type]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useTenantStore } from "@/stores/tenant";
import { api } from "@/services/api";
import { queryClient } from "@/lib";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Clapperboard, Check, ChevronsUpDown, Building2 } from "lucide-react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

export function OrganizationSwitcher() {
  const { activeOrganization, organizations, setActiveOrganization } = useTenantStore();
  const [isSwitching, setIsSwitching] = useState(false);

  async function handleSwitch(orgId: string) {
    if (orgId === activeOrganization?.id) return;
    try {
      setIsSwitching(true);
      const res = await api.post("/auth/organization/switch", { organizationId: orgId });
      const data = res.data?.data || res.data;
      if (data?.activeOrganization) {
        setActiveOrganization(data.activeOrganization);
        await queryClient.invalidateQueries();
        SucessMessage(`Organização ativa: ${data.activeOrganization.name}`);
      }
    } catch (err: any) {
      ErrorMessage(err?.response?.data?.message || "Erro ao trocar de organização.");
    } finally {
      setIsSwitching(false);
    }
  }

  const currentName = activeOrganization?.name || "Nora Studio";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex h-9 items-center gap-2 rounded-xl border border-border/80 bg-card/80 px-3 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          disabled={isSwitching}
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <Clapperboard className="h-3 w-3" />
          </div>
          <span className="max-w-[140px] truncate text-xs font-semibold">
            {currentName}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl border border-border/80 bg-card p-1.5 shadow-xl backdrop-blur-xl">
        <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Organizações Ativas
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 border-border/60" />

        {organizations.length > 0 ? (
          organizations.map((org) => {
            const isSelected = org.id === activeOrganization?.id;
            return (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleSwitch(org.id)}
                className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium">{org.name}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
            );
          })
        ) : (
          <div className="px-2.5 py-2 text-xs text-muted-foreground">
            {currentName}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

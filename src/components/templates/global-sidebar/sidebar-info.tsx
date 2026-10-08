"use client";

import { Icon } from "@/components/common/icon";
import { BrandLogo } from "@/components/common/brand-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/auth";
import { useTenantStore } from "@/stores/tenant";
import { api } from "@/services/api";
import { queryClient } from "@/lib";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { useState } from "react";

export function SidebarCompanyInfo() {
  const { user } = useAuth();
  const { isMobile } = useSidebar();
  const { activeOrganization, organizations, setActiveOrganization } = useTenantStore();
  const [isSwitching, setIsSwitching] = useState(false);

  const isPlatformAdmin = user?.role === "ADMIN" || user?.isPlatformAdmin;
  const orgName = isPlatformAdmin
    ? "Nora Audiovisual"
    : (activeOrganization?.name || user?.company?.name || "Nora Audiovisual Studio");
  const orgSubtitle = isPlatformAdmin
    ? "ADMIN • Plataforma"
    : (user?.role ? `${user.role} • Produção` : "Estúdio Audiovisual");

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

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/80 transition-colors"
              disabled={isSwitching}
            >
              <div className="flex items-center justify-center aspect-square size-8 overflow-hidden shrink-0">
                <BrandLogo variant="symbol" size="sm" />
              </div>
              <div className="grid flex-1 text-sm leading-tight text-left">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-semibold truncate text-foreground">
                    {orgName}
                  </span>
                  {isPlatformAdmin && (
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded bg-primary/10 text-primary border border-primary/20 shrink-0 leading-none">
                      ADMIN
                    </span>
                  )}
                </div>
                <span className="text-[11px] truncate text-muted-foreground">
                  {orgSubtitle}
                </span>
              </div>
              <Icon name="ChevronsUpDown" className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-xl border border-border/80 bg-card p-1.5 shadow-xl backdrop-blur-xl"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={6}
          >
            <DropdownMenuLabel className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Estúdio / Organização Ativa
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 border-border/60" />

            {organizations.length > 0 ? (
              organizations.map((org) => {
                const isSelected = org.id === (activeOrganization?.id || user?.company?.id);
                return (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => handleSwitch(org.id)}
                    className="flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="flex items-center justify-center rounded-md border border-border/80 size-6 bg-muted/50">
                        <Icon name="Building2" className="size-3.5 text-primary" />
                      </div>
                      <span className="truncate">{org.name}</span>
                    </div>
                    {isSelected && (
                      <Icon name="Check" className="size-4 text-primary shrink-0" />
                    )}
                  </DropdownMenuItem>
                );
              })
            ) : (
              <div className="flex items-center gap-2.5 px-2.5 py-2 text-xs text-foreground">
                <div className="flex items-center justify-center rounded-md border border-border/80 size-6 bg-primary/10 text-primary">
                  <Icon name="Film" className="size-3.5" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-medium truncate">{orgName}</span>
                  <span className="text-[10px] text-muted-foreground">Unidade de Produção</span>
                </div>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

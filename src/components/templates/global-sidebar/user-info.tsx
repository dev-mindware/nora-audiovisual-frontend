"use client";
import {
  Icon,
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components";
import { useAuth, useLogout } from "@/hooks/auth";
import { usePwaInstallPrompt } from "@/hooks/common/use-pwa-install-prompt";
import Link from "next/link";

export function UserInfo() {
  const { user } = useAuth();
  const { isMobile } = useSidebar();
  const { handleLogout } = useLogout();
  const { canInstall, promptInstall } = usePwaInstallPrompt();

  if (!user) return null;

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-muted-foreground"
            >
              <Avatar className="w-8 h-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary/20 text-primary font-semibold">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-medium truncate">{user.name}</span>
                <span className="text-xs truncate text-muted-foreground">{user.email}</span>
              </div>
              <Icon name="ChevronsUpDown" className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="w-8 h-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary/20 text-primary font-semibold">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-sm leading-tight text-left">
                  <span className="font-medium truncate">{user.name}</span>
                  <span className="text-xs truncate text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/subscriptions">
                <DropdownMenuItem className="cursor-pointer">
                  <Icon name="Sparkles" className="mr-2 h-4 w-4 text-primary" />
                  Planos &amp; Add-Ons
                </DropdownMenuItem>
              </Link>
              <Link href="/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <Icon name="Settings" className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            {canInstall && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={promptInstall} className="cursor-pointer">
                  <Icon name="Download" className="mr-2 h-4 w-4" />
                  Instalar Nora Audiovisual
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <Icon name="LogOut" className="mr-2 h-4 w-4" />
              Terminar Sessão
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

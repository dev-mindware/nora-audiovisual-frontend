"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/common/icon";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { MenuItem } from "@/constants/menu-items";

export function NavMenu({ items }: { items: MenuItem[] }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const isActive = (url: string) => {
    if (url === "#" || !url) return false;
    const cleanUrl = url.split("?")[0];
    if (cleanUrl === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(cleanUrl);
  };

  const activeParentId = useMemo(() => {
    const found = items.find((item) =>
      item.items?.some((sub) => {
        if (!sub.url || sub.url === "#") return false;
        const cleanUrl = sub.url.split("?")[0];
        if (cleanUrl === "/admin") return pathname === "/admin";
        return pathname.startsWith(cleanUrl);
      })
    );
    return found ? (found.name || found.url) : null;
  }, [items, pathname]);

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(activeParentId);

  useEffect(() => {
    if (activeParentId) {
      setOpenSubmenu(activeParentId);
    }
  }, [activeParentId]);

  const toggleSubmenu = (id: string) =>
    setOpenSubmenu((prev) => (prev === id ? null : id));

  const handleMobileClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      <SidebarGroup>
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
          {items.map((item) => {
            const id = item.name || item.url;
            const hasSubmenu = !!item.items?.length;
            const isOpen = openSubmenu === id;
            const activeMain =
              isActive(item.url) ||
              item.items?.some((sub) => isActive(sub.url));

            return (
              <SidebarMenuItem key={id}>
                {hasSubmenu ? (
                  <>
                    <SidebarMenuButton
                      onClick={() => toggleSubmenu(id)}
                      tooltip={item.name}
                      className={cn(
                        activeMain
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-sidebar-accent "
                      )}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                      <Icon
                        name="ChevronRight"
                        className={`ml-auto transition-transform duration-200 ${isOpen ? "rotate-90" : ""
                          }`}
                      />
                    </SidebarMenuButton>

                    {isOpen && (
                      <SidebarMenuSub>
                        {item.items!.map((sub) => {
                          const activeSub = isActive(sub.url);
                          return (
                            <SidebarMenuSubItem key={sub.name}>
                              <SidebarMenuSubButton
                                asChild
                                className={cn(
                                  activeSub
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-sidebar-accent "
                                )}
                              >
                                <Link
                                  href={sub.url}
                                  onClick={handleMobileClick}
                                  className="flex items-center justify-between w-full gap-2"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="truncate">{sub.name}</span>
                                    {sub.subtitle && (
                                      <span className="text-[10px] text-muted-foreground font-normal">
                                        ({sub.subtitle})
                                      </span>
                                    )}
                                  </div>
                                  {sub.badge && (
                                    <span
                                      className={cn(
                                        "px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider rounded border leading-none shrink-0",
                                        sub.badgeVariant === "active"
                                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                          : sub.badgeVariant === "trial"
                                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                          : "bg-muted text-muted-foreground border-border"
                                      )}
                                    >
                                      {sub.badge}
                                    </span>
                                  )}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
                  </>
                ) : (
                  <>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.name}
                      onClick={handleMobileClick}
                      className={cn(
                        activeMain
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-sidebar-accent "
                      )}
                    >
                      <Link href={item.url}>
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.showMoreIcon && (
                      <SidebarMenuAction>
                        <Icon name="Loader" className="text-primary" />
                      </SidebarMenuAction>
                    )}
                  </>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}

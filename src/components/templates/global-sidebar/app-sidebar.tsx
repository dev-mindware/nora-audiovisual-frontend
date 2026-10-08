"use client";
import {
  Sidebar,
  SidebarRail,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { NavMenu } from "./nav-components";
import { UserInfo } from "./user-info";
import { SidebarCompanyInfo } from "./sidebar-info";
import { SidebarSkeleton } from "@/components/common/skeletons/sidebar-skeleton";
import { menuItems } from "@/constants/menu-items";
import { useAuth } from "@/hooks/auth";
import { getSidebarForUser } from "@/lib/get-sidebar-for-user";
import { PlanType } from "@/types";

export function AppSidebar() {
  const { user } = useAuth();

  if (!user) return <SidebarSkeleton />;

  const plan = (user?.subscription?.plan?.name || user?.company?.subscription?.plan?.name) as PlanType | undefined;

  const filteredMenu = getSidebarForUser(
    menuItems.items,
    user.role,
    user.subscription ?? user.company?.subscription ?? null,
    plan,
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarCompanyInfo />
      </SidebarHeader>
      <SidebarContent className="group-data-[collapsible=icon]:items-center mt-4">
        <NavMenu items={filteredMenu} />
      </SidebarContent>
      <SidebarFooter>
        <UserInfo />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Role, PlanType, PLAN_HIERARCHY } from "@/types";
import { useAuth } from "@/hooks/auth";
import { menuItems, MenuItem } from "@/constants/menu-items";
import { getRouteByRole } from "@/utils/role-redirects";

const flattenMenu = (items: MenuItem[]): MenuItem[] =>
  items.reduce<MenuItem[]>((acc, item) => {
    acc.push(item);
    if (item.items) acc.push(...flattenMenu(item.items));
    return acc;
  }, []);

const allMenuItems = flattenMenu(menuItems.items);

export type AccessResult =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "unauthorized" }
  | { status: "plan_insufficient"; redirectTo: string }
  | { status: "allowed" };

export function useAccessControl(allowed: Role[], checkPlan = true): AccessResult {
  const pathname = usePathname();
  const { user, isAuthenticating } = useAuth();

  const matchingItem = useMemo(
    () =>
      allMenuItems
        .filter(
          (item) =>
            item.url !== "#" &&
            item.url !== "/" &&
            (pathname === item.url || pathname.startsWith(item.url + "/"))
        )
        .sort((a, b) => b.url.length - a.url.length)[0],
    [pathname]
  );

  const currentPlanLevel = useMemo(() => {
    const plan = (user?.subscription?.plan?.name || user?.company?.subscription?.plan?.name) as PlanType || "INICIAL";
    return PLAN_HIERARCHY[plan] ?? 0;
  }, [user]);

  return useMemo<AccessResult>(() => {
    if (isAuthenticating) return { status: "loading" };
    if (!user) return { status: "unauthenticated" };

    const userRole = user.role;
    const isPlatformAdmin = Boolean(user.isPlatformAdmin || userRole === "ADMIN");
    const effectiveRoles: Role[] = isPlatformAdmin ? ["ADMIN", userRole] : [userRole];

    const hasAllowedRole = allowed.some((r) => effectiveRoles.includes(r));
    if (!hasAllowedRole) return { status: "unauthorized" };

    // RBAC estrito a nível de item de menu / rota (ex: /admin restrito a ADMIN)
    if (matchingItem?.roles && matchingItem.roles.length > 0) {
      const hasMenuRole = matchingItem.roles.some((r) => effectiveRoles.includes(r));
      if (!hasMenuRole) {
        return { status: "unauthorized" };
      }
    }

    const PLAN_BYPASS_ROLES: Role[] = ["ADMIN"];
    const shouldCheckPlan = checkPlan && !PLAN_BYPASS_ROLES.includes(user.role);

    if (shouldCheckPlan && matchingItem?.minPlan) {
      const required = PLAN_HIERARCHY[matchingItem.minPlan] ?? 0;
      if (currentPlanLevel < required) {
        const fallbackRoute = getRouteByRole(user.role);
        const redirectTo =
          pathname !== fallbackRoute ? fallbackRoute : "/unauthorized";
        return { status: "plan_insufficient", redirectTo };
      }
    }

    return { status: "allowed" };
  }, [
    isAuthenticating,
    user,
    allowed,
    matchingItem,
    currentPlanLevel,
    pathname,
    checkPlan,
  ]);
}

export interface PlanAccessResult {
  hasAccess: boolean;
  requiredPlan?: PlanType;
  featureName?: string;
  isLoading: boolean;
}

export function usePlanAccess(): PlanAccessResult {
  const pathname = usePathname();
  const { user, isAuthenticating } = useAuth();

  const matchingItem = useMemo(
    () =>
      allMenuItems
        .filter(
          (item) =>
            item.url !== "#" &&
            item.url !== "/" &&
            (pathname === item.url || pathname.startsWith(item.url + "/"))
        )
        .sort((a, b) => b.url.length - a.url.length)[0],
    [pathname]
  );

  const currentPlanLevel = useMemo(() => {
    const sub = (user as any)?.subscription || (user?.activeOrganization as any)?.subscription || user?.company?.subscription;
    const planName = (sub?.plan?.name || sub?.planName || "Base") as PlanType;
    return PLAN_HIERARCHY[planName] ?? 0;
  }, [user]);

  if (isAuthenticating) {
    return { hasAccess: false, isLoading: true };
  }

  if (!user) {
    return { hasAccess: true, isLoading: false };
  }

  if (user.isPlatformAdmin || user.role === "ADMIN") {
    return { hasAccess: true, isLoading: false };
  }

  if (matchingItem?.minPlan) {
    const required = PLAN_HIERARCHY[matchingItem.minPlan] ?? 0;
    if (currentPlanLevel < required) {
      return {
        hasAccess: false,
        requiredPlan: matchingItem.minPlan,
        featureName: matchingItem.name,
        isLoading: false,
      };
    }
  }

  return { hasAccess: true, isLoading: false };
}

import { MenuItem } from "@/constants/menu-items";
import { Role, PlanType, Subscription, SubscriptionStatus, PLAN_HIERARCHY } from "@/types";

export function getSidebarForUser(
  items: MenuItem[],
  role: Role,
  subscription?: Subscription | null,
  plan?: PlanType,
): MenuItem[] {
  // Administradores de plataforma têm uma navegação restrita e dedicada ao backoffice
  if (role === "ADMIN") {
    return items.filter((item) => item.roles && item.roles.includes("ADMIN"));
  }

  // Utilizadores normais não devem ver menus exclusivos de ADMIN
  const nonAdminItems = items.filter((item) => !item.roles?.includes("ADMIN") || item.roles.length > 1);

  if (subscription && subscription.status === SubscriptionStatus.PENDING) {
    const pendingPlanLevel = plan ? (PLAN_HIERARCHY[plan] ?? 0) : 0;

    return nonAdminItems
      .filter((item) => !item.roles || item.roles.includes(role))
      .map((item) => {
        const isSubscriptions = item.url === "/subscriptions" || item.url === "/plans";
        const isSettings = item.url === "/settings";

        if (isSubscriptions || isSettings) return item;

        const itemPlanLevel = item.minPlan ? (PLAN_HIERARCHY[item.minPlan] ?? 0) : 0;
        const planOk = itemPlanLevel <= pendingPlanLevel;

        if (!planOk) return null;

        return {
          ...item,
          showUpgrade: true,
          items: item.items?.filter((sub) => {
            const subPlanLevel = sub.minPlan ? (PLAN_HIERARCHY[sub.minPlan] ?? 0) : 0;
            return subPlanLevel <= pendingPlanLevel;
          }),
        };
      })
      .filter(Boolean) as typeof items;
  }

  const currentPlanLevel = plan ? (PLAN_HIERARCHY[plan] ?? 0) : 0;

  return nonAdminItems
    .filter((item) => {
      const roleOk = !item.roles || item.roles.includes(role);
      const itemPlanLevel = item.minPlan ? (PLAN_HIERARCHY[item.minPlan] ?? 0) : 0;
      const planOk = !item.minPlan || currentPlanLevel >= itemPlanLevel;

      if (!planOk && item.showUpgrade) return roleOk;

      return roleOk && planOk;
    })
    .map((item) => ({
      ...item,
      items: item.items?.filter((sub) => {
        const roleOk = !sub.roles || sub.roles.includes(role);
        const subPlanLevel = sub.minPlan ? (PLAN_HIERARCHY[sub.minPlan] ?? 0) : 0;
        const planOk = !sub.minPlan || currentPlanLevel >= subPlanLevel;
        return roleOk && planOk;
      }),
    }));
}

import { useAuthStore } from "@/stores/auth";
import { SubscriptionStatus } from "@/types";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);

  const subscription = user?.company?.subscription;
  const rawStatus = subscription?.status;
  const isTrial = rawStatus === SubscriptionStatus.TRIALING;
  const endDate = isTrial
    ? subscription?.trialEndsAt
    : subscription?.periodEndsAt;
  const isTimeExpired = endDate ? new Date(endDate) < new Date() : false;
  const isExpired =
    rawStatus === SubscriptionStatus.EXPIRED || isTimeExpired;

  // Se o período já terminou, o status efetivo é EXPIRED
  const effectiveStatus = isExpired
    ? SubscriptionStatus.EXPIRED
    : rawStatus;

  const hasActiveSubscription =
    !isExpired &&
    (rawStatus === SubscriptionStatus.ACTIVE ||
      rawStatus === SubscriptionStatus.TRIALING);

  return {
    user,
    setUser,
    isAuthenticating,
    subscriptionStatus: effectiveStatus,
    hasActiveSubscription,
    isExpired,
    isTrial,
  };
}

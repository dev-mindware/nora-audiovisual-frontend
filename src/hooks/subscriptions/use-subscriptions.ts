import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noraSubscriptionsService, PlanItem, SubscriptionData, AddOnItem } from '@/services/subscriptions-service';
import { useAuthStore } from '@/stores/auth';
import { useTenantStore } from '@/stores/tenant';
import { toast } from 'sonner';

export function useNoraSubscriptions() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { activeOrganization } = useTenantStore();
  const isPlatformAdmin = Boolean(user?.isPlatformAdmin || user?.role === 'ADMIN');
  const hasTenant = Boolean(activeOrganization?.id);

  const plansQuery = useQuery<PlanItem[]>({
    queryKey: ['nora-plans'],
    queryFn: () => noraSubscriptionsService.getPlans(),
  });

  const addOnsQuery = useQuery<AddOnItem[]>({
    queryKey: ['nora-add-ons'],
    queryFn: () => noraSubscriptionsService.getAddOns(),
  });

  const currentSubscriptionQuery = useQuery<SubscriptionData>({
    queryKey: ['nora-current-subscription', activeOrganization?.id],
    queryFn: () => noraSubscriptionsService.getCurrentSubscription(),
    enabled: !isPlatformAdmin && hasTenant,
    retry: false,
  });

  const changePlanMutation = useMutation({
    mutationFn: ({ planCode, billingCycle }: { planCode: string; billingCycle?: 'MONTHLY' | 'ANNUAL' }) =>
      noraSubscriptionsService.changePlan(planCode, billingCycle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nora-current-subscription'] });
      toast.success('Plano alterado com sucesso!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Falha ao alterar plano');
    },
  });

  const purchaseAddOnMutation = useMutation({
    mutationFn: ({ addOnCode, quantity }: { addOnCode: string; quantity: number }) =>
      noraSubscriptionsService.purchaseAddOn(addOnCode, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nora-current-subscription'] });
      toast.success('Add-on contratado com sucesso!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Falha ao contratar add-on');
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: () => noraSubscriptionsService.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nora-current-subscription'] });
      toast.success('Cancelamento agendado para o fim do período.');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Falha ao cancelar subscrição');
    },
  });

  const reactivateSubscriptionMutation = useMutation({
    mutationFn: () => noraSubscriptionsService.reactivateSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nora-current-subscription'] });
      toast.success('Subscrição reativada com sucesso!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Falha ao reativar subscrição');
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: (data: {
      planCode: string;
      billingInterval: 'MONTHLY' | 'SEMIANNUAL' | 'ANNUAL';
      paymentMethod: 'BANK_TRANSFER' | 'MULTICAIXA_EXPRESS' | 'UNITEL_MONEY';
      proofFileUrl: string;
      referenceNumber?: string;
      notes?: string;
      couponCode?: string;
      addOns?: Array<{ code: string; quantity: number }>;
    }) => noraSubscriptionsService.checkout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nora-current-subscription'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Falha ao submeter comprovativo de subscrição');
    },
  });

  return {
    plans: plansQuery.data || [],
    addOns: addOnsQuery.data || [],
    subscription: currentSubscriptionQuery.data,
    isLoading: plansQuery.isLoading || currentSubscriptionQuery.isLoading,
    changePlan: changePlanMutation.mutateAsync,
    isChangingPlan: changePlanMutation.isPending,
    purchaseAddOn: purchaseAddOnMutation.mutateAsync,
    isPurchasingAddOn: purchaseAddOnMutation.isPending,
    cancelSubscription: cancelSubscriptionMutation.mutateAsync,
    isCancelling: cancelSubscriptionMutation.isPending,
    reactivateSubscription: reactivateSubscriptionMutation.mutateAsync,
    isReactivating: reactivateSubscriptionMutation.isPending,
    checkout: checkoutMutation.mutateAsync,
    isCheckingOut: checkoutMutation.isPending,
  };
}

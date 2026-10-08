"use client";

import { GlobalModal, Button, Badge } from "@/components";
import { ItemStatusBadge } from "@/components/common";
import { useModal } from "@/stores/modal/use-modal-store";
import { useAdmin } from "@/hooks/admin";
import {
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  FileCheck,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";
import { format } from "date-fns";

export function SubscriptionDetailsModal() {
  const { open, modalData, closeModal, openModal } = useModal();
  const sub = modalData["view-subscription-details"]?.subscription;
  const { updateSubscriptionStatus, isUpdatingSubscriptionStatus } = useAdmin();

  if (!open["view-subscription-details"] || !sub) return null;

  const handleClose = () => closeModal("view-subscription-details");

  const isActive = sub.status === "ACTIVE";
  const isPending = sub.status === "PENDING" || sub.status === "TRIALING";

  const handleApprove = async () => {
    await updateSubscriptionStatus({
      id: sub.id,
      status: "ACTIVE",
      reason: "Aprovação manual de pagamento via painel de administração",
      extendDays: sub.billingInterval === "ANNUAL" ? 365 : 30,
    });
  };

  const handleCancel = async () => {
    await updateSubscriptionStatus({
      id: sub.id,
      status: "CANCELLED",
      reason: "Cancelamento pelo painel administrativo",
    });
  };

  const handleViewProof = () => {
    const proofUrl = sub.proofUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1000&auto=format&fit=crop";
    openModal("proof-viewer", {
      url: proofUrl,
      title: `Comprovativo - ${sub.organization?.name || "Organização"}`,
      amount: sub.plan?.priceMonthly ? `${Number(sub.plan.priceMonthly).toLocaleString("pt-AO")} Kz` : undefined,
      reference: `SUB-${sub.id.slice(0, 8)}`,
    });
  };

  return (
    <GlobalModal
      id="view-subscription-details"
      title="Gestão de Subscrição"
      description={`ID: ${sub.id}`}
      canClose
      className="max-w-2xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Fechar
          </Button>

          {isActive && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              disabled={isUpdatingSubscriptionStatus}
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              Cancelar Subscrição
            </Button>
          )}

          {isPending && (
            <Button
              variant="default"
              size="sm"
              onClick={handleApprove}
              disabled={isUpdatingSubscriptionStatus}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              {isUpdatingSubscriptionStatus ? "A aprovar..." : "Aprovar Pagamento"}
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6 pt-2">
        {/* Header Org & Status */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">
                {sub.organization?.name || "Produtora"}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <span className="font-mono text-muted-foreground">slug: {sub.organization?.slug || "—"}</span>
              </p>
            </div>
          </div>
          <ItemStatusBadge status={sub.status} />
        </div>

        {/* Plan & Cycle Info */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-border bg-card space-y-1">
            <span className="text-muted-foreground block text-xs">Plano Comercial</span>
            <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-primary" />
              {sub.plan?.name || sub.plan?.code || "Plano Inicial"}
            </span>
            <div className="text-xs text-muted-foreground font-mono">
              Intervalo: {sub.billingInterval || "MONTHLY"}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border bg-card space-y-1">
            <span className="text-muted-foreground block text-xs">Ciclo de Faturação</span>
            <div className="font-medium text-xs flex items-center gap-1.5 text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {sub.currentPeriodStart ? format(new Date(sub.currentPeriodStart), "dd/MM/yyyy") : "—"} até{" "}
              {sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), "dd/MM/yyyy") : "—"}
            </div>
            <div className="text-xs text-muted-foreground">
              {sub.cancelAtPeriodEnd ? "Cancela ao fim do período" : "Renovação automática"}
            </div>
          </div>
        </div>

        {/* Comprovativo Banner */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3">
            <FileCheck className="h-8 w-8 text-primary" />
            <div>
              <h4 className="font-semibold text-foreground text-sm">Comprovativo de Pagamento</h4>
              <p className="text-xs text-muted-foreground">
                Documento bancário de transferência ou Multicaixa enviado pelo cliente.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleViewProof} className="gap-1.5">
            Ver Comprovativo
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}

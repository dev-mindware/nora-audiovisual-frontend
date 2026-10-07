"use client";

import { GlobalModal, Button, Badge } from "@/components";
import { useModal } from "@/stores/modal/use-modal-store";
import { useAdmin } from "@/hooks/admin";
import { TenantAdminItem } from "@/services/admin-service";
import {
  Building2,
  Mail,
  User,
  ShieldAlert,
  Calendar,
  Layers,
  HardDrive,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";

export function TenantDetailsModal() {
  const { open, modalData, closeModal } = useModal();
  const tenant = modalData["view-tenant-details"]?.tenant as TenantAdminItem | undefined;
  const { updateStatus, isUpdatingStatus } = useAdmin();

  if (!open["view-tenant-details"] || !tenant) return null;

  const handleClose = () => closeModal("view-tenant-details");

  const isActive = tenant.status === "ACTIVE";

  const handleToggle = async () => {
    const nextStatus = isActive ? "SUSPENDED" : "ACTIVE";
    await updateStatus({
      id: tenant.id,
      status: nextStatus,
      reason: nextStatus === "SUSPENDED" ? "Suspensão pelo painel de detalhes" : "Reativação administrativa",
    });
    handleClose();
  };

  return (
    <GlobalModal
      id="view-tenant-details"
      title="Detalhes da Produtora / Estúdio"
      description={`ID: ${tenant.id}`}
      canClose
      className="max-w-2xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Fechar
          </Button>
          <Button
            variant={isActive ? "destructive" : "default"}
            size="sm"
            onClick={handleToggle}
            disabled={isUpdatingStatus}
          >
            {isActive ? (
              <>
                <XCircle className="h-4 w-4 mr-1.5" /> Suspender Produtora
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Ativar Produtora
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-6 pt-2">
        {/* Header Tenant */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground text-base">{tenant.name}</h3>
                <Badge variant="outline" className="text-xs font-mono">
                  {tenant.slug}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <User className="h-3.5 w-3.5" /> Responsável: {tenant.owner?.name || "—"} ({tenant.owner?.email})
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              isActive
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }
          >
            {isActive ? "Ativo" : "Suspenso"}
          </Badge>
        </div>

        {/* Legal & Subscrição Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-border bg-card space-y-1">
            <span className="text-muted-foreground block text-xs">Plano Comercial</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-primary" />
                {tenant.subscription?.planCode || "INICIAL"}
              </span>
              <Badge variant="outline" className="text-xs">
                {tenant.subscription?.billingCycle || "MONTHLY"}
              </Badge>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border bg-card space-y-1">
            <span className="text-muted-foreground block text-xs">Data de Registo</span>
            <div className="font-semibold text-sm flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {tenant.createdAt ? format(new Date(tenant.createdAt), "dd/MM/yyyy") : "—"}
            </div>
          </div>
        </div>

        {/* Quotas & Métricas de Consumo */}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-primary" />
            Consumo de Infraestrutura & Capacidade
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-border bg-card text-center">
              <span className="text-muted-foreground block mb-1">Membros</span>
              <span className="text-lg font-semibold text-foreground">
                {tenant.metrics?.membersCount || 0}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-border bg-card text-center">
              <span className="text-muted-foreground block mb-1">Projectos</span>
              <span className="text-lg font-semibold text-foreground">
                {tenant.metrics?.projectsCount || 0}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-border bg-card text-center">
              <span className="text-muted-foreground block mb-1">Equipamentos</span>
              <span className="text-lg font-semibold text-foreground">
                {tenant.metrics?.equipmentCount || 0}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-border bg-card text-center">
              <span className="text-muted-foreground block mb-1">Storage</span>
              <span className="text-lg font-semibold text-primary">
                {tenant.metrics?.storageUsedGb || 0} GB
              </span>
            </div>
          </div>
        </div>
      </div>
    </GlobalModal>
  );
}

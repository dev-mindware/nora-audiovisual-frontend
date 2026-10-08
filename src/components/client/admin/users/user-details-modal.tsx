"use client";

import { GlobalModal, Button, Badge } from "@/components";
import { ItemStatusBadge } from "@/components/common";
import { useModal } from "@/stores/modal/use-modal-store";
import { AdminUserItem } from "@/services/admin-service";
import {
  User,
  Mail,
  Shield,
  Building2,
  Calendar,
  Layers,
  Monitor,
  CheckCircle2,
  XCircle,
  Clock,
  KeyRound,
} from "lucide-react";
import { format } from "date-fns";

export function UserDetailsModal() {
  const { open, modalData, closeModal, openModal } = useModal();
  const user = modalData["view-user-details"]?.user as AdminUserItem | undefined;

  if (!open["view-user-details"] || !user) return null;

  const handleClose = () => closeModal("view-user-details");

  const handleOpenResetPassword = () => {
    handleClose();
    openModal("reset-user-password", { user });
  };

  const isActive = user.status === "ACTIVE";

  return (
    <GlobalModal
      id="view-user-details"
      title="Perfil do Utilizador"
      description={`ID: ${user.id}`}
      canClose
      className="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            className="text-primary hover:text-primary gap-1.5 border-primary/30 hover:bg-primary/5"
            onClick={handleOpenResetPassword}
          >
            <KeyRound className="h-4 w-4" />
            Redefinir Palavra-passe
          </Button>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pt-2">
        {/* Header Profile */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground text-base">{user.name}</h3>
                {user.isPlatformAdmin && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">
                    <Shield className="h-3 w-3 mr-1" /> Super Admin
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Mail className="h-3 w-3" /> {user.email}
              </p>
            </div>
          </div>
          <ItemStatusBadge status={user.status} />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-border bg-card">
            <span className="text-muted-foreground block mb-1">Data de Cadastro</span>
            <div className="font-semibold flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {user.createdAt ? format(new Date(user.createdAt), "dd/MM/yyyy HH:mm") : "—"}
            </div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card">
            <span className="text-muted-foreground block mb-1">Email Verificado</span>
            <div className="font-semibold flex items-center gap-1">
              {user.emailVerifiedAt ? (
                <span className="text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Confirmado
                </span>
              ) : (
                <span className="text-amber-500 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Pendente
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Organizações / Estúdios Vinculados */}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Produtoras & Estúdios Vinculados ({user.organizations?.length || 0})
          </h4>
          {user.organizations && user.organizations.length > 0 ? (
            <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
              {user.organizations.map((org) => (
                <div key={org.organizationId} className="p-3 bg-card flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{org.organizationName}</span>
                    <span className="text-xs font-mono text-muted-foreground">{org.organizationSlug}</span>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                    {org.roleName || org.roleCode}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground p-4 border border-dashed rounded-lg text-center">
              Este utilizador não possui vínculos com produtoras ou atua apenas como administrador global.
            </p>
          )}
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-border bg-muted/10 flex items-center gap-3">
            <Monitor className="h-5 w-5 text-muted-foreground" />
            <div>
              <span className="font-semibold text-foreground text-sm">{user.activeSessionsCount || 0}</span>
              <p className="text-muted-foreground text-xs">Sessões Activas</p>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-muted/10 flex items-center gap-3">
            <Layers className="h-5 w-5 text-muted-foreground" />
            <div>
              <span className="font-semibold text-foreground text-sm">{user.activeProjectsCount || 0}</span>
              <p className="text-muted-foreground text-xs">Projectos Atribuídos</p>
            </div>
          </div>
        </div>
      </div>
    </GlobalModal>
  );
}

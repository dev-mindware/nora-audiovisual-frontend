"use client";

import { useState } from "react";
import { GlobalModal, Button, Input } from "@/components";
import { useModal } from "@/stores/modal/use-modal-store";
import { useAdmin } from "@/hooks/admin";
import { AdminUserItem } from "@/services/admin-service";
import { KeyRound, Lock, AlertTriangle, Eye, EyeOff } from "lucide-react";

export function ResetPasswordModal() {
  const { open, modalData, closeModal } = useModal();
  const user = modalData["reset-user-password"]?.user as AdminUserItem | undefined;
  const { resetUserPassword, isResettingPassword } = useAdmin();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open["reset-user-password"] || !user) return null;

  const handleClose = () => {
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    closeModal("reset-user-password");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("A nova palavra-passe deve conter pelo menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As palavras-passe introduzidas não coincidem.");
      return;
    }

    try {
      await resetUserPassword({ userId: user.id, newPassword });
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao redefinir palavra-passe.");
    }
  };

  return (
    <GlobalModal
      id="reset-user-password"
      title={
        <span className="flex items-center gap-2 text-foreground font-semibold">
          <KeyRound className="h-5 w-5 text-primary" />
          Redefinir Palavra-passe
        </span>
      }
      description={`Defina uma nova palavra-passe administrativa para ${user.name} (${user.email}).`}
      canClose
      className="max-w-md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isResettingPassword}>
            Cancelar
          </Button>
          <Button
            variant="default"
            size="sm"
            type="submit"
            form="admin-reset-pw-form"
            disabled={isResettingPassword || !newPassword || !confirmPassword}
          >
            {isResettingPassword ? "A redefinir..." : "Confirmar Redefinição"}
          </Button>
        </>
      }
    >
      <form id="admin-reset-pw-form" onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-500 text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Ao redefinir a palavra-passe, todas as sessões ativas deste utilizador em todos os dispositivos serão automaticamente revogadas.
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-xs">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Nova Palavra-passe
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="text-sm pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Confirmar Palavra-passe
          </label>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Repita a palavra-passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="text-sm"
            required
          />
        </div>
      </form>
    </GlobalModal>
  );
}

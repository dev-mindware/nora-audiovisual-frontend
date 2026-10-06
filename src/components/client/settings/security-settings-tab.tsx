'use client';

import { useState } from 'react';
import {
  Button,
  Input,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui';
import { Shield, KeyRound } from 'lucide-react';
import { SessionsPageContent } from './sessions-page-content';
import { toast } from 'sonner';
import { authService } from '@/services/auth-service';
import { getApiErrorMessage } from '@/utils';
import { MfaSettingsCard } from './mfa-settings-card';

export function SecuritySettingsTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('A nova palavra-passe e a confirmação não coincidem.');
      return;
    }
    if (newPassword.length < 15) {
      toast.error('A nova palavra-passe deve ter pelo menos 15 caracteres.');
      return;
    }

    setIsChangingPass(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success('Palavra-passe alterada. As outras sessões foram terminadas.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Falha ao atualizar a palavra-passe.'));
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Segurança da Conta &amp; Acessos
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Gerencie as suas credenciais de segurança, autenticação de dois fatores e sessões ativas.
        </p>
      </div>

      {/* Password Change Card */}
      <form onSubmit={handleChangePassword}>
        <Card className="p-0 gap-0">
          <CardHeader className="p-6 pb-4 border-b border-border flex flex-row items-center gap-2 space-y-0">
            <KeyRound className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold text-foreground">Alterar Palavra-passe</CardTitle>
          </CardHeader>

          <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Palavra-passe Atual</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Nova Palavra-passe</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Confirmar Nova Palavra-passe</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end p-6 pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={isChangingPass}
            >
              {isChangingPass ? 'A atualizar...' : 'Atualizar Palavra-passe'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <MfaSettingsCard />

      {/* Active Sessions */}
      <div className="space-y-3">
        <SessionsPageContent />
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui';
import { useAuthStore } from '@/stores';
import { User, Mail, Phone, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/auth-service';

export function ProfileSettingsTab() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [role] = useState(user?.role || 'PRODUCER');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('O nome completo é obrigatório.');
      return;
    }
    setIsSaving(true);
    try {
      const updatedUser = await authService.updateProfile({ name: name.trim() });
      if (user) {
        setUser({
          ...user,
          name: updatedUser.name || name.trim(),
        });
      }
      toast.success('Perfil atualizado com sucesso!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao atualizar os dados do perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div>
        <h3 className="text-base font-semibold text-foreground">Perfil de Utilizador</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Gerencie as suas informações pessoais e credenciais de contacto na plataforma.
        </p>
      </div>

      <form onSubmit={handleSaveProfile}>
        <Card className="p-0 gap-0">
          {/* Avatar & Identification */}
          <CardHeader className="p-6 pb-4 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xs bg-primary/10 text-primary font-semibold text-lg border border-primary/20">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">{user?.name || 'Utilizador Nora'}</CardTitle>
                <CardDescription className="text-xs">{user?.email || 'email@produtora.ao'}</CardDescription>
                <div className="mt-1">
                  <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-xs uppercase tracking-wider">
                    {user?.role || 'PRODUCER'}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" /> Nome Completo
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Endereço de Email
              </label>
              <Input
                type="email"
                value={email}
                disabled
                className="opacity-70 cursor-not-allowed bg-muted"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Contacto Telefónico
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: +244 923 000 000"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" /> Cargo / Função
              </label>
              <Input
                value={role}
                disabled
                className="opacity-70 cursor-not-allowed bg-muted"
              />
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-end p-6 pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? 'A guardar alterações...' : 'Guardar Alterações'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

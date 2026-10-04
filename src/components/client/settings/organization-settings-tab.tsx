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
import { Building2, FileText, MapPin, Mail, Phone, Globe } from 'lucide-react';
import { toast } from 'sonner';

export function OrganizationSettingsTab() {
  const user = useAuthStore((state) => state.user);
  const activeOrg = user?.activeOrganization || user?.company;

  const orgNameInitial = activeOrg?.name || 'Nora Audiovisual Studio, Lda';
  const nifInitial = (activeOrg && 'taxId' in activeOrg ? activeOrg.taxId : null) || (activeOrg && 'nif' in activeOrg ? (activeOrg as any).nif : null) || '5412345678';
  const addressInitial = (activeOrg && 'address' in activeOrg ? (activeOrg as any).address : null) || 'Luanda, Angola';
  const emailInitial = (activeOrg && 'email' in activeOrg ? (activeOrg as any).email : null) || user?.email || 'contato@produtora.ao';
  const phoneInitial = (activeOrg && 'phone' in activeOrg ? (activeOrg as any).phone : null) || user?.phone || '+244 923 000 000';

  const [orgName, setOrgName] = useState(orgNameInitial);
  const [nif, setNif] = useState(nifInitial);
  const [address, setAddress] = useState(addressInitial);
  const [email, setEmail] = useState(emailInitial);
  const [phone, setPhone] = useState(phoneInitial);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success('Informações da produtora atualizadas com sucesso!');
    } catch {
      toast.error('Erro ao atualizar dados da organização.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div>
        <h3 className="text-base font-semibold text-foreground">Dados da Produtora / Empresa</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Informações corporativas e fiscais utilizadas nos orçamentos, contratos e entregáveis.
        </p>
      </div>

      <form onSubmit={handleSave}>
        <Card className="p-0 gap-0">
          {/* Organization Logo & Identification */}
          <CardHeader className="p-6 pb-4 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xs bg-primary/10 text-primary font-semibold text-lg border border-primary/20">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">{orgName || 'Produtora Audiovisual'}</CardTitle>
                <CardDescription className="text-xs">{email || 'contato@produtora.ao'}</CardDescription>
                <div className="mt-1">
                  <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-xs font-mono uppercase tracking-wider border border-border">
                    NIF: {nif || 'Não definido'}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> Nome Comercial / Razão Social
              </label>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Nome da sua produtora"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" /> NIF Fiscal da Empresa
              </label>
              <Input
                value={nif}
                onChange={(e) => setNif(e.target.value)}
                placeholder="Ex: 5400000000"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Cidade / Província
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Luanda, Angola"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email Corporativo
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="geral@produtora.ao"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Telefone da Empresa
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+244 923 000 000"
              />
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-end p-6 pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? 'A guardar dados...' : 'Guardar Dados da Empresa'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
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
import { Building2, FileText, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { organizationsService } from '@/services/organizations-service';

export function OrganizationSettingsTab() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const activeOrg = user?.activeOrganization || user?.company;
  const orgId = activeOrg?.id;

  const [orgName, setOrgName] = useState(activeOrg?.name || '');
  const [legalName, setLegalName] = useState('');
  const [nif, setNif] = useState(
    (activeOrg && 'taxId' in activeOrg ? (activeOrg as any).taxId : null) || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    let isMounted = true;
    setIsLoading(true);
    organizationsService.getOrganization(orgId)
      .then((data) => {
        if (!isMounted) return;
        if (data.name) setOrgName(data.name);
        if (data.legalName) setLegalName(data.legalName);
        if (data.taxId) setNif(data.taxId);
      })
      .catch((err) => {
        console.warn('Não foi possível obter dados detalhados da organização:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [orgId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) {
      toast.error('Nenhuma organização activa selecionada.');
      return;
    }
    if (!orgName.trim()) {
      toast.error('O nome comercial da produtora é obrigatório.');
      return;
    }
    setIsSaving(true);
    try {
      const updated = await organizationsService.updateOrganization(orgId, {
        name: orgName.trim(),
        legalName: legalName.trim() || undefined,
        taxId: nif.trim() || undefined,
      });

      if (user && activeOrg) {
        setUser({
          ...user,
          activeOrganization: {
            ...activeOrg,
            name: updated.name,
            taxId: updated.taxId,
          } as any,
        });
      }
      toast.success('Informações da produtora atualizadas com sucesso!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao atualizar dados da organização.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div>
        <h3 className="text-base font-semibold text-foreground">Dados da Produtora / Empresa</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Informações corporativas e fiscais oficiais da organização activa na plataforma.
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
                <CardDescription className="text-xs">{legalName || 'Razão Social não definida'}</CardDescription>
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
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> Nome Comercial / Fantasia
              </label>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Ex: Minha Produtora Audiovisual"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Razão Social / Denominação Legal
              </label>
              <Input
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="Ex: Minha Empresa, Lda"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" /> NIF Fiscal
              </label>
              <Input
                value={nif}
                onChange={(e) => setNif(e.target.value)}
                placeholder="Ex: 5400000000"
                disabled={isLoading}
              />
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-end p-6 pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={isSaving || isLoading}
            >
              {isSaving ? 'A guardar dados...' : 'Guardar Dados da Empresa'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}


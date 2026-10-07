'use client';

import { useEffect, useState, useTransition } from 'react';
import { TitleList } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { membersService, OrganizationMemberItem } from '@/services/members-service';
import { useTenantStore } from '@/stores/tenant/tenant-store';
import { parseApiError } from '@/lib/api-error';
import { ErrorMessage, SucessMessage } from '@/utils';
import {
  UserPlus,
  Mail,
  ShieldCheck,
  UserX,
  UserCheck,
  Loader2,
  Users,
  Search,
  X,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

export function TeamPageContent() {
  const { activeOrganization } = useTenantStore();
  const [members, setMembers] = useState<OrganizationMemberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('PRODUCER');
  const [isInviting, setIsInviting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const fetchMembers = async () => {
    if (!activeOrganization?.id) return;
    try {
      setIsLoading(true);
      const data = await membersService.listMembers(activeOrganization.id);
      setMembers(data);
    } catch (err) {
      const parsed = parseApiError(err);
      ErrorMessage(parsed.message || 'Falha ao carregar os membros da equipa.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startTransition(() => {
      fetchMembers();
    });
  }, [activeOrganization?.id]);

  const handleToggleSuspend = async (member: OrganizationMemberItem) => {
    if (!activeOrganization?.id) return;
    try {
      setActionLoadingId(member.id);
      if (member.status === 'ACTIVE') {
        await membersService.suspendMember(activeOrganization.id, member.id);
        SucessMessage(`Acesso de ${member.user?.name || member.user?.email} suspenso.`);
      } else {
        await membersService.reactivateMember(activeOrganization.id, member.id);
        SucessMessage(`Acesso de ${member.user?.name || member.user?.email} reativado.`);
      }
      await fetchMembers();
    } catch (err) {
      const parsed = parseApiError(err);
      ErrorMessage(parsed.message || 'Erro ao alterar o estado do colaborador.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization?.id || !inviteEmail) return;

    try {
      setIsInviting(true);
      await membersService.inviteMember(activeOrganization.id, {
        email: inviteEmail,
      });
      SucessMessage(`Convite enviado com sucesso para ${inviteEmail}.`);
      setInviteEmail('');
      setInviteModalOpen(false);
      await fetchMembers();
    } catch (err) {
      const parsed = parseApiError(err);
      ErrorMessage(parsed.message || 'Erro ao enviar convite.');
    } finally {
      setIsInviting(false);
    }
  };

  const filteredMembers = members
    .filter((m) => m.role?.code !== 'CLIENT')
    .filter((m) => {
      if (!search) return true;
      const term = search.toLowerCase();
      const nameMatch = m.user?.name?.toLowerCase().includes(term);
      const emailMatch = m.user?.email?.toLowerCase().includes(term);
      const roleMatch = m.role?.name?.toLowerCase().includes(term);
      return Boolean(nameMatch || emailMatch || roleMatch);
    });

  return (
    <div className="space-y-6 w-full">
      {/* Cabeçalho */}
      <TitleList
        title="Equipa & Acessos de Produção"
        subtitle="Produtores, directores, gestores de estúdio, operadores e editores com acesso operacional à produtora."
      >
        <Button
          onClick={() => setInviteModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold min-h-[44px] sm:min-h-0 sm:h-9 px-4 uppercase tracking-wide w-full sm:w-auto"
        >
          <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Convidar Membro de Produção
        </Button>
      </TitleList>

      {/* Nota de esclarecimento e separação: Clientes vs Equipa */}
      <div className="rounded-none border border-border/70 bg-muted/20 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
          <span>
            <strong className="text-foreground font-semibold">Clientes Externos:</strong> Os clientes não integram a equipa técnica. Os seus acessos e permissões ao Portal são geridos na carteira de clientes.
          </span>
        </div>
        <a
          href="/crm"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline shrink-0 text-xs py-1"
        >
          <Users className="h-3.5 w-3.5" /> Ir para Clientes &amp; CRM →
        </a>
      </div>

      {/* Barra de Filtro Minimalista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Procurar membro por nome ou email..."
            className="pl-9 h-11 sm:h-10 text-base sm:text-xs rounded-none border-border bg-background"
          />
          {Boolean(search) && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center sm:min-h-0 sm:min-w-0"
              aria-label="Limpar pesquisa"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          {filteredMembers.length} {filteredMembers.length === 1 ? 'colaborador' : 'colaboradores'}
        </span>
      </div>

      {/* Lista Minimalista de Membros */}
      <div className="rounded-none border border-border/70 bg-card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border/50">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted/40" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-44 bg-muted/40" />
                    <div className="h-3 w-32 bg-muted/20" />
                  </div>
                </div>
                <div className="h-7 w-20 bg-muted/30" />
              </div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-foreground">Nenhum membro encontrado</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {search
                ? 'Nenhum colaborador corresponde aos termos de pesquisa.'
                : 'Adicione os primeiros membros da equipa técnica ou de produção.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredMembers.map((member) => {
              const roleCode = member.role?.code || 'MEMBER';
              const isOwner = roleCode === 'OWNER';
              const isActive = member.status === 'ACTIVE';
              const isSuspended = member.status === 'SUSPENDED';
              const isActing = actionLoadingId === member.id;

              const initials = (member.user?.name || member.user?.email || 'U')
                .split(' ')
                .map((n: string) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-border/70 bg-muted/40 font-mono text-xs font-semibold text-foreground">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tracking-tight text-foreground">
                          {member.user?.name || 'Membro Convidado'}
                        </span>
                        <Badge
                          variant="outline"
                          className={`rounded-none text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 ${
                            isOwner
                              ? 'border-primary/30 bg-primary/10 text-primary font-semibold'
                              : 'border-border/70 bg-muted/30 text-muted-foreground'
                          }`}
                        >
                          {isOwner ? <ShieldCheck className="mr-1 h-3 w-3 inline" /> : null}
                          {member.role?.name || roleCode}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1 font-mono">
                          <Mail className="h-3 w-3 text-muted-foreground/70" />
                          {member.user?.email}
                        </span>
                        <span>•</span>
                        <span className="font-mono flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground/70" />
                          Ingresso: {member.joinedAt ? format(new Date(member.joinedAt), 'dd/MM/yyyy') : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Badge
                      variant="outline"
                      className={`rounded-none text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 ${
                        isActive
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : isSuspended
                            ? 'border-destructive/30 bg-destructive/10 text-destructive'
                            : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isActive ? 'Activo' : isSuspended ? 'Suspenso' : 'Convidado'}
                    </Badge>

                    {isOwner ? (
                      <span className="text-xs text-muted-foreground italic px-2">
                        Titular da Conta
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isActing}
                        onClick={() => handleToggleSuspend(member)}
                        className={`rounded-none text-xs min-h-[38px] sm:min-h-0 sm:h-8 px-3 border-border ${
                          member.status === 'ACTIVE'
                            ? 'text-destructive hover:bg-destructive/10'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        {isActing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : member.status === 'ACTIVE' ? (
                          <>
                            <UserX className="mr-1.5 h-3.5 w-3.5" /> Suspender
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-1.5 h-3.5 w-3.5" /> Reactivar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Convidar */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-card border-t sm:border border-border rounded-t-lg sm:rounded-none p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="text-base font-semibold tracking-tight text-foreground">Convidar Membro de Produção</h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Fechar modal"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              O profissional receberá um convite por correio electrónico para integrar a equipa da produtora no Nora Audiovisual.
            </p>

            <form onSubmit={handleInvite} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Correio Electrónico Profissional</label>
                <input
                  type="email"
                  placeholder="colaborador@produtora.ao"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full h-11 sm:h-10 px-3.5 rounded-none border border-border bg-background text-foreground text-base sm:text-sm focus:outline-none focus:border-foreground"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Função na Equipa / Perfil Operacional</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full h-11 sm:h-10 px-3.5 rounded-none border border-border bg-background text-foreground text-base sm:text-sm focus:outline-none focus:border-foreground"
                >
                  <option value="PRODUCER">Produtor Executivo (PRODUCER)</option>
                  <option value="MANAGER">Gestor de Operações (MANAGER)</option>
                  <option value="FINANCE">Financeiro &amp; Facturação (FINANCE)</option>
                  <option value="EDITOR">Editor / Pós-Produção (EDITOR)</option>
                  <option value="CREW">Equipa Técnica / Rodagem (CREW)</option>
                </select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setInviteModalOpen(false)}
                  className="rounded-none text-xs border-border min-h-[44px] sm:min-h-0 sm:h-9 w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isInviting}
                  className="rounded-none text-xs font-medium min-h-[44px] sm:min-h-0 sm:h-9 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> A enviar...
                    </>
                  ) : (
                    'Enviar Convite'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



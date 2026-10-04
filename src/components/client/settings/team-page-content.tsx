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

  const filteredMembers = members.filter((m) => {
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
        subtitle="Produtores, gestores de estúdio, operadores e editores com acesso à organização."
      >
        <Button
          onClick={() => setInviteModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-9 px-4 uppercase tracking-wide"
        >
          <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Convidar Membro
        </Button>
      </TitleList>

      {/* Barra de Filtro Minimalista */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Procurar membro por nome ou email..."
            className="pl-9 h-10 text-xs rounded-none border-border bg-background"
          />
          {Boolean(search) && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs text-muted-foreground font-mono hidden sm:inline-block">
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
                      {isActive ? 'Ativo' : isSuspended ? 'Suspenso' : 'Convidado'}
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
                        className={`rounded-none text-xs h-8 px-3 border-border ${
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
                            <UserCheck className="mr-1.5 h-3.5 w-3.5" /> Reativar
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-none p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="text-base font-semibold tracking-tight text-foreground">Convidar Colaborador</h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              O convidado receberá um convite por email com link para aceder à produtora no Nora Audiovisual.
            </p>

            <form onSubmit={handleInvite} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Email Profissional</label>
                <input
                  type="email"
                  placeholder="colaborador@estudio.ao"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-none border border-border bg-background text-foreground text-sm focus:outline-none focus:border-foreground"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Função / Perfil</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-none border border-border bg-background text-foreground text-sm focus:outline-none focus:border-foreground"
                >
                  <option value="PRODUCER">Produtor Executivo (PRODUCER)</option>
                  <option value="MANAGER">Gestor de Operações (MANAGER)</option>
                  <option value="FINANCE">Financeiro & Faturação (FINANCE)</option>
                  <option value="EDITOR">Editor / Pós-Produção (EDITOR)</option>
                  <option value="CREW">Equipa Técnica / Set (CREW)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setInviteModalOpen(false)}
                  className="rounded-none text-xs border-border h-9"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isInviting}
                  className="rounded-none text-xs font-medium h-9 bg-primary text-primary-foreground hover:bg-primary/90"
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

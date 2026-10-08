'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import {
  useProject,
  useProjectMembers,
  useProjectCallSheets,
  useProjectKanban,
  useRemoveProjectMember,
} from '@/hooks/projects';
import { useProjectDeliverables } from '@/hooks/deliverables';
import {
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui';
import { EmptyState, ItemStatusBadge, DynamicMetricCard, UniversalTable } from '@/components';
import { CallSheetModal } from './call-sheet-modal';
import { MemberModal } from './member-modal';
import { DeliverableModal } from '@/components/client/deliverables/deliverable-modal';
import { RecordExpenseModal, RecordPaymentModal } from '@/components/client/finance';
import {
  useExpenses,
  usePayments,
  useProjectFinancialSummary,
  useApproveExpense,
  useRejectExpense,
} from '@/hooks/finance';
import { CallSheet, ProductionStage, ProjectLifecycleStatus, ProjectMember, Expense } from '@/types';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Film,
  FileText,
  Video,
  Plus,
  Trash2,
  ExternalLink,
  Printer,
  Kanban,
  Info,
  DollarSign,
  Receipt,
  Check,
  X,
  TrendingUp,
} from 'lucide-react';

const STAGE_LABELS: Record<ProductionStage, { label: string; color: string }> = {
  PRE_PRODUCTION: { label: 'Pré-Produção', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  PRODUCTION: { label: 'Rodagem / Produção', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  POST_PRODUCTION: { label: 'Pós-Produção', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
  REVIEW: { label: 'Revisão Técnica', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  DELIVERED: { label: 'Finalizado & Entregue', color: 'bg-muted text-muted-foreground border-border' },
};

interface ProjectDetailPageContentProps {
  projectId: string;
}

export function ProjectDetailPageContent({ projectId }: ProjectDetailPageContentProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Modals state
  const [isCallSheetModalOpen, setIsCallSheetModalOpen] = useState(false);
  const [selectedCallSheet, setSelectedCallSheet] = useState<CallSheet | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState(false);
  const [isProjectExpenseModalOpen, setIsProjectExpenseModalOpen] = useState(false);
  const [isProjectPaymentModalOpen, setIsProjectPaymentModalOpen] = useState(false);

  // Data fetching
  const { data: project } = useProject(projectId);
  const { data: members = [] } = useProjectMembers(projectId);
  const { data: callSheets = [] } = useProjectCallSheets(projectId);
  const { data: deliverables = [] } = useProjectDeliverables(projectId);
  const { data: kanbanData } = useProjectKanban(projectId);
  const { mutateAsync: removeMember } = useRemoveProjectMember(projectId);

  // Finance Data
  const { data: projectExpenses = [], isLoading: loadingExpenses } = useExpenses(projectId);
  const { data: projectPayments = [] } = usePayments(projectId);
  const { data: financialSummary } = useProjectFinancialSummary(projectId);
  const { mutateAsync: approveExpense } = useApproveExpense();
  const { mutateAsync: rejectExpense } = useRejectExpense();

  // Definições de Colunas para UniversalTable
  const callSheetColumns: ColumnDef<CallSheet>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Título / Dia',
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">{row.original.title}</span>
        ),
      },
      {
        accessorKey: 'shootDate',
        header: 'Data de Rodagem',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {new Date(row.original.shootDate).toLocaleDateString('pt-PT', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        ),
      },
      {
        accessorKey: 'generalCallTime',
        header: 'Chamada Geral',
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-primary">{row.original.generalCallTime}</span>
        ),
      },
      {
        accessorKey: 'location',
        header: 'Set / Localização',
        cell: ({ row }) => (
          <span className="text-muted-foreground truncate max-w-xs block">{row.original.location}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => <ItemStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Ações</div>,
        cell: ({ row }) => {
          const cs = row.original;
          return (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCallSheet(cs);
                  setIsCallSheetModalOpen(true);
                }}
                className="h-8 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Printer className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                Ver / Imprimir
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  const memberColumns: ColumnDef<ProjectMember>[] = useMemo(
    () => [
      {
        accessorKey: 'userName',
        header: 'Profissional',
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="flex items-center gap-2.5 font-semibold text-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {m.userName ? m.userName.substring(0, 2).toUpperCase() : 'AU'}
              </div>
              <span>{m.userName || 'Membro da Equipa'}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'userEmail',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.userEmail || '—'}</span>
        ),
      },
      {
        accessorKey: 'projectRole',
        header: 'Função Audiovisual',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="bg-muted text-foreground border-border font-medium"
          >
            {row.original.projectRole}
          </Badge>
        ),
      },
      {
        accessorKey: 'joinedAt',
        header: 'Escalado em',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.joinedAt ? new Date(row.original.joinedAt).toLocaleDateString('pt-PT') : '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Acção</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeMember(row.original.id)}
              className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Remover membro"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [removeMember]
  );

  const expenseColumns: ColumnDef<Expense>[] = useMemo(
    () => [
      {
        accessorKey: 'date',
        header: 'Data',
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground whitespace-nowrap">
            {new Date(row.original.date).toLocaleDateString('pt-AO')}
          </span>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Categoria',
        cell: ({ row }) => (
          <span className="inline-block px-2 py-0.5 text-[10px] font-mono rounded-md border border-border bg-muted/40">
            {row.original.category}
          </span>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Descrição',
        cell: ({ row }) => <span className="text-foreground">{row.original.description}</span>,
      },
      {
        accessorKey: 'receiptUrl',
        header: 'Comprovativo',
        cell: ({ row }) => {
          const url = row.original.receiptUrl;
          return url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline flex items-center gap-1 text-[11px]"
            >
              <ExternalLink className="h-3 w-3" /> Ver Recibo
            </a>
          ) : (
            <span className="text-muted-foreground/60">—</span>
          );
        },
      },
      {
        accessorKey: 'amount',
        header: () => <div className="text-right">Valor (AOA)</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono font-semibold text-foreground">
            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(row.original.amount))}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: () => <div className="text-center">Estado</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <ItemStatusBadge status={row.original.status} />
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Acção</div>,
        cell: ({ row }) => {
          const exp = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              {exp.status === 'PENDING' ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => approveExpense(exp.id)}
                    className="h-7 px-2.5 text-xs border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 gap-1"
                  >
                    <Check className="h-3 w-3" /> Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectExpense({ expenseId: exp.id })}
                    className="h-7 px-2.5 text-xs border-rose-500/40 text-rose-600 hover:bg-rose-500/10 gap-1"
                  >
                    <X className="h-3 w-3" /> Rejeitar
                  </Button>
                </>
              ) : (
                <span className="text-xs text-muted-foreground font-mono">Processado</span>
              )}
            </div>
          );
        },
      },
    ],
    [approveExpense, rejectExpense]
  );

  const stageConfig = project?.productionStage
    ? STAGE_LABELS[project.productionStage] || { label: project.productionStage, color: 'bg-muted' }
    : { label: 'Pré-Produção', color: 'bg-muted' };

  return (
    <div className="space-y-6">
      {/* Cabeçalho Padronizado da Produção */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {project?.title || 'Detalhes do Projecto'}
            </h1>
            <Badge variant="outline" className={`font-medium text-xs ${stageConfig.color}`}>
              {stageConfig.label}
            </Badge>
            {project?.lifecycleStatus && (
              <ItemStatusBadge status={project.lifecycleStatus} />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Cliente: <span className="font-semibold text-foreground">{project?.clientName || 'Cliente Direto'}</span>
            {project?.startDate && (
              <> • Início: <span className="font-semibold text-foreground">{new Date(project.startDate).toLocaleDateString('pt-PT')}</span></>
            )}
            {project?.endDate && (
              <> • Entrega: <span className="font-semibold text-foreground">{new Date(project.endDate).toLocaleDateString('pt-PT')}</span></>
            )}
          </p>
        </div>

        {/* Botões de Ação Padronizados */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => {
              setSelectedCallSheet(null);
              setIsCallSheetModalOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Nova Call Sheet
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMemberModalOpen(true)}
          >
            <Users className="mr-1.5 h-3.5 w-3.5 text-primary" /> Escalar Membro
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsDeliverableModalOpen(true)}
          >
            <Video className="mr-1.5 h-3.5 w-3.5 text-purple-600" /> Gerar Entregável
          </Button>
        </div>
      </div>

      {/* Tabs Padrões Radix / shadcn */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="border-b border-border pb-1 overflow-x-auto">
          <TabsList className="bg-transparent h-auto p-0 gap-1.5 flex flex-nowrap justify-start border-none">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none text-xs gap-2 py-2 px-3.5 rounded-lg font-medium"
            >
              <Film className="h-4 w-4" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="call-sheets"
              className="data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none text-xs gap-2 py-2 px-3.5 rounded-lg font-medium"
            >
              <Clock className="h-4 w-4" /> Folhas de Rodagem ({callSheets.length})
            </TabsTrigger>
            <TabsTrigger
              value="crew"
              className="data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none text-xs gap-2 py-2 px-3.5 rounded-lg font-medium"
            >
              <Users className="h-4 w-4" /> Equipa & Crew ({members.length})
            </TabsTrigger>
            <TabsTrigger
              value="deliverables"
              className="data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none text-xs gap-2 py-2 px-3.5 rounded-lg font-medium"
            >
              <Video className="h-4 w-4" /> Entregáveis ({deliverables.length})
            </TabsTrigger>
            <TabsTrigger
              value="kanban"
              className="data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none text-xs gap-2 py-2 px-3.5 rounded-lg font-medium"
            >
              <Kanban className="h-4 w-4" /> Quadro Kanban
            </TabsTrigger>
            <TabsTrigger
              value="finance"
              className="data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none text-xs gap-2 py-2 px-3.5 rounded-lg font-medium"
            >
              <DollarSign className="h-4 w-4" /> Custos & Finanças ({projectExpenses.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Visão Geral (Overview) */}
        <TabsContent value="overview" className="space-y-6 m-0 outline-none">
          {/* Key Metric Counters Padronizados */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DynamicMetricCard
              subtitle="Folhas de Rodagem"
              title={callSheets.length}
              icon="Clock"
              description="Dias de set programados"
            />
            <DynamicMetricCard
              subtitle="Equipa Escalada"
              title={members.length}
              icon="Users"
              description="Profissionais activos no projecto"
            />
            <DynamicMetricCard
              subtitle="Pacotes Entregáveis"
              title={deliverables.length}
              icon="Video"
              description="Versões e copiões de revisão"
            />
          </div>

          {/* Description & Production Briefing */}
          <Card className="p-6 shadow-xs">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" /> Briefing & Notas de Produção
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {project?.description ||
                'Nenhuma descrição detalhada fornecida para este projecto. Utilize o briefing para alinhar directrizes de direcção, referências estéticas e notas técnicas do cliente.'}
            </p>
          </Card>

          {/* Next Steps / Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              onClick={() => {
                setSelectedCallSheet(null);
                setIsCallSheetModalOpen(true);
              }}
              className="group cursor-pointer p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Clock className="h-5 w-5" />
              </div>
              <h4 className="mt-4 font-semibold text-foreground">Criar Folha de Rodagem</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Escalone horários de chamada (crew call), localização do set e contactos de emergência.
              </p>
            </Card>

            <Card
              onClick={() => setIsMemberModalOpen(true)}
              className="group cursor-pointer p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Users className="h-5 w-5" />
              </div>
              <h4 className="mt-4 font-semibold text-foreground">Escalar Equipa Técnica</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Atribua Director de Fotografia, Gaffer, Técnico de Som e Produtores ao projecto.
              </p>
            </Card>

            <Card
              onClick={() => setIsDeliverableModalOpen(true)}
              className="group cursor-pointer p-5 shadow-xs hover:border-purple-400 hover:shadow-md transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Video className="h-5 w-5" />
              </div>
              <h4 className="mt-4 font-semibold text-foreground">Gerar Copião de Revisão</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Empacote versões de vídeo para revisão com timecode e link protegido do cliente.
              </p>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Folhas de Rodagem (Call Sheets) */}
        <TabsContent value="call-sheets" className="space-y-4 m-0 outline-none">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Folhas de Rodagem (Call Sheets)</h2>
              <p className="text-xs text-muted-foreground">
                Cronogramas oficiais diários de rodagem, chamadas de equipa e procedimentos de segurança.
              </p>
            </div>
            <Button
              onClick={() => {
                setSelectedCallSheet(null);
                setIsCallSheetModalOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Criar Folha de Rodagem
            </Button>
          </div>

          <UniversalTable<CallSheet>
            columns={callSheetColumns}
            data={callSheets}
            searchPlaceholder="Pesquisar folha de rodagem..."
            searchKey="title"
            emptyState={{
              title: 'Nenhuma folha de rodagem',
              description: 'Cronogramas oficiais diários de rodagem, chamadas de equipa e procedimentos de segurança ainda não foram criados.',
              action: (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedCallSheet(null);
                    setIsCallSheetModalOpen(true);
                  }}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Criar Folha de Rodagem
                </Button>
              ),
            }}
          />
        </TabsContent>

        {/* Tab 3: Equipa & Crew */}
        <TabsContent value="crew" className="space-y-4 m-0 outline-none">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Equipa e Escalação Técnica</h2>
              <p className="text-xs text-muted-foreground">
                Profissionais associados a este projecto com funções especializadas na produção.
              </p>
            </div>
            <Button
              onClick={() => setIsMemberModalOpen(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Escalar Profissional
            </Button>
          </div>

          <UniversalTable<ProjectMember>
            columns={memberColumns}
            data={members}
            searchPlaceholder="Pesquisar profissional por nome..."
            searchKey="userName"
            emptyState={{
              title: 'Nenhum membro escalado',
              description: 'Adicione profissionais e funções técnicas especializadas para esta produção (Director de Fotografia, Gaffer, Som, etc.).',
              action: (
                <Button
                  size="sm"
                  onClick={() => setIsMemberModalOpen(true)}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Escalar Profissional
                </Button>
              ),
            }}
          />
        </TabsContent>

        {/* Tab 4: Entregáveis & Copiões */}
        <TabsContent value="deliverables" className="space-y-6 m-0 outline-none">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Video className="h-4 w-4 text-purple-600" /> Pacotes de Entregáveis / Copiões de Revisão
                </h3>
                <p className="text-xs text-muted-foreground">
                  Versões estruturadas para aprovação com cliente, notas por timecode e link seguro.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsDeliverableModalOpen(true)}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Gerar Entregável
              </Button>
            </div>

            {deliverables.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deliverables.map((d) => (
                  <Card
                    key={d.id}
                    className="flex flex-col justify-between p-5 shadow-xs hover:border-purple-400 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-semibold"
                        >
                          Versão {d.version || 1} • {d.type || 'ROUGH_CUT'}
                        </Badge>
                        <ItemStatusBadge status={d.status || 'PENDING'} />
                      </div>
                      <h4 className="mt-3 text-base font-semibold text-foreground">{d.title}</h4>
                      {d.feedbackNotes && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{d.feedbackNotes}</p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Criado em {new Date(d.createdAt).toLocaleDateString('pt-PT')}
                      </span>
                      <Link href={`/deliverables?projectId=${projectId}&deliverableId=${d.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-border text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                        >
                          <Video className="mr-1.5 h-3.5 w-3.5" /> Abrir Leitor de Revisão
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="Video"
                title="Nenhum entregável gerado"
                description="Crie pacotes de copiões de revisão ou cortes finais com timecode para aprovação do cliente."
                action={
                  <Button
                    size="sm"
                    onClick={() => setIsDeliverableModalOpen(true)}
                    className="bg-purple-600 text-white hover:bg-purple-700"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Gerar Entregável
                  </Button>
                }
              />
            )}
          </div>
        </TabsContent>

        {/* Tab 5: Quadro Kanban */}
        <TabsContent value="kanban" className="space-y-4 m-0 outline-none">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Quadro de Produção Audiovisual</h2>
              <p className="text-xs text-muted-foreground">
                Acompanhamento ágil de tarefas dividido por departamentos técnicos (Câmara, Som, Arte, Edição).
              </p>
            </div>
            <Link href={`/kanban?projectId=${projectId}`}>
              <Button>
                <ExternalLink className="mr-2 h-4 w-4" /> Abrir Kanban em Ecrã Completo
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((statusKey) => {
              const columnTitle =
                statusKey === 'TODO'
                  ? 'A Fazer'
                  : statusKey === 'IN_PROGRESS'
                    ? 'Em Rodagem'
                    : statusKey === 'REVIEW'
                      ? 'Revisão Técnica'
                      : 'Concluído';

              const tasksInColumn =
                kanbanData?.columns?.[statusKey] ||
                kanbanData?.tasks?.filter((t) => t.status === statusKey) ||
                [];

              return (
                <Card
                  key={statusKey}
                  className="p-4 space-y-3 min-h-[350px] shadow-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      {columnTitle}
                    </span>
                    <Badge variant="outline" className="bg-muted text-foreground text-xs font-semibold border-border">
                      {tasksInColumn.length}
                    </Badge>
                  </div>

                  <div className="space-y-2.5">
                    {tasksInColumn.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-xl border border-border bg-card p-3 shadow-xs hover:border-primary/40 transition-all"
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-foreground">{task.title}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border text-[11px] text-muted-foreground">
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal border-border">
                            {task.department}
                          </Badge>
                          {task.assigneeName && <span>{task.assigneeName}</span>}
                        </div>
                      </div>
                    ))}
                    {tasksInColumn.length === 0 && (
                      <div className="py-8 text-center text-xs text-muted-foreground italic">
                        Sem tarefas nesta coluna.
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 6: Custos & Despesas de Produção */}
        <TabsContent value="finance" className="space-y-6 m-0 outline-none">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">Custos Reais de Produção & Margem</h3>
              <p className="text-xs text-muted-foreground">Despesas de rodagem efectuadas no terreno e margem consolidada do projecto.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsProjectPaymentModalOpen(true)}
                className="text-xs h-8 gap-1.5"
              >
                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                Registar Recebimento
              </Button>
              <Button
                size="sm"
                onClick={() => setIsProjectExpenseModalOpen(true)}
                className="text-xs h-8 gap-1.5 font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                Lançar Despesa
              </Button>
            </div>
          </div>

          {/* KPI Cards Padronizados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DynamicMetricCard
              subtitle="Receita Facturada / Orçada"
              title={new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(financialSummary?.totalRevenue || 0))}
              icon="TrendingUp"
              description="Valor recebido ou aprovado em proposta"
            />
            <DynamicMetricCard
              subtitle="Total Despesas de Campo"
              title={new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(financialSummary?.totalExpenses || 0))}
              icon="Receipt"
              colors="destructive"
              variant="action"
              description="Catering, combustível, alugueres e diárias"
            />
            <DynamicMetricCard
              subtitle="Margem Efectiva"
              title={new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(financialSummary?.actualMargin || 0))}
              icon="DollarSign"
              trend={financialSummary?.actualMarginPercent !== undefined ? { percent: financialSummary.actualMarginPercent, label: 'Rentabilidade' } : undefined}
              description={financialSummary ? `Rentabilidade: ${financialSummary.actualMarginPercent}%` : 'Rentabilidade apurada'}
            />
          </div>

          {/* Expenses Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Despesas Registadas ({projectExpenses.length})
            </h4>

            <UniversalTable<Expense>
              columns={expenseColumns}
              data={projectExpenses}
              isLoading={loadingExpenses}
              searchPlaceholder="Pesquisar despesa por descrição..."
              searchKey="description"
              emptyState={{
                title: 'Nenhuma despesa de campo registada',
                description: 'Lance custos de alimentação, transporte e diárias de rodagem para calcular a rentabilidade da produção.',
                action: (
                  <Button
                    size="sm"
                    onClick={() => setIsProjectExpenseModalOpen(true)}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Lançar Despesa
                  </Button>
                ),
              }}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CallSheetModal
        isOpen={isCallSheetModalOpen}
        onClose={() => {
          setIsCallSheetModalOpen(false);
          setSelectedCallSheet(null);
        }}
        projectId={projectId}
        projectTitle={project?.title}
        viewCallSheet={selectedCallSheet}
      />

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        projectId={projectId}
      />

      <DeliverableModal
        isOpen={isDeliverableModalOpen}
        onClose={() => setIsDeliverableModalOpen(false)}
        defaultProjectId={projectId}
      />

      <RecordExpenseModal
        isOpen={isProjectExpenseModalOpen}
        onClose={() => setIsProjectExpenseModalOpen(false)}
        defaultProjectId={projectId}
      />

      <RecordPaymentModal
        isOpen={isProjectPaymentModalOpen}
        onClose={() => setIsProjectPaymentModalOpen(false)}
        defaultProjectId={projectId}
      />
    </div>
  );
}

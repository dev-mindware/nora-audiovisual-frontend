'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useProject,
  useProjectMembers,
  useProjectCallSheets,
  useProjectKanban,
  useMoveTask,
  useRemoveProjectMember,
} from '@/hooks/projects';
import { useFiles } from '@/hooks/files';
import { useProjectDeliverables } from '@/hooks/deliverables';
import { Button, Badge } from '@/components/ui';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
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
import { CallSheet, ProductionStage, ProjectLifecycleStatus } from '@/types';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Film,
  FileText,
  Video,
  Plus,
  Trash2,
  Download,
  Upload,
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

const STATUS_LABELS: Record<ProjectLifecycleStatus, { label: string; color: string }> = {
  LEAD: { label: 'Lead / Proposta', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30' },
  PLANNING: { label: 'Planeamento', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  ACTIVE: { label: 'Em Execução Ativa', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  COMPLETED: { label: 'Concluído', color: 'bg-muted text-muted-foreground border-border' },
  CANCELLED: { label: 'Cancelado', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' },
  ARCHIVED: { label: 'Arquivado', color: 'bg-muted text-muted-foreground border-border' },
};

interface ProjectDetailPageContentProps {
  projectId: string;
}

export function ProjectDetailPageContent({ projectId }: ProjectDetailPageContentProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'call-sheets' | 'crew' | 'files' | 'kanban' | 'finance'>('overview');

  // Modals state
  const [isCallSheetModalOpen, setIsCallSheetModalOpen] = useState(false);
  const [selectedCallSheet, setSelectedCallSheet] = useState<CallSheet | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState(false);
  const [isProjectExpenseModalOpen, setIsProjectExpenseModalOpen] = useState(false);
  const [isProjectPaymentModalOpen, setIsProjectPaymentModalOpen] = useState(false);
  const [fileCategoryFilter, setFileCategoryFilter] = useState<string>('ALL');

  // Data fetching
  const { data: project, isLoading: loadingProject } = useProject(projectId);
  const { data: members = [], isLoading: loadingMembers } = useProjectMembers(projectId);
  const { data: callSheets = [], isLoading: loadingCallSheets } = useProjectCallSheets(projectId);
  const { files = [], isLoading: loadingFiles, uploadFile, isUploading, deleteFile } = useFiles(projectId);
  const { data: deliverables = [], isLoading: loadingDeliverables } = useProjectDeliverables(projectId);
  const { data: kanbanData } = useProjectKanban(projectId);
  const { mutateAsync: removeMember } = useRemoveProjectMember(projectId);

  // Finance Data
  const { data: projectExpenses = [], isLoading: loadingExpenses } = useExpenses(projectId);
  const { data: projectPayments = [] } = usePayments(projectId);
  const { data: financialSummary } = useProjectFinancialSummary(projectId);
  const { mutateAsync: approveExpense } = useApproveExpense();
  const { mutateAsync: rejectExpense } = useRejectExpense();

  const stageConfig = project?.productionStage
    ? STAGE_LABELS[project.productionStage] || { label: project.productionStage, color: 'bg-muted' }
    : { label: 'Pré-Produção', color: 'bg-muted' };

  const statusConfig = project?.lifecycleStatus
    ? STATUS_LABELS[project.lifecycleStatus] || { label: project.lifecycleStatus, color: 'bg-muted' }
    : { label: 'Em Curso', color: 'bg-muted' };

  const filteredFiles = files.filter((f) => {
    if (fileCategoryFilter === 'ALL') return true;
    return f.category === fileCategoryFilter;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    let category = 'DOCUMENT';
    if (file.type.startsWith('video/')) category = 'VIDEO_PROXY';
    else if (file.type.startsWith('audio/')) category = 'AUDIO';
    else if (file.name.endsWith('.pdf')) category = 'SCRIPT';

    await uploadFile({ file, category });
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar aos Projetos
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {project?.title || 'Detalhes do Projeto'}
            </h1>
            <Badge variant="outline" className={`font-semibold ${stageConfig.color}`}>
              {stageConfig.label}
            </Badge>
            <Badge variant="outline" className={`font-semibold ${statusConfig.color}`}>
              {statusConfig.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Cliente: <span className="font-semibold text-foreground">{project?.clientName || 'Cliente Direto'}</span>
            {project?.startDate && (
              <>
                {' '}• Início:{' '}
                <span className="font-semibold text-foreground">
                  {new Date(project.startDate).toLocaleDateString('pt-PT')}
                </span>
              </>
            )}
            {project?.endDate && (
              <>
                {' '}• Entrega:{' '}
                <span className="font-semibold text-foreground">
                  {new Date(project.endDate).toLocaleDateString('pt-PT')}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Global Hub Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setSelectedCallSheet(null);
              setIsCallSheetModalOpen(true);
            }}
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Nova Call Sheet
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMemberModalOpen(true)}
            className="rounded-xl border-border text-foreground hover:bg-muted"
          >
            <Users className="mr-1.5 h-3.5 w-3.5 text-primary" /> Escalar Membro
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsDeliverableModalOpen(true)}
            className="rounded-xl border-border text-foreground hover:bg-muted"
          >
            <Video className="mr-1.5 h-3.5 w-3.5 text-purple-600" /> Gerar Entregável
          </Button>
        </div>
      </div>

      {/* Operational Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          <Film className="h-4 w-4" /> Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('call-sheets')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === 'call-sheets'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          <Clock className="h-4 w-4" /> Folhas de Rodagem ({callSheets.length})
        </button>
        <button
          onClick={() => setActiveTab('crew')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === 'crew'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          <Users className="h-4 w-4" /> Equipa & Crew ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === 'files'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          <FileText className="h-4 w-4" /> Arquivos & Entregáveis ({files.length + deliverables.length})
        </button>
        <button
          onClick={() => setActiveTab('kanban')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === 'kanban'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          <Kanban className="h-4 w-4" /> Quadro Kanban
        </button>
        <button
          onClick={() => setActiveTab('finance')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === 'finance'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          <DollarSign className="h-4 w-4" /> Custos & Despesas ({projectExpenses.length})
        </button>
      </div>

      {/* Tab 1: Visão Geral (Overview) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Folhas de Rodagem
              </span>
              <p className="mt-2 text-2xl font-semibold text-foreground">{callSheets.length}</p>
              <span className="text-xs text-muted-foreground">Dias de set programados</span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Equipa Escalada
              </span>
              <p className="mt-2 text-2xl font-semibold text-foreground">{members.length}</p>
              <span className="text-xs text-muted-foreground">Profissionais ativos no projeto</span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Ficheiros no Bucket
              </span>
              <p className="mt-2 text-2xl font-semibold text-foreground">{files.length}</p>
              <span className="text-xs text-muted-foreground">Guiões, áudios e proxies</span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Pacotes Entregáveis
              </span>
              <p className="mt-2 text-2xl font-semibold text-purple-600 dark:text-purple-400">{deliverables.length}</p>
              <span className="text-xs text-muted-foreground">Versões com timecode</span>
            </div>
          </div>

          {/* Description & Production Briefing */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" /> Briefing & Notas de Produção
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {project?.description ||
                'Nenhuma descrição detalhada fornecida para este projeto. Utilize o briefing para alinhar diretrizes de direção, referências estéticas e notas técnicas do cliente.'}
            </p>
          </div>

          {/* Next Steps / Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => {
                setSelectedCallSheet(null);
                setIsCallSheetModalOpen(true);
              }}
              className="group cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Clock className="h-5 w-5" />
              </div>
              <h4 className="mt-4 font-semibold text-foreground">Criar Folha de Rodagem</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Escalone horários de chamada (crew call), localização do set e contatos de emergência.
              </p>
            </div>

            <div
              onClick={() => setIsMemberModalOpen(true)}
              className="group cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Users className="h-5 w-5" />
              </div>
              <h4 className="mt-4 font-semibold text-foreground">Escalar Equipa Técnica</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Atribua Diretor de Fotografia, Gaffer, Técnico de Som e Produtores ao projeto.
              </p>
            </div>

            <div
              onClick={() => setIsDeliverableModalOpen(true)}
              className="group cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-purple-400 hover:shadow-md transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Video className="h-5 w-5" />
              </div>
              <h4 className="mt-4 font-semibold text-foreground">Gerar Copião de Revisão</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Empacote versões de vídeo para revisão com timecode e link protegido do cliente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Folhas de Rodagem (Call Sheets) */}
      {activeTab === 'call-sheets' && (
        <div className="space-y-4">
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
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Criar Folha de Rodagem
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 font-semibold text-muted-foreground hover:bg-muted/50">
                  <TableHead className="px-5 py-3.5">Título / Dia</TableHead>
                  <TableHead className="px-5 py-3.5">Data de Rodagem</TableHead>
                  <TableHead className="px-5 py-3.5">Chamada Geral</TableHead>
                  <TableHead className="px-5 py-3.5">Set / Localização</TableHead>
                  <TableHead className="px-5 py-3.5">Estado</TableHead>
                  <TableHead className="px-5 py-3.5 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {callSheets.length > 0 ? (
                  callSheets.map((cs) => (
                    <TableRow key={cs.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="px-5 py-4 font-semibold text-foreground">{cs.title}</TableCell>
                      <TableCell className="px-5 py-4 text-muted-foreground">
                        {new Date(cs.shootDate).toLocaleDateString('pt-PT', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="px-5 py-4 font-mono font-semibold text-primary">{cs.generalCallTime}</TableCell>
                      <TableCell className="px-5 py-4 text-muted-foreground truncate max-w-xs">{cs.location}</TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className={
                            cs.status === 'PUBLISHED'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          }
                        >
                          {cs.status === 'PUBLISHED' ? 'PUBLICADA' : 'RASCUNHO'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right">
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
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                      Nenhuma folha de rodagem criada ainda. Clique em &ldquo;Criar Folha de Rodagem&rdquo; para iniciar o plano do set.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Tab 3: Equipa & Crew */}
      {activeTab === 'crew' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Equipa e Escalação Técnica</h2>
              <p className="text-xs text-muted-foreground">
                Profissionais associados a este projeto com funções especializadas na produção.
              </p>
            </div>
            <Button
              onClick={() => setIsMemberModalOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Escalar Profissional
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 font-semibold text-muted-foreground hover:bg-muted/50">
                  <TableHead className="px-5 py-3.5">Profissional</TableHead>
                  <TableHead className="px-5 py-3.5">Email</TableHead>
                  <TableHead className="px-5 py-3.5">Função Audiovisual</TableHead>
                  <TableHead className="px-5 py-3.5">Escalado em</TableHead>
                  <TableHead className="px-5 py-3.5 text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {members.length > 0 ? (
                  members.map((m) => (
                    <TableRow key={m.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="px-5 py-4 font-semibold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {m.userName ? m.userName.substring(0, 2).toUpperCase() : 'AU'}
                          </div>
                          <span>{m.userName || 'Membro da Equipa'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-muted-foreground">{m.userEmail || '—'}</TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className="bg-muted text-foreground border-border font-medium"
                        >
                          {m.projectRole}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-muted-foreground">
                        {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('pt-PT') : '—'}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMember(m.id)}
                          className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Remover membro"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                      Nenhum membro escalado ainda. Adicione os profissionais responsáveis pelo projeto.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Tab 4: Ficheiros & Entregáveis */}
      {activeTab === 'files' && (
        <div className="space-y-6">
          {/* Deliverables section */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deliverables.length > 0 ? (
                deliverables.map((d) => (
                  <div
                    key={d.id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-purple-400 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-semibold"
                        >
                          Versão {d.version || 1} • {d.type || 'ROUGH_CUT'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            d.status === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          }
                        >
                          {d.status || 'PENDING'}
                        </Badge>
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
                          <Video className="mr-1.5 h-3.5 w-3.5" /> Abrir Player de Revisão
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-xs text-muted-foreground">
                  Nenhum entregável gerado ainda. Crie um pacote a partir dos arquivos do projeto.
                </div>
              )}
            </div>
          </div>

          {/* Files library section */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Acervo de Arquivos do Projeto
                </h3>
                <p className="text-xs text-muted-foreground">
                  Armazenamento em bucket privado de guiões, áudio, vídeos proxy e documentação.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs">
                    <Upload className="h-3.5 w-3.5" />
                    {isUploading ? 'A Carregar...' : 'Carregar Ficheiro'}
                  </div>
                </label>
              </div>
            </div>

            {/* Category filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['ALL', 'SCRIPT', 'AUDIO', 'VIDEO_PROXY', 'DELIVERABLE', 'DOCUMENT'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFileCategoryFilter(cat)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${fileCategoryFilter === cat
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {cat === 'ALL'
                    ? 'Todos'
                    : cat === 'SCRIPT'
                      ? 'Guiões'
                      : cat === 'AUDIO'
                        ? 'Áudio'
                        : cat === 'VIDEO_PROXY'
                          ? 'Vídeo Proxy'
                          : cat === 'DELIVERABLE'
                            ? 'Entregáveis'
                            : 'Documentos'}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
              <Table className="min-w-full text-left text-xs">
                <TableHeader className="bg-muted/50 font-semibold text-muted-foreground">
                  <TableRow>
                    <TableHead className="px-5 py-3.5">Nome do Ficheiro</TableHead>
                    <TableHead className="px-5 py-3.5">Categoria</TableHead>
                    <TableHead className="px-5 py-3.5">Tamanho</TableHead>
                    <TableHead className="px-5 py-3.5">Carregado por</TableHead>
                    <TableHead className="px-5 py-3.5">Data</TableHead>
                    <TableHead className="px-5 py-3.5 text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {filteredFiles.length > 0 ? (
                    filteredFiles.map((file) => (
                      <TableRow key={file.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="px-5 py-4 font-semibold text-foreground">
                          <div className="flex items-center gap-2 truncate max-w-sm">
                            <FileText className="h-4 w-4 text-primary shrink-0" />
                            <span className="truncate">{file.fileName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <Badge variant="outline" className="text-xs border-border">
                            {file.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-muted-foreground font-mono">
                          {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                        </TableCell>
                        <TableCell className="px-5 py-4 text-foreground">{file.uploader?.name || 'Equipa'}</TableCell>
                        <TableCell className="px-5 py-4 text-muted-foreground">
                          {new Date(file.createdAt).toLocaleDateString('pt-PT')}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {file.url && (
                              <a href={file.url} target="_blank" rel="noopener noreferrer">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-muted-foreground hover:text-foreground"
                                  title="Descarregar"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </a>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteFile(file.id)}
                              className="h-8 text-muted-foreground hover:text-destructive"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                        Nenhum ficheiro encontrado nesta categoria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Quadro Kanban */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Quadro de Produção Audiovisual</h2>
              <p className="text-xs text-muted-foreground">
                Acompanhamento ágil de tarefas dividido por departamentos técnicos (Câmara, Som, Arte, Edição).
              </p>
            </div>
            <Link href={`/kanban?projectId=${projectId}`}>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
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
                <div
                  key={statusKey}
                  className="rounded-2xl border border-border bg-card p-4 space-y-3 min-h-[350px]"
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
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Custos & Despesas de Produção */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h3 className="text-base font-bold text-foreground">Custos Reais de Produção & Margem</h3>
              <p className="text-xs text-muted-foreground">Despesas de rodagem efetuadas no terreno e margem consolidada do projeto.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsProjectPaymentModalOpen(true)}
                className="rounded-none text-xs h-8 gap-1.5"
              >
                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                Registar Recebimento
              </Button>
              <Button
                size="sm"
                onClick={() => setIsProjectExpenseModalOpen(true)}
                className="rounded-none text-xs h-8 gap-1.5 font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                Lançar Despesa
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-none border border-border bg-card p-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Receita Faturada / Orçada
              </span>
              <p className="mt-2 text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {financialSummary ? new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(financialSummary.totalRevenue) : '—'}
              </p>
              <span className="text-[11px] text-muted-foreground">Valor recebido ou aprovado em proposta</span>
            </div>

            <div className="rounded-none border border-border bg-card p-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Total Despesas de Campo
              </span>
              <p className="mt-2 text-xl font-mono font-bold text-rose-600 dark:text-rose-400">
                {financialSummary ? new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(financialSummary.totalExpenses) : '—'}
              </p>
              <span className="text-[11px] text-muted-foreground">Catering, combustível, alugueres e diárias</span>
            </div>

            <div className="rounded-none border border-border bg-card p-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Margem Efetiva
              </span>
              <p className={`mt-2 text-xl font-mono font-bold ${financialSummary && financialSummary.actualMargin >= 0 ? 'text-foreground' : 'text-rose-600'}`}>
                {financialSummary ? new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(financialSummary.actualMargin) : '—'}
              </p>
              <span className="text-[11px] text-muted-foreground">
                Rentabilidade: {financialSummary ? `${financialSummary.actualMarginPercent}%` : '—'}
              </span>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Despesas Registadas ({projectExpenses.length})
            </h4>

            {loadingExpenses ? (
              <div className="p-8 text-center text-xs text-muted-foreground">A carregar despesas...</div>
            ) : projectExpenses.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border text-xs text-muted-foreground space-y-1">
                <Receipt className="h-6 w-6 mx-auto text-muted-foreground/50 mb-1" />
                <p className="font-semibold text-foreground">Nenhuma despesa de campo registada para este projeto.</p>
                <p>Lançe custos de alimentação, transporte e diárias de rodagem.</p>
              </div>
            ) : (
              <div className="border border-border overflow-x-auto">
                <Table className="w-full text-left text-xs">
                  <TableHeader className="bg-muted/40 border-b border-border uppercase font-mono text-[10px] tracking-wider text-muted-foreground">
                    <TableRow>
                      <TableHead className="py-2.5 px-3">Data</TableHead>
                      <TableHead className="py-2.5 px-3">Categoria</TableHead>
                      <TableHead className="py-2.5 px-3">Descrição</TableHead>
                      <TableHead className="py-2.5 px-3">Comprovativo</TableHead>
                      <TableHead className="py-2.5 px-3 text-right">Valor (AOA)</TableHead>
                      <TableHead className="py-2.5 px-3 text-center">Estado</TableHead>
                      <TableHead className="py-2.5 px-3 text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border font-sans">
                    {projectExpenses.map((exp) => (
                      <TableRow key={exp.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="py-2.5 px-3 font-mono text-muted-foreground whitespace-nowrap">
                          {new Date(exp.date).toLocaleDateString('pt-AO')}
                        </TableCell>
                        <TableCell className="py-2.5 px-3">
                          <span className="inline-block px-1.5 py-0.5 text-[10px] font-mono border border-border bg-muted/20">
                            {exp.category}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5 px-3 text-foreground">{exp.description}</TableCell>
                        <TableCell className="py-2.5 px-3">
                          {exp.receiptUrl ? (
                            <a
                              href={exp.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                            >
                              <ExternalLink className="h-3 w-3" /> Ver Recibo
                            </a>
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                          {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(exp.amount))}
                        </TableCell>
                        <TableCell className="py-2.5 px-3 text-center">
                          {exp.status === 'APPROVED' && (
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px] font-mono">
                              Aprovada
                            </Badge>
                          )}
                          {exp.status === 'PENDING' && (
                            <Badge variant="outline" className="border-amber-500/30 text-amber-600 bg-amber-500/10 text-[10px] font-mono">
                              Pendente
                            </Badge>
                          )}
                          {exp.status === 'REJECTED' && (
                            <Badge variant="outline" className="border-rose-500/30 text-rose-600 bg-rose-500/10 text-[10px] font-mono">
                              Rejeitada
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-2.5 px-3 text-right">
                          {exp.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveExpense(exp.id)}
                                className="h-6 px-2 text-[10px] rounded-none border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 gap-1"
                              >
                                <Check className="h-2.5 w-2.5" /> Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectExpense({ expenseId: exp.id })}
                                className="h-6 px-2 text-[10px] rounded-none border-rose-500/40 text-rose-600 hover:bg-rose-500/10 gap-1"
                              >
                                <X className="h-2.5 w-2.5" /> Rejeitar
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-mono">Processado</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}

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


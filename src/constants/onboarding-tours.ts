import type { Alignment, DriveStep, Side } from "driver.js";
import type { Role } from "@/types";

/** Tem de coincidir com `ONBOARDING_TOUR_IDS` da API (módulo `onboarding`). */
export const ONBOARDING_TOUR_IDS = [
  "setup",
  "dashboard",
  "services",
  "studio-availability",
  "crm",
  "budgets",
  "projects",
  "project-detail",
  "finance",
  "deliverables",
  "automate",
] as const;

export type OnboardingTourId = (typeof ONBOARDING_TOUR_IDS)[number];

export type OnboardingTourGroup = "setup" | "core" | "operation" | "advanced";

export type OnboardingTourMode = "normal" | "demo";

export type TourStepDefinition = {
  /** Selector CSS do alvo (`[data-tour="..."]`). */
  selector: string;
  title: string;
  description: string;
  side?: Side;
  align?: Alignment;
  /**
   * `data-tour` de um botão que abre o ecrã onde o alvo vive (ex.: modal de criação).
   * É clicado automaticamente se o alvo ainda não estiver visível.
   */
  open?: string;
  /** Fecha o diálogo aberto antes de mostrar este passo (volta à página). */
  closeDialog?: boolean;
  /** Passo omitido em silêncio quando o alvo não existe (ex.: lista vazia). */
  optional?: boolean;
};

export type TourDefinition = {
  id: OnboardingTourId;
  /** Subir a versão volta a mostrar o guia a quem já o viu. */
  version: number;
  title: string;
  description: string;
  group: OnboardingTourGroup;
  /** Rota onde o guia corre; usada pela lista de "Primeiros passos" e pelas definições. */
  route: string;
  priority: number;
  roles: Role[];
  steps: TourStepDefinition[];
};

export type OnboardingDriveStep = DriveStep & {
  selector?: string;
  open?: string;
  closeDialog?: boolean;
  optional?: boolean;
};

type TourConfig = Omit<TourDefinition, "id" | "version"> & { version?: number };
type StepOptions = Pick<
  TourStepDefinition,
  "side" | "align" | "open" | "closeDialog" | "optional"
>;

const OWNER_MANAGER: Role[] = ["OWNER", "MANAGER"];
const COMMERCIAL: Role[] = ["OWNER", "MANAGER", "PRODUCER"];
const EVERYONE: Role[] = [
  "OWNER",
  "MANAGER",
  "PRODUCER",
  "FINANCE",
  "EDITOR",
  "CREW",
  "MEMBER",
];

/** Aceita o nome de um `data-tour` ou um selector CSS completo. */
function toSelector(target: string) {
  return /^[[.#]/.test(target) ? target : `[data-tour="${target}"]`;
}

function step(
  target: string,
  title: string,
  description: string,
  options: StepOptions = {},
): TourStepDefinition {
  return { selector: toSelector(target), title, description, ...options };
}

function defineTour(id: OnboardingTourId, config: TourConfig): TourDefinition {
  return { id, version: config.version ?? 1, ...config };
}

export function toDriveStep(definition: TourStepDefinition): OnboardingDriveStep {
  return {
    selector: definition.selector,
    open: definition.open,
    closeDialog: definition.closeDialog,
    optional: definition.optional,
    popover: {
      title: definition.title,
      description: definition.description,
      side: definition.side,
      align: definition.align,
    },
  };
}

export const onboardingTours: Record<OnboardingTourId, TourDefinition> = {
  dashboard: defineTour("dashboard", {
    title: "O seu painel",
    description: "Indicadores e atalhos do seu papel, numa só vista.",
    group: "core",
    route: "/dashboard",
    priority: 1,
    roles: EVERYONE,
    steps: [
      step(
        "dashboard-quick-actions",
        "Atalhos do seu dia a dia",
        "Os botões abrem diretamente o formulário certo: um clique em vez de procurar no menu.",
        { side: "left", optional: true },
      ),
      step(
        "dashboard-kpis",
        "Indicadores do seu papel",
        "Cada pessoa vê apenas o que lhe interessa: a gestão vê receita e margem, a produção vê projectos e prazos, a equipa vê as suas tarefas.",
        { side: "bottom" },
      ),
      step(
        "dashboard-urgent",
        "O que precisa de atenção",
        "Orçamentos à espera de resposta, pagamentos por receber e prazos a chegar. Clique num item para ir direto ao registo.",
        { side: "top", optional: true },
      ),
      step(
        "dashboard-period",
        "Período de análise",
        "Mude o intervalo (mês, trimestre, ano) e todos os números do painel acompanham.",
        { side: "left", optional: true },
      ),
    ],
  }),

  setup: defineTour("setup", {
    title: "Arranque da produtora",
    description: "A ordem recomendada para pôr a produtora a funcionar.",
    group: "setup",
    route: "/settings?tab=guides",
    priority: 2,
    roles: OWNER_MANAGER,
    steps: [
      step(
        "settings-checklist",
        "Uma lista, por ordem",
        "Siga estes passos de cima para baixo. O progresso é calculado a partir do que já existe na produtora: quando cria um serviço, o item fica concluído sozinho.",
        { side: "bottom", optional: true },
      ),
      step(
        '[data-sidebar="content"]',
        "O fluxo principal no menu",
        "1) Serviços: o que vende. 2) Estúdio: onde e quando. 3) Orçamentos: a proposta ao cliente. 4) Projectos: a execução. 5) Finanças: o recebimento. Quando o cliente aprova o orçamento, o projecto é criado automaticamente.",
        { side: "right", align: "start" },
      ),
      step(
        "settings-guides",
        "Repita um guia quando quiser",
        "Aqui também controla se os guias aparecem sozinhos e pode repor os que já viu.",
        { side: "top" },
      ),
    ],
  }),

  services: defineTour("services", {
    title: "Criar serviços",
    description: "O catálogo que alimenta orçamentos, portal e marcações.",
    group: "setup",
    route: "/services",
    priority: 3,
    roles: COMMERCIAL,
    steps: [
      step(
        "services-banner",
        "O seu catálogo público",
        "Os serviços activos aparecem na página pública da produtora. Partilhe este link com os clientes para receberem pedidos sem trocar mensagens.",
        { side: "bottom", optional: true },
      ),
      step(
        "services-metrics",
        "Visão rápida do catálogo",
        "Quantos serviços tem, quantos estão activos e o preço médio.",
        { side: "bottom" },
      ),
      step(
        "services-categories",
        "Categorias",
        "Agrupe os serviços (videoclipe, institucional, eventos...). Pode criar mais tarde, também a partir do formulário do serviço.",
        { side: "bottom" },
      ),
      step(
        "services-create",
        "Crie o primeiro serviço",
        "Cada serviço é um pacote com preço de referência. Vamos ver o formulário.",
        { side: "bottom" },
      ),
      step(
        "service-name",
        "Nome claro",
        "Use o nome que o cliente reconhece, por exemplo \"Videoclipe Master\" ou \"Diária de Estúdio\".",
        { side: "bottom", open: "services-create" },
      ),
      step(
        "service-category",
        "Categoria",
        "Escolha uma categoria existente ou crie uma nova com \"+ Nova\".",
        { side: "bottom" },
      ),
      step(
        "service-price",
        "Preço de referência",
        "É o valor que entra automaticamente nos orçamentos. Pode ser ajustado em cada proposta.",
        { side: "bottom" },
      ),
      step(
        "service-duration",
        "Duração estimada",
        "Ajuda a planear a equipa e o calendário. Pode deixar a zero se variar muito.",
        { side: "top" },
      ),
      step(
        "service-visibility",
        "Visível aos clientes",
        "Mantenha activo para aparecer no catálogo público e no portal. Desligue para guardar como rascunho.",
        { side: "top" },
      ),
      step(
        "service-deliverables",
        "O que o cliente recebe",
        "Liste os entregáveis (ex.: 1 vídeo master 4K + 3 versões para redes). Passam para o orçamento e para o projecto.",
        { side: "top" },
      ),
      step(
        "service-save",
        "Guardar",
        "Pronto: o serviço fica disponível nos orçamentos e no portal do cliente.",
        { side: "top", align: "end" },
      ),
      step(
        "services-list",
        "Os seus serviços",
        "Edite, ative ou desative a partir daqui. Próximo passo: definir quando o estúdio aceita marcações.",
        { side: "top", closeDialog: true, optional: true },
      ),
    ],
  }),

  "studio-availability": defineTour("studio-availability", {
    title: "Horários de disponibilidade",
    description:
      "Defina os dias e horas em que os clientes podem marcar sessões no estúdio.",
    group: "setup",
    route: "/studio",
    priority: 4,
    roles: COMMERCIAL,
    steps: [
      step(
        "studio-metrics",
        "O seu estúdio",
        "Cada espaço (palco, cabine, ciclorama, ilha de edição) tem o seu próprio horário e tarifa.",
        { side: "bottom" },
      ),
      step(
        "studio-create",
        "Crie ou edite um espaço",
        "Para um espaço existente, use o menu \"⋮\" do cartão e escolha Editar. Vamos ver o formulário de um novo espaço.",
        { side: "bottom" },
      ),
      step(
        "studio-name",
        "Identifique o espaço",
        "Dê um nome que os clientes entendam, como \"Estúdio A\" ou \"Cabine de Som\".",
        { side: "bottom", open: "studio-create" },
      ),
      step(
        "studio-rates",
        "Tarifas",
        "A tarifa horária e a diária entram no custo das marcações.",
        { side: "bottom" },
      ),
      step(
        "studio-hours-presets",
        "Comece pelo atalho",
        "\"Seg–Sex 09–18\" preenche a semana de trabalho típica. \"Copiar Seg → Sex\" repete o horário de segunda nos outros dias úteis.",
        { side: "bottom" },
      ),
      step(
        "studio-hours-editor",
        "Dias e horas de funcionamento",
        "Ligue os dias em que o espaço está aberto e ajuste a hora de abertura e de fecho. Use \"+ intervalo\" para pausas (ex.: 09–13 e 14–18). Os clientes só conseguem marcar dentro destas janelas.",
        { side: "top" },
      ),
      step(
        "studio-save",
        "Guardar",
        "Depois de guardar, o portal passa a recusar marcações fora do horário, sem trabalho manual da sua parte.",
        { side: "top", align: "end" },
      ),
      step(
        "studio-hours-summary",
        "Horário em cada espaço",
        "O cartão mostra o resumo do horário. Se vir o aviso a laranja, o espaço ainda não tem horário definido.",
        { side: "top", closeDialog: true, optional: true },
      ),
      step(
        "studio-bookings",
        "Marcações",
        "As marcações dos clientes e da equipa aparecem aqui, já validadas contra o horário e sem sobreposições.",
        { side: "top", optional: true },
      ),
    ],
  }),

  crm: defineTour("crm", {
    title: "Registar clientes",
    description: "Cada orçamento e projecto parte de um cliente.",
    group: "core",
    route: "/crm",
    priority: 5,
    roles: COMMERCIAL,
    steps: [
      step(
        "crm-create",
        "Comece por um cliente",
        "Empresas, agências e particulares ficam aqui. Depois escolhe-os nos orçamentos e nos projectos sem voltar a escrever os dados. Vamos ver o formulário.",
        { side: "bottom" },
      ),
      step(
        "client-name",
        "Nome do cliente",
        "É o único campo obrigatório: o nome comercial que reconhece, por exemplo \"Banza Filmes\".",
        { side: "bottom", open: "crm-create" },
      ),
      step(
        "client-taxid",
        "NIF",
        "Preencha se o cliente precisar de factura. É ele que segue para o pedido de factura quando o pagamento é registado.",
        { side: "bottom" },
      ),
      step(
        "client-email",
        "Email de contacto",
        "Usado para enviar orçamentos e avisos ao cliente e para o convidar para o portal.",
        { side: "top" },
      ),
      step(
        "client-save",
        "Guardar",
        "Pronto: o cliente fica disponível para criar o primeiro orçamento.",
        { side: "top", align: "end" },
      ),
      step(
        "crm-table",
        "A sua carteira de clientes",
        "Pesquise, edite e veja o histórico de cada cliente a partir daqui.",
        { side: "top", closeDialog: true },
      ),
    ],
  }),

  budgets: defineTour("budgets", {
    title: "Enviar um orçamento",
    description: "Da proposta à aprovação do cliente.",
    group: "core",
    route: "/budgets",
    priority: 6,
    roles: COMMERCIAL,
    steps: [
      step(
        "budgets-create",
        "Nova proposta",
        "Um orçamento é a proposta ao cliente. Quando ele aprova, o projecto é criado automaticamente. Vamos ver o formulário.",
        { side: "bottom" },
      ),
      step(
        "budget-client",
        "Para quem é",
        "Escolha o cliente. Se ainda não existe, registe-o primeiro em Clientes & CRM.",
        { side: "bottom", open: "budgets-create" },
      ),
      step(
        "budget-project",
        "Projecto (opcional)",
        "Deixe vazio para um orçamento avulso: o projecto nasce quando o cliente aprovar. Escolha um projecto existente só se o orçamento for um extra dele.",
        { side: "bottom" },
      ),
      step(
        "budget-items",
        "Rubricas de produção",
        "Cada linha é um custo (equipa, equipamento, pós-produção...) com quantidade e preço. Use \"Adicionar linha\" para acrescentar mais.",
        { side: "top" },
      ),
      step(
        "budget-summary",
        "Desconto e total",
        "O subtotal soma as rubricas. Pode aplicar um desconto comercial e vê logo o total que o cliente vai receber.",
        { side: "top" },
      ),
      step(
        "budget-save",
        "Guardar como rascunho",
        "O orçamento fica em rascunho. Depois envie-o pelo menu \"⋮\" da linha; o cliente aprova no portal e o projecto é criado sozinho.",
        { side: "top", align: "end" },
      ),
      step(
        "budgets-table",
        "Acompanhe cada proposta",
        "Rascunho, enviado, aprovado, recusado... Pode também aprovar manualmente, duplicar uma proposta ou pedir a factura a partir de cada linha.",
        { side: "top", closeDialog: true },
      ),
    ],
  }),

  projects: defineTour("projects", {
    title: "Criar um projecto",
    description: "Quando não vem de um orçamento aprovado.",
    group: "operation",
    route: "/projects",
    priority: 7,
    roles: COMMERCIAL,
    steps: [
      step(
        "projects-create",
        "Projecto direto",
        "Normalmente o projecto nasce sozinho quando um orçamento é aprovado. Use este botão para trabalhos que começam sem proposta. Vamos ver o formulário.",
        { side: "bottom" },
      ),
      step(
        "project-title",
        "Título da produção",
        "O nome que a equipa e o cliente vão ver, por exemplo \"Comercial de Verão 2026\".",
        { side: "bottom", open: "projects-create" },
      ),
      step(
        "project-client",
        "Cliente",
        "Escolha o cliente. Se for novo, registe-o aqui mesmo com \"+ Registar Cliente\", sem sair do formulário.",
        { side: "bottom" },
      ),
      step(
        "project-service",
        "Serviço do catálogo",
        "Escolha um serviço e o Nora gera a proposta comercial automaticamente, com preço e entregáveis do catálogo.",
        { side: "bottom" },
      ),
      step(
        "project-stage",
        "Fase e estado",
        "A fase de produção (pré-produção, rodagem, pós...) e o estado operacional. Mudam ao longo do projecto.",
        { side: "top" },
      ),
      step(
        "project-dates",
        "Datas previstas",
        "O início e a entrega alimentam os prazos do painel e os alertas de atraso.",
        { side: "top" },
      ),
      step(
        "project-save",
        "Criar projecto",
        "Depois de criado, abra-o para escalar a equipa, gerar a folha de rodagem e criar entregáveis.",
        { side: "top", align: "end" },
      ),
      step(
        "projects-table",
        "Todos os projectos",
        "Abra um projecto para ver o detalhe, o quadro Kanban ou os entregáveis a partir do menu \"⋮\".",
        { side: "top", closeDialog: true },
      ),
    ],
  }),

  "project-detail": defineTour("project-detail", {
    title: "Gerir um projecto",
    description: "Equipa, folha de rodagem, entregáveis e custos num só lugar.",
    group: "operation",
    route: "/projects",
    priority: 8,
    roles: ["OWNER", "MANAGER", "PRODUCER", "EDITOR", "CREW"],
    steps: [
      step(
        "project-header",
        "Resumo do projecto",
        "Cliente, datas e fase actual. Tudo o que acontece no projecto liga a este cabeçalho.",
        { side: "bottom" },
      ),
      step(
        "project-crew",
        "Escalar a equipa",
        "Adicione membros e funções. Quem for escalado passa a ver o projecto e recebe a convocatória. Vamos ver o formulário.",
        { side: "bottom" },
      ),
      step(
        "member-user",
        "Quem",
        "Escolha o profissional entre os membros da produtora.",
        { side: "bottom", open: "project-crew" },
      ),
      step(
        "member-role",
        "Função no projecto",
        "A função técnica (realizador, DoP, som, editor...) aparece na folha de rodagem.",
        { side: "top" },
      ),
      step(
        "member-save",
        "Escalar",
        "O membro fica no projecto e já pode ser incluído na folha de rodagem.",
        { side: "top", align: "end" },
      ),
      step(
        "project-call-sheet",
        "Folha de rodagem num clique",
        "\"Gerar Call Sheet\" cria o rascunho com a equipa escalada, o equipamento reservado e a última localização. Só tem de rever e enviar.",
        { side: "bottom", closeDialog: true },
      ),
      step(
        "project-deliverable",
        "Entregáveis",
        "Crie as versões a entregar ao cliente para revisão e aprovação.",
        { side: "bottom" },
      ),
      step(
        "project-tabs",
        "Tudo no mesmo sítio",
        "Visão geral, folhas de rodagem, equipa, entregáveis, quadro Kanban e custos do projecto.",
        { side: "bottom" },
      ),
    ],
  }),

  finance: defineTour("finance", {
    title: "Recebimentos e despesas",
    description: "Registe pagamentos; a factura é pedida sem trabalho extra.",
    group: "operation",
    route: "/finance",
    priority: 9,
    roles: ["OWNER", "MANAGER", "FINANCE"],
    steps: [
      step(
        "finance-payment",
        "Registar um recebimento",
        "Quando o cliente paga, registe aqui. Vamos ver o formulário.",
        { side: "bottom" },
      ),
      step(
        "payment-project",
        "Projecto",
        "Ligue o pagamento ao projecto para ver a rentabilidade real. Pode deixar vazio para um pagamento geral.",
        { side: "bottom", open: "finance-payment", optional: true },
      ),
      step(
        "payment-method",
        "Método e estado",
        "Como o cliente pagou e se o dinheiro já entrou. Registe como \"pago\" só quando o valor estiver na conta.",
        { side: "bottom" },
      ),
      step(
        "payment-invoice-note",
        "A factura sai sozinha",
        "Ao registar como pago, o evento fica disponível para as automações e, com o Mindgest ligado, o pedido de factura é criado automaticamente.",
        { side: "top" },
      ),
      step(
        "payment-amount",
        "Valor recebido",
        "O montante em Kwanzas.",
        { side: "top" },
      ),
      step(
        "payment-save",
        "Registar",
        "O pagamento entra no fluxo de caixa e nos indicadores do painel.",
        { side: "top", align: "end" },
      ),
      step(
        "finance-expense",
        "Registar uma despesa",
        "Despesas de rodagem e de produção ficam ligadas ao projecto e seguem para aprovação. Vamos ver o formulário.",
        { side: "bottom", closeDialog: true },
      ),
      step(
        "expense-project",
        "Projecto da despesa",
        "Toda a despesa pertence a um projecto: é assim que se calcula a margem de cada produção.",
        { side: "bottom", open: "finance-expense", optional: true },
      ),
      step(
        "expense-category",
        "Categoria e data",
        "Classifique (equipa, equipamento, transporte...) para os relatórios. Pode criar categorias novas com \"+ Nova\".",
        { side: "bottom" },
      ),
      step(
        "expense-amount",
        "Valor",
        "O montante gasto em Kwanzas.",
        { side: "top" },
      ),
      step(
        "expense-proof",
        "Comprovativo",
        "Anexe a fotografia ou PDF da factura. Fica guardado em segurança e facilita a aprovação.",
        { side: "top" },
      ),
      step(
        "expense-save",
        "Submeter para aprovação",
        "Quem aprova vê a despesa na lista de pendentes.",
        { side: "top", align: "end" },
      ),
      step(
        "finance-tabs",
        "Despesas, pagamentos e fluxo de caixa",
        "Aprove despesas, confirme pagamentos pendentes e acompanhe o fluxo de caixa.",
        { side: "bottom", closeDialog: true },
      ),
    ],
  }),

  deliverables: defineTour("deliverables", {
    title: "Entregáveis e aprovação",
    description: "Versões para o cliente rever e aprovar.",
    group: "operation",
    route: "/deliverables",
    priority: 10,
    roles: ["OWNER", "MANAGER", "PRODUCER", "EDITOR"],
    steps: [
      step(
        "deliverables-create",
        "Novo entregável",
        "Um entregável é uma versão do trabalho (corte, fotos, áudio) que o cliente revê e aprova. Vamos ver o formulário.",
        { side: "bottom" },
      ),
      step(
        "deliverable-project",
        "Projecto",
        "Cada entregável pertence a um projecto.",
        { side: "bottom", open: "deliverables-create" },
      ),
      step(
        "deliverable-title",
        "Título da versão",
        "Seja específico (\"Corte do realizador v2\"): o cliente vê este nome no portal.",
        { side: "bottom" },
      ),
      step(
        "deliverable-type",
        "Tipo",
        "Vídeo, ensaio fotográfico, áudio... Os tipos podem ser geridos no botão de tipos desta página.",
        { side: "bottom" },
      ),
      step(
        "deliverable-media",
        "O ficheiro",
        "Envie os ficheiros (vídeo, fotos, áudio) para o armazenamento seguro. O cliente revê com comentários ancorados ao tempo exacto.",
        { side: "top" },
      ),
      step(
        "deliverable-watermark",
        "Marca d'água de prova",
        "Proteja o material durante a revisão: a marca sai na versão final aprovada.",
        { side: "top", optional: true },
      ),
      step(
        "deliverable-save",
        "Criar entregável",
        "Depois de criado, publique-o para o cliente rever no portal.",
        { side: "top", align: "end" },
      ),
      step(
        "deliverables-page",
        "Revisão e feedback",
        "O cliente comenta e aprova no portal. Os comentários e o estado de aprovação aparecem aqui.",
        { side: "top", closeDialog: true },
      ),
    ],
  }),

  automate: defineTour("automate", {
    title: "Automações",
    description: "Deixe o Nora tratar das tarefas repetitivas.",
    group: "advanced",
    route: "/automate",
    priority: 11,
    roles: OWNER_MANAGER,
    steps: [
      step(
        "automate-metrics",
        "Resultados das automações",
        "Quantos fluxos estão activos, quantas execuções houve e a taxa de sucesso.",
        { side: "bottom" },
      ),
      step(
        "automate-create",
        "Novo fluxo",
        "Um fluxo é uma regra: \"quando acontece X, faz Y\". Vamos ver o formulário.",
        { side: "bottom" },
      ),
      step(
        "workflow-name",
        "Dê-lhe um nome",
        "Descreva o resultado, por exemplo \"Avisar o financeiro quando o orçamento for aprovado\".",
        { side: "bottom", open: "automate-create" },
      ),
      step(
        "workflow-trigger",
        "Quando dispara",
        "O evento que inicia o fluxo: orçamento aprovado, pagamento confirmado, entregável aprovado...",
        { side: "bottom" },
      ),
      step(
        "workflow-action",
        "O que faz",
        "Enviar notificação ou email, criar uma tarefa ou chamar um sistema externo.",
        { side: "bottom" },
      ),
      step(
        "workflow-content",
        "A mensagem",
        "Pode usar dados do evento no texto, como o total do orçamento.",
        { side: "top", optional: true },
      ),
      step(
        "workflow-recipients",
        "Quem recebe",
        "Escolha os perfis que recebem o aviso.",
        { side: "top", optional: true },
      ),
      step(
        "workflow-save",
        "Criar fluxo",
        "O fluxo fica activo e pode ser testado a partir da lista antes de o deixar a correr sozinho.",
        { side: "top", align: "end" },
      ),
    ],
  }),
};

export function isOnboardingTourId(value: string): value is OnboardingTourId {
  return (ONBOARDING_TOUR_IDS as readonly string[]).includes(value);
}

/** Guias por ordem de prioridade (usado pelas definições e pela lista de primeiros passos). */
export const orderedOnboardingTours = Object.values(onboardingTours).sort(
  (a, b) => a.priority - b.priority,
);

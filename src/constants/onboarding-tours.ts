import type { Alignment, DriveStep, Side } from "driver.js";
import type { Role } from "@/types";

/** Tem de coincidir com `ONBOARDING_TOUR_IDS` da API (módulo `onboarding`). */
export const ONBOARDING_TOUR_IDS = [
  "setup",
  "dashboard",
  "services",
  "studio-availability",
  "budgets",
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

  budgets: defineTour("budgets", {
    title: "Orçamentos",
    description: "Da proposta à aprovação do cliente.",
    group: "core",
    route: "/budgets",
    priority: 5,
    roles: COMMERCIAL,
    steps: [
      step(
        "budgets-create",
        "Nova proposta",
        "Escolha o cliente e acrescente serviços do catálogo: os preços e os entregáveis vêm preenchidos.",
        { side: "bottom" },
      ),
      step(
        "budgets-table",
        "Acompanhe cada proposta",
        "Rascunho, enviado, aprovado... Envie por aqui e acompanhe a resposta. Quando o orçamento é aprovado (por si ou pelo cliente no portal), o projecto é criado automaticamente.",
        { side: "top" },
      ),
    ],
  }),

  "project-detail": defineTour("project-detail", {
    title: "Gerir um projecto",
    description: "Equipa, folha de rodagem, entregáveis e custos num só lugar.",
    group: "operation",
    route: "/projects",
    priority: 6,
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
        "Adicione membros e funções. Quem for escalado recebe a convocatória.",
        { side: "bottom" },
      ),
      step(
        "project-call-sheet",
        "Folha de rodagem em um clique",
        "O rascunho é gerado com a equipa escalada, o equipamento reservado e a última localização. Só tem de rever e enviar.",
        { side: "bottom" },
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
    description: "Registe pagamentos; a fatura é pedida sem trabalho extra.",
    group: "operation",
    route: "/finance",
    priority: 7,
    roles: ["OWNER", "MANAGER", "FINANCE"],
    steps: [
      step(
        "finance-payment",
        "Registar um recebimento",
        "Quando o cliente paga, registe aqui. Com o Mindgest ligado, a fatura é pedida automaticamente a partir deste pagamento.",
        { side: "bottom" },
      ),
      step(
        "finance-expense",
        "Registar uma despesa",
        "Despesas de rodagem e de produção ficam ligadas ao projecto e seguem para aprovação.",
        { side: "bottom" },
      ),
      step(
        "finance-tabs",
        "Despesas, pagamentos e fluxo de caixa",
        "Aprove despesas, confirme pagamentos pendentes e acompanhe o fluxo de caixa.",
        { side: "bottom" },
      ),
    ],
  }),

  deliverables: defineTour("deliverables", {
    title: "Entregáveis e aprovação",
    description: "Versões para o cliente rever e aprovar.",
    group: "operation",
    route: "/deliverables",
    priority: 8,
    roles: ["OWNER", "MANAGER", "PRODUCER", "EDITOR"],
    steps: [
      step(
        "deliverables-create",
        "Novo entregável",
        "Crie a versão (ex.: V1 do vídeo) ligada ao projecto e publique-a para o cliente rever.",
        { side: "bottom" },
      ),
      step(
        "deliverables-page",
        "Revisão e feedback",
        "O cliente comenta e aprova no portal. Os comentários e o estado de aprovação aparecem aqui.",
        { side: "top" },
      ),
    ],
  }),

  automate: defineTour("automate", {
    title: "Automações",
    description: "Deixe o Nora tratar das tarefas repetitivas.",
    group: "advanced",
    route: "/automate",
    priority: 9,
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
        "Escolha um evento (ex.: orçamento aprovado) e o que acontece a seguir: notificar a equipa, criar tarefas ou chamar um sistema externo.",
        { side: "bottom" },
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

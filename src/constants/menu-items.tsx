import { Icon } from "@/components";
import { Role, PlanType } from "@/types";

export type SubMenuItem = {
  name: string;
  url: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "active" | "trial" | "pro";
  roles?: Role[];
  minPlan?: PlanType;
};

export type MenuItem = {
  name: string;
  url: string;
  icon?: React.ReactNode;
  roles?: Role[];
  minPlan?: PlanType;
  showMoreIcon?: boolean;
  showUpgrade?: boolean;
  items?: SubMenuItem[];
};

export type MenuStructure = {
  items: MenuItem[];
};

export const menuItems: MenuStructure = {
  items: [
    {
      name: "Painel Geral",
      url: "/admin",
      icon: <Icon name="LayoutDashboard" className="w-5 h-5" />,
      roles: ["ADMIN"],
    },
    {
      name: "Produtoras & Estúdios",
      url: "/admin/tenants",
      icon: <Icon name="Building2" className="w-5 h-5" />,
      roles: ["ADMIN"],
    },
    {
      name: "Utilizadores Globais",
      url: "/admin/users",
      icon: <Icon name="Users" className="w-5 h-5" />,
      roles: ["ADMIN"],
    },
    {
      name: "Subscrições da Plataforma",
      url: "/admin/subscriptions",
      icon: <Icon name="CreditCard" className="w-5 h-5" />,
      roles: ["ADMIN"],
    },
    {
      name: "Auditoria & Logs",
      url: "/admin/audit",
      icon: <Icon name="Activity" className="w-5 h-5" />,
      roles: ["ADMIN"],
    },
    {
      name: "Painel Operacional",
      url: "/dashboard",
      icon: <Icon name="LayoutDashboard" className="w-5 h-5" />,
      roles: ["OWNER", "MANAGER", "PRODUCER", "FINANCE", "CREW", "EDITOR", "MEMBER"],
    },
    {
      name: "Produção",
      url: "#",
      icon: <Icon name="Clapperboard" className="w-5 h-5" />,
      roles: ["OWNER", "MANAGER", "PRODUCER", "CREW", "FINANCE", "CLIENT"],
      items: [
        {
          name: "Projectos",
          url: "/projects",
          roles: ["OWNER", "MANAGER", "PRODUCER", "CREW", "FINANCE"],
        },
        {
          name: "Quadro de Produção",
          url: "/kanban",
          roles: ["OWNER", "MANAGER", "PRODUCER", "CREW"],
        },
        {
          name: "Entregáveis & Copiões",
          url: "/deliverables",
          roles: ["OWNER", "MANAGER", "PRODUCER", "CREW", "CLIENT"],
        },
      ],
    },
    {
      name: "Recursos & Estúdio",
      url: "#",
      icon: <Icon name="Camera" className="w-5 h-5" />,
      roles: ["OWNER", "MANAGER", "PRODUCER", "CREW"],
      items: [
        {
          name: "Equipamentos",
          url: "/equipment",
          roles: ["OWNER", "MANAGER", "PRODUCER", "CREW"],
        },
        {
          name: "Estúdio & Espaços",
          url: "/studio",
          roles: ["OWNER", "MANAGER", "PRODUCER", "CREW"],
        },
      ],
    },
    {
      name: "Comercial & Finanças",
      url: "#",
      icon: <Icon name="Receipt" className="w-5 h-5" />,
      roles: ["OWNER", "MANAGER", "PRODUCER", "FINANCE"],
      items: [
        {
          name: "Clientes & CRM",
          url: "/crm",
          roles: ["OWNER", "MANAGER", "PRODUCER", "FINANCE"],
        },
        {
          name: "Orçamentos",
          url: "/budgets",
          roles: ["OWNER", "MANAGER", "PRODUCER", "FINANCE"],
        },
        {
          name: "Catálogo de Serviços",
          url: "/services",
          roles: ["OWNER", "MANAGER", "PRODUCER", "FINANCE"],
        },
        {
          name: "Finanças & Despesas",
          url: "/finance",
          roles: ["OWNER", "MANAGER", "PRODUCER", "FINANCE"],
        },
      ],
    },
    {
      name: "Nora Suite",
      url: "#",
      icon: <Icon name="Sparkles" className="w-5 h-5 text-primary" />,
      roles: ["OWNER", "MANAGER", "PRODUCER", "CREW", "FINANCE"],
      items: [
        {
          name: "Nora AI",
          url: "/ai",
          badge: "Pro",
          badgeVariant: "pro",
        },
        {
          name: "Nora Insights",
          url: "/insights",
          badge: "Pro",
          badgeVariant: "pro",
        },
        {
          name: "Nora Automate",
          url: "/automate",
          badge: "Pro",
          badgeVariant: "pro",
        },
      ],
    },
    {
      name: "Subscrições & Capacidade",
      url: "/subscriptions",
      icon: <Icon name="CreditCard" className="w-5 h-5" />,
      roles: ["OWNER", "MANAGER"],
    },
    {
      name: "Configurações",
      url: "/settings",
      icon: <Icon name="Settings" className="w-5 h-5" />,
      roles: ["OWNER", "MANAGER", "ADMIN", "PRODUCER", "FINANCE", "CREW", "EDITOR", "MEMBER"],
    },
  ],
};

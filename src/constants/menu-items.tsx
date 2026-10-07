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
      name: "Projectos",
      url: "/projects",
      icon: <Icon name="Clapperboard" className="w-5 h-5" />,
      roles: ["OWNER", "MANAGER", "PRODUCER", "CREW", "FINANCE"],
    },
    {
      name: "Equipamentos",
      url: "/equipment",
      icon: <Icon name="Camera" className="w-5 h-5" />,
      roles: ["OWNER", "MANAGER", "PRODUCER", "CREW"],
    },
    {
      name: "Estúdio",
      url: "/studio",
      icon: <Icon name="Building2" className="w-5 h-5" />,
      roles: ["OWNER", "MANAGER", "PRODUCER", "CREW"],
    },
    {
      name: "Quadro de Produção",
      url: "/kanban",
      icon: <Icon name="Kanban" className="w-5 h-5" />,
      roles: ["OWNER", "MANAGER", "PRODUCER", "CREW"],
    },
    {
      name: "Entregáveis & Copiões",
      url: "/deliverables",
      icon: <Icon name="Video" className="w-5 h-5" />,
      roles: ["OWNER", "MANAGER", "PRODUCER", "CREW", "CLIENT"],
    },
    {
      name: "Orçamentos",
      url: "/budgets",
      icon: <Icon name="FileSpreadsheet" className="w-5 h-5" />,
      roles: ["OWNER", "MANAGER", "PRODUCER", "FINANCE"],
    },
    {
      name: "Finanças & Despesas",
      url: "/finance",
      icon: <Icon name="Receipt" className="w-5 h-5" />,
      roles: ["OWNER", "MANAGER", "PRODUCER", "FINANCE"],
    },
    {
      name: "Clientes & CRM",
      url: "/crm",
      icon: <Icon name="Users" className="w-5 h-5" />,
      roles: ["OWNER", "MANAGER", "PRODUCER", "FINANCE"],
    },
    {
      name: "Nora Suite",
      url: "/ai",
      icon: <Icon name="Sparkles" className="w-5 h-5 text-primary" />,
      roles: ["OWNER", "MANAGER", "PRODUCER", "CREW", "FINANCE"],
      items: [
        {
          name: "Nora AI",
          url: "/ai",
          badge: "Activo",
          badgeVariant: "active",
        },
        {
          name: "Nora Insights",
          url: "/insights",
          badge: "Activo",
          badgeVariant: "active",
        },
        {
          name: "Nora Automate",
          url: "/automate",
          badge: "Disponível",
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

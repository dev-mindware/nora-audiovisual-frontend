import { Role } from "@/types";

// Rotas públicas (acessíveis sem autenticação)
export const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/checkout",
  "/portal/deliverables/view",
  "/portal/budgets/view",
  "/unauthorized",
  "/not-found",
] as const;

// Páginas de autenticação — se logado, redireciona para dashboard
export const AUTH_PAGES = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
] as const;

// Prefixos de rotas privadas (Nora Audiovisual Core)
export const PRIVATE_ROUTE_PREFIXES = [
  "/portal",
  "/dashboard",
  "/admin",
  "/projects",
  "/equipment",
  "/studio",
  "/kanban",
  "/deliverables",
  "/budgets",
  "/finance",
  "/crm",
  "/ai",
  "/insights",
  "/automate",
  "/subscriptions",
  "/settings",
] as const;

// Rota de login padrão
export const DEFAULT_LOGIN_REDIRECT = "/auth/login";

// Rota de unauthorized
export const UNAUTHORIZED_REDIRECT = "/unauthorized";

// Prefixo de auth da API
export const API_AUTH_PREFIX = "/api/auth";

// Cookies
export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const ROLE_KEY = "user_role";

// Mapa de redirect por role
export const ROLE_REDIRECTS: Record<Role, string> = {
  ADMIN: "/admin",
  OWNER: "/dashboard",
  MANAGER: "/dashboard",
  PRODUCER: "/dashboard",
  FINANCE: "/dashboard",
  EDITOR: "/dashboard",
  CREW: "/dashboard",
  CLIENT: "/portal",
  MEMBER: "/dashboard",
  CASHIER: "/dashboard",
};

// Validação: roles aceitas (para validar cookie manipulado)
export const VALID_ROLES: Role[] = [
  "ADMIN",
  "OWNER",
  "MANAGER",
  "PRODUCER",
  "FINANCE",
  "EDITOR",
  "CREW",
  "CLIENT",
  "MEMBER",
  "CASHIER",
];
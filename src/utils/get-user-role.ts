import { Role } from "@/types";

export const getUserRole = (role: Role) => {
  const roleMap: Record<Role, string> = {
    OWNER: "Proprietário",
    MANAGER: "Gerente",
    ADMIN: "Administrador",
    CASHIER: "Caixa",
    PRODUCER: "Produtor",
    FINANCE: "Financeiro",
    EDITOR: "Editor / Pós-Produção",
    CREW: "Equipa Técnica / Realizador",
    CLIENT: "Cliente / Revisor",
    MEMBER: "Membro da Equipa",
  };
  return roleMap[role] || role;
};


# 🎬 Nora Audiovisual — Frontend

Plataforma de gestão integrada e produção audiovisual para empresas de cinema, eventos, aluguer de equipamento e streaming. Desenvolvido com base no **MINDGEST Frontend SDK**.

---

## 🛠️ Stack Tecnológica

- **Framework**: [Next.js](https://nextjs.org/) 16 (App Router com Turbopack em dev e Webpack para compilação estável)
- **UI Core**: [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/) 5
- **Design System & Estilização**: [Tailwind CSS](https://tailwindcss.com/) v4 + [Radix UI](https://www.radix-ui.com/) + CVA + [Lucide React](https://lucide.dev/)
- **Server State & Cache**: [TanStack React Query](https://tanstack.com/query) v5 + Axios
- **Tabelas & Inventário**: [TanStack Table](https://tanstack.com/table) v8 (`UniversalTable` / `DataTable`)
- **Gestão de Estado do Cliente**: [Zustand](https://zustand.docs.pmnd.rs/) (stores atómicas)
- **Filtros & URL State**: [Nuqs](https://nuqs.47ng.com/) (`useQueryState`)
- **Formulários**: React Hook Form + Zod (`@hookform/resolvers/zod`)
- **Notificações & Feedback**: Sonner

---

## 📂 Estrutura de Componentes Importados (Mindgest SDK)

Todos os componentes canónicos e módulos do ecossistema Mindgest foram integrados:

- **`src/components/ui/`**: 44+ primitivos shadcn/radix (Button, Dialog, Popover, Dropdown, Table, Input, Select, Badge, Card, Tooltip, Sheet, etc.)
- **`src/components/common/`**: `PageWrapper`, `UniversalTable`, `DynamicBreadcrumb`, `DynamicDrawer`, `EmptyState`, `AlertError`, `RequestError`, `FeatureGate`, `PlanGate`, `OnboardingTourButton`, etc.
- **`src/components/custom/`**: `InputCurrency`, `PriceInput`, `PercInput`, `DatePickerInput`, `ValidInputPassword`, `RequiredInput`, `MultiSelectInput`, `ChartAreaInteractive`, etc.
- **`src/components/guards/`**: `ProtectedAction`, `SubscriptionGuard`, `PaywallHeader`, etc.
- **`src/components/modal/`**: Modais de subscrição, estados de confirmação e alertas.
- **`src/components/shared/`**: `DynamicMetricCard`, `MetricTrend`, `Notifications`, `Chatbot`, `TrialBanner`, etc.
- **`src/components/templates/`**: Sidebars responsivas, layouts e templates.
- **`src/components/auth/`**: Fluxos de login, recuperação de senha, registo e autenticação.
- **`src/components/client/`**: Orquestradores de conteúdo e o módulo inicial `NoraHomePageContent`.

---

## 🚀 Como Executar

### 1. Instalar dependências
```bash
pnpm install
```

### 2. Configurar variáveis de ambiente
Copie o ficheiro `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Iniciar servidor de desenvolvimento
```bash
pnpm dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

### 4. Compilar para produção
```bash
pnpm build
```
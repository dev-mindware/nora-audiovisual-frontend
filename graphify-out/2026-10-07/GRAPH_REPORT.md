# Graph Report - nora-audiovisual-frontend  (2026-10-07)

## Corpus Check
- 602 files · ~975,253 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .example 1, (none) 1, .webmanifest 1)

## Summary
- 2934 nodes · 10275 edges · 128 communities (112 shown, 16 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 38 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7ef1b2a7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- src_components_index_button
- Card
- dependencies
- notifications.tsx
- components/index.ts
- admin-dashboard-view.tsx
- cn
- Icon
- project-detail-page-content.tsx
- projects-page-content.tsx
- sidebar-info.tsx
- forgot-password/page.tsx
- ErrorMessage
- ui/index.ts
- schemas/index.ts
- package.json
- Skeleton
- nextjs-responsive-ui-skill.md
- nora.ts
- types/index.ts
- kanban-settings-tab.tsx
- Input
- Button
- modal/index.tsx
- equipment-page-content.tsx
- chatbot/index.tsx
- kanban-page-content.tsx
- next
- call-sheet-modal.tsx
- project-modal.tsx
- chart-area-interactive.tsx
- recovery-password.tsx
- page-wrapper/index.tsx
- automate-page-content.tsx
- session.ts
- app/layout.tsx
- register-flow.tsx
- (client)/layout.tsx
- first-step.tsx
- studio-page-content.tsx
- nif-verification-field.tsx
- date-picker.tsx
- utils/index.ts
- data-table-toolbar.tsx
- DropdownMenuContent
- verify-email-content.tsx
- api.ts
- app-sidebar.tsx
- use-onboarding-tour.ts
- types/auth.ts
- components/common/index.ts
- deliverables-page-content.tsx
- portal-service.ts
- dashboard.ts
- admin-audit-page-content.tsx
- Badge
- item-status-badge/index.tsx
- dynamic-breadcrumb.tsx
- services/index.ts
- workflow-modal.tsx
- stepper.tsx
- onboarding-preferences-store.ts
- compilerOptions
- components.json
- budget-modal.tsx
- @tanstack/react-query
- lib/utils.ts
- react
- use-onboarding-preferences.ts
- hero-charts.tsx
- constants/index.ts
- onboarding-tours.ts
- deliverables-service.ts
- custom/index.ts
- _components/index.ts
- use-plans.ts
- 🚀 Como Executar
- deliverable-modal.tsx
- use-budgets.ts
- upgrade-plan-modal.tsx
- reports.ts
- 54. Ordem de implementação recomendada
- devDependencies
- use-mindgest.ts
- 52. Padrões Tailwind recomendados
- file-upload-modal.tsx
- async-multi-select.tsx
- chatbot-service.ts
- drawer.tsx
- 53. Anti-patterns
- subscriptions/checkout-modal.tsx
- settings-page-content.tsx
- clients-filters.ts
- entities.ts
- 51. Checklist obrigatório para cada página
- supplier-details-skeleton.tsx
- mindgest-kpi-grid.tsx
- SubscriptionStatus
- eslint.config.mjs
- images.d.ts
- tutorials-modal.tsx
- cashier.ts
- Skill: Responsive UI Engineering para Next.js
- scripts
- mindgest-urgent-items.tsx
- collapsible.tsx
- reset-password.tsx
- plan-gate.tsx
- audit-trail.ts
- axios
- notification-skeleton.tsx
- 50. Regra para decidir o layout
- 8. Tabelas: nunca assumir que uma tabela desktop deve permanecer tabela no mobile
- global.d.ts
- 4.1 Quatro cards no desktop → 2×2 no mobile
- 56. Regra final para agentes de código
- download-barcode-png.ts
- list-skeleton.tsx
- 12. Botões
- 7. Tamanho de texto responsivo
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `cn()` - 286 edges
2. `Button()` - 254 edges
3. `react` - 230 edges
4. `lucide-react` - 150 edges
5. `Input` - 108 edges
6. `Badge()` - 104 edges
7. `Icon()` - 98 edges
8. `Card()` - 88 edges
9. `next` - 78 edges
10. `CardContent()` - 75 edges

## Surprising Connections (you probably didn't know these)
- `🛠️ Stack Tecnológica` --references--> `DataTable()`  [INFERRED]
  README.md → src/components/custom/universal-table/data-table.tsx
- `📂 Estrutura de Componentes Importados (Mindgest SDK)` --references--> `NoraHomePageContent()`  [INFERRED]
  README.md → src/components/client/nora/nora-home-page-content.tsx
- `📂 Estrutura de Componentes Importados (Mindgest SDK)` --references--> `DynamicDrawer()`  [INFERRED]
  README.md → src/components/common/dynamic-drawer/dinamic-drawer.tsx
- `📂 Estrutura de Componentes Importados (Mindgest SDK)` --references--> `EmptyState()`  [INFERRED]
  README.md → src/components/common/empty-state/index.tsx
- `📂 Estrutura de Componentes Importados (Mindgest SDK)` --references--> `PageWrapper()`  [INFERRED]
  README.md → src/components/common/page-wrapper/index.tsx

## Import Cycles
- 3-file cycle: `src/components/custom/index.ts -> src/components/custom/input-password-normal.tsx -> src/components/index.ts -> src/components/custom/index.ts`
- 3-file cycle: `src/components/custom/date-picker-input.tsx -> src/components/index.ts -> src/components/custom/index.ts -> src/components/custom/date-picker-input.tsx`
- 3-file cycle: `src/components/index.ts -> src/components/shared/index.ts -> src/components/shared/dynamic-metric-card.tsx -> src/components/index.ts`
- 3-file cycle: `src/components/index.ts -> src/components/modal/index.tsx -> src/components/modal/icon-warning.tsx -> src/components/index.ts`
- 3-file cycle: `src/components/custom/chart-area-interactive.tsx -> src/components/index.ts -> src/components/custom/index.ts -> src/components/custom/chart-area-interactive.tsx`
- 3-file cycle: `src/components/custom/index.ts -> src/components/custom/required-input.tsx -> src/components/index.ts -> src/components/custom/index.ts`
- 3-file cycle: `src/components/custom/index.ts -> src/components/custom/section-cards.tsx -> src/components/index.ts -> src/components/custom/index.ts`
- 3-file cycle: `src/components/common/index.ts -> src/components/common/nif-verification-field.tsx -> src/components/index.ts -> src/components/common/index.ts`
- 3-file cycle: `src/components/common/index.ts -> src/components/common/page-wrapper/index.tsx -> src/components/index.ts -> src/components/common/index.ts`
- 3-file cycle: `src/components/common/index.ts -> src/components/common/request-error/index.tsx -> src/components/index.ts -> src/components/common/index.ts`
- 3-file cycle: `src/components/common/index.ts -> src/components/common/search-handler-wrapper/index.tsx -> src/components/index.ts -> src/components/common/index.ts`
- 3-file cycle: `src/components/index.ts -> src/components/modal/index.tsx -> src/components/modal/icon-success.tsx -> src/components/index.ts`
- 3-file cycle: `src/components/index.ts -> src/components/portal/index.ts -> src/components/portal/portal-navbar.tsx -> src/components/index.ts`
- 3-file cycle: `src/components/index.ts -> src/components/shared/index.ts -> src/components/shared/chatbot/index.tsx -> src/components/index.ts`
- 3-file cycle: `src/components/index.ts -> src/components/shared/index.ts -> src/components/shared/metric-trend.tsx -> src/components/index.ts`
- 4-file cycle: `src/components/common/index.ts -> src/components/common/title-list/index.tsx -> src/components/ui/index.ts -> src/components/ui/button-submit.tsx -> src/components/common/index.ts`
- 4-file cycle: `src/components/common/index.ts -> src/components/common/title-list/index.tsx -> src/components/ui/index.ts -> src/components/ui/custom-select.tsx -> src/components/common/index.ts`
- 4-file cycle: `src/components/common/index.ts -> src/components/common/title-list/index.tsx -> src/components/ui/index.ts -> src/components/ui/input.tsx -> src/components/common/index.ts`
- 4-file cycle: `src/components/common/index.ts -> src/components/common/title-list/index.tsx -> src/components/ui/index.ts -> src/components/ui/input-currency.tsx -> src/components/common/index.ts`
- 4-file cycle: `src/components/common/index.ts -> src/components/common/title-list/index.tsx -> src/components/ui/index.ts -> src/components/ui/textarea.tsx -> src/components/common/index.ts`

## Communities (128 total, 16 thin omitted)

### Community 0 - "src_components_index_button"
Cohesion: 0.10
Nodes (39): date-fns, SuccessResetModal(), AdminMetricsCards(), AdminMetricsCardsProps, AdminLegacyPageContent(), AdminTab, COLORS, AdminAuditPageContent() (+31 more)

### Community 1 - "Card"
Cohesion: 0.13
Nodes (42): CallSheetContent(), CallSheetPage(), DeliverablePortalPage(), PageProps, TanStackChartContainer(), CheckoutPageContent(), AudiovisualDashboardContent(), DashboardSalesPie() (+34 more)

### Community 2 - "dependencies"
Cohesion: 0.03
Nodes (65): dependencies, axios, class-variance-authority, clsx, date-fns, driver.js, @fullcalendar/core, @fullcalendar/daygrid (+57 more)

### Community 3 - "notifications.tsx"
Cohesion: 0.05
Nodes (44): @radix-ui/react-scroll-area, zustand, AllNotifications(), NotificationDropdown(), NOTIFICATION_STYLES, NotificationItem(), NotificationItemProps, NotificationList() (+36 more)

### Community 4 - "components/index.ts"
Cohesion: 0.05
Nodes (33): @radix-ui/react-avatar, AdminAuditPage(), AdminOverviewPage(), AdminSubscriptionsPage(), AdminTenantsPage(), AdminUsersPage(), AiAssistantPage(), AutomatePage() (+25 more)

### Community 5 - "admin-dashboard-view.tsx"
Cohesion: 0.24
Nodes (27): AdminDashboardView, CrewDashboardView, DynamicRoleDashboard(), EditorDashboardView, FinanceDashboardView, ManagerDashboardView, OwnerDashboardView, ProducerDashboardView (+19 more)

### Community 6 - "cn"
Cohesion: 0.08
Nodes (43): input-otp, radix-ui, @radix-ui/react-separator, OverviewLegendRow(), OverviewLegendRowProps, SidebarSkeleton(), SidebarSkeletonProps, widths (+35 more)

### Community 7 - "Icon"
Cohesion: 0.10
Nodes (19): react-number-format, Icon(), Props, InputPassword, Option, QuizSelect(), QuizSelectProps, IconCheckSucessfull() (+11 more)

### Community 8 - "project-detail-page-content.tsx"
Cohesion: 0.06
Nodes (28): ProjectDetailPage(), ProjectDetailPageProps, CATEGORY_LABELS, ProjectDetailPageContent(), ProjectDetailPageContentProps, STAGE_LABELS, STATUS_LABELS, useProjectDeliverables() (+20 more)

### Community 9 - "projects-page-content.tsx"
Cohesion: 0.07
Nodes (26): BudgetsPageContent(), SORT_OPTIONS, STATUS_OPTIONS, ClientRow, SORT_OPTIONS, STATUS_OPTIONS, TYPE_OPTIONS, SORT_OPTIONS (+18 more)

### Community 10 - "sidebar-info.tsx"
Cohesion: 0.10
Nodes (11): NotificationFiltersProps, STATUS_LABELS, TYPE_LABELS, SidebarMenu(), SidebarMenuButton(), SidebarMenuItem(), BeforeInstallPromptEvent, isStandaloneMode() (+3 more)

### Community 11 - "forgot-password/page.tsx"
Cohesion: 0.20
Nodes (13): ForgotPasswordPage(), metadata, LoginPage(), metadata, metadata, RegisterPage(), metadata, ResetPasswordPage() (+5 more)

### Community 12 - "ErrorMessage"
Cohesion: 0.19
Nodes (24): handleSwitch(), handleSwitch(), DELIVERABLES_QUERY_KEY, useAddReviewComment(), useCreateDeliverable(), usePublishDeliverable(), useResolveReviewComment(), EQUIPMENT_QUERY_KEY (+16 more)

### Community 13 - "ui/index.ts"
Cohesion: 0.18
Nodes (10): sonner, AiAssistantPageContent, AiPageContent(), ChatMessage, Step, Props, PortalBudgetViewProps, PortalDeliverableViewProps (+2 more)

### Community 14 - "schemas/index.ts"
Cohesion: 0.08
Nodes (29): zod, CallSheetFormData, createCallSheetSchema, CrewCallSlot, crewCallSlotSchema, ChangePasswordFormData, changePasswordSchema, CompanyFormData (+21 more)

### Community 15 - "package.json"
Cohesion: 0.05
Nodes (41): name, packageManager, private, version, baseline-browser-mapping, eslint, eslint-config-next, @fullcalendar/core (+33 more)

### Community 16 - "Skeleton"
Cohesion: 0.16
Nodes (14): CreditNoteFormSkeleton(), DashboardSkeleton(), DynamicMetricCardSkeleton(), InvoiceFiltersSkeleton(), InvoiceFormSkeleton(), ItemsFiltersSkeleton(), PosCartSkeleton(), PosCategorySkeleton() (+6 more)

### Community 17 - "nextjs-responsive-ui-skill.md"
Cohesion: 0.05
Nodes (43): 10. Não esconder dados importantes no mobile, 11. Toolbar responsiva, 13. Botões com texto longo, 14. Flexbox: `min-w-0` é obrigatório em muitos layouts, 15. Imagens, 16. Vídeo, 17. Modais, 18. Formulários (+35 more)

### Community 18 - "nora.ts"
Cohesion: 0.07
Nodes (26): CallSheetModalProps, useProjectsFilters(), CreateProjectPayload, ProjectFilters, projectsService, AiBudgetEstimatePrompt, AiCallSheetPrompt, AiCreditBalance (+18 more)

### Community 19 - "types/index.ts"
Cohesion: 0.09
Nodes (16): @tanstack/charts, TanStackAreaChartProps, TanStackBarChartProps, DEFAULT_PALETTE, TanStackDonutChartProps, dashboardRoleService, DashboardCapacityItem, DashboardDistributionSlice (+8 more)

### Community 20 - "kanban-settings-tab.tsx"
Cohesion: 0.20
Nodes (14): EditColumnDialogProps, Switch(), KANBAN_CATEGORIES_METADATA, NOTION_KANBAN_COLORS, KANBAN_SETTINGS_QUERY_KEY(), CreateKanbanColumnPayload, kanbanSettingsService, UpdateCardPropertiesPayload (+6 more)

### Community 21 - "Input"
Cohesion: 0.09
Nodes (32): WorkflowModal(), BudgetModal(), ClientModal(), DeliverableModal(), EquipmentModal(), ReservationModal(), EXPENSE_CATEGORIES, RecordExpenseModal() (+24 more)

### Community 22 - "Button"
Cohesion: 0.09
Nodes (25): class-variance-authority, lucide-react, @radix-ui/react-slot, NotFound(), UnauthorizedPage(), GoogleButton(), NavigationButtons(), Props (+17 more)

### Community 23 - "modal/index.tsx"
Cohesion: 0.24
Nodes (23): SEVERITY_CONFIG, MindgestInvoiceModal(), FileUploadModal(), EditColumnDialog(), KanbanSettingsTab(), AddOnPurchaseModal(), SubscriptionCheckoutModal(), SubscriptionSuccessModal() (+15 more)

### Community 24 - "equipment-page-content.tsx"
Cohesion: 0.06
Nodes (34): CheckinModal(), CheckinModalProps, CONDITION_OPTIONS, CheckoutModal(), CheckoutModalProps, CONDITION_OPTIONS, CATEGORY_OPTIONS, CONDITION_OPTIONS (+26 more)

### Community 25 - "chatbot/index.tsx"
Cohesion: 0.10
Nodes (37): AuditInvestigationDrawer(), DynamicDrawer(), DynamicDrawerProps, FilterOption, MobileFilterBottomSheet(), MobileFilterBottomSheetExtra, AnimatedRenderAIMessage(), ChatTab() (+29 more)

### Community 26 - "kanban-page-content.tsx"
Cohesion: 0.11
Nodes (34): @radix-ui/react-select, DASHBOARD_PERIOD_OPTIONS, DashboardPeriodSelectProps, DeliverableTypesModal(), DeliverableTypesModalProps, DEPARTMENT_CONFIG, DEPARTMENT_OPTIONS, FALLBACK_COLUMNS (+26 more)

### Community 27 - "next"
Cohesion: 0.10
Nodes (13): nextConfig, next, CheckoutPage(), metadata, AccountCreatedModal(), UnauthorizedLink(), PaywallHeader(), ProtectedActionProps (+5 more)

### Community 28 - "call-sheet-modal.tsx"
Cohesion: 0.10
Nodes (30): @tanstack/react-table, BudgetPortalPage(), PageProps, DashboardRecentSalesTable(), StoresBreakdownTable(), FinancePageContent(), CallSheetModal(), DataTableProps (+22 more)

### Community 29 - "project-modal.tsx"
Cohesion: 0.09
Nodes (13): @hookform/resolvers, ClientModalProps, AUDIOVISUAL_ROLES, MemberModalProps, ProjectModalProps, CrmClientFormData, crmClientSchema, addMemberSchema (+5 more)

### Community 30 - "chart-area-interactive.tsx"
Cohesion: 0.06
Nodes (30): recharts, COLORS, DashboardSalesPieProps, MindgestAreaChartProps, MindgestAreaSeries, MindgestBarChartProps, MindgestBarItem, DEFAULT_COLORS (+22 more)

### Community 31 - "recovery-password.tsx"
Cohesion: 0.18
Nodes (8): OTPModal(), RecoveryPassword(), onSubmit(), useForgotPassword(), ForgotPasswordFormData, forgotPasswordSchema, OtpFormData, otpSchema

### Community 32 - "page-wrapper/index.tsx"
Cohesion: 0.09
Nodes (8): Action, ActionItem, ActionVariant, isSeparator(), Props, SeparatorItem, variantStyles, Props

### Community 33 - "automate-page-content.tsx"
Cohesion: 0.08
Nodes (21): SKIP_REASONS, STATUS_STYLES, AUTOMATE_QUERY_KEY, useCreateWorkflow(), useDeleteWorkflow(), useExecuteWorkflow(), useTestWorkflow(), useToggleWorkflow() (+13 more)

### Community 34 - "session.ts"
Cohesion: 0.12
Nodes (24): ACCESS_TOKEN_KEY, API_AUTH_PREFIX, DEFAULT_LOGIN_REDIRECT, PRIVATE_ROUTE_PREFIXES, PUBLIC_ROUTES, REFRESH_TOKEN_KEY, ROLE_KEY, ROLE_REDIRECTS (+16 more)

### Community 35 - "app/layout.tsx"
Cohesion: 0.11
Nodes (13): next-themes, inter, metadata, outfit, plusJakartaSans, poppins, roboto, RootLayout() (+5 more)

### Community 36 - "register-flow.tsx"
Cohesion: 0.13
Nodes (15): LoginActionResult, logoutAction(), registerAction(), RegisterActionResult, PlanOption, PLANS, RegisterFlow(), handleRegister() (+7 more)

### Community 37 - "(client)/layout.tsx"
Cohesion: 0.09
Nodes (22): ALLOWED_ROLES, ClientLayout(), ADMIN_ALLOWED_ROLES, AdminLayout(), ALLOWED_PORTAL_ROLES, PortalLayout(), SubscriptionGuard(), PortalNavbar() (+14 more)

### Community 38 - "first-step.tsx"
Cohesion: 0.13
Nodes (23): 📂 Estrutura de Componentes Importados (Mindgest SDK), FirstStep(), FirstStepProps, SecondStep(), StepsHeader(), terms, ThirdStep(), AlertError() (+15 more)

### Community 39 - "studio-page-content.tsx"
Cohesion: 0.10
Nodes (18): nuqs, BOOKING_STATUS_OPTIONS, DEFAULT_RESOURCES, RESOURCE_TYPE_LABELS, RESOURCE_TYPE_OPTIONS, StudioPageContent(), useStudioFilters(), STUDIO_QUERY_KEY (+10 more)

### Community 40 - "nif-verification-field.tsx"
Cohesion: 0.14
Nodes (20): NifVerificationField(), NifVerificationFieldProps, useContributorVerification(), UseNifFormVerificationOptions, FINAL_CONSUMER_TAX_NUMBER, isValidAngolanTaxNumber(), normalizeTaxNumber(), RESTRICTED_TAXPAYER_STATUSES (+12 more)

### Community 41 - "date-picker.tsx"
Cohesion: 0.14
Nodes (17): react-day-picker, FilterDropdown(), DateRangeFilter(), DateRangeFilterProps, FilterPopover(), FilterPopoverOption, FilterPopoverProps, FilterPopoverProps (+9 more)

### Community 42 - "utils/index.ts"
Cohesion: 0.09
Nodes (15): loginAction(), LoginForm(), handleLogin(), AI_QUERY_KEY, usePreviewAiAction(), useSendAiMessage(), LoginFormData, loginSchema (+7 more)

### Community 43 - "data-table-toolbar.tsx"
Cohesion: 0.29
Nodes (17): AutomatePageContent(), COLUMN_LABEL_MAP, DataTableToolbar(), getColumnDisplayTitle(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent() (+9 more)

### Community 44 - "DropdownMenuContent"
Cohesion: 0.21
Nodes (24): CrmPageContent(), DeliverablesPageContent(), FilesPageContent(), ProjectsPageContent(), ButtonActionLink(), Props, OrganizationSwitcher(), DataTableRowActions() (+16 more)

### Community 45 - "verify-email-content.tsx"
Cohesion: 0.53
Nodes (4): VerifyEmailContent(), verify(), ApiError, parseApiError()

### Community 46 - "api.ts"
Cohesion: 0.10
Nodes (16): use-debounce, clearLocalSession(), AsyncCreatableSelectField(), AsyncCreatableSelectProps, Option, fetchCurrentUser(), useFetchUser(), UseFetchUserOptions (+8 more)

### Community 47 - "app-sidebar.tsx"
Cohesion: 0.09
Nodes (18): PlanUpgradeGateProps, MenuItem, menuItems, MenuStructure, SubMenuItem, getPlanFeatureGroups(), includedInAllPlans, mindMessageLimitByPlan (+10 more)

### Community 48 - "use-onboarding-tour.ts"
Cohesion: 0.10
Nodes (45): toDriveStep(), activeDemoInputs, activeRetryIntervals, canUserAccessOnboardingTour(), cleanupActiveDemo(), clearActiveTyping(), clearReactSelect(), clickCreateOption() (+37 more)

### Community 49 - "types/auth.ts"
Cohesion: 0.19
Nodes (12): LoginResponse, NoraMembership, NoraOrganization, Tokens, Company, CompanyData, Store, CheckoutPayload (+4 more)

### Community 50 - "components/common/index.ts"
Cohesion: 0.08
Nodes (17): react-dropzone, DropzoneContent(), FileUpload(), FileUploadProps, ICON_ALIASES, IconProps, PropsBanner, DropzoneContent() (+9 more)

### Community 51 - "deliverables-page-content.tsx"
Cohesion: 0.27
Nodes (6): DELIVERABLE_TYPE_LABELS, STATUS_OPTIONS, formatTimecode(), VideoReviewPlayer(), VideoReviewPlayerProps, ReviewComment

### Community 52 - "portal-service.ts"
Cohesion: 0.10
Nodes (19): ExtraPhotosCheckoutModal(), ExtraPhotosCheckoutModalProps, PhotoProofingGallery(), PhotoProofingGalleryProps, Props, AcceptBudgetPayload, ApproveDeliverablePayload, DeliverableAccessCapabilities (+11 more)

### Community 53 - "dashboard.ts"
Cohesion: 0.08
Nodes (24): DashboardRevenueChart(), DashboardRevenueChartProps, DashboardAccountsReceivable, DashboardActivity, DashboardActivityType, DashboardClientsOverview, DashboardFinancialEvolution, DashboardMetric (+16 more)

### Community 54 - "admin-audit-page-content.tsx"
Cohesion: 0.17
Nodes (18): CATEGORIES, OS_FILTERS, SEVERITIES, AuditInvestigationDrawerProps, AuditTimelineView(), AuditTimelineViewProps, SEVERITY_DOT, CATEGORIES (+10 more)

### Community 55 - "Badge"
Cohesion: 0.10
Nodes (26): ClientPortalBudgetsPage(), ClientPortalDeliverablesPage(), ClientPortalOverviewPage(), MindgestInvoiceModalProps, KpiMetricCard(), VARIANT_STYLES, CATEGORY_LABELS, PortalBudgetDetailDialog() (+18 more)

### Community 56 - "item-status-badge/index.tsx"
Cohesion: 0.11
Nodes (16): displayStatusLabel(), StatusBadgeProps, statusMap, CreateItemData, ItemData, ItemResponse, ItemsFilters, ItemStatus (+8 more)

### Community 57 - "dynamic-breadcrumb.tsx"
Cohesion: 0.19
Nodes (10): DinamicBreadcrumb(), Props, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage() (+2 more)

### Community 58 - "services/index.ts"
Cohesion: 0.16
Nodes (3): authService, UpdateUserProfilePayload, userService

### Community 59 - "workflow-modal.tsx"
Cohesion: 0.11
Nodes (12): ACTION_LABELS, ACTION_OPTIONS, buildAction(), DEPARTMENT_OPTIONS, TRIGGER_LABELS, TRIGGER_OPTIONS, WorkflowModalProps, useAutomationRoles() (+4 more)

### Community 60 - "stepper.tsx"
Cohesion: 0.13
Nodes (18): StepItemContext, StepItemContextValue, Stepper(), StepperContext, StepperContextValue, StepperDescription(), StepperIndicator(), StepperIndicatorProps (+10 more)

### Community 61 - "onboarding-preferences-store.ts"
Cohesion: 0.29
Nodes (6): defaultPreferences, mergeWithDefaults(), OnboardingPreferencesState, OnboardingScopePreferences, OnboardingTourSeenStatus, useOnboardingPreferencesStore

### Community 62 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 63 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 64 - "budget-modal.tsx"
Cohesion: 0.13
Nodes (9): react-hook-form, BudgetModalProps, CATEGORY_OPTIONS, Option, RHFSelectProps, BudgetFormData, budgetFormSchema, BudgetItemData (+1 more)

### Community 65 - "@tanstack/react-query"
Cohesion: 0.12
Nodes (12): @tanstack/react-query, PaginationResponse, UsePaginatedFetchOptions, usePagination(), useAddClient(), useGetClients(), useToggleStatusClient(), useUpdateClient() (+4 more)

### Community 66 - "lib/utils.ts"
Cohesion: 0.12
Nodes (13): clsx, tailwind-merge, ChartSkeleton(), ChartSkeletonProps, TanStackChartContainerProps, EmptyStateProps, MultiQuizSelect(), Option (+5 more)

### Community 67 - "react"
Cohesion: 0.19
Nodes (9): react, PercInput(), LabeledInputWithIconProps, RequiredInput(), ValidInputPassword(), Label(), EntityFilters, useSliderWithInput() (+1 more)

### Community 68 - "use-onboarding-preferences.ts"
Cohesion: 0.15
Nodes (24): OnboardingTourId, OnboardingTourMode, enqueuePendingTourReset(), enqueuePendingTourUpdate(), ONBOARDING_QUERY_KEY, PendingTourReset, PendingTourUpdate, readPendingTourResets() (+16 more)

### Community 69 - "hero-charts.tsx"
Cohesion: 0.25
Nodes (13): billingConfig, billingData, GlassWrapper(), HeroBillingChart(), HeroPieChart(), HeroRadarChart(), HeroStatsWidget(), HeroStockChart() (+5 more)

### Community 70 - "constants/index.ts"
Cohesion: 0.08
Nodes (17): MINDWARE_INFO, MAX_FILE_SIZE, categorySortByOption, categorySortOrderOption, categoryStatusOptions, invoiceByOption, invoiceStatusOptions, itemsByOption (+9 more)

### Community 71 - "onboarding-tours.ts"
Cohesion: 0.14
Nodes (13): driver.js, dataTour(), OnboardingDriveStep, OnboardingTourDemo, OnboardingTourGroup, onboardingTours, OnboardingTourType, StepOptions (+5 more)

### Community 72 - "deliverables-service.ts"
Cohesion: 0.19
Nodes (9): useDeliverablesFilters(), CreateDeliverablePayload, CreateReviewCommentPayload, DeliverableFilters, deliverablesService, formatTimecode(), mapReviewComment(), DeliverableType (+1 more)

### Community 73 - "custom/index.ts"
Cohesion: 0.11
Nodes (20): @internationalized/date, react-aria-components, DatePickerInput(), DatePickerInputProps, PriceInput(), PriceInputProps, TimeInput(), TimeInputProps (+12 more)

### Community 75 - "use-plans.ts"
Cohesion: 0.25
Nodes (5): useFetch(), usePlans(), PlanStore, useCurrentPlanStore, Plan

### Community 76 - "🚀 Como Executar"
Cohesion: 0.25
Nodes (7): 1. Instalar dependências, 2. Configurar variáveis de ambiente, 3. Iniciar servidor de desenvolvimento, 4. Compilar para produção, 🚀 Como Executar, 🎬 Nora Audiovisual — Frontend, 🛠️ Stack Tecnológica

### Community 77 - "deliverable-modal.tsx"
Cohesion: 0.14
Nodes (7): DeliverableModalProps, DELIVERABLE_TYPES_QUERY_KEY, createDeliverableSchema, DeliverableFormData, DEFAULT_DELIVERABLE_TYPES, DeliverableTypeItem, deliverableTypesService

### Community 78 - "use-budgets.ts"
Cohesion: 0.22
Nodes (7): BUDGETS_QUERY_KEY, useChangeBudgetStatus(), useCreateBudget(), BudgetFilters, budgetsService, CreateBudgetPayload, BudgetStatus

### Community 79 - "upgrade-plan-modal.tsx"
Cohesion: 0.24
Nodes (9): PENDING_SUBSCRIPTION_MODAL_ID, PendingSubscriptionModal(), UPGRADE_PLAN_MODAL_ID, UpgradePlanModal(), SubscriptionModal(), FeatureGateContext, FeatureGateContextType, FeatureGateProviderContext() (+1 more)

### Community 80 - "reports.ts"
Cohesion: 0.14
Nodes (13): ClientAnalytics, ClientAnalyticsResponse, ClientAnalyticsSummary, MonthlyTrend, PosManagementDashboard, PosManagementSummary, PreferredItem, ReportExportParams (+5 more)

### Community 81 - "54. Ordem de implementação recomendada"
Cohesion: 0.15
Nodes (13): 54. Ordem de implementação recomendada, Passo 1, Passo 10, Passo 11, Passo 12, Passo 2, Passo 3, Passo 4 (+5 more)

### Community 82 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, baseline-browser-mapping, eslint, eslint-config-next, @eslint/eslintrc, tailwindcss, @tailwindcss/postcss, tw-animate-css (+4 more)

### Community 83 - "use-mindgest.ts"
Cohesion: 0.21
Nodes (9): INVOICE_REQUESTS_QUERY_KEY, MINDGEST_CONFIG_QUERY_KEY, useConfigureMindgest(), useCreateInvoiceRequest(), billingService, ConfigureMindgestPayload, CreateInvoiceRequestPayload, InvoiceRequest (+1 more)

### Community 84 - "52. Padrões Tailwind recomendados"
Cohesion: 0.18
Nodes (11): 52. Padrões Tailwind recomendados, Card textual, Conteúdo, Dashboard, Desktop table, Flex responsivo, Formulário, Full-height mobile (+3 more)

### Community 85 - "file-upload-modal.tsx"
Cohesion: 0.16
Nodes (7): FileUploadModalProps, useFilesFilters(), useFiles(), FileAsset, FileFilters, filesService, PresignUploadDto

### Community 86 - "async-multi-select.tsx"
Cohesion: 0.40
Nodes (5): react-select, MultiSelect(), MultiSelectProps, SelectOption, selectStyles()

### Community 87 - "chatbot-service.ts"
Cohesion: 0.29
Nodes (5): ChatbotService, ChatbotHistoryResponse, ChatbotMessageRequest, ChatbotResponse, ChatHistoryItem

### Community 88 - "drawer.tsx"
Cohesion: 0.20
Nodes (8): vaul, DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerPortal(), DrawerTitle()

### Community 89 - "53. Anti-patterns"
Cohesion: 0.20
Nodes (10): 53. Anti-patterns, Anti-pattern 1, Anti-pattern 2, Anti-pattern 3, Anti-pattern 4, Anti-pattern 5, Anti-pattern 6, Anti-pattern 7 (+2 more)

### Community 90 - "subscriptions/checkout-modal.tsx"
Cohesion: 0.44
Nodes (6): AddOnPurchaseModalProps, CheckoutModalProps, AddOnItem, noraSubscriptionsService, PlanItem, SubscriptionData

### Community 91 - "settings-page-content.tsx"
Cohesion: 0.42
Nodes (9): InsightsPageContent(), ROLE_ALLOWED_TABS, SettingsPageContent(), SettingsTab, TeamPageContent(), Tabs(), TabsContent(), TabsList() (+1 more)

### Community 92 - "clients-filters.ts"
Cohesion: 0.20
Nodes (4): useClientsFilters(), Client, ClientSelectOption, clientsFilters

### Community 94 - "entities.ts"
Cohesion: 0.24
Nodes (8): Category, CategoryData, CategoryFilters, CategoryResponse, ClientData, ClientResponse, Stores, StoresResponse

### Community 95 - "51. Checklist obrigatório para cada página"
Cohesion: 0.22
Nodes (9): 51. Checklist obrigatório para cada página, Accessibility, Cards, Forms, Layout, Navigation, States, Tables (+1 more)

### Community 96 - "supplier-details-skeleton.tsx"
Cohesion: 0.22
Nodes (4): ClientsFiltersSkeleton(), LoaderStoresSkeleton(), PillSkeleton(), SupplierDetailsSkeleton()

### Community 97 - "mindgest-kpi-grid.tsx"
Cohesion: 0.14
Nodes (10): DashboardSummaryCards(), DashboardSummaryCardsProps, StoresBreakdownTableProps, KpiMetricCardProps, DEFAULT_ICONS, MindgestKpiGridProps, DynamicMetricCard(), DashboardSummary (+2 more)

### Community 98 - "SubscriptionStatus"
Cohesion: 0.25
Nodes (8): SubscriptionStatus, ACTIVE, CANCELED, EXPIRED, PAST_DUE, PENDING, SUSPENDED, TRIALING

### Community 99 - "eslint.config.mjs"
Cohesion: 0.25
Nodes (5): compat, __dirname, eslintConfig, __filename, @eslint/eslintrc

### Community 100 - "images.d.ts"
Cohesion: 0.25
Nodes (6): *.jpeg, *.jpg, *.mp3, *.png, *.svg, *.webp

### Community 101 - "tutorials-modal.tsx"
Cohesion: 0.43
Nodes (6): YoutubeIcon(), TUTORIAL_CATEGORIES, TUTORIAL_VIDEOS, TutorialCategory, TutorialVideo, YOUTUBE_CHANNEL_URL

### Community 102 - "cashier.ts"
Cohesion: 0.29
Nodes (4): Cashier, CashierCardProps, CashOpeningFormProps, OpenCashRegister

### Community 103 - "Skill: Responsive UI Engineering para Next.js"
Cohesion: 0.29
Nodes (7): 1.1 Mobile-first, 1. Princípios fundamentais, 2. Breakpoints: não desenhar para dispositivos específicos, 3. Container principal, Objetivo, Regra, Skill: Responsive UI Engineering para Next.js

### Community 104 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, start, typecheck

### Community 105 - "mindgest-urgent-items.tsx"
Cohesion: 0.33
Nodes (5): MindgestUrgentItemsProps, STATUS_BADGE, TYPE_ICONS, UrgentItemsCardProps, DashboardUrgentItem

### Community 107 - "reset-password.tsx"
Cohesion: 0.15
Nodes (10): getStrength(), PasswordStrengthBar(), StrengthConfig, StrengthLevel, ResetPasswordForm(), onChangePassword(), ResetPasswordSkeleton(), useResetPassword() (+2 more)

### Community 108 - "plan-gate.tsx"
Cohesion: 0.38
Nodes (4): PlanGate(), PlanGateProps, PlanUpgradeGate(), usePlanAccess()

### Community 109 - "audit-trail.ts"
Cohesion: 0.29
Nodes (6): AuditTrailAction, AuditTrailEntity, AuditTrailFilters, AuditTrailResponse, AuditTrailUser, PaginatedAuditTrailResponse

### Community 111 - "notification-skeleton.tsx"
Cohesion: 0.83
Nodes (3): AllNotificationsSkeleton(), NotificationItemSkeleton(), NotificationListSkeleton()

### Community 112 - "50. Regra para decidir o layout"
Cohesion: 0.50
Nodes (4): 1. O conteúdo ainda é legível?, 2. Ficou apertado?, 3. Continua impossível?, 50. Regra para decidir o layout

### Community 113 - "8. Tabelas: nunca assumir que uma tabela desktop deve permanecer tabela no mobile"
Cohesion: 0.50
Nodes (4): 8. Tabelas: nunca assumir que uma tabela desktop deve permanecer tabela no mobile, Estratégia A — tabela com scroll horizontal, Estratégia B — tabela → cards, Regra importante

### Community 116 - "4.1 Quatro cards no desktop → 2×2 no mobile"
Cohesion: 0.67
Nodes (3): 4.1 Quatro cards no desktop → 2×2 no mobile, 4. Grelhas de cards, Quando usar 1 coluna

### Community 117 - "56. Regra final para agentes de código"
Cohesion: 0.67
Nodes (3): 56. Regra final para agentes de código, Princípio de engenharia, Referências

## Knowledge Gaps
- **726 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+721 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1036 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `src_components_index_button`, `Card`, `notifications.tsx`, `components/index.ts`, `admin-dashboard-view.tsx`, `cn`, `Icon`, `project-detail-page-content.tsx`, `projects-page-content.tsx`, `sidebar-info.tsx`, `forgot-password/page.tsx`, `ui/index.ts`, `package.json`, `Skeleton`, `nora.ts`, `types/index.ts`, `kanban-settings-tab.tsx`, `Input`, `Button`, `modal/index.tsx`, `equipment-page-content.tsx`, `chatbot/index.tsx`, `kanban-page-content.tsx`, `next`, `call-sheet-modal.tsx`, `project-modal.tsx`, `chart-area-interactive.tsx`, `recovery-password.tsx`, `automate-page-content.tsx`, `app/layout.tsx`, `register-flow.tsx`, `(client)/layout.tsx`, `first-step.tsx`, `studio-page-content.tsx`, `nif-verification-field.tsx`, `date-picker.tsx`, `utils/index.ts`, `data-table-toolbar.tsx`, `DropdownMenuContent`, `verify-email-content.tsx`, `api.ts`, `app-sidebar.tsx`, `use-onboarding-tour.ts`, `components/common/index.ts`, `deliverables-page-content.tsx`, `portal-service.ts`, `admin-audit-page-content.tsx`, `Badge`, `dynamic-breadcrumb.tsx`, `stepper.tsx`, `budget-modal.tsx`, `@tanstack/react-query`, `lib/utils.ts`, `use-onboarding-preferences.ts`, `hero-charts.tsx`, `deliverables-service.ts`, `custom/index.ts`, `deliverable-modal.tsx`, `use-budgets.ts`, `upgrade-plan-modal.tsx`, `file-upload-modal.tsx`, `drawer.tsx`, `subscriptions/checkout-modal.tsx`, `settings-page-content.tsx`, `mindgest-invoice-modal.tsx`, `mindgest-kpi-grid.tsx`, `tutorials-modal.tsx`, `mindgest-urgent-items.tsx`, `reset-password.tsx`, `plan-gate.tsx`?**
  _High betweenness centrality (0.189) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _726 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src_components_index_button` be split into smaller, more focused modules?**
  _Cohesion score 0.09899396378269618 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `src_components_index_button`, `Card`, `notifications.tsx`, `components/index.ts`, `admin-dashboard-view.tsx`, `Icon`, `sidebar-info.tsx`, `ui/index.ts`, `Skeleton`, `kanban-settings-tab.tsx`, `Input`, `Button`, `modal/index.tsx`, `equipment-page-content.tsx`, `chatbot/index.tsx`, `kanban-page-content.tsx`, `next`, `call-sheet-modal.tsx`, `chart-area-interactive.tsx`, `page-wrapper/index.tsx`, `(client)/layout.tsx`, `first-step.tsx`, `nif-verification-field.tsx`, `date-picker.tsx`, `data-table-toolbar.tsx`, `DropdownMenuContent`, `components/common/index.ts`, `Badge`, `dynamic-breadcrumb.tsx`, `stepper.tsx`, `lib/utils.ts`, `react`, `hero-charts.tsx`, `custom/index.ts`, `drawer.tsx`, `settings-page-content.tsx`, `mindgest-kpi-grid.tsx`, `tutorials-modal.tsx`, `reset-password.tsx`, `notification-skeleton.tsx`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Should `Card` be split into smaller, more focused modules?**
  _Cohesion score 0.13277428371767994 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Button` to `src_components_index_button`, `Card`, `notifications.tsx`, `components/index.ts`, `admin-dashboard-view.tsx`, `cn`, `Icon`, `project-detail-page-content.tsx`, `projects-page-content.tsx`, `forgot-password/page.tsx`, `ui/index.ts`, `package.json`, `types/index.ts`, `kanban-settings-tab.tsx`, `Input`, `modal/index.tsx`, `equipment-page-content.tsx`, `chatbot/index.tsx`, `kanban-page-content.tsx`, `next`, `call-sheet-modal.tsx`, `project-modal.tsx`, `chart-area-interactive.tsx`, `recovery-password.tsx`, `page-wrapper/index.tsx`, `automate-page-content.tsx`, `register-flow.tsx`, `(client)/layout.tsx`, `first-step.tsx`, `studio-page-content.tsx`, `date-picker.tsx`, `utils/index.ts`, `data-table-toolbar.tsx`, `DropdownMenuContent`, `verify-email-content.tsx`, `api.ts`, `components/common/index.ts`, `deliverables-page-content.tsx`, `portal-service.ts`, `admin-audit-page-content.tsx`, `Badge`, `dynamic-breadcrumb.tsx`, `workflow-modal.tsx`, `stepper.tsx`, `budget-modal.tsx`, `lib/utils.ts`, `react`, `hero-charts.tsx`, `constants/index.ts`, `custom/index.ts`, `_components/index.ts`, `deliverable-modal.tsx`, `file-upload-modal.tsx`, `subscriptions/checkout-modal.tsx`, `settings-page-content.tsx`, `mindgest-invoice-modal.tsx`, `mindgest-kpi-grid.tsx`, `tutorials-modal.tsx`, `mindgest-urgent-items.tsx`, `reset-password.tsx`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.03076923076923077 - nodes in this community are weakly interconnected._
# Graph Report - nora-audiovisual-frontend  (2026-10-07)

## Corpus Check
- 598 files · ~975,168 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .example 1, (none) 1, .webmanifest 1)

## Summary
- 2927 nodes · 10235 edges · 139 communities (114 shown, 25 thin omitted)
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
- react
- admin-dashboard-view.tsx
- cn
- Icon
- project-detail-page-content.tsx
- Button
- sidebar-info.tsx
- _components/index.ts
- ErrorMessage
- Badge
- schemas/index.ts
- package.json
- Skeleton
- nextjs-responsive-ui-skill.md
- nora.ts
- types/index.ts
- kanban-settings-tab.tsx
- GlobalModal
- team-page-content.tsx
- modal/index.tsx
- reservation-modal.tsx
- chatbot/index.tsx
- kanban-page-content.tsx
- next
- data-table.tsx
- deliverable-modal.tsx
- mindgest-area-chart.tsx
- recovery-password.tsx
- page-wrapper/index.tsx
- automate-page-content.tsx
- actions/login.ts
- app/layout.tsx
- CardTitle
- 📂 Estrutura de Componentes Importados (Mindgest SDK)
- onboarding-tour-button.tsx
- portal-client-booking-modal.tsx
- nif-verification-field.tsx
- lib/utils.ts
- utils/index.ts
- data-table-toolbar.tsx
- call-sheet-modal.tsx
- tanstack-donut-chart.tsx
- use-fetch-user.ts
- app-sidebar.tsx
- use-onboarding-tour.ts
- types/auth.ts
- file-upload/index.tsx
- deliverables-page-content.tsx
- portal-service.ts
- dashboard.ts
- first-step.tsx
- lucide-react
- view-mode.tsx
- DashboardLayoutSkeleton
- services/index.ts
- useOnboardingTour
- stepper.tsx
- onboarding-service.ts
- compilerOptions
- components.json
- budget-modal.tsx
- hooks/index.ts
- api.ts
- Input
- use-onboarding-preferences.ts
- hero-charts.tsx
- constants/index.ts
- onboarding-tours.ts
- use-deliverables.ts
- date-picker-input.tsx
- task-modal.tsx
- use-plans.ts
- 🚀 Como Executar
- use-deliverable-types.ts
- use-budgets.ts
- components/common/index.ts
- reports.ts
- 54. Ordem de implementação recomendada
- devDependencies
- use-mindgest.ts
- 52. Padrões Tailwind recomendados
- async-select.tsx
- chatbot-service.ts
- drawer.tsx
- 53. Anti-patterns
- sonner
- generic-table/index.tsx
- clients-filters.ts
- mindgest-invoice-modal.tsx
- entities.ts
- 51. Checklist obrigatório para cada página
- equipment-service.ts
- mindgest-kpi-grid.tsx
- SubscriptionStatus
- eslint.config.mjs
- images.d.ts
- filters.ts
- cashier.ts
- Skill: Responsive UI Engineering para Next.js
- scripts
- mindgest-urgent-items.tsx
- collapsible.tsx
- register-flow.tsx
- prepareTarget
- audit-trail.ts
- calendar-rac.tsx
- finance-page-content.tsx
- 50. Regra para decidir o layout
- 8. Tabelas: nunca assumir que uma tabela desktop deve permanecer tabela no mobile
- global.d.ts
- 4.1 Quatro cards no desktop → 2×2 no mobile
- 56. Regra final para agentes de código
- download-barcode-png.ts
- input-currency.tsx
- 12. Botões
- 7. Tamanho de texto responsivo
- postcss.config.mjs
- mindgest-quick-actions.tsx
- icon/index.tsx
- budgets/view/[token]/page.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 286 edges
2. `Button()` - 254 edges
3. `react` - 228 edges
4. `lucide-react` - 150 edges
5. `Input` - 108 edges
6. `Badge()` - 106 edges
7. `Icon()` - 98 edges
8. `Card()` - 88 edges
9. `next` - 78 edges
10. `CardContent()` - 75 edges

## Surprising Connections (you probably didn't know these)
- `🛠️ Stack Tecnológica` --references--> `DataTable()`  [INFERRED]
  README.md → src/components/custom/universal-table/data-table.tsx
- `📂 Estrutura de Componentes Importados (Mindgest SDK)` --references--> `NoraHomePageContent()`  [INFERRED]
  README.md → src/components/client/nora/nora-home-page-content.tsx
- `📂 Estrutura de Componentes Importados (Mindgest SDK)` --references--> `AlertError()`  [INFERRED]
  README.md → src/components/common/alert-error/index.tsx
- `📂 Estrutura de Componentes Importados (Mindgest SDK)` --references--> `DynamicDrawer()`  [INFERRED]
  README.md → src/components/common/dynamic-drawer/dinamic-drawer.tsx
- `📂 Estrutura de Componentes Importados (Mindgest SDK)` --references--> `EmptyState()`  [INFERRED]
  README.md → src/components/common/empty-state/index.tsx

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

## Communities (139 total, 25 thin omitted)

### Community 0 - "src_components_index_button"
Cohesion: 0.06
Nodes (70): date-fns, AdminMetricsCards(), AdminMetricsCardsProps, AdminLegacyPageContent(), AdminTab, COLORS, AdminAuditPageContent(), CATEGORIES (+62 more)

### Community 1 - "Card"
Cohesion: 0.12
Nodes (28): CallSheetContent(), CallSheetPage(), ChartSkeleton(), ChartSkeletonProps, TanStackChartContainer(), TanStackChartContainerProps, ACTION_ICONS, DashboardHeaderBanner() (+20 more)

### Community 2 - "dependencies"
Cohesion: 0.03
Nodes (65): dependencies, axios, class-variance-authority, clsx, date-fns, driver.js, @fullcalendar/core, @fullcalendar/daygrid (+57 more)

### Community 3 - "notifications.tsx"
Cohesion: 0.06
Nodes (37): react-intersection-observer, zustand, NOTIFICATION_STYLES, NotificationItemProps, NotificationListProps, BrowserPermission, getBrowserPermission(), Notification() (+29 more)

### Community 4 - "react"
Cohesion: 0.07
Nodes (28): react, AdminAuditPage(), AdminOverviewPage(), AdminSubscriptionsPage(), AdminTenantsPage(), AdminUsersPage(), AiAssistantPage(), AutomatePage() (+20 more)

### Community 5 - "admin-dashboard-view.tsx"
Cohesion: 0.31
Nodes (18): AdminDashboardView(), CrewDashboardView(), EditorDashboardView(), FinanceDashboardView(), ManagerDashboardView(), OwnerDashboardView(), ProducerDashboardView(), DashboardFilterBar() (+10 more)

### Community 6 - "cn"
Cohesion: 0.06
Nodes (62): input-otp, radix-ui, OverviewLegendRow(), OverviewLegendRowProps, DynamicDrawer(), DynamicDrawerProps, SidebarSkeleton(), SidebarSkeletonProps (+54 more)

### Community 7 - "Icon"
Cohesion: 0.11
Nodes (20): @radix-ui/react-scroll-area, NavigationButtons(), Props, Icon(), PlanUpgradeGate(), QuizSelect(), IconCheckSucessfull(), IconWarning() (+12 more)

### Community 8 - "project-detail-page-content.tsx"
Cohesion: 0.12
Nodes (11): ProjectDetailPageContent(), ProjectDetailPageContentProps, STAGE_LABELS, STATUS_LABELS, useProjectDeliverables(), useExpenses(), usePayments(), useProjectFinancialSummary() (+3 more)

### Community 9 - "Button"
Cohesion: 0.08
Nodes (51): @tanstack/react-table, BudgetsPageContent(), SORT_OPTIONS, STATUS_OPTIONS, ClientRow, CrmPageContent(), SORT_OPTIONS, STATUS_OPTIONS (+43 more)

### Community 10 - "sidebar-info.tsx"
Cohesion: 0.14
Nodes (7): Props, NotificationFiltersProps, STATUS_LABELS, TYPE_LABELS, BeforeInstallPromptEvent, isStandaloneMode(), usePwaInstallPrompt()

### Community 11 - "_components/index.ts"
Cohesion: 0.09
Nodes (23): ForgotPasswordPage(), metadata, LoginPage(), metadata, metadata, RegisterPage(), metadata, ResetPasswordPage() (+15 more)

### Community 12 - "ErrorMessage"
Cohesion: 0.13
Nodes (41): handleSwitch(), handleSwitch(), usePreviewAiAction(), useSendAiMessage(), useCreateWorkflow(), useDeleteWorkflow(), useExecuteWorkflow(), useToggleWorkflow() (+33 more)

### Community 13 - "Badge"
Cohesion: 0.11
Nodes (29): CheckoutPage(), metadata, DeliverablePortalPage(), PageProps, GoogleButton(), CheckoutPageContent(), AiAssistantPageContent, AiPageContent() (+21 more)

### Community 14 - "schemas/index.ts"
Cohesion: 0.11
Nodes (23): zod, ChangePasswordFormData, changePasswordSchema, CompanyFormData, companySchema, EditProfileFormData, editProfileSchema, accountNumberSchema (+15 more)

### Community 15 - "package.json"
Cohesion: 0.04
Nodes (44): name, packageManager, private, version, baseline-browser-mapping, clsx, eslint, eslint-config-next (+36 more)

### Community 16 - "Skeleton"
Cohesion: 0.10
Nodes (22): ClientsFiltersSkeleton(), CreditNoteFormSkeleton(), DashboardSkeleton(), DynamicMetricCardSkeleton(), InvoiceFiltersSkeleton(), InvoiceFormSkeleton(), ItemsFiltersSkeleton(), LoaderStoresSkeleton() (+14 more)

### Community 17 - "nextjs-responsive-ui-skill.md"
Cohesion: 0.05
Nodes (43): 10. Não esconder dados importantes no mobile, 11. Toolbar responsiva, 13. Botões com texto longo, 14. Flexbox: `min-w-0` é obrigatório em muitos layouts, 15. Imagens, 16. Vídeo, 17. Modais, 18. Formulários (+35 more)

### Community 18 - "nora.ts"
Cohesion: 0.06
Nodes (31): FINANCE_QUERY_KEYS, financeService, CreateProjectPayload, ProjectFilters, projectsService, AiBudgetEstimatePrompt, AiCallSheetPrompt, AiCreditBalance (+23 more)

### Community 19 - "types/index.ts"
Cohesion: 0.18
Nodes (8): dashboardRoleService, DashboardFilterParams, DashboardRange, RoleDashboardData, PaginatedMeta, PaginatedResponse, PaginationParams, Stats

### Community 20 - "kanban-settings-tab.tsx"
Cohesion: 0.19
Nodes (15): EditColumnDialogProps, Switch(), KANBAN_CATEGORIES_METADATA, NOTION_KANBAN_COLORS, KANBAN_SETTINGS_QUERY_KEY(), useOrganizationKanbanSettings(), CreateKanbanColumnPayload, kanbanSettingsService (+7 more)

### Community 21 - "GlobalModal"
Cohesion: 0.12
Nodes (29): ClientModal(), DeliverableModal(), CheckinModal(), CheckoutModal(), EquipmentModal(), ReservationModal(), EXPENSE_CATEGORIES, RecordExpenseModal() (+21 more)

### Community 22 - "team-page-content.tsx"
Cohesion: 0.18
Nodes (11): VerifyEmailContent(), verify(), SessionsPageContent(), TeamPageContent(), ApiError, parseApiError(), InviteMemberDto, membersService (+3 more)

### Community 23 - "modal/index.tsx"
Cohesion: 0.17
Nodes (30): SEVERITY_CONFIG, MindgestInvoiceModal(), EditColumnDialog(), KanbanSettingsTab(), AddOnPurchaseModal(), SubscriptionCheckoutModal(), SubscriptionSuccessModal(), SubscriptionSuccessModalProps (+22 more)

### Community 24 - "reservation-modal.tsx"
Cohesion: 0.08
Nodes (18): CheckinModalProps, CONDITION_OPTIONS, CheckoutModalProps, CONDITION_OPTIONS, CATEGORY_OPTIONS, CONDITION_OPTIONS, EquipmentModalProps, OWNERSHIP_OPTIONS (+10 more)

### Community 25 - "chatbot/index.tsx"
Cohesion: 0.11
Nodes (30): InsightsPageContent(), ROLE_ALLOWED_TABS, SettingsPageContent(), SettingsTab, AnimatedRenderAIMessage(), ChatTab(), ChatTabProps, QUICK_ACTIONS (+22 more)

### Community 26 - "kanban-page-content.tsx"
Cohesion: 0.11
Nodes (34): BudgetModal(), DASHBOARD_PERIOD_OPTIONS, DashboardPeriodSelectProps, DeliverableTypesModal(), DeliverableTypesModalProps, DEPARTMENT_CONFIG, DEPARTMENT_OPTIONS, FALLBACK_COLUMNS (+26 more)

### Community 27 - "next"
Cohesion: 0.12
Nodes (10): nextConfig, next, AccountCreatedModal(), UnauthorizedLink(), UpgradeModal(), PaywallHeader(), ProtectedActionProps, EXCLUDED_PATHS (+2 more)

### Community 28 - "data-table.tsx"
Cohesion: 0.36
Nodes (14): FinancePageContent(), CallSheetModal(), DataTable(), DataTableProps, DefaultMobileCard(), PortalBudgetView(), Table(), TableBody() (+6 more)

### Community 29 - "deliverable-modal.tsx"
Cohesion: 0.08
Nodes (10): DeliverableModalProps, AUDIOVISUAL_ROLES, MemberModalProps, ProjectModalProps, createDeliverableSchema, DeliverableFormData, addMemberSchema, MemberFormData (+2 more)

### Community 30 - "mindgest-area-chart.tsx"
Cohesion: 0.10
Nodes (24): recharts, DashboardRevenueChart(), DashboardRevenueChartProps, MindgestAreaChartProps, MindgestAreaSeries, MindgestBarChartProps, MindgestBarItem, DEFAULT_COLORS (+16 more)

### Community 31 - "recovery-password.tsx"
Cohesion: 0.13
Nodes (5): OTPModal(), ForgotPasswordFormData, forgotPasswordSchema, OtpFormData, otpSchema

### Community 32 - "page-wrapper/index.tsx"
Cohesion: 0.08
Nodes (11): Action, ActionItem, ActionVariant, isSeparator(), Props, SeparatorItem, variantStyles, Props (+3 more)

### Community 33 - "automate-page-content.tsx"
Cohesion: 0.06
Nodes (30): SKIP_REASONS, STATUS_STYLES, ACTION_LABELS, ACTION_OPTIONS, buildAction(), DEPARTMENT_OPTIONS, TRIGGER_LABELS, TRIGGER_OPTIONS (+22 more)

### Community 34 - "actions/login.ts"
Cohesion: 0.10
Nodes (29): logoutAction(), ACCESS_TOKEN_KEY, API_AUTH_PREFIX, AUTH_PAGES, DEFAULT_LOGIN_REDIRECT, PRIVATE_ROUTE_PREFIXES, PUBLIC_ROUTES, REFRESH_TOKEN_KEY (+21 more)

### Community 35 - "app/layout.tsx"
Cohesion: 0.06
Nodes (25): driver.js, next-themes, inter, metadata, outfit, plusJakartaSans, poppins, roboto (+17 more)

### Community 36 - "CardTitle"
Cohesion: 0.09
Nodes (21): @radix-ui/react-select, AudiovisualDashboardContent(), COLORS, DashboardSalesPie(), DashboardSalesPieProps, OverviewSectionCard(), OverviewSectionCardProps, EquipmentItem (+13 more)

### Community 37 - "📂 Estrutura de Componentes Importados (Mindgest SDK)"
Cohesion: 0.08
Nodes (20): 📂 Estrutura de Componentes Importados (Mindgest SDK), ALLOWED_ROLES, ClientLayout(), ADMIN_ALLOWED_ROLES, AdminLayout(), PlanGate(), PlanGateProps, ProtectedAction() (+12 more)

### Community 38 - "onboarding-tour-button.tsx"
Cohesion: 0.19
Nodes (16): FirstStep(), FeatureGate(), FeatureGateProps, OnboardingTourButton(), OnboardingTourButtonProps, TourModeItem(), TourModeItemProps, Props (+8 more)

### Community 39 - "portal-client-booking-modal.tsx"
Cohesion: 0.08
Nodes (23): @hookform/resolvers, ClientPortalStudioPage(), BookingModalProps, BOOKING_STATUS_OPTIONS, DEFAULT_RESOURCES, RESOURCE_TYPE_LABELS, RESOURCE_TYPE_OPTIONS, StudioPageContent() (+15 more)

### Community 40 - "nif-verification-field.tsx"
Cohesion: 0.14
Nodes (20): NifVerificationField(), NifVerificationFieldProps, useContributorVerification(), UseNifFormVerificationOptions, FINAL_CONSUMER_TAX_NUMBER, isValidAngolanTaxNumber(), normalizeTaxNumber(), RESTRICTED_TAXPAYER_STATUSES (+12 more)

### Community 41 - "lib/utils.ts"
Cohesion: 0.12
Nodes (22): react-day-picker, MultiQuizSelect(), Option, QuizSelectProps, FilterDropdown(), DateRangeFilter(), DateRangeFilterProps, FilterPopover() (+14 more)

### Community 42 - "utils/index.ts"
Cohesion: 0.11
Nodes (8): loginAction(), LoginForm(), handleLogin(), LoginFormData, loginSchema, InfoMessage(), SuccessMessage, normalize()

### Community 43 - "data-table-toolbar.tsx"
Cohesion: 0.29
Nodes (17): AutomatePageContent(), COLUMN_LABEL_MAP, DataTableToolbar(), getColumnDisplayTitle(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent() (+9 more)

### Community 44 - "call-sheet-modal.tsx"
Cohesion: 0.12
Nodes (6): CallSheetModalProps, CallSheetFormData, createCallSheetSchema, CrewCallSlot, crewCallSlotSchema, CallSheet

### Community 45 - "tanstack-donut-chart.tsx"
Cohesion: 0.14
Nodes (8): @tanstack/charts, TanStackAreaChartProps, TanStackBarChartProps, DEFAULT_PALETTE, TanStackDonutChartProps, DashboardCapacityItem, DashboardDistributionSlice, DashboardEvolutionPoint

### Community 46 - "use-fetch-user.ts"
Cohesion: 0.19
Nodes (11): clearLocalSession(), ALLOWED_PORTAL_ROLES, PortalLayout(), PortalNavbar(), SidebarInset(), fetchCurrentUser(), useFetchUser(), UseFetchUserOptions (+3 more)

### Community 47 - "app-sidebar.tsx"
Cohesion: 0.08
Nodes (19): PlanUpgradeGateProps, MenuItem, menuItems, MenuStructure, SubMenuItem, getPlanFeatureGroups(), includedInAllPlans, mindMessageLimitByPlan (+11 more)

### Community 48 - "use-onboarding-tour.ts"
Cohesion: 0.17
Nodes (21): activeDemoInputs, activeRetryIntervals, clearActiveTyping(), clearReactSelect(), clickCreateOption(), clickFirstExistingOption(), clickOption(), CONDITIONAL_STEP_MARKERS (+13 more)

### Community 49 - "types/auth.ts"
Cohesion: 0.21
Nodes (11): LoginResponse, NoraMembership, NoraOrganization, Tokens, Company, CompanyData, Store, CheckoutPayload (+3 more)

### Community 50 - "file-upload/index.tsx"
Cohesion: 0.15
Nodes (13): react-dropzone, DropzoneContent(), FileUpload(), FileUploadProps, DropzoneContent(), FileUploadProps, PhotoUpload(), MutationVariables (+5 more)

### Community 51 - "deliverables-page-content.tsx"
Cohesion: 0.13
Nodes (13): ClientPortalDeliverablesPage(), DELIVERABLE_TYPE_LABELS, STATUS_OPTIONS, formatTimecode(), VideoReviewPlayer(), VideoReviewPlayerProps, formatTimecode(), PortalDeliverableReviewDialogProps (+5 more)

### Community 52 - "portal-service.ts"
Cohesion: 0.09
Nodes (21): Option, QuizSelectProps, ExtraPhotosCheckoutModal(), ExtraPhotosCheckoutModalProps, PhotoProofingGalleryProps, Props, Props, AcceptBudgetPayload (+13 more)

### Community 53 - "dashboard.ts"
Cohesion: 0.10
Nodes (21): DashboardAccountsReceivable, DashboardActivity, DashboardActivityType, DashboardClientsOverview, DashboardFinancialEvolution, DashboardMetric, DashboardMonthlyGoal, DashboardOverview (+13 more)

### Community 54 - "first-step.tsx"
Cohesion: 0.25
Nodes (8): FirstStepProps, SecondStep(), StepsHeader(), terms, ThirdStep(), AlertError(), useNifFormVerification(), RegisterFormData

### Community 55 - "lucide-react"
Cohesion: 0.13
Nodes (15): class-variance-authority, lucide-react, @radix-ui/react-slot, ClientPortalBudgetsPage(), ClientPortalOverviewPage(), PendingSubscriptionBannerProps, CinemaVideoPlayerProps, CATEGORY_LABELS (+7 more)

### Community 56 - "view-mode.tsx"
Cohesion: 0.09
Nodes (17): displayStatusLabel(), StatusBadgeProps, statusMap, Props, CreateItemData, ItemData, ItemResponse, ItemsFilters (+9 more)

### Community 57 - "DashboardLayoutSkeleton"
Cohesion: 0.31
Nodes (10): DashboardPage(), AdminDashboardView, CrewDashboardView, DynamicRoleDashboard(), EditorDashboardView, FinanceDashboardView, ManagerDashboardView, OwnerDashboardView (+2 more)

### Community 58 - "services/index.ts"
Cohesion: 0.12
Nodes (8): LoginActionResult, RegisterActionResult, SessionProviderProps, authService, UpdateUserProfilePayload, userService, AuthState, User

### Community 59 - "useOnboardingTour"
Cohesion: 0.22
Nodes (14): canUserAccessOnboardingTour(), cleanupActiveDemo(), completeActiveTour(), getScope(), handleHighlighted(), handleNextClick(), handlePrevClick(), moveToPreparedStep() (+6 more)

### Community 60 - "stepper.tsx"
Cohesion: 0.13
Nodes (18): StepItemContext, StepItemContextValue, Stepper(), StepperContext, StepperContextValue, StepperDescription(), StepperIndicator(), StepperIndicatorProps (+10 more)

### Community 61 - "onboarding-service.ts"
Cohesion: 0.12
Nodes (13): OnboardingTourId, OnboardingTourMode, DEFAULTS, OnboardingPreferencesResponse, onboardingService, OnboardingTourProgress, OnboardingTourStatus, UpdateOnboardingPreferencesPayload (+5 more)

### Community 62 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 63 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 64 - "budget-modal.tsx"
Cohesion: 0.09
Nodes (14): react-hook-form, BudgetModalProps, CATEGORY_OPTIONS, ClientModalProps, Option, RHFSelectProps, BudgetFormData, budgetFormSchema (+6 more)

### Community 65 - "hooks/index.ts"
Cohesion: 0.14
Nodes (10): EntityFilters, usePagination(), useAddClient(), useGetClients(), useToggleStatusClient(), useUpdateClient(), ClientLike, excludeFinalConsumer() (+2 more)

### Community 66 - "api.ts"
Cohesion: 0.12
Nodes (15): axios, @tanstack/react-query, AI_QUERY_KEY, PaginationResponse, UsePaginatedFetchOptions, API_ORIGIN, API_URL, AiActionPreviewPayload (+7 more)

### Community 67 - "Input"
Cohesion: 0.18
Nodes (13): InputPassword, PercInput(), PriceInput(), PriceInputProps, LabeledInputWithIconProps, RequiredInput(), ValidInputPassword(), Input (+5 more)

### Community 68 - "use-onboarding-preferences.ts"
Cohesion: 0.34
Nodes (15): enqueuePendingTourReset(), enqueuePendingTourUpdate(), ONBOARDING_QUERY_KEY, PendingTourReset, PendingTourUpdate, readPendingTourResets(), readPendingTourUpdates(), removePendingScopeOperations() (+7 more)

### Community 69 - "hero-charts.tsx"
Cohesion: 0.25
Nodes (13): billingConfig, billingData, GlassWrapper(), HeroBillingChart(), HeroPieChart(), HeroRadarChart(), HeroStatsWidget(), HeroStockChart() (+5 more)

### Community 70 - "constants/index.ts"
Cohesion: 0.12
Nodes (8): MINDWARE_INFO, MAX_FILE_SIZE, footerSections, socialLinks, paywallFooterLinks, UNIT_OPTIONS, paymentMethodMap, paymentMethods

### Community 71 - "onboarding-tours.ts"
Cohesion: 0.13
Nodes (14): dataTour(), OnboardingDriveStep, OnboardingTourDemo, OnboardingTourGroup, onboardingTours, OnboardingTourType, StepOptions, toDriveStep() (+6 more)

### Community 72 - "use-deliverables.ts"
Cohesion: 0.16
Nodes (11): DELIVERABLES_QUERY_KEY, useDeliverablesFilters(), useResolveReviewComment(), CreateDeliverablePayload, CreateReviewCommentPayload, DeliverableFilters, deliverablesService, formatTimecode() (+3 more)

### Community 73 - "date-picker-input.tsx"
Cohesion: 0.20
Nodes (10): react-aria-components, DatePickerInput(), DatePickerInputProps, TimeInput(), TimeInputProps, DateField(), DateInput(), DateInputProps (+2 more)

### Community 74 - "task-modal.tsx"
Cohesion: 0.18
Nodes (5): DEPARTMENTS, PRIORITIES, TaskModalProps, createTaskSchema, TaskFormData

### Community 75 - "use-plans.ts"
Cohesion: 0.27
Nodes (5): useFetch(), usePlans(), PlanStore, useCurrentPlanStore, Plan

### Community 76 - "🚀 Como Executar"
Cohesion: 0.25
Nodes (7): 1. Instalar dependências, 2. Configurar variáveis de ambiente, 3. Iniciar servidor de desenvolvimento, 4. Compilar para produção, 🚀 Como Executar, 🎬 Nora Audiovisual — Frontend, 🛠️ Stack Tecnológica

### Community 77 - "use-deliverable-types.ts"
Cohesion: 0.47
Nodes (4): DELIVERABLE_TYPES_QUERY_KEY, DEFAULT_DELIVERABLE_TYPES, DeliverableTypeItem, deliverableTypesService

### Community 78 - "use-budgets.ts"
Cohesion: 0.13
Nodes (10): nuqs, BUDGETS_QUERY_KEY, useDuplicateBudget(), useSendBudget(), BudgetFilters, budgetsService, CreateBudgetPayload, ClientFilters (+2 more)

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
Cohesion: 0.24
Nodes (7): INVOICE_REQUESTS_QUERY_KEY, MINDGEST_CONFIG_QUERY_KEY, billingService, ConfigureMindgestPayload, CreateInvoiceRequestPayload, InvoiceRequest, MindgestConfig

### Community 84 - "52. Padrões Tailwind recomendados"
Cohesion: 0.18
Nodes (11): 52. Padrões Tailwind recomendados, Card textual, Conteúdo, Dashboard, Desktop table, Flex responsivo, Formulário, Full-height mobile (+3 more)

### Community 86 - "async-select.tsx"
Cohesion: 0.20
Nodes (9): react-select, use-debounce, MultiSelect(), MultiSelectProps, SelectOption, selectStyles(), AsyncCreatableSelectField(), AsyncCreatableSelectProps (+1 more)

### Community 87 - "chatbot-service.ts"
Cohesion: 0.29
Nodes (5): ChatbotService, ChatbotHistoryResponse, ChatbotMessageRequest, ChatbotResponse, ChatHistoryItem

### Community 88 - "drawer.tsx"
Cohesion: 0.20
Nodes (8): vaul, DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerPortal(), DrawerTitle()

### Community 89 - "53. Anti-patterns"
Cohesion: 0.20
Nodes (10): 53. Anti-patterns, Anti-pattern 1, Anti-pattern 2, Anti-pattern 3, Anti-pattern 4, Anti-pattern 5, Anti-pattern 6, Anti-pattern 7 (+2 more)

### Community 90 - "sonner"
Cohesion: 0.41
Nodes (7): sonner, AddOnPurchaseModalProps, CheckoutModalProps, AddOnItem, noraSubscriptionsService, PlanItem, SubscriptionData

### Community 91 - "generic-table/index.tsx"
Cohesion: 0.35
Nodes (9): DataTableProps, Pagination(), PaginationContent(), PaginationEllipsis(), PaginationItem(), PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 92 - "clients-filters.ts"
Cohesion: 0.20
Nodes (4): useClientsFilters(), Client, ClientSelectOption, clientsFilters

### Community 94 - "entities.ts"
Cohesion: 0.24
Nodes (8): Category, CategoryData, CategoryFilters, CategoryResponse, ClientData, ClientResponse, Stores, StoresResponse

### Community 95 - "51. Checklist obrigatório para cada página"
Cohesion: 0.22
Nodes (9): 51. Checklist obrigatório para cada página, Accessibility, Cards, Forms, Layout, Navigation, States, Tables (+1 more)

### Community 96 - "equipment-service.ts"
Cohesion: 0.24
Nodes (6): CreateEquipmentPayload, EquipmentFilters, equipmentService, EquipmentCategory, EquipmentReservation, EquipmentStatus

### Community 97 - "mindgest-kpi-grid.tsx"
Cohesion: 0.21
Nodes (8): DashboardSummaryCards(), DashboardSummaryCardsProps, KpiMetricCardProps, DEFAULT_ICONS, MindgestKpiGridProps, DynamicMetricCard(), DashboardSummary, DashboardKpiItem

### Community 98 - "SubscriptionStatus"
Cohesion: 0.25
Nodes (8): SubscriptionStatus, ACTIVE, CANCELED, EXPIRED, PAST_DUE, PENDING, SUSPENDED, TRIALING

### Community 99 - "eslint.config.mjs"
Cohesion: 0.25
Nodes (5): compat, __dirname, eslintConfig, __filename, @eslint/eslintrc

### Community 100 - "images.d.ts"
Cohesion: 0.25
Nodes (6): *.jpeg, *.jpg, *.mp3, *.png, *.svg, *.webp

### Community 101 - "filters.ts"
Cohesion: 0.20
Nodes (9): categorySortByOption, categorySortOrderOption, categoryStatusOptions, invoiceByOption, invoiceStatusOptions, itemsByOption, itemsOrderOption, itemsStatusOptions (+1 more)

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

### Community 107 - "register-flow.tsx"
Cohesion: 0.11
Nodes (15): registerAction(), getStrength(), PasswordStrengthBar(), StrengthConfig, StrengthLevel, PlanOption, PLANS, RegisterFlow() (+7 more)

### Community 108 - "prepareTarget"
Cohesion: 0.33
Nodes (10): clickPosSettingsTab(), clickSafe(), clickSettingsTab(), closeProductModalForTour(), findVisibleElement(), isElementVisible(), openPosCustomerSection(), openProductModalForTour() (+2 more)

### Community 109 - "audit-trail.ts"
Cohesion: 0.29
Nodes (6): AuditTrailAction, AuditTrailEntity, AuditTrailFilters, AuditTrailResponse, AuditTrailUser, PaginatedAuditTrailResponse

### Community 110 - "calendar-rac.tsx"
Cohesion: 0.33
Nodes (8): @internationalized/date, BaseCalendarProps, Calendar(), CalendarGridComponent(), CalendarHeader(), CalendarProps, RangeCalendar(), RangeCalendarProps

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

### Community 119 - "input-currency.tsx"
Cohesion: 0.33
Nodes (5): react-number-format, InputCurrency, InputCurrencyProps, RHFInputCurrency(), RHFInputCurrencyProps

### Community 127 - "mindgest-quick-actions.tsx"
Cohesion: 0.29
Nodes (3): DashboardHeaderBannerProps, MindgestQuickActionsProps, DashboardQuickAction

### Community 128 - "icon/index.tsx"
Cohesion: 0.40
Nodes (3): EmptyStateProps, ICON_ALIASES, IconProps

## Knowledge Gaps
- **726 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+721 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1032 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `src_components_index_button`, `budgets/view/[token]/page.tsx`, `Card`, `icon/index.tsx`, `notifications.tsx`, `admin-dashboard-view.tsx`, `cn`, `Icon`, `project-detail-page-content.tsx`, `Button`, `sidebar-info.tsx`, `_components/index.ts`, `Badge`, `package.json`, `Skeleton`, `nora.ts`, `kanban-settings-tab.tsx`, `GlobalModal`, `team-page-content.tsx`, `modal/index.tsx`, `reservation-modal.tsx`, `chatbot/index.tsx`, `kanban-page-content.tsx`, `next`, `data-table.tsx`, `deliverable-modal.tsx`, `mindgest-area-chart.tsx`, `recovery-password.tsx`, `page-wrapper/index.tsx`, `automate-page-content.tsx`, `app/layout.tsx`, `CardTitle`, `📂 Estrutura de Componentes Importados (Mindgest SDK)`, `onboarding-tour-button.tsx`, `portal-client-booking-modal.tsx`, `nif-verification-field.tsx`, `lib/utils.ts`, `utils/index.ts`, `data-table-toolbar.tsx`, `call-sheet-modal.tsx`, `tanstack-donut-chart.tsx`, `use-fetch-user.ts`, `app-sidebar.tsx`, `use-onboarding-tour.ts`, `file-upload/index.tsx`, `deliverables-page-content.tsx`, `portal-service.ts`, `lucide-react`, `DashboardLayoutSkeleton`, `stepper.tsx`, `budget-modal.tsx`, `hooks/index.ts`, `api.ts`, `Input`, `use-onboarding-preferences.ts`, `hero-charts.tsx`, `use-deliverables.ts`, `task-modal.tsx`, `use-budgets.ts`, `async-select.tsx`, `drawer.tsx`, `sonner`, `generic-table/index.tsx`, `mindgest-invoice-modal.tsx`, `equipment-service.ts`, `mindgest-kpi-grid.tsx`, `mindgest-urgent-items.tsx`, `register-flow.tsx`, `calendar-rac.tsx`, `finance-page-content.tsx`, `input-currency.tsx`, `mindgest-quick-actions.tsx`?**
  _High betweenness centrality (0.185) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _726 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src_components_index_button` be split into smaller, more focused modules?**
  _Cohesion score 0.05862068965517241 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `icon/index.tsx`, `Card`, `src_components_index_button`, `notifications.tsx`, `admin-dashboard-view.tsx`, `Icon`, `Button`, `sidebar-info.tsx`, `_components/index.ts`, `Badge`, `Skeleton`, `kanban-settings-tab.tsx`, `GlobalModal`, `modal/index.tsx`, `chatbot/index.tsx`, `kanban-page-content.tsx`, `data-table.tsx`, `mindgest-area-chart.tsx`, `page-wrapper/index.tsx`, `app/layout.tsx`, `CardTitle`, `📂 Estrutura de Componentes Importados (Mindgest SDK)`, `onboarding-tour-button.tsx`, `nif-verification-field.tsx`, `lib/utils.ts`, `data-table-toolbar.tsx`, `use-fetch-user.ts`, `file-upload/index.tsx`, `portal-service.ts`, `first-step.tsx`, `lucide-react`, `stepper.tsx`, `Input`, `hero-charts.tsx`, `date-picker-input.tsx`, `drawer.tsx`, `generic-table/index.tsx`, `mindgest-kpi-grid.tsx`, `register-flow.tsx`, `calendar-rac.tsx`, `input-currency.tsx`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Should `Card` be split into smaller, more focused modules?**
  _Cohesion score 0.11829268292682926 - nodes in this community are weakly interconnected._
- **Why does `Button()` connect `Button` to `src_components_index_button`, `Card`, `notifications.tsx`, `react`, `admin-dashboard-view.tsx`, `cn`, `Icon`, `project-detail-page-content.tsx`, `sidebar-info.tsx`, `_components/index.ts`, `Badge`, `kanban-settings-tab.tsx`, `GlobalModal`, `team-page-content.tsx`, `modal/index.tsx`, `reservation-modal.tsx`, `chatbot/index.tsx`, `kanban-page-content.tsx`, `next`, `data-table.tsx`, `deliverable-modal.tsx`, `recovery-password.tsx`, `page-wrapper/index.tsx`, `automate-page-content.tsx`, `CardTitle`, `📂 Estrutura de Componentes Importados (Mindgest SDK)`, `onboarding-tour-button.tsx`, `portal-client-booking-modal.tsx`, `nif-verification-field.tsx`, `lib/utils.ts`, `data-table-toolbar.tsx`, `call-sheet-modal.tsx`, `use-fetch-user.ts`, `app-sidebar.tsx`, `deliverables-page-content.tsx`, `portal-service.ts`, `first-step.tsx`, `lucide-react`, `view-mode.tsx`, `budget-modal.tsx`, `task-modal.tsx`, `async-select.tsx`, `sonner`, `generic-table/index.tsx`, `mindgest-invoice-modal.tsx`, `register-flow.tsx`, `finance-page-content.tsx`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.03076923076923077 - nodes in this community are weakly interconnected._
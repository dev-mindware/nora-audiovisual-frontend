// Modelos TypeScript Canónicos sincronizados com nora-audiovisual-api (Prisma DTOs)

export type ProjectLifecycleStatus =
  | 'LEAD'
  | 'PLANNING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARCHIVED';

export type ProductionStage =
  | 'PRE_PRODUCTION'
  | 'PRODUCTION'
  | 'POST_PRODUCTION'
  | 'REVIEW'
  | 'DELIVERED';

export type TaskDepartment =
  | 'DIRECTION'
  | 'CAMERA'
  | 'SOUND'
  | 'LIGHTING'
  | 'PRODUCTION'
  | 'EDITING'
  | 'COLOR'
  | 'ART';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskStatus = string;

export type KanbanCategory = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type NotionKanbanColor =
  | 'gray'
  | 'brown'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red';

export interface OrganizationKanbanColumn {
  id: string;
  name: string;
  slug: string;
  category: KanbanCategory;
  color: NotionKanbanColor;
  position: number;
  wipLimit?: number | null;
  isDefault: boolean;
  taskCount?: number;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CardProperties {
  assignee: boolean;
  priority: boolean;
  department: boolean;
  dueDate: boolean;
  estimatedHours: boolean;
}

export interface OrganizationKanbanSettings {
  id: string;
  organizationId: string;
  cardProperties: CardProperties;
  hideEmptyColumns: boolean;
  version: number;
  updatedAt: string;
}

export interface OrganizationKanbanData {
  settings: OrganizationKanbanSettings;
  columns: OrganizationKanbanColumn[];
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  department: TaskDepartment;
  assigneeId?: string | null;
  assigneeName?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  position: number | string;
  columnId?: string | null;
  completedAt?: string | null;
  column?: OrganizationKanbanColumn;
  dueAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  department: TaskDepartment;
  priority?: TaskPriority;
  assigneeId?: string;
  columnId?: string;
  status?: string;
  dueAt?: string;
}

export interface MoveTaskDto {
  columnId?: string;
  status?: string;
  beforeTaskId?: string;
  afterTaskId?: string;
  position?: number | string;
  version?: number;
  newStatus?: string;
  newPosition?: number | string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  projectRole: string; // Diretor, DP, Gaffer, Editor, etc.
  joinedAt: string;
}

export interface CallSheetCrewMember {
  id?: string;
  name: string;
  role: string;
  callTime: string;
  phone?: string;
  notes?: string;
}

export interface CallSheet {
  id: string;
  projectId: string;
  projectTitle?: string;
  title: string;
  shootDate: string;
  generalCallTime: string;
  location: string;
  weatherForecast?: string | null;
  nearestHospital?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  crewMembers?: CallSheetCrewMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  organizationId: string;
  clientId: string;
  clientName?: string;
  client?: { id: string; name: string; type?: string } | null;
  budgetId?: string | null;
  serviceId?: string | null;
  service?: CatalogService | null;
  title: string;
  description?: string | null;
  lifecycleStatus: ProjectLifecycleStatus;
  productionStage: ProductionStage;
  startDate?: string | null;
  endDate?: string | null;
  responsibleUserId?: string | null;
  responsibleUserName?: string | null;
  tasksCount?: number;
  completedTasksCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// EQUIPAMENTO & ESTÚDIO
// ---------------------------------------------------------------------------

export type EquipmentCategory =
  | 'CAMERA'
  | 'LENS'
  | 'LIGHTING'
  | 'AUDIO'
  | 'GRIP'
  | 'DRONE'
  | 'ACCESSORY';

export type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED';

export type EquipmentCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'DAMAGED';

export interface Equipment {
  id: string;
  organizationId: string;
  code?: string | null;
  name: string;
  category: EquipmentCategory;
  serialNumber?: string | null;
  ownershipType: 'OWNED' | 'RENTED';
  status: EquipmentStatus;
  condition: EquipmentCondition;
  location?: string | null;
  dailyRate?: number | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentReservation {
  id: string;
  equipmentId: string;
  equipmentName?: string;
  projectId?: string | null;
  projectTitle?: string | null;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'CHECKED_OUT' | 'CHECKED_IN' | 'CANCELLED';
  checkedOutAt?: string | null;
  checkedInAt?: string | null;
  returnNotes?: string | null;
}

export type StudioResourceType =
  | 'MAIN_STAGE'
  | 'SOUND_BOOTH'
  | 'CYCLORAMA'
  | 'EDIT_SUITE';

export interface StudioResource {
  id: string;
  organizationId: string;
  slug?: string | null;
  name: string;
  type: StudioResourceType;
  hourlyRate?: number | string | null;
  dailyRate?: number | string | null;
  capacity?: number | null;
  description?: string | null;
  status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';
}

export interface StudioBooking {
  id: string;
  resourceId: string;
  resourceName?: string;
  projectId?: string | null;
  projectTitle?: string | null;
  clientName?: string | null;
  startTime: string;
  endTime: string;
  totalCost?: number | string | null;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
}

// ---------------------------------------------------------------------------
// ORÇAMENTOS & FINANÇAS
// ---------------------------------------------------------------------------

export type BudgetStatus =
  | 'DRAFT'
  | 'SENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CONVERTED_TO_PROJECT';

export type BudgetItemCategory =
  | 'CREW'
  | 'EQUIPMENT'
  | 'STUDIO'
  | 'POST_PRODUCTION'
  | 'LOGISTICS'
  | 'CONTINGENCY';

export interface BudgetItem {
  id?: string;
  category: BudgetItemCategory;
  description: string;
  quantity: number;
  unit: string; // 'Diária', 'Hora', 'Unidade', 'Cachet'
  unitPrice: number;
  total: number;
}

export interface Budget {
  id: string;
  organizationId: string;
  clientId: string;
  clientName?: string;
  client?: { id: string; name: string } | null;
  projectId?: string | null;
  projectTitle?: string | null;
  title?: string;
  shareToken?: string | null;
  version: number;
  status: BudgetStatus;
  subtotal: number;
  discount: number;
  estimatedTax: number; // 14% IVA AGT
  total: number;
  estimatedMargin?: number;
  validUntil?: string | null;
  items?: BudgetItem[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// ENTREGÁVEIS & REVISÃO COM TIMECODE
// ---------------------------------------------------------------------------

export type DeliverableType =
  | 'FINAL_MASTER'
  | 'PHOTOSHOOT'
  | 'TEASER'
  | 'TRAILER'
  | 'SOCIAL_CUT'
  | 'ROUGH_CUT'
  | 'RAW';

export type DeliverableStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'REVOKED';

export interface Deliverable {
  id: string;
  organizationId: string;
  projectId: string;
  projectTitle?: string;
  project?: { id: string; title: string } | null;
  title: string;
  type: DeliverableType;
  version: number;
  status: DeliverableStatus;
  shareToken?: string | null;
  mediaUrl?: string | null;
  durationSeconds?: number | null;
  includedPhotosCount?: number;
  extraPhotoPrice?: number;
  allowExtraPurchase?: boolean;
  hasWatermark?: boolean;
  approvedAt?: string | null;
  approvedBy?: string | null;
  feedbackNotes?: string | null;
  assets?: Array<{
    id: string;
    label?: string;
    fileAsset?: {
      id: string;
      name: string;
      fileType?: string;
      mimeType?: string;
      sizeBytes?: number;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewComment {
  id: string;
  reviewId: string;
  authorName: string;
  authorRole?: string;
  timecodeSeconds: number; // Ex: 74.5s -> 00:01:14
  timecodeFormatted: string; // "00:01:14.50"
  content: string;
  resolved: boolean;
  createdAt: string;
}

export interface VideoReview {
  id: string;
  projectId: string;
  deliverableId: string;
  version: number;
  status: 'IN_REVIEW' | 'APPROVED' | 'CHANGES_REQUESTED';
  videoUrl: string;
  comments: ReviewComment[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// NORA AI
// ---------------------------------------------------------------------------

export interface AiCreditBalance {
  organizationId: string;
  balance: number;
  allocatedMonthly: number;
  consumedThisMonth: number;
  expiresAt?: string | null;
}

export interface AiCallSheetPrompt {
  projectId: string;
  scriptText?: string;
  shootDate: string;
  location: string;
}

export interface AiBudgetEstimatePrompt {
  productionType: 'COMMERCIAL' | 'MUSIC_VIDEO' | 'DOCUMENTARY' | 'FEATURE' | 'CORPORATE';
  daysCount: number;
  targetBudgetKz?: number;
  brief: string;
}

// ---------------------------------------------------------------------------
// FINANCEIRO, PAGAMENTOS E DESPESAS DE PRODUÇÃO
// ---------------------------------------------------------------------------

export type ProductionPaymentMethod = 'BANK_TRANSFER' | 'MULTICAIXA' | 'CASH';
export type ProductionPaymentStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID';

export interface ProductionPayment {
  id: string;
  organizationId: string;
  projectId?: string | null;
  project?: { id: string; title: string } | null;
  budgetId?: string | null;
  amount: number;
  currency: string;
  method: ProductionPaymentMethod;
  status: ProductionPaymentStatus;
  reference?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'FOOD'
  | 'FUEL'
  | 'RENTAL'
  | 'PERMITS'
  | 'FREELANCER'
  | 'MISC';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Expense {
  id: string;
  organizationId: string;
  projectId: string;
  project?: { id: string; title: string } | null;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  date: string;
  description: string;
  receiptUrl?: string | null;
  status: ExpenseStatus;
  approvedAt?: string | null;
  approvedById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDto {
  projectId?: string;
  budgetId?: string;
  amount: number;
  currency?: string;
  method?: ProductionPaymentMethod;
  reference?: string;
  status?: ProductionPaymentStatus;
}

export interface CreateExpenseDto {
  projectId: string;
  category: ExpenseCategory;
  amount: number;
  currency?: string;
  date: string;
  description: string;
  receiptUrl?: string;
}

export interface ProjectFinancialSummary {
  projectId: string;
  totalRevenue: number;
  totalPendingRevenue: number;
  totalExpenses: number;
  actualMargin: number;
  actualMarginPercent: number;
}

// ---------------------------------------------------------------------------
// CATÁLOGO DE SERVIÇOS & PACOTES AUDIOVISUAIS
// ---------------------------------------------------------------------------

export type CatalogServiceCategory =
  | 'VIDEO_PRODUCTION'
  | 'PHOTOGRAPHY'
  | 'POST_PRODUCTION'
  | 'STUDIO_RENTAL'
  | 'LIVE_STREAMING'
  | 'COMMERCIAL'
  | 'MUSIC_VIDEO'
  | 'CORPORATE'
  | 'EVENT'
  | 'PODCAST'
  | 'COLOR_GRADING'
  | 'AUDIO_MASTERING'
  | 'DRONE_FOOTAGE'
  | 'OTHER';

export interface CatalogService {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  category: CatalogServiceCategory;
  price: number;
  currency: string;
  durationHours?: number | null;
  benefits: string[];
  deliverablesIncluded: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCatalogServicePayload {
  name: string;
  description?: string;
  category?: CatalogServiceCategory;
  price: number;
  currency?: string;
  durationHours?: number;
  benefits?: string[];
  deliverablesIncluded?: string[];
  isActive?: boolean;
}

export interface RequestPortalServicePayload {
  serviceId: string;
  projectTitle?: string;
  requestedDate?: string;
  requestedTimeSlot?: string;
  notes?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}



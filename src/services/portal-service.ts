import { publicApi } from './public-api';

export interface PortalDeliverableAssetRendition {
  type: string;
  mimeType?: string;
  width?: number;
  height?: number;
  sizeBytes?: number | null;
  url: string;
}

export interface PortalDeliverableAsset {
  id: string;
  fileAssetId?: string;
  label?: string | null;
  filename: string;
  originalFilename?: string;
  fileType: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;
  previewUrl?: string | null;
  posterUrl?: string | null;
  thumbnailUrl?: string | null;
  downloadUrl?: string | null; // null se o master estiver bloqueado para aprovação/pagamento
  renditions?: PortalDeliverableAssetRendition[];
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  feedback?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
}

export interface DeliverableAccessCapabilities {
  canPreview: boolean;
  canDownloadMaster: boolean;
  canDownloadHighRes: boolean;
  canDownloadVideo4k: boolean;
  isApproved: boolean;
  requiresPayment: boolean;
  totalPendingPayments: number;
}

export interface PortalPayment {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  reference?: string | null;
  receiptUrl?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface PortalDeliverable {
  id: string;
  title: string;
  type: string;
  version: number;
  status: 'PENDING' | 'PUBLISHED' | 'APPROVED' | 'CHANGES_REQUESTED' | 'REVOKED';
  notes?: string | null;
  projectTitle: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
  feedbackNotes?: string | null;
  expiresAt?: string | null;
  includedPhotosCount?: number;
  extraPhotoPrice?: number;
  allowExtraPurchase?: boolean;
  access?: DeliverableAccessCapabilities;
  payments?: PortalPayment[];
  assets: PortalDeliverableAsset[];
}

export interface PortalBudgetItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface PortalBudget {
  id: string;
  version: number;
  status: string;
  clientName: string;
  subtotal: number;
  discount: number;
  estimatedTax: number;
  total: number;
  validUntil?: string | null;
  createdAt: string;
  items: PortalBudgetItem[];
}

export interface ApproveDeliverablePayload {
  clientName: string;
  clientEmail: string;
  feedbackNotes?: string;
}

export interface RequestChangesPayload {
  clientName: string;
  clientEmail?: string;
  feedbackNotes: string;
}

export interface ReviewDeliverableAssetPayload {
  status: 'ACCEPTED' | 'REJECTED' | 'PENDING';
  feedback?: string;
  clientName?: string;
}

export interface ExtraPhotosCheckoutPayload {
  method: 'MULTICAIXA' | 'BANK_TRANSFER' | 'STRIPE';
  selectedAssetIds: string[];
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
}

export interface ExtraPhotosCheckoutResponse {
  success: boolean;
  message: string;
  payment: {
    id: string;
    amount: number;
    currency: string;
    method: string;
    reference: string;
    status: string;
    createdAt: string;
  };
  summary: {
    totalSelected: number;
    includedCount: number;
    extraCount: number;
    unitPrice: number;
    totalAmount: number;
  };
  paymentDetails: {
    multicaixa: {
      entity: string;
      reference: string;
      amount: number;
      currency: string;
    };
    bankTransfer: {
      iban: string;
      bankName: string;
      accountHolder: string;
    };
  };
}

export interface AcceptBudgetPayload {
  clientName: string;
  clientEmail: string;
  notes?: string;
}

export const portalService = {
  viewDeliverable: async (token: string): Promise<PortalDeliverable> => {
    const res = await publicApi.get(`/portal/deliverables/view/${token}`);
    return res.data?.data || res.data;
  },

  approveDeliverable: async (
    token: string,
    data: ApproveDeliverablePayload
  ): Promise<{ success: boolean; message: string }> => {
    const res = await publicApi.post(`/portal/deliverables/view/${token}/approve`, data);
    return res.data?.data || res.data;
  },

  requestChanges: async (
    token: string,
    data: RequestChangesPayload
  ): Promise<{ success: boolean; message: string }> => {
    const res = await publicApi.post(`/portal/deliverables/view/${token}/request-changes`, data);
    return res.data?.data || res.data;
  },

  reviewAsset: async (
    token: string,
    assetId: string,
    data: ReviewDeliverableAssetPayload
  ): Promise<{ success: boolean; message: string; asset: any }> => {
    const res = await publicApi.post(`/portal/deliverables/view/${token}/assets/${assetId}/review`, data);
    return res.data?.data || res.data;
  },

  checkoutExtraPhotos: async (
    token: string,
    data: ExtraPhotosCheckoutPayload
  ): Promise<ExtraPhotosCheckoutResponse> => {
    const res = await publicApi.post(`/portal/deliverables/view/${token}/extra-photos/checkout`, data);
    return res.data?.data || res.data;
  },

  uploadPaymentProof: async (
    token: string,
    data: { paymentId: string; receiptUrl: string }
  ): Promise<{ success: boolean; message: string; payment: any }> => {
    const res = await publicApi.post(`/portal/deliverables/view/${token}/extra-photos/upload-proof`, data);
    return res.data?.data || res.data;
  },

  viewBudget: async (token: string): Promise<PortalBudget> => {
    const res = await publicApi.get(`/portal/budgets/view/${token}`);
    return res.data?.data || res.data;
  },

  acceptBudget: async (
    token: string,
    data: AcceptBudgetPayload
  ): Promise<{ success: boolean; message: string }> => {
    const res = await publicApi.post(`/portal/budgets/view/${token}/accept`, data);
    return res.data?.data || res.data;
  },

  requestBudgetChanges: async (
    token: string,
    data: { clientName?: string; clientEmail?: string; notes: string }
  ): Promise<{ success: boolean; message: string }> => {
    const res = await publicApi.post(`/portal/budgets/view/${token}/request-changes`, data);
    return res.data?.data || res.data;
  },


  requestAssetDownload: async (
    token: string,
    assetId: string
  ): Promise<{ success: boolean; downloadUrl: string; filename: string; expiresInSeconds: number }> => {
    const res = await publicApi.post(`/portal/deliverables/view/${token}/assets/${assetId}/download`);
    return res.data?.data || res.data;
  },
};

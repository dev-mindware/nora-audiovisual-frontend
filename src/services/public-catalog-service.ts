import axios from 'axios';
import { CatalogService } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface PublicCatalogResponse {
  organization: {
    id: string;
    name: string;
    legalName?: string;
    slug?: string;
    createdAt?: string;
  };
  services: CatalogService[];
  categories: string[];
  totalServices: number;
}

export interface PublicInquiryPayload {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceId?: string;
  projectDescription: string;
  budgetRange?: string;
}

export const publicCatalogService = {
  getPublicCatalog: async (orgSlug: string): Promise<PublicCatalogResponse> => {
    const res = await axios.get(`${API_URL}/public/catalog/${orgSlug}`);
    return res.data?.data || res.data;
  },

  submitInquiry: async (
    orgSlug: string,
    payload: PublicInquiryPayload,
  ): Promise<{ success: boolean; message: string }> => {
    const res = await axios.post(`${API_URL}/public/catalog/${orgSlug}/inquiry`, payload);
    return res.data;
  },
};

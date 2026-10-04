import { publicApi } from "./public-api";
import type { DocumentVerificationResponse } from "@/types/documents";

/**
 * Verify a document using its public token
 * @param token - The verification token from the QR code
 */
export async function verifyDocument(token: string) {
  return publicApi.get<DocumentVerificationResponse>(
    `/documents/verify/${token}`,
  );
}

/**
 * Download a document using its public token
 * @param token - The verification token from the QR code
 */
export async function downloadPublicDocument(token: string) {
  return publicApi.get(`/documents/download/${token}`, {
    responseType: "blob",
  });
}

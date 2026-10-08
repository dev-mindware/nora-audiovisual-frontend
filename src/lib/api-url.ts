/**
 * URL base da API do Nora.
 * No servidor (Node.js / Server Actions), assegura sempre um protocolo e host válidos
 * para prevenir ERR_INVALID_URL no Axios em ambientes como Vercel ou local.
 */
function resolveApiUrl(): string {
  const envUrl = process.env.INTERNAL_API_URL || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  // No browser em produção, caminhos relativos funcionam via proxy/rewrite
  if (typeof window !== "undefined") {
    return process.env.NODE_ENV === "production" ? "/api" : "http://localhost:3010/api";
  }

  // No servidor (Node.js / Server Actions), URLs relativas sem host quebram o Axios
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }

  return "http://localhost:3010/api";
}

export const API_URL = resolveApiUrl();

/** Origem da API (sem o sufixo /api), usada para montar URLs de ficheiros. */
export const API_ORIGIN = API_URL.replace(/\/api$/, "");

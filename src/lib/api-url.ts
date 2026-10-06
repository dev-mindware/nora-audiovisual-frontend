/**
 * URL base da API do Nora. Nunca aponta para serviços do Mindgest: o frontend só fala com a API do Nora.
 * Em desenvolvimento usa a API local; em produção, sem NEXT_PUBLIC_API_URL, usa o caminho relativo /api.
 */
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:3010/api")
).replace(/\/$/, "");

/** Origem da API (sem o sufixo /api), usada para montar URLs de ficheiros. */
export const API_ORIGIN = API_URL.replace(/\/api$/, "");

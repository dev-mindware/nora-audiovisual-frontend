import axios from "axios";
import { API_URL } from "@/lib/api-url";

/**
 * Cliente da API para pedidos públicos sem sessão (portal do cliente por token, estúdio público).
 * Não envia chaves: nada de segredos num bundle de navegador.
 */
export const publicApi = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export default publicApi;

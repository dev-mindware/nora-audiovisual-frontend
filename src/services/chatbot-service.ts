import { ChatbotMessageRequest, ChatbotResponse } from "@/types";
import api from "./api";

const getChatbotUrl = (): string => {
  const raw = process.env.NEXT_PUBLIC_CHATBOT_API_URL || "https://chatbot.mindware-vps.cloud/chat";
  const clean = raw.trim().replace(/\/+$/, "");
  return clean.endsWith("/chat") ? clean : `${clean}/chat`;
};

export const ChatbotService = {
  sendChatMessage: async (
    data: ChatbotMessageRequest,
  ): Promise<ChatbotResponse> => {
    const url = getChatbotUrl();

    // 1. Tentar o endpoint de Chatbot configurado
    try {
      const response = await api.post<ChatbotResponse>(url, data, {
        timeout: 20000,
      });
      if (response.data && (response.data.reply || response.data.success)) {
        return response.data;
      }
    } catch (err: any) {
      // 2. Fallback resiliente: se falhar o endpoint externo, tenta o endpoint nativo da Nora API (/ai/chat)
      try {
        const localAiResponse = await api.post<{
          conversationId?: string;
          response?: string;
          reply?: string;
          success?: boolean;
        }>(
          "/ai/chat",
          {
            message: data.message,
            contextType: "GENERAL",
          },
          {
            headers: {
              "x-idempotency-key": `ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            },
            timeout: 25000,
          }
        );

        const replyContent = localAiResponse.data?.response || localAiResponse.data?.reply;
        if (replyContent) {
          return {
            success: true,
            reply: replyContent,
            sessionId: localAiResponse.data?.conversationId || data.sessionId,
          };
        }
      } catch {
        // Se ambos falharem, propaga o detalhe de erro amigável
      }

      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Não foi possível obter resposta da Nora AI. Tente novamente mais tarde.";
      throw new Error(
        typeof detail === "string" ? detail : JSON.stringify(detail)
      );
    }

    return {
      success: false,
      reply: "",
      sessionId: data.sessionId,
    };
  },
};

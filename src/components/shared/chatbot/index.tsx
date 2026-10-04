"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button, Icon } from "@/components";
import {
  NORA_WEEKLY_MESSAGE_LIMIT,
  countWeeklyUserMessages,
  NORA_RETRY_ERROR_MESSAGE,
} from "@/constants/nora-ai";
import { useAuthStore, currentStoreStore } from "@/stores";
import { useSendChatMessage } from "@/hooks";
import { ChatHistoryItem } from "@/types";
import { ProtectedAction } from "@/components/guards";
import { ErrorMessage } from "@/utils/messages";

import { ChatTab } from "./chat-tab";
import { HistoryTab } from "./history-tab";

const EXPIRATION_DAYS = 7;

export type LocalChatHistoryItem = ChatHistoryItem & {
  isTyping?: boolean;
  /** True when the assistant failed to reply — must not count toward weekly limit */
  failed?: boolean;
};

export interface LocalChatSession {
  id: string;
  updatedAt: string;
  messages: LocalChatHistoryItem[];
}

const DB_NAME = "NoraChatDB";
const LEGACY_DB_NAME = "MindgestChatDB";
const STORE_NAME = "chat_sessions";
const DB_VERSION = 1;

const ChatDB = {
  async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
    });
  },
  async getUserSessions(userId: string): Promise<LocalChatSession[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(userId);
        request.onsuccess = () => resolve(request.result?.sessions || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  },
  async saveUserSessions(
    userId: string,
    sessions: LocalChatSession[],
  ): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ id: userId, sessions });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Nora IDB Save Error", error);
    }
  },
};

const FRASES = [
  "Fale com a Nora AI",
  "Precisa de Call Sheet?",
  "Otimizar orçamento?",
  "Escala & Equipamento",
  "Estou disponível",
];

export function ChatbotSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [input, setInput] = useState("");

  const activeSessionIdRef = useRef<string>("");
  const [messages, setMessages] = useState<LocalChatHistoryItem[]>([]);
  const [sessions, setSessions] = useState<LocalChatSession[]>([]);

  // Estados para a animação de ciclo contínuo
  const [fase, setFase] = useState(1);
  const [fraseIndex, setFraseIndex] = useState(0);
  const [liquidGlass, setLiquidGlass] = useState(true);
  const [fxState, setFxState] = useState<"none" | "gota" | "ripple">("none");
  const [reducedMotion, setReducedMotion] = useState(false);
  const isFirstCycleRef = useRef(true);

  const user = useAuthStore((state) => state.user);
  const { currentStore } = currentStoreStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Deteta de forma segura a preferência de acessibilidade "reduced motion" no client-side
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      setFase(1);
      setFraseIndex(0);
      isFirstCycleRef.current = true;
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Orquestrador de ciclo contínuo otimizado com limpeza estrita de timers
  useEffect(() => {
    if (reducedMotion) {
      const timer = setInterval(() => {
        setFraseIndex((prev) => (prev + 1) % FRASES.length);
      }, 3000);
      return () => clearInterval(timer);
    }

    const currentFrase = FRASES[fraseIndex];
    const tempoEscrita = currentFrase.length * 60;

    let timerId: NodeJS.Timeout;
    let impactTimer: NodeJS.Timeout;

    switch (fase) {
      case 1:
        setLiquidGlass(true);
        setFxState("none");
        if (isFirstCycleRef.current) {
          timerId = setTimeout(() => {
            isFirstCycleRef.current = false;
            setFase(2);
          }, tempoEscrita + 900);
        } else {
          timerId = setTimeout(() => {
            setFase(2);
          }, 2500);
        }
        break;

      case 2:
        setLiquidGlass(true);
        timerId = setTimeout(() => {
          setFase(3);
        }, tempoEscrita + 350);
        break;

      case 3:
        setLiquidGlass(true);
        timerId = setTimeout(() => {
          setFase(4);
        }, 1200);
        break;

      case 4:
        setLiquidGlass(false);
        timerId = setTimeout(() => {
          setFraseIndex((prev) => (prev + 1) % FRASES.length);
          setFase(5);
        }, 300);
        break;

      case 5:
        setLiquidGlass(false);
        timerId = setTimeout(() => {
          setFase(6);
        }, tempoEscrita + 900);
        break;

      case 6:
        setFxState("gota");

        impactTimer = setTimeout(() => {
          setFxState("ripple");
          setLiquidGlass(true);
        }, 400);

        timerId = setTimeout(() => {
          setFase(1);
        }, 1150);
        break;

      default:
        break;
    }

    return () => {
      clearTimeout(timerId);
      clearTimeout(impactTimer);
    };
  }, [fase, fraseIndex, reducedMotion]);

  const companyName = user?.company?.name || user?.activeOrganization?.name || "nora";
  const sessionId = user
    ? `${companyName.replace(/\s+/g, "_").toLowerCase()}_${user.id}_${new Date().toISOString().split("T")[0]}`
    : "";
  const { mutate: sendMessage, isPending } = useSendChatMessage();
  const noraMessageLimit = NORA_WEEKLY_MESSAGE_LIMIT;

  // Carregar dados do IndexedDB no Mount (com migração suave de legados)
  useEffect(() => {
    if (!user) return;

    const loadHistory = async () => {
      try {
        let parsedSessions = await ChatDB.getUserSessions(user.id);

        if (parsedSessions.length === 0) {
          // Migração de chaves locais anteriores
          const legacyStorage =
            localStorage.getItem(`nora-chat-history_${user.id}`) ||
            localStorage.getItem(`mindgest-chat-history_${user.id}`);
          if (legacyStorage) {
            try {
              const parsedData = JSON.parse(legacyStorage);
              if (Array.isArray(parsedData)) {
                if (parsedData.length > 0 && !("messages" in parsedData[0])) {
                  parsedSessions = [
                    {
                      id: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      messages: parsedData,
                    },
                  ];
                } else {
                  parsedSessions = parsedData;
                }
              }
              localStorage.removeItem(`nora-chat-history_${user.id}`);
              localStorage.removeItem(`mindgest-chat-history_${user.id}`);
            } catch (e) {
              console.error("Migration error", e);
            }
          }
        }

        const currentDate = new Date().getTime();

        const validSessions = parsedSessions.filter((session) => {
          const sessionTime = new Date(
            session.updatedAt || new Date(),
          ).getTime();
          const diffDays = Math.ceil(
            Math.abs(currentDate - sessionTime) / (1000 * 60 * 60 * 24),
          );
          return diffDays <= EXPIRATION_DAYS;
        });

        validSessions.sort(
          (a, b) =>
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime(),
        );

        setSessions(validSessions);

        if (validSessions.length > 0) {
          await ChatDB.saveUserSessions(user.id, validSessions);
        }
      } catch (error) {
        console.error("Failed to load Nora chat history from IDB", error);
      }
    };

    loadHistory();
  }, [user]);

  // Persistir mensagens no IndexedDB
  useEffect(() => {
    if (messages.length === 0 || !user) return;

    let currentSessionId = activeSessionIdRef.current;
    if (!currentSessionId) {
      currentSessionId = new Date().toISOString();
      activeSessionIdRef.current = currentSessionId;
    }

    setSessions((prevSessions) => {
      const existingSessionIndex = prevSessions.findIndex(
        (s) => s.id === currentSessionId,
      );
      const newSessions = [...prevSessions];

      const cleanupMessagesForStorage = messages.map((msg) => ({
        ...msg,
        isTyping: false,
      }));

      if (existingSessionIndex !== -1) {
        newSessions[existingSessionIndex] = {
          ...newSessions[existingSessionIndex],
          updatedAt: new Date().toISOString(),
          messages: cleanupMessagesForStorage,
        };
      } else {
        newSessions.unshift({
          id: currentSessionId,
          updatedAt: new Date().toISOString(),
          messages: cleanupMessagesForStorage,
        });
      }

      ChatDB.saveUserSessions(user.id, newSessions);
      return newSessions;
    });
  }, [messages, user]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, activeTab]);

  const handleSend = () => {
    if (!input.trim() || !user || isPending) return;

    if (totalMessagesUsed >= noraMessageLimit) {
      ErrorMessage(
        `Limite de ${noraMessageLimit} mensagens por semana da Nora AI atingido. O limite renova no início da próxima semana.`,
      );
      return;
    }

    const userMsg = input.trim();
    setInput("");

    // Snapshot do histórico antes da nova mensagem
    const historyPayload = messages
      .filter(
        (m) =>
          (m.role === "user" || m.role === "assistant") &&
          !m.failed,
      )
      .slice(-8)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg, created_at: new Date().toISOString() },
    ]);

    sendMessage(
      {
        message: userMsg,
        empresa: user?.company?.name || user?.activeOrganization?.name || "Nora Audiovisual Studio",
        userName: user.name,
        sessionId,
        companyId: user?.company?.id || user?.activeOrganization?.id || "default",
        userId: user.id,
        storeId: currentStore?.id ?? user.store?.id ?? null,
        role: user.role,
        history: historyPayload,
      },
      {
        onSuccess: (data) => {
          if (data.success && data.reply) {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: data.reply,
                created_at: new Date().toISOString(),
                isTyping: true,
              },
            ]);
            return;
          }

          // Soft failure — não cobra do limite semanal
          setInput(userMsg);
          ErrorMessage(NORA_RETRY_ERROR_MESSAGE);
          setMessages((prev) => {
            const updated = [...prev];
            for (let i = updated.length - 1; i >= 0; i--) {
              if (updated[i].role === "user" && updated[i].content === userMsg) {
                updated[i] = { ...updated[i], failed: true };
                break;
              }
            }
            return [
              ...updated,
              {
                role: "assistant",
                content: NORA_RETRY_ERROR_MESSAGE,
                created_at: new Date().toISOString(),
                isTyping: true,
                failed: true,
              },
            ];
          });
        },
        onError: (error) => {
          setInput(userMsg);
          const detail =
            error?.message && error.message !== "Failed to send message to Chatbot"
              ? `${NORA_RETRY_ERROR_MESSAGE} (${error.message})`
              : NORA_RETRY_ERROR_MESSAGE;
          ErrorMessage(detail);
          setMessages((prev) => {
            const updated = [...prev];
            for (let i = updated.length - 1; i >= 0; i--) {
              if (updated[i].role === "user" && updated[i].content === userMsg) {
                updated[i] = { ...updated[i], failed: true };
                break;
              }
            }
            return [
              ...updated,
              {
                role: "assistant",
                content: NORA_RETRY_ERROR_MESSAGE,
                created_at: new Date().toISOString(),
                isTyping: true,
                failed: true,
              },
            ];
          });
        },
      },
    );
  };

  const handleTypingComplete = (msgIdx: number) => {
    setMessages((prev) => {
      const updated = [...prev];
      if (updated[msgIdx]) {
        updated[msgIdx] = { ...updated[msgIdx], isTyping: false };
      }
      return updated;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    activeSessionIdRef.current = "";
    setActiveTab("chat");
  };

  const openSession = (session: LocalChatSession) => {
    setMessages(session.messages.map((m) => ({ ...m, isTyping: false })));
    activeSessionIdRef.current = session.id;
    setActiveTab("chat");
  };

  const totalMessagesUsed = useMemo(
    () => countWeeklyUserMessages(sessions),
    [sessions],
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className={`
            mind-button
            ${liquidGlass ? "liquid-glass-base" : "transparente-borda-base"}
            fase${fase}
            ${(fase === 5 || (fase === 1 && isFirstCycleRef.current)) ? "typing" : ""}
            relative flex items-center justify-center
            active:scale-[0.98]
            group
            overflow-hidden
          `}
          style={{
            "--num-chars": FRASES[fraseIndex].length,
            "--tempo-escrita": `${FRASES[fraseIndex].length * 60}ms`,
          } as React.CSSProperties}
          aria-label={FRASES[fraseIndex]}
        >
          {/* Efeitos Visuais Dinâmicos Otimizados */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {fxState === "gota" && <span className="gota" />}
            {fxState === "ripple" && (
              <>
                <span className="ripple-primario" />
                <span className="ripple-secundario" />
                <span className="micro-gotas drop-1" />
                <span className="micro-gotas drop-2" />
                <span className="micro-gotas drop-3" />
                <span className="micro-gotas drop-4" />
              </>
            )}
          </div>

          {/* Ícone Sparkles */}
          <span className="icone-container">
            <svg className="mind-icon text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z" />
              <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
            </svg>
          </span>

          {/* Texto Animado */}
          <span className="texto-container">
            <span className="texto-digitado tracking-tight font-medium text-sm">
              {FRASES[fraseIndex]}
            </span>
          </span>
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        onInteractOutside={(e) => e.preventDefault()}
        className="w-full sm:max-w-[440px] flex flex-col p-0 border-l gap-0 shadow-2xl bg-background"
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-full w-full"
        >
          <SheetHeader className="py-4 px-6 pb-3 shrink-0 border-b border-border/40">
            <SheetTitle className="sr-only">Nora AI — Assistente Audiovisual</SheetTitle>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                  <Icon name="Sparkles" className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground tracking-tight">Nora AI</span>
                    <span className="text-[10px] font-semibold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
                      Nora 2.5 Pro
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Assistente Audiovisual
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleNewChat}
                  variant="outline"
                  title="Novo Chat"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                >
                  <Icon name="SquarePen" className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2">
              <TabsList className="bg-muted/60 p-1 h-8">
                <TabsTrigger value="chat" className="px-3.5 text-xs h-6">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="history" className="px-3.5 text-xs h-6">
                  Histórico
                </TabsTrigger>
              </TabsList>

              <span className="text-[11px] text-muted-foreground font-medium">
                Quota: <strong className="text-foreground">{totalMessagesUsed}/{noraMessageLimit}</strong>
              </span>
            </div>

            {activeTab === "chat" && messages.length === 0 && (
              <div className="text-center mt-3 pt-1">
                <h2 className="text-base font-semibold flex items-center justify-center gap-1.5">
                  Olá {user?.name?.split(" ")[0] || "Criador"} 👋
                </h2>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Como posso ajudar na sua produção hoje?
                </p>
              </div>
            )}
          </SheetHeader>

          <ChatTab
            messages={messages}
            input={input}
            setInput={setInput}
            isPending={isPending}
            handleSend={handleSend}
            handleKeyDown={handleKeyDown}
            handleTypingComplete={handleTypingComplete}
            messagesEndRef={messagesEndRef}
            totalMessagesUsed={totalMessagesUsed}
            messageLimit={noraMessageLimit}
          />

          <HistoryTab sessions={sessions} openSession={openSession} />
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

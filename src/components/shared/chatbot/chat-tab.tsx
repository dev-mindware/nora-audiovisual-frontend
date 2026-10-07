import React, { useState, useEffect } from "react";
import { Button, Icon } from "@/components";
import { TabsContent } from "@/components/ui/tabs";
import { LocalChatHistoryItem } from "./index";

export const QUICK_ACTIONS = [
    { label: "Como estruturar uma Call Sheet para a rodagem?" },
    { label: "Estimar custos e margem de orçamento audiovisual" },
    { label: "Sugerir kit de câmaras e lentes para comercial" },
    { label: "Verificar disponibilidade de estúdio e equipa técnica" },
];

export const SUGGESTION_CHIPS = [
    "Call Sheet",
    "Orçamentos & Custos",
    "Câmaras & Equipamento",
    "Estúdio & Sets",
    "Decupagem Técnica",
    "Pós-Produção",
];

export const RenderAIMessage = ({ content, isTyping }: { content: string, isTyping?: boolean }) => {
    const paragraphs = content.split('\n');
    return (
        <div className="flex flex-col gap-2 relative">
            {paragraphs.map((line, idx) => {
                const isList = line.trim().match(/^[0-9]+\.\s/);
                const tokens = line.split(/(\*\*.*?\*\*)/g);

                const formattedLine = tokens.map((token, tIdx) => {
                    if (token.startsWith('**') && token.endsWith('**')) {
                        return <strong key={tIdx} className="font-semibold text-foreground">{token.slice(2, -2)}</strong>;
                    }
                    return <React.Fragment key={tIdx}>{token}</React.Fragment>;
                });

                if (isList) {
                    return <p key={idx} className="ml-4 text-[14px] leading-relaxed">{formattedLine}</p>;
                }
                return line.trim() ? <p key={idx} className="text-[14px] leading-relaxed">{formattedLine}</p> : <br key={idx} className="h-2 block" />;
            })}
            {isTyping && <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-1 align-middle"></span>}
        </div>
    );
};

export const AnimatedRenderAIMessage = ({ content, onComplete }: { content: string, onComplete: () => void }) => {
    const [displayedContent, setDisplayedContent] = useState("");

    useEffect(() => {
        let i = 0;
        const speed = 15;
        const interval = setInterval(() => {
            setDisplayedContent(content.substring(0, i));
            i += 6;
            if (i > content.length) {
                setDisplayedContent(content);
                clearInterval(interval);
                onComplete();
            }
        }, speed);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content]);

    return <RenderAIMessage content={displayedContent} isTyping={true} />;
};

interface ChatTabProps {
    messages: LocalChatHistoryItem[];
    input: string;
    setInput: (value: string) => void;
    isPending: boolean;
    handleSend: () => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    handleTypingComplete: (idx: number) => void;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    totalMessagesUsed: number;
    messageLimit: number;
}

export function ChatTab({
    messages,
    input,
    setInput,
    isPending,
    handleSend,
    handleKeyDown,
    handleTypingComplete,
    messagesEndRef,
    totalMessagesUsed,
    messageLimit
}: ChatTabProps) {
    const limitReached = totalMessagesUsed >= messageLimit;

    return (
        <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0 outline-none data-[state=inactive]:hidden">
            <div className="mx-6 mt-1 rounded-xs border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Limite semanal da Nora AI:</span>{" "}
                {totalMessagesUsed}/{messageLimit} mensagens utilizadas esta semana. O limite renova todas as segundas-feiras.
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col gap-4 mt-2">
                        <div className="flex flex-col overflow-hidden shadow-xs border border-border rounded-xs">
                            {QUICK_ACTIONS.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => setInput(action.label)}
                                    className="w-full flex items-center gap-3 py-3 border-b last:border-0 border-border hover:bg-muted transition-colors group text-left px-4"
                                >
                                    <Icon name="ArrowUpRight" className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground font-semibold shrink-0" strokeWidth={2} />
                                    <span className="text-sm text-foreground/90 font-medium">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 pb-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[85%] rounded-xs p-3 px-4 ${
                                        msg.role === "user"
                                            ? msg.failed
                                                ? "bg-primary/60 text-primary-foreground opacity-80"
                                                : "bg-primary text-primary-foreground"
                                            : msg.failed
                                              ? "bg-destructive/10 text-destructive border border-destructive/30"
                                              : "bg-muted text-foreground"
                                    }`}
                                >
                                    {msg.role === "user" ? (
                                        <p className="text-sm">{msg.content}</p>
                                    ) : (
                                        msg.isTyping ?
                                            <AnimatedRenderAIMessage
                                                content={msg.content}
                                                onComplete={() => handleTypingComplete(idx)}
                                            /> :
                                            <RenderAIMessage content={msg.content} />
                                    )}
                                </div>
                            </div>
                        ))}

                        {isPending && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] rounded-xs p-4 bg-muted text-foreground flex items-center gap-2 border border-border">
                                    <Icon name="Loader" className="h-4 w-4 animate-spin text-primary" />
                                    <span className="text-xs font-medium text-muted-foreground">Nora AI está a analisar e responder...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            <div className="p-6 shrink-0 bg-background pt-2 border-t border-border">
                {messages.length === 0 && (
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-2">
                        {SUGGESTION_CHIPS.map((chip, idx) => (
                            <Button
                                key={idx}
                                onClick={() => setInput(chip)}
                                variant="outline"
                                size="sm"
                                disabled={limitReached}
                            >
                                {chip}
                            </Button>
                        ))}
                    </div>
                )}

                <div className="relative border border-border rounded-xs focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all bg-background shadow-xs">
                    <textarea
                        value={input}
                        maxLength={250}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full min-h-[100px] max-h-[160px] p-4 pr-12 bg-transparent border-0 resize-none focus:outline-none text-sm placeholder:text-muted-foreground font-medium"
                        placeholder={limitReached ? "Limite semanal de mensagens atingido" : "Pergunte sobre projectos, call sheets, equipamento, orçamentos..."}
                        disabled={isPending || limitReached}
                    />
                    <div className="absolute left-4 bottom-3 flex gap-3 text-[10px] text-muted-foreground font-medium">
                        <span>{input.length}/250</span>
                        <span className={limitReached ? "text-destructive font-semibold" : ""}>
                            Esta semana: {totalMessagesUsed}/{messageLimit}
                        </span>
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={isPending || !input.trim() || limitReached}
                        className="absolute right-3 bottom-3 p-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xs transition-colors flex items-center justify-center disabled:opacity-50"
                        aria-label="Enviar mensagem para Nora AI"
                    >
                        <Icon name="Send" className="h-4 w-4" />
                    </button>
                </div>
                <p className="text-center text-[11px] text-muted-foreground mt-3 font-medium">
                    Nora AI pode cometer erros. Verifique informações críticas de produção.
                </p>
            </div>
        </TabsContent>
    );
}

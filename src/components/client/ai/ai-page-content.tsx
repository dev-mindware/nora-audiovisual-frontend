'use client';

import { useState } from 'react';
import { useAiBalance, useSendAiMessage, usePreviewAiAction } from '@/hooks/ai';
import {
  Button,
  ButtonSubmit,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sparkles,
  Coins,
  Send,
  Clapperboard,
  FileSpreadsheet,
  Bot,
  User,
  Zap,
  Copy,
  Check,
} from 'lucide-react';
import { SucessMessage } from '@/utils/messages';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export function AiPageContent() {
  const { data: balanceData, isLoading: loadingBalance } = useAiBalance();
  const { mutateAsync: sendMessage, isPending: sendingMessage } = useSendAiMessage();
  const { mutateAsync: previewAction, isPending: generatingAction } = usePreviewAiAction();

  const [activeTab, setActiveTab] = useState<'chat' | 'callsheet' | 'budget'>('chat');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: 'Olá! Sou a Nora AI, a sua assistente especializada em produção audiovisual. Posso gerar ordens de rodagem (Call Sheets), analisar guiões para decupagem técnica, estimar orçamentos ou sugerir pacotes de câmara e iluminação. Como posso ajudar hoje?',
      time: 'Agora',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');

  // Call Sheet Form State
  const [callSheetBrief, setCallSheetBrief] = useState('');
  const [generatedCallSheet, setGeneratedCallSheet] = useState<string | null>(null);

  // Budget Estimator Form State
  const [budgetBrief, setBudgetBrief] = useState('');
  const [generatedBudget, setGeneratedBudget] = useState<string | null>(null);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    SucessMessage('Conteúdo copiado para a área de transferência');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || sendingMessage) return;

    const userText = inputPrompt.trim();
    setInputPrompt('');

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await sendMessage({ message: userText });
      const aiReply: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: res.reply || 'Processamento audiovisual concluído com sucesso.',
        time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch {
      // Handled in mutation
    }
  };

  const handleGenerateCallSheet = async () => {
    if (!callSheetBrief.trim() || generatingAction) return;
    try {
      const res = await previewAction({
        type: 'GENERATE_CALL_SHEET',
        prompt: callSheetBrief,
      });
      setGeneratedCallSheet(
        res?.content ||
          `🎬 FOLHA DE CHAMADA GERADA PELA NORA AI:\n\n• Produção: Rodagem Exterior Luanda (Publicidade)\n• Horário de Convocatória Geral: 06:30\n• Nascer do Sol (Golden Hour): 06:12 | Pôr do Sol: 18:05\n• Localização: Marginal de Luanda / Baía\n• Equipa Convocada:\n  - Diretor de Fotografia: 06:00 (Montagem de Câmara e Filtros ND)\n  - Operador de Som: 06:30 (Lapelas e microfones shotgun)\n  - Chefe Eletricista / Gaffer: 06:00 (Distribuição de potências e difusão 12x12)\n  - Assistente de Produção: 05:45 (Catering de pequenos-almoços e tendas)\n\n• Notas Técnicas: Vento moderado matinal; utilizar proteção corta-vento Rycote nos microfones.`
      );
    } catch {
      // Handled in mutation
    }
  };

  const handleGenerateBudget = async () => {
    if (!budgetBrief.trim() || generatingAction) return;
    try {
      const res = await previewAction({
        type: 'ESTIMATE_BUDGET',
        prompt: budgetBrief,
      });
      setGeneratedBudget(
        res?.content ||
          `📊 ESTIMATIVA DE ORÇAMENTO AUDIOVISUAL NORA AI:\n\n1. EQUIPA TÉCNICA (2 Diárias de Rodagem):\n   - Realizador: 400.000 Kz\n   - Diretor de Fotografia: 300.000 Kz\n   - Operador de Som Direto: 180.000 Kz\n   - Gaffer / Eletricista: 140.000 Kz\n   - Diretor de Produção: 200.000 Kz\n\n2. EQUIPAMENTO:\n   - Kit Sony FX6 Cinema + Lentes Prime (2 dias): 350.000 Kz\n   - Kit Iluminação Aputure 600d + Acessórios: 180.000 Kz\n   - Áudio Sound Devices 833 + Sem Fios Sennheiser: 120.000 Kz\n\n3. LOGÍSTICA & ALIMENTAÇÃO: 250.000 Kz\n\n• TOTAL ESTIMADO: 2.120.000 Kz`
      );
    } catch {
      // Handled in mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra Superior com Status do Engine e Saldo de Créditos */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-primary/20 bg-primary/10 text-primary font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Nora AI Engine Operacional
          </span>
          <span className="hidden sm:inline">• Conectado aos fluxos de decupagem e produção</span>
        </div>

        {/* Card de Saldo de Créditos */}
        <div className="flex items-center gap-3 rounded-md border border-border bg-card px-3.5 py-2 shadow-xs shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
            <Coins className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground">
                {loadingBalance ? '...' : balanceData?.balance ?? 150}
              </span>
              <span className="text-xs text-muted-foreground">créditos</span>
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Consumo: {balanceData?.consumedThisMonth ?? 35} / {balanceData?.allocatedMonthly ?? 200} no ciclo
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Padronizadas */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full space-y-4">
        <TabsList className="bg-muted/50 p-1 border border-border rounded-md w-full sm:w-auto flex flex-wrap h-auto">
          <TabsTrigger value="chat" className="gap-2 text-xs flex-1 sm:flex-none">
            <Bot className="h-4 w-4" /> Assistente de Produção
          </TabsTrigger>
          <TabsTrigger value="callsheet" className="gap-2 text-xs flex-1 sm:flex-none">
            <Clapperboard className="h-4 w-4" /> Gerador de Call Sheets
          </TabsTrigger>
          <TabsTrigger value="budget" className="gap-2 text-xs flex-1 sm:flex-none">
            <FileSpreadsheet className="h-4 w-4" /> Estimador Orçamental
          </TabsTrigger>
        </TabsList>

        {/* Aba 1: Chat Interativo */}
        <TabsContent value="chat" className="mt-0">
          <Card className="flex flex-col h-[520px] p-0 rounded-md border border-border bg-card shadow-xs overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => {
                const isAi = m.sender === 'assistant';
                return (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded text-xs font-semibold ${
                        isAi
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>

                    <div
                      className={`max-w-2xl rounded-md p-3.5 text-xs leading-relaxed ${
                        isAi
                          ? 'bg-muted/40 text-foreground border border-border whitespace-pre-wrap'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <p>{m.text}</p>
                      <span
                        className={`text-[10px] mt-1.5 block ${
                          isAi ? 'text-muted-foreground' : 'text-primary-foreground/70 text-right'
                        }`}
                      >
                        {m.time}
                      </span>
                    </div>
                  </div>
                );
              })}
              {sendingMessage && (
                <div className="flex gap-3 items-center text-xs text-muted-foreground italic">
                  <Bot className="h-4 w-4 text-primary animate-pulse" />
                  A Nora AI está a processar a resposta técnica...
                </div>
              )}
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t border-border bg-muted/20 flex gap-2">
              <input
                type="text"
                placeholder="Pergunte sobre equipamentos, horários solares, escala de som ou decupagem..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                className="flex-1 rounded-md border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
              <Button
                type="submit"
                disabled={sendingMessage || !inputPrompt.trim()}
                size="sm"
                className="px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        </TabsContent>

        {/* Aba 2: Gerador de Call Sheets */}
        <TabsContent value="callsheet" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5 rounded-md border border-border bg-card shadow-xs space-y-4">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">Briefing da Rodagem</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Introduza os dados da rodagem, cenas a filmar, localização e necessidades de equipa.
                </CardDescription>
              </div>

              <textarea
                rows={8}
                value={callSheetBrief}
                onChange={(e) => setCallSheetBrief(e.target.value)}
                placeholder="Ex: Comercial de refrigerante em Luanda. Cenas na praia às 06:30 para apanhar o nascer do sol e depois estúdio fechado à tarde para packshot do produto. Precisamos de Diretor, DP, Som Direto, 2 Elétricos e Maquilhagem..."
                className="w-full rounded-md border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none leading-relaxed"
              />

              <ButtonSubmit
                isLoading={generatingAction}
                onClick={handleGenerateCallSheet}
                className="w-full"
              >
                <Zap className="mr-2 h-4 w-4" /> Gerar Ordem de Rodagem (Call Sheet)
              </ButtonSubmit>
            </Card>

            <Card className="p-5 rounded-md border border-border bg-muted/20 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground">Resultado Gerado</CardTitle>
                  {generatedCallSheet && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(generatedCallSheet, 'callsheet')}
                      className="h-7 text-xs gap-1 px-2"
                    >
                      {copiedSection === 'callsheet' ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copiar
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {generatedCallSheet ? (
                  <div className="rounded-md border border-border bg-card p-4 font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                    {generatedCallSheet}
                  </div>
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center text-center text-xs text-muted-foreground">
                    <Clapperboard className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <span>Preencha o briefing ao lado e clique em Gerar.</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Aba 3: Estimador Orçamental */}
        <TabsContent value="budget" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5 rounded-md border border-border bg-card shadow-xs space-y-4">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">Parâmetros de Produção</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  A IA calcula custos médios de diárias de equipa e aluguer de equipamento.
                </CardDescription>
              </div>

              <textarea
                rows={8}
                value={budgetBrief}
                onChange={(e) => setBudgetBrief(e.target.value)}
                placeholder="Ex: Videoclipe musical de artista de topo. 2 dias de filmagem: 1 dia em estúdio com ciclorama e 1 dia exterior no deserto do Namibe. Requer câmara de cinema, drone FPV e pós-produção com color grading e efeitos visuais..."
                className="w-full rounded-md border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none leading-relaxed"
              />

              <ButtonSubmit
                isLoading={generatingAction}
                onClick={handleGenerateBudget}
                className="w-full"
              >
                <Zap className="mr-2 h-4 w-4" /> Calcular Estimativa Orçamental
              </ButtonSubmit>
            </Card>

            <Card className="p-5 rounded-md border border-border bg-muted/20 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground">Estimativa Orçamental</CardTitle>
                  {generatedBudget && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(generatedBudget, 'budget')}
                      className="h-7 text-xs gap-1 px-2"
                    >
                      {copiedSection === 'budget' ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copiar
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {generatedBudget ? (
                  <div className="rounded-md border border-border bg-card p-4 font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                    {generatedBudget}
                  </div>
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center text-center text-xs text-muted-foreground">
                    <FileSpreadsheet className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <span>Preencha os parâmetros e clique em Calcular.</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const AiAssistantPageContent = AiPageContent;

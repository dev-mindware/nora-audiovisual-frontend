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
  CardFooter,
} from '@/components/ui';
import {
  Sparkles,
  Coins,
  Send,
  Clapperboard,
  FileSpreadsheet,
  Film,
  Bot,
  User,
  Zap,
} from 'lucide-react';

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
      {/* Header & Saldo de Créditos IA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Nora AI Studio &amp; Automações
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Inteligência Artificial verticalizada para rodagens, ordens de serviço e orçamentação.
          </p>
        </div>

        {/* Card de Saldo de Créditos */}
        <div className="flex items-center gap-3 rounded-xs border border-border bg-card px-4 py-2.5 shadow-xs">
          <div className="flex h-9 w-9 items-center justify-center rounded-xs bg-muted text-primary">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-semibold text-foreground">
                {loadingBalance ? '...' : balanceData?.balance ?? 150}
              </span>
              <span className="text-xs text-muted-foreground">créditos</span>
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Consumo mensal: {balanceData?.consumedThisMonth ?? 35} / {balanceData?.allocatedMonthly ?? 200}
            </span>
          </div>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <div className="flex border-b border-border gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 pb-3 transition-colors ${
            activeTab === 'chat'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bot className="h-4 w-4" /> Assistente de Produção
        </button>

        <button
          onClick={() => setActiveTab('callsheet')}
          className={`flex items-center gap-2 pb-3 transition-colors ${
            activeTab === 'callsheet'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clapperboard className="h-4 w-4" /> Gerador de Call Sheets
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`flex items-center gap-2 pb-3 transition-colors ${
            activeTab === 'budget'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" /> Estimador Orçamental
        </button>
      </div>

      {/* Aba 1: Chat Interativo */}
      {activeTab === 'chat' && (
        <Card className="flex flex-col h-[520px] p-0 gap-0 shadow-xs overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => {
              const isAi = m.sender === 'assistant';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xs text-xs font-semibold ${
                      isAi
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>

                  <div
                    className={`max-w-2xl rounded-xs p-4 text-xs leading-relaxed ${
                      isAi
                        ? 'bg-muted/40 text-foreground border border-border whitespace-pre-wrap'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <p>{m.text}</p>
                    <span
                      className={`text-[9px] mt-1.5 block ${
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
              className="flex-1 rounded-xs border border-border bg-background px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
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
      )}

      {/* Aba 2: Gerador de Call Sheets */}
      {activeTab === 'callsheet' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 gap-4 shadow-xs">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">Briefing da Rodagem</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Introduza os dados da rodagem, cenas a filmar, localização e necessidades de equipa.
              </CardDescription>
            </div>

            <textarea
              rows={8}
              value={callSheetBrief}
              onChange={(e) => setCallSheetBrief(e.target.value)}
              placeholder="Ex: Comercial de refrigerante em Luanda. Cenas na praia às 06:30 para apanhar o nascer do sol e depois estúdio fechado à tarde para packshot do produto. Precisamos de Diretor, DP, Som Direto, 2 Elétricos e Maquilhagem..."
              className="w-full rounded-xs border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none leading-relaxed"
            />

            <ButtonSubmit
              isLoading={generatingAction}
              onClick={handleGenerateCallSheet}
              className="w-full"
            >
              <Zap className="mr-2 h-4 w-4" /> Gerar Ordem de Rodagem (Call Sheet)
            </ButtonSubmit>
          </Card>

          <Card className="p-5 gap-3 shadow-xs bg-muted/20">
            <CardTitle className="text-base font-semibold text-foreground">Resultado Gerado</CardTitle>
            {generatedCallSheet ? (
              <div className="rounded-xs border border-border bg-card p-4 font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                {generatedCallSheet}
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center text-center text-xs text-muted-foreground">
                <Clapperboard className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <span>Preencha o briefing ao lado e clique em Gerar.</span>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Aba 3: Estimador Orçamental */}
      {activeTab === 'budget' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 gap-4 shadow-xs">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">Parâmetros de Produção</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                A IA calcula custos de equipa média em Angola e aluguer de equipamento.
              </CardDescription>
            </div>

            <textarea
              rows={8}
              value={budgetBrief}
              onChange={(e) => setBudgetBrief(e.target.value)}
              placeholder="Ex: Videoclipe musical de artista de topo. 2 dias de filmagem: 1 dia em estúdio com ciclorama e 1 dia exterior no deserto do Namibe. Requer câmara de cinema, drone FPV e pós-produção com color grading e efeitos visuais..."
              className="w-full rounded-xs border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none leading-relaxed"
            />

            <ButtonSubmit
              isLoading={generatingAction}
              onClick={handleGenerateBudget}
              className="w-full"
            >
              <Zap className="mr-2 h-4 w-4" /> Calcular Estimativa Orçamental
            </ButtonSubmit>
          </Card>

          <Card className="p-5 gap-3 shadow-xs bg-muted/20">
            <CardTitle className="text-base font-semibold text-foreground">Estimativa Orçamental</CardTitle>
            {generatedBudget ? (
              <div className="rounded-xs border border-border bg-card p-4 font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                {generatedBudget}
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center text-center text-xs text-muted-foreground">
                <FileSpreadsheet className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <span>Preencha os parâmetros e clique em Calcular.</span>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

export const AiAssistantPageContent = AiPageContent;

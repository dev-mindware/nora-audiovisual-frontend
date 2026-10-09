'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  publicCatalogService,
  PublicCatalogResponse,
  PublicInquiryPayload,
} from '@/services/public-catalog-service';
import { CatalogService } from '@/types';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  DollarSign,
  Search,
  Building2,
  Mail,
  Phone,
  Send,
  Clapperboard,
  ShieldCheck,
  Film,
  Camera,
  Layers,
  Check,
  ChevronRight,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface PublicCatalogPageProps {
  orgSlug: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  ALL: 'Todos os Serviços',
  COMMERCIAL: 'Comercial & Ads',
  MUSIC_VIDEO: 'Videoclipes',
  CORPORATE: 'Corporativo',
  EVENT: 'Eventos & Cobertura',
  PODCAST: 'Podcasts & Videocasts',
  STUDIO_RENTAL: 'Aluguer de Estúdio',
  COLOR_GRADING: 'Color Grading & Pós',
  AUDIO_MASTERING: 'Áudio & Trilha Sonora',
  DRONE_FOOTAGE: 'Imagens Aéreas (Drone)',
  VIDEO_PRODUCTION: 'Produção Geral de Vídeo',
  PHOTOGRAPHY: 'Fotografia Profissional',
  POST_PRODUCTION: 'Pós-Produção & VFX',
  OTHER: 'Outros Serviços',
};

export function PublicCatalogPage({ orgSlug }: PublicCatalogPageProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [inquiryService, setInquiryService] = useState<CatalogService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulário de Solicitação
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: catalog, isLoading, error } = useQuery<PublicCatalogResponse>({
    queryKey: ['public-catalog', orgSlug],
    queryFn: () => publicCatalogService.getPublicCatalog(orgSlug),
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const services = catalog?.services || [];
  const organization = catalog?.organization;

  // Filtragem
  const filteredServices = useMemo(() => {
    let list = [...services];
    if (selectedCategory !== 'ALL') {
      list = list.filter((s) => s.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [services, selectedCategory, search]);

  const availableCategories = useMemo(() => {
    const cats = new Set(services.map((s) => s.category));
    return ['ALL', ...Array.from(cats)];
  }, [services]);

  const formatKz = (value: number) => {
    if (!value || value <= 0) return 'Sob Consulta';
    return `${Number(value).toLocaleString('pt-AO')} Kz`;
  };

  const handleOpenInquiry = (service?: CatalogService) => {
    setInquiryService(service || null);
    setIsModalOpen(true);
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim() || !projectDescription.trim()) {
      toast.error('Preencha os campos obrigatórios (Nome, E-mail e Descrição do Projeto).');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: PublicInquiryPayload = {
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim() || undefined,
        serviceId: inquiryService?.id,
        projectDescription: projectDescription.trim(),
        budgetRange: budgetRange.trim() || undefined,
      };

      await publicCatalogService.submitInquiry(orgSlug, payload);
      toast.success('Proposta solicitada com sucesso! A produtora entrará em contacto.');
      setIsModalOpen(false);
      // Reset form
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setProjectDescription('');
      setBudgetRange('');
      setInquiryService(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Falha ao enviar proposta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="space-y-3 text-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">Carregando catálogo oficial...</p>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-500 mb-3">
          <Clapperboard className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Catálogo Não Encontrado</h2>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Não foi possível localizar o catálogo da produtora solicitada. Verifique o link e tente novamente.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Banner & Header da Produtora */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-foreground tracking-tight">
                {organization.name}
              </span>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1">
                <ShieldCheck className="h-3 w-3" />
                Catálogo Oficial
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {organization.legalName || 'Portfólio comercial de pacotes e soluções audiovisuais'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => handleOpenInquiry()}
              size="sm"
              className="text-xs font-semibold gap-1.5 bg-primary text-primary-foreground rounded-xs h-9 px-4 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Solicitar Orçamento Geral
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-muted/30 to-background py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <Badge variant="outline" className="text-xs text-primary border-primary/20 bg-primary/5 px-3 py-1 rounded-full">
            Produção Cinematográfica • Publicidade • Estúdios
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Serviços &amp; Pacotes Oficiais de Produção
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Consulte a tabela oficial de serviços de {organization.name}. Equipas de ponta, captação 4K/8K, estúdios cyclorama e pós-produção completa para o seu projeto.
          </p>

          {/* Barra de Pesquisa */}
          <div className="pt-3 max-w-md mx-auto relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar por pacote, comercial, videoclipe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xs border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground shadow-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* Main Content: Filtros & Grid de Serviços */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Filtros em Pílulas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {availableCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium shrink-0 transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            );
          })}
        </div>

        {/* Contagem de Serviços */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-3">
          <span>{filteredServices.length} {filteredServices.length === 1 ? 'pacote disponível' : 'pacotes disponíveis'}</span>
          <span className="text-[11px]">Valores em Kwanzas (Kz) sujeitos a especificações do briefing</span>
        </div>

        {/* Grid de Cards de Serviços */}
        {filteredServices.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Film className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
            <h3 className="text-sm font-semibold text-foreground">Nenhum serviço encontrado</h3>
            <p className="text-xs text-muted-foreground">Tente limpar a pesquisa ou selecionar outra categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => {
              const deliverables = service.deliverablesIncluded || [];
              const benefits = service.benefits || [];

              return (
                <Card
                  key={service.id}
                  className="bg-card border-border shadow-none rounded-xs flex flex-col justify-between hover:border-border/80 transition-all group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <Badge variant="outline" className="text-[10px] font-medium border-border">
                        {CATEGORY_LABELS[service.category] || service.category}
                      </Badge>
                      {service.durationHours && (
                        <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {service.durationHours}h estimadas
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                      {service.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {service.description || 'Solução audiovisual personalizada sob medida para a sua marca.'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1 pb-4">
                    {/* Preço de Referência */}
                    <div className="p-3 rounded-xs border border-border/60 bg-muted/20">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                        Investimento Estimado
                      </span>
                      <div className="text-lg font-bold font-mono text-foreground mt-0.5">
                        {formatKz(service.price)}
                      </div>
                    </div>

                    {/* Entregáveis / Benefícios */}
                    {(deliverables.length > 0 || benefits.length > 0) && (
                      <div className="space-y-1.5 text-xs">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                          O que está incluído:
                        </span>
                        <ul className="space-y-1 text-muted-foreground">
                          {deliverables.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="text-foreground">{item}</span>
                            </li>
                          ))}
                          {benefits.slice(0, 2).map((item, idx) => (
                            <li key={`b-${idx}`} className="flex items-start gap-1.5 text-[11px]">
                              <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Button
                      onClick={() => handleOpenInquiry(service)}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold justify-between border-border rounded-xs h-9 hover:bg-primary hover:text-primary-foreground group-hover:border-primary/50 transition-all"
                    >
                      <span>Solicitar Este Pacote</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de Solicitação de Proposta / Orçamento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg w-full bg-card border-border rounded-xs p-6 text-foreground">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base font-semibold tracking-tight">
              {inquiryService ? `Solicitar Proposta: ${inquiryService.name}` : 'Solicitar Orçamento Geral'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Envie os detalhes do seu projeto para a equipa da {organization.name}. Responderemos com uma proposta comercial detalhada.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitInquiry} className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Seu Nome / Empresa *</label>
              <Input
                required
                placeholder="Ex: João da Silva / Agência XYZ"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="h-9 text-xs rounded-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">E-mail para Contato *</label>
                <Input
                  required
                  type="email"
                  placeholder="seuemail@empresa.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="h-9 text-xs rounded-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Telefone / WhatsApp</label>
                <Input
                  placeholder="+244 923 000 000"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="h-9 text-xs rounded-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Expectativa Orçamentária (Opcional)</label>
              <Input
                placeholder="Ex: Até 5.000.000 Kz ou Sob Consulta"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="h-9 text-xs rounded-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Descrição do Projeto &amp; Briefing *</label>
              <textarea
                required
                rows={3}
                placeholder="Descreva o objetivo do vídeo, datas previstas de rodagem, locações ou necessidades específicas..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xs border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-xs rounded-xs h-9 border-border"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
                className="text-xs gap-1.5 bg-primary text-primary-foreground rounded-xs h-9 font-semibold"
              >
                <Send className="h-3.5 w-3.5" />
                {isSubmitting ? 'Enviando...' : 'Enviar Pedido de Proposta'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40 py-6 px-4 text-center text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            © {new Date().getFullYear()} {organization.name}. Todos os direitos reservados.
          </span>
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Powered by Nora Audiovisual Management Platform
          </span>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { usePortalServices } from '@/hooks/services';
import { CatalogService, CatalogServiceCategory } from '@/types';
import { PortalServiceRequestModal } from './portal-service-request-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Search,
  Camera,
  Music,
  Video,
  Building2,
  Mic,
  Palette,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';

const CATEGORY_META: Record<
  CatalogServiceCategory | string,
  { label: string; icon: typeof Video }
> = {
  COMMERCIAL: { label: 'Comercial & Ads', icon: Video },
  MUSIC_VIDEO: { label: 'Videoclipe', icon: Music },
  CORPORATE: { label: 'Corporativo & Empresa', icon: Briefcase },
  EVENT: { label: 'Cobertura de Eventos', icon: Camera },
  PODCAST: { label: 'Podcast & Videocast', icon: Mic },
  STUDIO_RENTAL: { label: 'Aluguer de Estúdio', icon: Building2 },
  COLOR_GRADING: { label: 'Color Grading', icon: Palette },
  AUDIO_MASTERING: { label: 'Áudio & Masterização', icon: Radio },
  DRONE_FOOTAGE: { label: 'Captação Drone Aérea', icon: SlidersHorizontal },
  OTHER: { label: 'Pacote Especial', icon: Sparkles },
};

export function PortalServicesContent() {
  const { data: services = [], isLoading } = usePortalServices();

  const [selectedServiceForRequest, setSelectedServiceForRequest] =
    useState<CatalogService | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const handleOpenRequest = (service: CatalogService) => {
    setSelectedServiceForRequest(service);
    setIsRequestModalOpen(true);
  };

  const categories = useMemo(() => {
    const list = new Set<string>();
    services.forEach((s) => list.add(s.category));
    return ['ALL', ...Array.from(list)];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchCat =
        activeCategory === 'ALL' || s.category === activeCategory;
      const matchSearch =
        search === '' ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase()) ||
        s.benefits?.some((b) => b.toLowerCase().includes(search.toLowerCase())) ||
        s.deliverablesIncluded?.some((d) =>
          d.toLowerCase().includes(search.toLowerCase()),
        );
      return matchCat && matchSearch;
    });
  }, [services, activeCategory, search]);

  return (
    <div className="space-y-8 pb-12">
      {/* Banner de Apresentação / Hero Audiovisual */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6 sm:p-8">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary border border-primary/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Produção Audiovisual de Alta Performance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Catálogo Oficial de Serviços & Pacotes
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Escolha o pacote perfeito para a sua marca ou projeto artístico. Ao solicitar
            um serviço, uma proposta comercial com orçamento detalhado é gerada
            automaticamente e a nossa equipa inicia o alinhamento de datas de filmagem.
          </p>
        </div>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filtros por Categoria em formato de Tags / Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat;
            const meta = CATEGORY_META[cat];
            const label = cat === 'ALL' ? 'Todos os Pacotes' : meta?.label || cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Input de Busca */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar por pacote ou entregável..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs rounded-full border border-input bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
          />
        </div>
      </div>

      {/* Grid de Serviços */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 rounded-2xl border bg-card/50 animate-pulse"
            />
          ))}
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const meta = CATEGORY_META[service.category] || CATEGORY_META.OTHER;
            const Icon = meta.icon;

            return (
              <div
                key={service.id}
                className="group relative flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-xs hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div>
                  {/* Topo do Card: Categoria e Ícone */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                      <Icon className="h-3 w-3" />
                      {meta.label}
                    </span>
                    {service.durationHours ? (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                        <Clock className="h-3.5 w-3.5" />
                        ~{service.durationHours}h
                      </span>
                    ) : null}
                  </div>

                  {/* Nome do Serviço */}
                  <h3 className="mt-4 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>

                  {/* Descrição */}
                  {service.description && (
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {service.description}
                    </p>
                  )}

                  {/* Preço de Referência */}
                  <div className="mt-5 p-3 rounded-xl bg-muted/40 border border-border/50">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block tracking-wider">
                      Valor de Referência
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-black text-foreground tracking-tight">
                        {Number(service.price).toLocaleString('pt-AO')}
                      </span>
                      <span className="text-xs font-semibold text-primary">
                        {service.currency || 'AOA'}
                      </span>
                    </div>
                  </div>

                  {/* Entregáveis Inclusos */}
                  {service.deliverablesIncluded &&
                    service.deliverablesIncluded.length > 0 && (
                      <div className="mt-5 space-y-2 border-t pt-4">
                        <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          Entregáveis Inclusos
                        </span>
                        <ul className="space-y-1.5">
                          {service.deliverablesIncluded.map((deliv, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-foreground/90 flex items-start gap-2"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              <span>{deliv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Benefícios Técnicos */}
                  {service.benefits && service.benefits.length > 0 && (
                    <div className="mt-4 space-y-2 border-t pt-3">
                      <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        Vantagens & Equipamento
                      </span>
                      <ul className="space-y-1.5">
                        {service.benefits.map((ben, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-muted-foreground flex items-start gap-2"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span>{ben}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Botão de Solicitação no Rodapé */}
                <div className="mt-6 border-t pt-4">
                  <Button
                    onClick={() => handleOpenRequest(service)}
                    className="w-full gap-2 font-semibold shadow-xs group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    <span>Solicitar este Pacote</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h4 className="text-base font-semibold text-foreground">
            Nenhum pacote encontrado para os filtros selecionados
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Tente buscar com outros termos ou altere a categoria ativa.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveCategory('ALL');
              setSearch('');
            }}
            className="mt-4"
          >
            Limpar Filtros
          </Button>
        </div>
      )}

      {/* Banner Rodapé para Projetos Sob Medida */}
      <div className="rounded-2xl border bg-muted/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Precisa de um projeto ou campanha 100% personalizada?
          </h4>
          <p className="text-xs text-muted-foreground">
            A nossa equipa elabora orçamentos customizados para produções internacionais, longas-metragens ou campanhas 360°.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            if (services.length > 0) {
              handleOpenRequest(services[0]);
            }
          }}
          className="shrink-0"
        >
          Pedir Orçamento Especial
        </Button>
      </div>

      {/* Modal de Solicitação */}
      <PortalServiceRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        service={selectedServiceForRequest}
      />
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { LegalLayout, LegalSectionItem } from "@/components/legal/legal-layout";
import {
  Scale,
  Film,
  ShieldCheck,
  CreditCard,
  Zap,
  Sparkles,
  Server,
  FileCheck,
  AlertTriangle,
  Clock,
  ExternalLink,
} from "lucide-react";

const SECTIONS: LegalSectionItem[] = [
  { id: "preambulo", title: "Preâmbulo e Aceitação Electrónica", number: "1" },
  { id: "identificacao", title: "Entidade Operadora e Foro Territorial", number: "2" },
  { id: "contas-seguranca", title: "Contas de Utilizador e Credenciais", number: "3" },
  { id: "propriedade-audiovisual", title: "Propriedade Intelectual e Regime Audiovisual (Lei 15/14)", number: "4" },
  { id: "nora-automate-ai", title: "Módulos Nora Automate e Nora AI", number: "5" },
  { id: "estudios-producao", title: "Estúdios, Equipamentos e Folhas de Chamada", number: "6" },
  { id: "faturacao-agt", title: "Facturação Fiscal Certificada AGT (Mindgest)", number: "7" },
  { id: "sla-disponibilidade", title: "Níveis de Serviço (SLA) e Manutenção", number: "8" },
  { id: "responsabilidade", title: "Limitação de Responsabilidade e Força Maior", number: "9" },
  { id: "rescisao-foro", title: "Cessação, Carência de Acervo e Jurisdição", number: "10" },
];

export default function TermsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return SECTIONS;
    const term = searchTerm.toLowerCase();
    return SECTIONS.filter(
      (sec) =>
        sec.title.toLowerCase().includes(term) ||
        sec.number?.includes(term)
    );
  }, [searchTerm]);

  return (
    <LegalLayout
      documentType="TERMS"
      title="Termos Gerais de Utilização e Contrato de Prestação de Serviços SaaS"
      subtitle="Regulamento contratual aplicável à plataforma de gestão audiovisual, estúdios, inventário técnico, entregáveis e facturação electrónica certificada pela AGT, em estrita conformidade com o ordenamento jurídico da República de Angola."
      version="2.4 / AO"
      effectiveDate="09 de Outubro de 2026"
      sections={filteredSections}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      {/* 1. Preâmbulo e Aceitação Electrónica */}
      <section id="preambulo" className="space-y-4 pt-2 border-t border-border/40 first:border-t-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 1.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Preâmbulo, Objeto e Aceitação Contratual Electrónica
          </h2>
        </div>

        <p>
          1.1. O presente Contrato de Prestação de Serviços em regime de <em>Software as a Service</em> (doravante designado por <strong>"Contrato"</strong> ou <strong>"Termos de Utilização"</strong>) regula o acesso e utilização da plataforma tecnológica integrada <strong>Nora Audiovisual</strong> (acessível através do domínio <code>nora.ao</code> e subdomínios associados), propriedade da <strong>Nora Audiovisual & Tecnologias Lda</strong>.
        </p>

        <p>
          1.2. A celebração do presente contrato realiza-se por via puramente electrónica, ao abrigo do artigo 18.º e seguintes da <strong>Lei n.º 23/11, de 20 de Junho (Lei das Comunicações Electrónicas e dos Serviços da Sociedade da Informação)</strong>. A submissão do formulário de registo mediante a aposição de visto na caixa de verificação (<em>checkbox</em>) de aceitação constitui declaração expressa, inequívoca e vinculativa de concordância com todas as cláusulas aqui estipuladas.
        </p>

        <p>
          1.3. A plataforma destina-se primordialmente a produtoras audiovisuais, estúdios de cinema, realizadores, fotógrafos profissionais, agências de publicidade e clientes finais que operem no mercado angolano ou em cooperação com produções cinematográficas realizadas no território da República de Angola.
        </p>

        <div className="p-4 border border-border/80 bg-muted/20 rounded-none space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
            <Scale className="h-4 w-4 text-primary" />
            <span>Validade Probatória no Direito Angolano:</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Nos termos do Código Civil Angolano e da Lei n.º 23/11, os registos informáticos, <em>logs</em> criptográficos e comprovativos de autenticação gerados pelo sistema constituem meio idóneo de prova da celebração contratual e da manifestação de consentimento do titular.
          </p>
        </div>
      </section>

      {/* 2. Entidade Operadora e Foro Territorial */}
      <section id="identificacao" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 2.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Identificação da Entidade Operadora e Foro Territorial
          </h2>
        </div>

        <p>
          2.1. A plataforma é gerida e mantida pela sociedade comercial de direito angolano <strong>Nora Audiovisual & Tecnologias Lda</strong>, registada na Conservatória do Registo Comercial de Luanda sob a matrícula n.º 18294/2024, titular do Número de Identificação Fiscal (NIF) <strong>5418932014</strong>, com sede social em Talatona, Província de Luanda, República de Angola.
        </p>

        <p>
          2.2. Quaisquer comunicações oficiais, notificações judiciais ou pedidos de esclarecimento contratuais devem ser remetidos por escrito para a sede estatutária da empresa ou endereçados ao correio electrónico institucional <a href="mailto:juridico@nora.ao" className="text-primary font-semibold hover:underline">juridico@nora.ao</a>.
        </p>
      </section>

      {/* 3. Contas de Utilizador e Credenciais */}
      <section id="contas-seguranca" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 3.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Contas de Utilizador, Acesso Multi-Tenant e Segurança
          </h2>
        </div>

        <p>
          3.1. Cada organização contratante é isolada num ambiente multi-tenant lógico segregado através de identificador global único (UUID), garantindo que os seus projectos, orçamentos, convocatórias e activos digitais são completamente inacessíveis a outras entidades na infra-estrutura.
        </p>

        <p>
          3.2. O utilizador com estatuto de Proprietário (<em>Owner</em>) é o exclusivo responsável pela gestão das permissões atribuídas a membros da sua equipa (Produtores, Diretores de Fotografia, Técnicos de Som e Contabilistas).
        </p>

        <p>
          3.3. As palavras-passe de acesso são cifradas através do algoritmo computacional de derivação <strong>Argon2id</strong>. É obrigação indelegável do utilizador manter a confidencialidade das suas credenciais. A detecção de tentativas sistemáticas de intrusão, partilha abusiva de acessos fora da org ou ataques de força bruta confere à Nora a faculdade de suspender preventivamente a conta associada ao incidente.
        </p>
      </section>

      {/* 4. Propriedade Intelectual e Regime Especial do Audiovisual */}
      <section id="propriedade-audiovisual" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 4.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Propriedade Intelectual e Regime Especial da Obra Audiovisual (Lei n.º 15/14)
          </h2>
        </div>

        <p>
          4.1. Nos termos expressos do <strong>artigo 50.º da Lei n.º 15/14, de 31 de Julho (Lei dos Direitos de Autor e Conexos de Angola)</strong>, a titularidade dos direitos morais e patrimoniais sobre as obras audiovisuais, planos de filmagem, guiões e captações sonoras pertence originariamente aos seus coautores, presumindo-se a cessão dos direitos de exploração patrimonial ao <strong>Produtor Audiovisual</strong> mediante contrato de produção.
        </p>

        <p>
          4.2. <strong>Inexistência de Cessão à Nora:</strong> A disponibilização, carregamento (<em>upload</em>) ou transcodificação de ficheiros na plataforma Nora Audiovisual não transfere, a qualquer título, a titularidade de direitos de autor, marcas, patentes ou segredos de negócio da produtora ou do cliente final para a Nora.
        </p>

        <p>
          4.3. <strong>Licença Operacional Estrita:</strong> A produtora concede à Nora apenas uma licença limitada, não exclusiva e revogável com a cessação da subscrição, estritamente necessária para:
        </p>

        <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
          <li>Armazenar cópias de trabalho e arquivos brutos (RAW, ProRes, BRAW, DNG);</li>
          <li>Gerar <em>proxies</em> de visualização, miniaturas e fluxos adaptativos de <em>streaming</em> HLS;</li>
          <li>Aplicar marcas d'água provisórias em galerias fotográficas e copiões para pré-visualização de clientes;</li>
          <li>Processar metadados de timecode, registos de claquete e comentários de revisão sincronizados.</li>
        </ul>

        {/* Tabela de Titularidade */}
        <div className="border border-border/80 overflow-hidden rounded-none mt-3">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-b border-border/80 text-foreground font-semibold">
              <tr>
                <th className="p-3">Categoria de Ficheiro / Activo</th>
                <th className="p-3">Titular dos Direitos</th>
                <th className="p-3">Âmbito de Intervenção Nora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="p-3 font-medium text-foreground">Ficheiros Brutos (RAW) & Masters 4K/8K</td>
                <td className="p-3">Produtora / Estúdio Contratante</td>
                <td className="p-3">Custódia digital cifrada e entrega sem compressão</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Galerias Fotográficas & Copiões</td>
                <td className="p-3">Fotógrafo / Produtor / Cliente</td>
                <td className="p-3">Exibição com marca d'água até aprovação formal</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Folhas de Convocatória (Call Sheets)</td>
                <td className="p-3">Direcção de Produção</td>
                <td className="p-3">Despacho seguro para elenco e equipa técnica</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Facturas & Documentos Fiscais</td>
                <td className="p-3">Produtora & AGT (República de Angola)</td>
                <td className="p-3">Transmissão e certificação via Mindgest Fiscal</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Módulos Nora Automate e Nora AI */}
      <section id="nora-automate-ai" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 5.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Módulos Especiais: Nora Automate e Nora AI
          </h2>
        </div>

        <p>
          5.1. <strong>Nora Automate:</strong> O módulo de automação de processos permite à organização configurar gatilhos (<em>triggers</em>), acções automáticas e chamadas a <em>webhooks</em> externos. A produtora é integralmente responsável pela veracidade dos endereços de destino configurados e pelos dados despachados para sistemas terceiros.
        </p>

        <p>
          5.2. <strong>Compromisso Ético Nora AI:</strong> O módulo de Inteligência Artificial fornece previsões orçamentais, recomendações de elenco e análises pós-produção. A Nora assegura perante a lei que <strong>nenhum vídeo, imagem, guião ou dado confidencial da produtora é partilhado com terceiros ou utilizado para treino público de modelos fundacionais de IA generativa</strong>. O processamento ocorre em ambientes isolados com descarte imediato de tensores temporários após inferência.
        </p>
      </section>

      {/* 6. Estúdios, Equipamentos e Folhas de Chamada */}
      <section id="estudios-producao" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 6.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Gestão de Estúdios, Inventário Técnico e Folhas de Chamada (Call Sheets)
          </h2>
        </div>

        <p>
          6.1. O sistema de reserva de estúdios e recursos técnicos previne colisões de agendamento (<em>double booking</em>) através de bloqueios atómicos na base de dados. As confirmações emitidas pela plataforma constituem título probatório entre os membros da organização.
        </p>

        <p>
          6.2. A emissão de Convocatórias de Rodagem (<em>Call Sheets</em>) acarreta o processamento de contactos profissionais e dados de escala horária de membros da equipa técnica e actores. A produtora declara deter a legitimidade jurídica para inserir tais dados em conformidade com as regras laborais e contratuais angolanas.
        </p>
      </section>

      {/* 7. Facturação Fiscal Certificada AGT (Mindgest) */}
      <section id="faturacao-agt" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 7.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Regime Financeiro, Subscrições e Facturação Fiscal Certificada pela AGT
          </h2>
        </div>

        <p>
          7.1. Todos os preços dos planos da plataforma são cotados em <strong>Kwanzas (AOA)</strong>, acrescidos do Imposto sobre o Valor Acrescentado (IVA) à taxa legal de 14%, quando aplicável, em estrito cumprimento da <strong>Lei n.º 7/19, de 24 de Abril (Código do IVA de Angola)</strong>.
        </p>

        <p>
          7.2. A emissão de Facturas-Recibo (FR) e Facturas Pró-Forma (FP) é processada directamente através do conector <strong>Mindgest Fiscal</strong>, homologado e certificado pela Administração Geral Tributária (AGT) ao abrigo do <strong>Certificado AGT n.º 344/AGT/2026</strong> e do <strong>Decreto Presidencial n.º 292/18</strong> (Regime Jurídico das Facturas e Documentos Equivalentes).
        </p>

        <p>
          7.3. <strong>Período de Avaliação (Trial):</strong> O acesso ao pacote inicial gratuito por 7 (sete) dias não exige cartão de crédito nem pagamento imediato. Decorrido o período sem contratação de plano pago, o workspace da organização transita automaticamente para o modo <strong>Somente Leitura (Read-Only)</strong>, garantindo que o acervo histórico, contactos e dados já inseridos permanecem salvaguardados para consulta e exportação.
        </p>
      </section>

      {/* 8. Níveis de Serviço (SLA) e Manutenção */}
      <section id="sla-disponibilidade" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 8.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Níveis de Serviço (SLA), Disponibilidade e Salvaguarda de Dados
          </h2>
        </div>

        <p>
          8.1. A Nora compromete-se a envidar todos os esforços técnicos para assegurar uma taxa média mensal de disponibilidade do serviço de <strong>99,5%</strong> (noventa e nove vírgula cinco por cento), excluindo janelas programadas de manutenção.
        </p>

        <p>
          8.2. As manutenções de infra-estrutura que impliquem interrupção temporária de serviços serão comunicadas com aviso prévio mínimo de 48 (quarenta e oito) horas aos administradores da produtora, sendo executadas preferencialmente durante períodos de menor tráfego operacional (entre as 23:00 e as 05:00, horário de Luanda).
        </p>

        <p>
          8.3. Cópias de segurança (<em>backups</em>) dos metadados de projectos e ficheiros de configuração são executadas diariamente com replicação redundante geograficamente distribuída.
        </p>
      </section>

      {/* 9. Limitação de Responsabilidade e Força Maior */}
      <section id="responsabilidade" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 9.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Limitação de Responsabilidade e Força Maior
          </h2>
        </div>

        <p>
          9.1. Nenhuma das partes será responsável pelo incumprimento das suas obrigações quando este decorra de motivo de <strong>Força Maior ou Caso Fortuito</strong>, nos termos do artigo 790.º do Código Civil Angolano, incluindo expressamente:
        </p>

        <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
          <li>Cortes prolongados ou oscilações graves no fornecimento de energia da rede pública (ENDE);</li>
          <li>Rupturas ou cortes acidentais em cabos submarinos de fibra óptica internacionais que liguem Angola (WACS, SACS, SAT-3, Monet);</li>
          <li>Calmarias meteorológicas extremas, conflitos armados, catástrofes naturais ou restrições legais decretadas pelo Executivo angolano.</li>
        </ul>

        <p>
          9.2. A responsabilidade patrimonial global da Nora perante a organização contratante, decorrente de qualquer falha na prestação do serviço comprovada judicialmente, fica expressamente limitada ao valor efectivamente pago pela produtora à Nora nos últimos 12 (doze) meses de subscrição do serviço.
        </p>
      </section>

      {/* 10. Cessação, Carência de Acervo e Jurisdição */}
      <section id="rescisao-foro" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 10.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Cessação Contratual, Período de Carência do Acervo e Foro Competente
          </h2>
        </div>

        <p>
          10.1. A subscrição pode ser rescindida a qualquer momento pelo Proprietário através do painel de administração da organização, mantendo-se os serviços activos até ao termo do período de facturação em curso.
        </p>

        <p>
          10.2. <strong>Período de Carência para Descarregamento de Mídia:</strong> Em caso de cessação do serviço ou não renovação de plano, a Nora concede à produtora um período de carência de <strong>30 (trinta) dias consecutivos</strong> em modo somente leitura, durante o qual a produtora pode descarregar todos os seus ficheiros brutos (RAW), entregáveis e históricos orçamentais. Decorrido este prazo, e sem regularização contratual, os ficheiros de mídia pesada poderão ser purgados da infra-estrutura para libertação de recursos.
        </p>

        <p>
          10.3. <strong>Foro da Comarca de Luanda:</strong> Para a resolução de qualquer litígio emergente da interpretação, validade, execução ou cessação do presente Contrato que não seja resolvido amigavelmente no prazo de 30 dias, é competente com exclusão de qualquer outro o <strong>Tribunal da Comarca de Luanda</strong>, com renúncia expressa a qualquer outro foro de outra jurisdição nacional ou estrangeira.
        </p>

        <p>
          10.4. O presente contrato rege-se em todas as suas vertentes pela legislação vigente na <strong>República de Angola</strong>.
        </p>
      </section>
    </LegalLayout>
  );
}

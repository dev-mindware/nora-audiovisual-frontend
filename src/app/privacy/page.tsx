"use client";

import React, { useState, useMemo } from "react";
import { LegalLayout, LegalSectionItem } from "@/components/legal/legal-layout";
import {
  Shield,
  Lock,
  UserCheck,
  Building,
  KeyRound,
  FileCheck,
  Database,
  ExternalLink,
  Eye,
  FileSpreadsheet,
} from "lucide-react";

const SECTIONS: LegalSectionItem[] = [
  { id: "responsavel-apd", title: "Responsável pelo Tratamento e Tutela da APD", number: "1" },
  { id: "principios-legais", title: "Princípios Fundamentais do Tratamento (Lei 22/11)", number: "2" },
  { id: "categorias-dados", title: "Categorias de Dados Pessoais Tratados", number: "3" },
  { id: "dados-audiovisuais", title: "Tratamento Especial de Imagem, Som e Folhas de Chamada", number: "4" },
  { id: "finalidades-licitude", title: "Finalidades e Fundamentos Jurídicos de Licitude", number: "5" },
  { id: "direitos-titulares", title: "Direitos dos Titulares e Prazo Legal de 60 Dias", number: "6" },
  { id: "seguranca-ciberseguranca", title: "Segurança da Informação e Lei de Cibersegurança (Lei 9/26)", number: "7" },
  { id: "transferencia-internacional", title: "Transferência Internacional de Dados (Art. 33.º LPDP)", number: "8" },
  { id: "prazos-retencao", title: "Prazos de Conservação e Retenção Fiscal (AGT)", number: "9" },
  { id: "cookies-canal-dpo", title: "Cookies Essenciais e Exercício de Direitos", number: "10" },
];

export default function PrivacyPage() {
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
      documentType="PRIVACY"
      title="Política de Privacidade e Protecção de Dados Pessoais"
      subtitle="Regulamento institucional para tratamento de dados pessoais, salvaguarda de privacidade de equipas e elenco, criptografia de acervos e cumprimento integral da Lei n.º 22/11 perante a Agência de Protecção de Dados (APD) da República de Angola."
      version="2.4 / AO"
      effectiveDate="09 de Outubro de 2026"
      sections={filteredSections}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      {/* 1. Responsável pelo Tratamento e APD */}
      <section id="responsavel-apd" className="space-y-4 pt-2 border-t border-border/40 first:border-t-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 1.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Responsável pelo Tratamento e Autoridade Nacional de Tutela (APD)
          </h2>
        </div>

        <p>
          1.1. A presente Política de Privacidade regula o tratamento de dados pessoais levado a cabo pela <strong>Nora Audiovisual & Tecnologias Lda</strong> (doravante designada por <strong>"Nora"</strong> ou <strong>"Responsável pelo Tratamento"</strong>), sociedade comercial com sede em Talatona, Província de Luanda, titular do NIF <strong>5418932014</strong>.
        </p>

        <p>
          1.2. Todas as actividades de tratamento de dados pessoais na plataforma processam-se em estrita obediência à <strong>Lei n.º 22/11, de 17 de Junho (Lei da Protecção de Dados Pessoais - LPDP da República de Angola)</strong>, sob a supervisão regulatória da <strong>Agência de Protecção de Dados (APD)</strong>, autoridade administrativa independente criada pelo Decreto Presidencial n.º 214/16 e reforçada pelo Decreto Presidencial n.º 202/21.
        </p>

        <p>
          1.3. A Nora nomeou um Encarregado de Protecção de Dados (DPO) com representação permanente em Luanda, acessível directamente através do correio electrónico <a href="mailto:dpo@nora.ao" className="text-primary font-semibold hover:underline">dpo@nora.ao</a>.
        </p>

        <div className="p-4 border border-border/80 bg-muted/20 rounded-none space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
            <Shield className="h-4 w-4 text-primary" />
            <span>Autoridade Reguladora Nacional — APD Angola:</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Caso o titular considere que o tratamento dos seus dados viola as disposições da Lei n.º 22/11, tem o direito legítimo de apresentar queixa ou reclamação junto da <strong>Agência de Protecção de Dados (APD)</strong>, com instalações físicas em Luanda e canal telemático em <a href="https://apd.ao" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">www.apd.ao</a>.
          </p>
        </div>
      </section>

      {/* 2. Princípios Fundamentais da Lei 22/11 */}
      <section id="principios-legais" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 2.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Princípios Fundamentais do Tratamento de Dados (Artigos 9.º a 13.º da LPDP)
          </h2>
        </div>

        <p>
          Em cumprimento escrupuloso dos artigos 9.º a 13.º da Lei n.º 22/11, a Nora pauta todas as suas rotinas de engenharia de software pelos seguintes princípios basilares:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 border border-border/80 bg-card rounded-none space-y-1">
            <span className="font-semibold text-foreground block">a) Princípio da Licitude e Boa-Fé (Art. 9.º)</span>
            <p className="text-muted-foreground">O tratamento de dados é realizado unicamente com base em fundamentos legais transparentes e para fins legítimos de produção audiovisual.</p>
          </div>
          <div className="p-3 border border-border/80 bg-card rounded-none space-y-1">
            <span className="font-semibold text-foreground block">b) Princípio da Finalidade Determinada (Art. 10.º)</span>
            <p className="text-muted-foreground">Os dados recolhidos para folhas de chamada, estúdios ou facturação não são reutilizados para fins incompatíveis sem novo consentimento.</p>
          </div>
          <div className="p-3 border border-border/80 bg-card rounded-none space-y-1">
            <span className="font-semibold text-foreground block">c) Princípio da Proporcionalidade (Art. 11.º)</span>
            <p className="text-muted-foreground">Recolhem-se exclusivamente os dados adequados, pertinentes e não excessivos para a operacionalização dos projectos.</p>
          </div>
          <div className="p-3 border border-border/80 bg-card rounded-none space-y-1">
            <span className="font-semibold text-foreground block">d) Princípio da Exactidão (Art. 12.º)</span>
            <p className="text-muted-foreground">Garante-se a disponibilização de ferramentas para que os utilizadores possam manter os seus dados actualizados e corrigir lapsos.</p>
          </div>
        </div>
      </section>

      {/* 3. Categorias de Dados Tratados */}
      <section id="categorias-dados" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 3.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Categorias de Dados Pessoais Recolhidos e Tratados
          </h2>
        </div>

        <p>
          3.1. A Nora recolhe e armazena os seguintes conjuntos de dados consoante a interacção com a plataforma:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs text-muted-foreground">
          <li><strong>Dados de Registo e Conta de Titular:</strong> Nome completo, endereço de correio electrónico profissional, palavra-passe cifrada por <em>hash</em> irreversível (Argon2id), número de telefone móvel e registo de autenticação multifactor (MFA).</li>
          <li><strong>Dados de Identificação Fiscal da Produtora:</strong> Razão social, nome comercial, Número de Identificação Fiscal (NIF angolano), enquadramento no regime de IVA da AGT, domicílio fiscal e certidão comercial de Luanda.</li>
          <li><strong>Dados Financeiros e de Pagamento:</strong> Coordenadas bancárias (IBAN de contas sediadas em Angola - BFA, BAI, BCI, etc.), talões de transferência bancária em Kwanzas (AOA) e comprovativos de pagamento submetidos para subscrição.</li>
          <li><strong>Dados de Telemetria e Logs Técnicos:</strong> Endereço IP do dispositivo de acesso, identificador de sessão, <em>User-Agent</em> do navegador, carimbos temporais de auditoria e registos imutáveis de acções executadas na organização.</li>
        </ul>
      </section>

      {/* 4. Tratamento Especial de Imagem, Som e Folhas de Chamada */}
      <section id="dados-audiovisuais" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 4.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Tratamento Especial de Imagem, Som e Convocatórias de Rodagem (Call Sheets)
          </h2>
        </div>

        <p>
          4.1. <strong>Distinção de Papéis:</strong> No que concerne ao material audiovisual carregado (vídeos brutos RAW, fotografias, vozes gravadas de elenco) e às Convocatórias de Rodagem (<em>Call Sheets</em>):
        </p>

        <div className="p-4 border border-border/80 bg-card rounded-none space-y-2 text-xs">
          <p>
            • A <strong>Produtora / Estúdio Contratante</strong> actua como <strong>Responsável Primário pelo Tratamento</strong> dos dados pessoais dos seus profissionais, actores, figurantes e clientes finais, incumbindo-lhe recolher os consentimentos de imagem e som exigíveis por lei.
          </p>
          <p>
            • A <strong>Nora Audiovisual & Tecnologias Lda</strong> actua na qualidade estrita de <strong>Subcontratante (Operador de Infra-estrutura)</strong>, processando o material unicamente sob instrução documentada da produtora e para efeitos de hospedagem, transcodificação e distribuição controlada no Portal do Cliente.
          </p>
        </div>

        <p>
          4.2. Os dados de folhas de chamada (nomes de técnicos, funções, escalas horárias e locais de filmagem em Angola) são confidenciais e protegidos por isolamento de <em>tenant</em>, sendo vedado o seu cruzamento com outras entidades.
        </p>
      </section>

      {/* 5. Finalidades e Fundamentos Jurídicos de Licitude */}
      <section id="finalidades-licitude" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 5.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Finalidades do Tratamento e Fundamentos Jurídicos de Licitude (Art. 14.º da LPDP)
          </h2>
        </div>

        <p>
          O tratamento de dados fundamenta-se nas seguintes bases legais reconhecidas pelo artigo 14.º da Lei n.º 22/11:
        </p>

        <div className="space-y-2 text-xs">
          <div className="p-3 border border-border/80 bg-muted/20 rounded-none flex items-start gap-3">
            <span className="font-semibold text-foreground shrink-0 w-36">Execução Contratual:</span>
            <span className="text-muted-foreground">Disponibilização do workspace, gestão de rodagens, criação de catálogos e aprovação de galerias multimédia com timecode.</span>
          </div>
          <div className="p-3 border border-border/80 bg-muted/20 rounded-none flex items-start gap-3">
            <span className="font-semibold text-foreground shrink-0 w-36">Obrigação Legal & AGT:</span>
            <span className="text-muted-foreground">Emissão de Facturas-Recibo certificadas pela AGT (Mindgest Fiscal) e manutenção de ficheiros SAF-T de facturação por 5 anos fiscais.</span>
          </div>
          <div className="p-3 border border-border/80 bg-muted/20 rounded-none flex items-start gap-3">
            <span className="font-semibold text-foreground shrink-0 w-36">Interesse Legítimo:</span>
            <span className="text-muted-foreground">Prevenção contra ciberataques, bloqueio de intrusões e garantia da estabilidade dos servidores em Luanda.</span>
          </div>
          <div className="p-3 border border-border/80 bg-muted/20 rounded-none flex items-start gap-3">
            <span className="font-semibold text-foreground shrink-0 w-36">Consentimento:</span>
            <span className="text-muted-foreground">Aceitação voluntária manifestada no acto de registo para recepção de notificações transaccionais e comunicados de serviço.</span>
          </div>
        </div>
      </section>

      {/* 6. Direitos dos Titulares e Prazo Legal de 60 Dias */}
      <section id="direitos-titulares" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 6.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Direitos dos Titulares e Prazo Legal de Resposta de 60 Dias Úteis
          </h2>
        </div>

        <p>
          Em conformidade com os <strong>artigos 24.º a 29.º da Lei n.º 22/11</strong>, assistem ao titular dos dados os seguintes direitos intransmissíveis:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs text-muted-foreground">
          <li><strong>Direito de Informação (Art. 24.º):</strong> Saber que categorias de dados estão a ser tratadas, quem é o responsável e para que fins concretos.</li>
          <li><strong>Direito de Acesso (Art. 25.º):</strong> Obter a confirmação do tratamento e cópia inteligível dos seus dados registados na plataforma.</li>
          <li><strong>Direito de Rectificação e Actualização (Art. 26.º):</strong> Exigir a correcção imediata de dados incorrectos, imprecisos ou incompletos.</li>
          <li><strong>Direito de Eliminação e Cancelamento (Art. 27.º):</strong> Solicitar o apagamento de dados cujo tratamento seja ilícito ou já não se mostre necessário para os fins da subscrição.</li>
          <li><strong>Direito de Oposição (Art. 28.º):</strong> Opor-se a que os seus dados sejam tratados para finalidades acessórias com base em razões ponderosas.</li>
        </ul>

        <div className="p-4 border border-primary/30 bg-primary/5 rounded-none space-y-2 text-xs">
          <span className="font-semibold text-foreground block">
            Prazo Legal de Resposta — Artigo 26.º da LPDP Angolana:
          </span>
          <p className="text-muted-foreground leading-relaxed">
            O responsável pelo tratamento tem a obrigação legal estrita de assegurar a apreciação e resposta aos pedidos de rectificação, actualização ou eliminação no prazo máximo de <strong>sessenta (60) dias úteis</strong> a contar da data de recepção formal do requerimento instruído com comprovação de identidade do titular.
          </p>
        </div>
      </section>

      {/* 7. Segurança da Informação e Lei de Cibersegurança (Lei 9/26) */}
      <section id="seguranca-ciberseguranca" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 7.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Segurança da Informação e Conformidade com a Lei de Cibersegurança (Lei n.º 9/26)
          </h2>
        </div>

        <p>
          7.1. A Nora cumpre os requisitos de salvaguarda de infra-estruturas críticas estabelecidos pela recente <strong>Lei n.º 9/26, de 28 de Setembro (Lei da Cibersegurança da República de Angola)</strong>, aplicando as melhores práticas técnicas da indústria:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="p-3 border border-border/80 bg-card rounded-none space-y-1">
            <span className="font-semibold text-foreground block">Criptografia em Trânsito</span>
            <p>Comunicação integral cifrada via protocolo TLS 1.3 com certificados de segurança de chave forte.</p>
          </div>
          <div className="p-3 border border-border/80 bg-card rounded-none space-y-1">
            <span className="font-semibold text-foreground block">Derivação Argon2id</span>
            <p>Armazenamento de senhas sem possibilidade de recuperação em texto limpo, resistentes a ataques de GPU.</p>
          </div>
          <div className="p-3 border border-border/80 bg-card rounded-none space-y-1">
            <span className="font-semibold text-foreground block">Isolamento Multi-Tenant</span>
            <p>Segregação forçada por chave de organização em todas as consultas SQL na camada de base de dados.</p>
          </div>
        </div>

        <p className="text-xs">
          7.2. Em caso de incidente cibernético grave que comprometa a confidencialidade de dados pessoais, a Nora comunicará a ocorrência à <strong>APD</strong> e ao <strong>Centro Nacional de Cibersegurança</strong> no prazo regulamentar, informando igualmente os titulares afectados.
        </p>
      </section>

      {/* 8. Transferência Internacional de Dados */}
      <section id="transferencia-internacional" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 8.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Transferência Internacional de Dados Pessoais (Artigo 33.º da LPDP)
          </h2>
        </div>

        <p>
          8.1. Nos termos do artigo 33.º da Lei n.º 22/11, a transferência de dados pessoais para servidores situados fora do território da República de Angola só é efectuada para países que assegurem um nível de protecção adequado ou mediante a adopção de cláusulas contratuais-tipo de salvaguarda aprovadas, dando cumprimento às directivas e autorizações da APD.
        </p>

        <p>
          8.2. A infra-estrutura de armazenamento na nuvem utiliza centros de dados com certificação internacional ISO 27001 e SOC 2 Type II, assegurando que o acervo audiovisual permanece resguardado contra acessos não autorizados de jurisdições terceiras.
        </p>
      </section>

      {/* 9. Prazos de Conservação e Retenção Fiscal */}
      <section id="prazos-retencao" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 9.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Prazos de Conservação e Retenção de Dados
          </h2>
        </div>

        <p>
          Os dados pessoais são conservados unicamente pelo período estritamente necessário à prossecução das finalidades que motivaram a sua recolha ou para o cumprimento de prazos imperativos fixados pela legislação angolana:
        </p>

        {/* Tabela de Retenção */}
        <div className="border border-border/80 overflow-hidden rounded-none mt-2">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-b border-border/80 text-foreground font-semibold">
              <tr>
                <th className="p-3">Categoria de Dados</th>
                <th className="p-3">Prazo de Retenção Legal</th>
                <th className="p-3">Fundamento Jurídico Angolano</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="p-3 font-medium text-foreground">Documentos Fiscais & Facturação</td>
                <td className="p-3">5 (cinco) anos fiscais</td>
                <td className="p-3">Código Geral Tributário de Angola & Regras AGT</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Contas de Utilizador & Acessos</td>
                <td className="p-3">Duração do contrato + 30 dias de carência</td>
                <td className="p-3">Execução do Contrato de Licença de Software</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Logs de Auditoria e Segurança</td>
                <td className="p-3">12 (doze) meses rotativos</td>
                <td className="p-3">Lei n.º 9/26 (Cibersegurança)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Arquivos de Mídia e Copiões</td>
                <td className="p-3">Até eliminação pelo utilizador ou término de subscrição</td>
                <td className="p-3">Lei n.º 15/14 (Direitos de Autor)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 10. Cookies Essenciais e Canal DPO */}
      <section id="cookies-canal-dpo" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 10.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Cookies Essenciais, Contacto do DPO e Alterações à Política
          </h2>
        </div>

        <p>
          10.1. A Nora utiliza apenas <strong>cookies estritamente técnicos e de sessão</strong> (como <code>nora_session</code> e <code>nora_token</code>) indispensáveis para manter a autenticação segura do utilizador e a integridade da navegação, não utilizando <em>trackers</em> nem vendendo perfis comportamentais a redes de publicidade de terceiros.
        </p>

        <p>
          10.2. Qualquer pedido de exercício dos direitos previstos na Lei n.º 22/11 deve ser endereçado por correio electrónico para <a href="mailto:dpo@nora.ao" className="text-primary font-semibold hover:underline">dpo@nora.ao</a> ou por carta remetida para o Gabinete Jurídico da Nora Audiovisual em Talatona, Luanda.
        </p>

        <p>
          10.3. A presente política pode ser revista periodicamente para reflectir novas directrizes regulamentares da APD ou alterações legislativas no ordenamento jurídico da República de Angola, entrando as alterações em vigor no dia seguinte à sua publicação na plataforma.
        </p>
      </section>
    </LegalLayout>
  );
}

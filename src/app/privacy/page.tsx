import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Política de Privacidade e Protecção de Dados | Nora Audiovisual",
  description: "Tratamento de dados pessoais e segurança da informação na Nora Audiovisual.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao início
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-4 w-4 text-primary" />
            <span>Privacidade & Segurança</span>
          </div>
        </div>

        <div className="space-y-4 border-b pb-6">
          <h1 className="text-3xl font-bold tracking-tight">Política de Privacidade e Protecção de Dados</h1>
          <p className="text-sm text-muted-foreground">
            Última actualização: Outubro de 2026 • Em conformidade com as directrizes de protecção de dados pessoais.
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">1. Recolha e Finalidade de Dados</h2>
            <p>
              Recolhemos dados estritamente necessários para a operacionalização dos projectos, emissão de folhas de chamada, agendamento de estúdios e facturação integrada (nome, email, NIF e identificadores de contacto).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">2. Segurança e Criptografia</h2>
            <p>
              Todas as palavras-passe são armazenadas utilizando derivação de chaves Argon2id. O tráfego de dados é encriptado via TLS 1.3 e as sessões utilizam tokens assinados com isolamento rígido entre organizações (multi-tenancy).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">3. Direitos dos Titulares</h2>
            <p>
              Os utilizadores podem exercer os seus direitos de acesso, rectificação ou eliminação de dados de conta através do painel de administração da sua organização ou por solicitação directa ao encarregado de protecção de dados.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

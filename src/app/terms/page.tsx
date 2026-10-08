import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Termos de Uso e Serviço | Nora Audiovisual",
  description: "Termos de serviço e condições de utilização da plataforma Nora Audiovisual.",
};

export default function TermsPage() {
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
            <Shield className="h-4 w-4 text-primary" />
            <span>Nora Audiovisual Legal</span>
          </div>
        </div>

        <div className="space-y-4 border-b pb-6">
          <h1 className="text-3xl font-bold tracking-tight">Termos de Utilização do Serviço</h1>
          <p className="text-sm text-muted-foreground">
            Última actualização: Outubro de 2026 • Em conformidade com a legislação de comércio electrónico e proteção de dados.
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">1. Objecto e Âmbito</h2>
            <p>
              A plataforma Nora Audiovisual disponibiliza ferramentas integradas para gestão de produções audiovisuais, estúdios, inventário técnico, aprovação de vídeo e facturação empresarial. O acesso ao serviço implica a aceitação integral dos presentes termos.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">2. Contas e Credenciais</h2>
            <p>
              O utilizador é responsável pela confidencialidade das suas credenciais de acesso e pela autenticação multifactor (MFA) associada à sua conta. A partilha indevida de acessos pode resultar na suspensão preventiva da organização.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">3. Direitos de Propriedade Intelectual</h2>
            <p>
              Todos os conteúdos multimédia, ficheiros em bruto (RAW), versões de edição e entregáveis carregados pertencem integralmente à respectiva produtora ou aos seus clientes titulares de direitos.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">4. Disponibilidade e SLA</h2>
            <p>
              A Nora Audiovisual emprega infra-estruturas resilientes de alta disponibilidade e protecção com cópias de segurança automáticas. A manutenção programada é comunicada previamente com aviso aos administradores.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

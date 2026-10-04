import { RegisterFlow } from "@/components/auth/register/register-flow";
import { HeroImageSide } from "@/components/auth/_components";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components";
import Link from "next/link";

export const metadata = {
  title: "Criar Conta | Nora Audiovisual",
  description: "Registo de nova produtora audiovisual e provisionamento de espaço de trabalho multi-tenant",
};

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Coluna Esquerda: Formulário de Registo */}
      <div className="flex flex-col justify-between bg-background px-6 py-8 sm:px-12 sm:py-10 lg:px-16 lg:py-12 overflow-y-auto">
        <div className="flex items-center justify-between w-full mb-4">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo variant="full" size="md" priority />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">7 dias de teste</span>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto my-auto">
          <RegisterFlow />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-6">
          <span>&copy; {new Date().getFullYear()} Nora Audiovisual & Estúdios Lda.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">Termos</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link>
          </div>
        </div>
      </div>

      {/* Coluna Direita: Imagem de Hero Cinematográfica */}
      <HeroImageSide
        source="/auth-cinema-rig.jpg"
        title="Comece a gerir a sua produtora com tecnologia de ponta."
        subtitle="Junte-se a dezenas de estúdios e produtoras que centralizam equipas, equipamentos e aprovação de clientes na Nora Audiovisual."
        badge="NORA AUDIOVISUAL — WORKSPACE CORPORATIVO"
      />
    </div>
  );
}

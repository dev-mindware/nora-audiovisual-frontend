import { LoginForm } from "@/components/auth/login/login-form";
import { HeroImageSide } from "@/components/auth/_components";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components";
import Link from "next/link";

export const metadata = {
  title: "Entrar | Nora Audiovisual",
  description: "Acesse a plataforma de gestão operacional, inventário e produção da Nora Audiovisual.",
};

export default function LoginPage() {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Coluna Esquerda: Formulário de Autenticação */}
      <div className="flex flex-col justify-between bg-background px-6 py-8 sm:px-12 sm:py-12 lg:px-16 lg:py-16">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo variant="full" size="md" priority />
          </Link>
          <ThemeToggle />
        </div>

        <LoginForm />

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-6">
          <span>&copy; {new Date().getFullYear()} MINDWARE - Comércio e Serviços.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">Termos</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link>
          </div>
        </div>
      </div>

      {/* Coluna Direita: Imagem de Hero Cinematográfica */}
      <HeroImageSide
        source="/auth-cinema-production.jpg"
        title="Gestão operacional e planeamento para produtoras e estúdios."
        subtitle="Do guião, planeamento e folhas de chamada ao timecode review e faturação profissional integrada."
        badge="NORA AUDIOVISUAL — GESTÃO & PRODUÇÃO"
      />
    </div>
  );
}

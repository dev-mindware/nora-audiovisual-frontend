import { RecoveryPassword } from "@/components/auth/forgot-password/recovery-password";
import { HeroImageSide } from "@/components/auth/_components";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components";
import Link from "next/link";
import { KeyRound, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Recuperar Palavra-passe | Nora Audiovisual",
  description: "Recupere o acesso à sua conta na plataforma Nora Audiovisual.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Coluna Esquerda: Formulário de Recuperação */}
      <div className="flex flex-col justify-between bg-background px-6 py-8 sm:px-12 sm:py-12 lg:px-16 lg:py-16">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo variant="full" size="md" priority />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Recuperação Segura</span>
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto my-auto">
          <RecoveryPassword />
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
        source="/auth-recovery-cinema.jpg"
        title="Acesso seguro e proteção de dados para a sua produtora."
        subtitle="Recupere o acesso à plataforma e ao catálogo de produções com validação criptografada de credenciais e proteção multi-tenant."
        badge="NORA AUDIOVISUAL — RECUPERAÇÃO DE CONTA"
        features={[
          {
            icon: <KeyRound className="h-4 w-4 text-primary shrink-0" />,
            label: "Validação Segura por Email & OTP",
          },
          {
            icon: <ShieldCheck className="h-4 w-4 text-primary shrink-0" />,
            label: "Criptografia & Controlo de Acesso",
          },
        ]}
      />
    </div>
  );
}

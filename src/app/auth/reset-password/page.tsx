import { ResetPassword } from "@/components/auth/reset-password";
import { HeroImageSide } from "@/components/auth/_components";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Clapperboard, Lock, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Redefinir Palavra-passe | Nora Audiovisual",
  description: "Defina uma nova palavra-passe de acesso seguro à plataforma Nora Audiovisual.",
};

export default function ResetPasswordPage() {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Coluna Esquerda: Formulário de Redefinição */}
      <div className="flex flex-col justify-between bg-background px-6 py-8 sm:px-12 sm:py-12 lg:px-16 lg:py-16">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <Clapperboard className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Nora <span className="text-primary">Audiovisual</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Segurança de Acesso</span>
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto my-auto">
          <ResetPassword />
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
        title="Defina uma credencial forte e proteja o seu estúdio."
        subtitle="Crie uma nova palavra-passe com verificação em tempo real de robustez para salvaguardar orçamentos, guiões e materiais confidenciais."
        badge="NORA AUDIOVISUAL — NOVA CREDENCIAL"
        features={[
          {
            icon: <Lock className="h-4 w-4 text-primary shrink-0" />,
            label: "Análise Dinâmica de Força de Senha",
          },
          {
            icon: <ShieldCheck className="h-4 w-4 text-primary shrink-0" />,
            label: "Sessões Ativas Criptografadas",
          },
        ]}
      />
    </div>
  );
}

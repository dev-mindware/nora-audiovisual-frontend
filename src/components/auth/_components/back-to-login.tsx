import Link from "next/link";

export function BackToLogin() {
  return (
    <div className="w-full flex items-center justify-center">
      <Link
        href="/auth/login"
        className="w-max text-primary hover:text-primary/90 hover:underline block text-sm font-medium transition-colors"
      >
        Voltar para o login
      </Link>
    </div>
  );
}

"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { differenceInDays } from "date-fns";
import { useAuthStore } from "@/stores/auth";
import { useNoraSubscriptions } from "@/hooks/subscriptions";
import { Button } from "@/components/ui";
import { AlertCircle, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function TrialBanner() {
  const { user } = useAuthStore();
  const { subscription: noraSub } = useNoraSubscriptions();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isPlatformAdmin = Boolean(user?.isPlatformAdmin || user?.role === 'ADMIN');
  const subscription = noraSub || (user as any)?.subscription || (user?.activeOrganization as any)?.subscription;
  const isTrialing = subscription?.status === "TRIALING";
  const targetEndDate = subscription?.trialEndsAt || subscription?.currentPeriodEnd;

  const { daysRemaining, urgency, isExpired } = useMemo(() => {
    if (subscription?.status === "EXPIRED") {
      return { daysRemaining: 0, urgency: "expired", isExpired: true };
    }
    if (!targetEndDate) return { daysRemaining: 0, urgency: "neutral", isExpired: false };
    
    const targetMs = new Date(targetEndDate).getTime();
    const nowMs = Date.now();
    const diffMs = targetMs - nowMs;
    
    if (diffMs <= 0) {
      return { daysRemaining: 0, urgency: "expired", isExpired: true };
    }
    
    const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    
    let level = "neutral";
    if (days <= 2) level = "critical";
    else if (days <= 5) level = "warning";
    
    return { daysRemaining: days, urgency: level, isExpired: false };
  }, [subscription?.status, targetEndDate]);

  if (!mounted || isPlatformAdmin || (!isTrialing && !isExpired) || (!isExpired && !isVisible) || pathname === "/subscriptions" || pathname === "/checkout") {
    return null;
  }

  const urgencyStyles = {
    neutral: "bg-primary/10 text-primary border-primary/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20",
    critical: "bg-destructive/10 text-destructive border-destructive/20",
    expired: "bg-destructive text-destructive-foreground border-destructive",
  };

  const urgencyIcon = {
    neutral: <Clock className="h-4 w-4 shrink-0" />,
    warning: <Clock className="h-4 w-4 shrink-0" />,
    critical: <AlertCircle className="h-4 w-4 shrink-0" />,
    expired: <AlertCircle className="h-4 w-4 shrink-0" />,
  };

  const currentStyle = urgencyStyles[urgency as keyof typeof urgencyStyles];
  const Icon = urgencyIcon[urgency as keyof typeof urgencyIcon];

  return (
    <div className={cn(
      "relative flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2 border-b text-xs sm:text-sm font-medium transition-colors w-full z-50",
      currentStyle
    )}>
      <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start text-center sm:text-left">
        {Icon}
        <span>
          {isExpired ? (
            <strong>Modo Apenas Leitura: A subscrição da sua organização expirou. Pode consultar todos os seus registos gravados anteriormente, mas novas criações e edições estão bloqueadas até regularizar o plano.</strong>
          ) : (
            <>
              <strong>Plano Inicial (Teste):</strong> {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'} (5 projectos, 3 membros, 50 GB). Actualize para o plano Pro para desbloquear Nora Suite e capacidade ilimitada.
            </>
          )}
        </span>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/subscriptions">
          <Button 
            size="sm" 
            variant={isExpired ? "secondary" : "default"}
            className={cn(
              "h-7 text-xs px-3 rounded-none font-semibold",
              urgency === "warning" && "bg-amber-600 hover:bg-amber-700 text-white",
              urgency === "critical" && "bg-destructive hover:bg-destructive/90 text-white",
              isExpired && "bg-white text-destructive hover:bg-white/90"
            )}
          >
            {isExpired ? "Regularizar Subscrição" : "Fazer Upgrade"}
          </Button>
        </Link>
        {!isExpired && (
          <button 
            onClick={() => setIsVisible(false)}
            className={cn(
              "p-1 rounded-none opacity-70 hover:opacity-100 transition-opacity",
              urgency === "warning" && "hover:bg-amber-500/20 text-amber-700",
              urgency === "critical" && "hover:bg-destructive/20 text-destructive",
              urgency === "neutral" && "hover:bg-primary/10 text-primary"
            )}
            aria-label="Fechar aviso"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

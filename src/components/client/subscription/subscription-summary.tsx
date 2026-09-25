"use client";

import { useState } from "react";
import { Plan } from "@/types";
import {
  formatCurrency,
  getPlanFeatures,
} from "@/utils";
import type { ComponentType, ReactNode } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Icon,
  Input,
} from "@/components";
import { Shield, Check } from "lucide-react";
import { ValidateCouponResponse } from "@/services/coupon-service";

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-foreground">{label}</span>
      {children}
    </div>
  );
}

function SectionCard({
  icon: IconComponent,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-border shadow-none">
      <CardHeader className="font-semibold flex items-center text-foreground">
        <IconComponent className="h-5 w-5 text-primary-500 mr-2" />
        {title}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-center">
      <Check className="h-4 w-4 text-green-500 mr-2" />
      <span className="text-foreground">{children}</span>
    </li>
  );
}

interface SubscriptionSummaryProps {
  selectedPlan: Plan | null;
  months: number;
  frequency: "MONTHLY" | "SEMI_ANNUAL" | "ANNUAL";
  couponData?: ValidateCouponResponse | null;
  onApplyCoupon?: (code: string) => Promise<void>;
  onRemoveCoupon?: () => void;
  couponLoading?: boolean;
  couponError?: string | null;
}

export function SubscriptionSummary({
  selectedPlan,
  months,
  frequency,
  couponData,
  onApplyCoupon,
  onRemoveCoupon,
  couponLoading = false,
  couponError = null,
}: SubscriptionSummaryProps) {
  const [couponInput, setCouponInput] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  if (!selectedPlan) return null;

  const price = parseFloat(selectedPlan.priceMonthly);
  const isAnnual = frequency === "ANNUAL";
  const isSemiAnnual = frequency === "SEMI_ANNUAL";
  const actualMonths = isAnnual ? 12 : isSemiAnnual ? 6 : months;

  const subtotal = price * actualMonths;
  const cycleDiscount = isAnnual ? subtotal * 0.05 : isSemiAnnual ? subtotal * 0.02 : 0;
  const priceAfterCycleDiscount = subtotal - cycleDiscount;

  const couponDiscount = couponData ? couponData.discountAmount : 0;
  const totalToPay = Math.max(0, priceAfterCycleDiscount - couponDiscount);

  const featuresList = getPlanFeatures(selectedPlan);

  const handleApply = () => {
    if (!couponInput.trim()) {
      setLocalError("Introduza o código do cupão");
      return;
    }
    setLocalError(null);
    if (onApplyCoupon) {
      onApplyCoupon(couponInput.trim());
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Resumo da Subscrição
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow label="Plano seleccionado:">
            <Badge className="bg-primary-500 text-white">
              {selectedPlan.name}
            </Badge>
          </InfoRow>

          <InfoRow label="Tipo de Subscrição:">
            <span className="font-medium text-foreground">
              {isAnnual
                ? "Anual (5% desconto)"
                : isSemiAnnual
                  ? "Semestral (2% desconto)"
                  : "Mensal"}
            </span>
          </InfoRow>

          <InfoRow label="Preço mensal:">
            <span className="font-bold text-primary-600">
              {formatCurrency(price)}
            </span>
          </InfoRow>

          {isAnnual && (
            <InfoRow label="Desconto anual (5%):">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                - {formatCurrency(cycleDiscount)}
              </span>
            </InfoRow>
          )}

          {isSemiAnnual && (
            <InfoRow label="Desconto semestral (2%):">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                - {formatCurrency(cycleDiscount)}
              </span>
            </InfoRow>
          )}

          {/* Secção de Cupão de Desconto */}
          {couponData ? (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono font-bold tracking-wider border-primary text-primary">
                    {couponData.coupon.code}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {couponData.coupon.discountType === "PERCENTAGE"
                      ? `${couponData.coupon.discountValue}% OFF`
                      : `-${formatCurrency(couponData.coupon.discountValue)}`}
                  </span>
                </div>
                {onRemoveCoupon && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCouponInput("");
                      setLocalError(null);
                      onRemoveCoupon();
                    }}
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                  >
                    Remover
                  </Button>
                )}
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Cupão aplicado com sucesso!
              </p>
            </div>
          ) : (
            onApplyCoupon && (
              <div className="space-y-1.5 pt-2 border-t">
                <label htmlFor="coupon-code-input" className="text-xs font-medium text-muted-foreground block">
                  Tem um cupão de desconto?
                </label>
                <div className="flex gap-2">
                  <Input
                    id="coupon-code-input"
                    placeholder="Código do cupão"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      if (localError) setLocalError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleApply();
                      }
                    }}
                    className="uppercase font-mono text-sm h-9"
                    disabled={couponLoading}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleApply}
                    disabled={!couponInput.trim() || couponLoading}
                    className="h-9 px-4 shrink-0"
                  >
                    {couponLoading ? (
                      <Icon name="LoaderCircle" className="h-4 w-4 animate-spin" />
                    ) : (
                      "Aplicar"
                    )}
                  </Button>
                </div>
                {(couponError || localError) && (
                  <p className="text-xs text-destructive font-medium">
                    {couponError || localError}
                  </p>
                )}
              </div>
            )
          )}

          {couponData && (
            <InfoRow label={`Desconto do cupão:`}>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                - {formatCurrency(couponDiscount)}
              </span>
            </InfoRow>
          )}

          <InfoRow label="Total a pagar:">
            <div className="text-right">
              {(isAnnual || isSemiAnnual || couponData) && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatCurrency(subtotal)}
                </p>
              )}
              <p className="font-bold text-primary-600 text-lg">
                {formatCurrency(totalToPay)}
              </p>
            </div>
          </InfoRow>
        </CardContent>
      </Card>

      <SectionCard icon={Shield} title="Recursos inclusos">
        <ul className="space-y-2 text-sm">
          {featuresList.map((feature, idx) => (
            <CheckItem key={idx}>{feature}</CheckItem>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}

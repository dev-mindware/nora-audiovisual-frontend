"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  EmptyState,
} from "@/components";
import { Award, Mail, Calendar as CalendarIcon, Receipt, Users } from "lucide-react";
import { ClientAnalyticsResponse } from "@/types";
import { formatCurrency, formatDate } from "@/utils";

interface TopClientCardProps {
  client: ClientAnalyticsResponse["clients"][0] | undefined;
}

export function TopClientCard({ client }: TopClientCardProps) {
  if (!client) {
    return (
      <Card className="h-full border border-border bg-muted/20 flex items-center justify-center p-6 min-h-[350px] rounded-xs shadow-none">
        <EmptyState
          title="Sem Top Cliente"
          description="Ainda não existem dados suficientes para identificar o cliente com melhor desempenho."
          icon="Award"
        />
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border border-border bg-card shadow-none group h-full rounded-xs">
      <CardHeader className="p-5 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-xs bg-primary/10 text-primary">
                <Award className="h-3.5 w-3.5" />
              </div>
              <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-primary/30 text-primary rounded-xs">
                Top Performance
              </Badge>
            </div>
            <CardTitle className="text-xl font-semibold tracking-tight pt-1">
              {client.clientName}
            </CardTitle>
            <CardDescription className="flex items-center gap-1.5 font-normal text-muted-foreground text-xs">
              <Mail className="h-3.5 w-3.5" />
              {client.clientEmail}
            </CardDescription>
          </div>
          <div className="h-9 w-9 rounded-xs bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xs bg-muted/30 border border-border space-y-1">
            <p className="text-[10px] uppercase font-medium text-muted-foreground tracking-wider">Receita Total</p>
            <p className="text-base font-semibold text-primary truncate">
              {formatCurrency(client.totalRevenue)}
            </p>
          </div>
          <div className="p-3 rounded-xs bg-muted/30 border border-border space-y-1">
            <p className="text-[10px] uppercase font-medium text-muted-foreground tracking-wider">Frequência</p>
            <p className="text-base font-semibold truncate">{client.totalInvoices} <span className="text-xs font-normal text-muted-foreground">vendas</span></p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-normal text-muted-foreground">
              <Receipt className="h-3.5 w-3.5" />
              <span>Valor Médio</span>
            </div>
            <span className="font-semibold text-foreground">{formatCurrency(client.averageOrderValue)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-normal text-muted-foreground">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Última Atividade</span>
            </div>
            <span className="font-semibold text-foreground">{formatDate(client.lastPurchaseDate)}</span>
          </div>
        </div>

        <div className="pt-2 space-y-2 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Índice de fidelização</p>
            <span className="text-xs font-semibold text-primary">
              {client.loyaltyScore}%
            </span>
          </div>
          <div className="relative h-1.5 w-full bg-muted rounded-xs overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-xs transition-all duration-700 ease-out"
              style={{ width: `${client.loyaltyScore}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

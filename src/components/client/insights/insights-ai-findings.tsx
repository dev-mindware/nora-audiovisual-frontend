'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components';
import { Sparkles, AlertCircle, Lightbulb, CheckCircle, ArrowRight } from 'lucide-react';
import { InsightsOverview } from '@/services/insights-service';

interface InsightsAiFindingsProps {
  findings: InsightsOverview['noraFindings'];
}

export function InsightsAiFindings({ findings }: InsightsAiFindingsProps) {
  return (
    <Card className="bg-card border-border shadow-none rounded-xs w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xs bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                Diagnósticos &amp; Oportunidades Nora AI
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Anomalias, desvios de margem e capacidade técnica detectados automaticamente
              </CardDescription>
            </div>
          </div>
          <span className="text-xs font-semibold text-primary font-mono hidden sm:inline">
            {findings.length} Recomendações
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {findings.map((finding) => {
            const isAlert = finding.type === 'ALERT';
            const isOpportunity = finding.type === 'OPPORTUNITY';
            const IconComponent = isAlert ? AlertCircle : isOpportunity ? Lightbulb : CheckCircle;
            const badgeClasses = isAlert
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-500'
              : isOpportunity
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
              : 'border-blue-500/30 bg-blue-500/10 text-blue-500';

            return (
              <div
                key={finding.id}
                className="p-4 rounded-xs border border-border bg-background/60 flex flex-col justify-between space-y-3 hover:border-border/80 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase rounded-xs border ${badgeClasses}`}
                    >
                      <IconComponent className="h-3 w-3" />
                      {isAlert ? 'Alerta Crítico' : isOpportunity ? 'Oportunidade' : 'Destaque'}
                    </span>
                    {finding.metricChange && (
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {finding.metricChange}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-foreground leading-snug">
                    {finding.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {finding.description}
                  </p>
                </div>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-medium justify-between border-border rounded-xs h-8"
                >
                  <Link href={finding.actionTarget}>
                    <span>{finding.actionLabel}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

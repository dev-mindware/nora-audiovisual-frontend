"use client";

import * as React from "react";
import {
  HeroBillingChart,
  HeroStockChart,
  HeroStatsWidget,
  HeroPieChart,
  HeroRadarChart,
} from "./hero-charts";
import { Users, Clapperboard, Camera, Film, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui";

export function LoginHeroComposition() {
  return (
    <div className="relative w-full h-full min-h-[700px] flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Decorative Background Blobs with Royal Blue Lighting */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/25 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[140px] animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-600/15 rounded-full blur-[100px]" />

      {/* CTA Text - Top Header */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 text-center w-full px-4 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/60 px-3.5 py-1 text-xs font-semibold text-blue-300 shadow-inner backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span>Gestão Integrada para Produtoras & Estúdios</span>
        </div>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
          Nora <span className="text-blue-500">Audiovisual</span>
        </h2>
        <p className="mt-1 text-xs font-medium text-slate-400 max-w-md mx-auto">
          Do guião e folha de chamada ao timecode review e faturação profissional
        </p>
      </div>

      {/* Centered Composition */}
      <div className="relative w-full max-w-3xl h-[600px] mt-28">
        {/* Main Billing Chart - Top Left */}
        <div className="absolute top-0 left-10 z-20">
          <HeroBillingChart />
        </div>

        {/* Radar Chart - Center Right */}
        <div className="absolute top-6 right-4 z-10">
          <HeroRadarChart />
        </div>

        {/* Pie Chart - Middle Left */}
        <div className="absolute top-[220px] left-0 z-30">
          <HeroPieChart />
        </div>

        {/* Stock Chart - Bottom Center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
          <HeroStockChart />
        </div>

        {/* Top Right Widget */}
        <div className="absolute top-44 right-16 z-30">
          <HeroStatsWidget
            icon={Film}
            label="Projectos Activos"
            value="18"
            trend="+24%"
            delay="delay-150"
          />
        </div>

        {/* Bottom Right Widget */}
        <div className="absolute bottom-16 right-8 z-20">
          <HeroStatsWidget
            icon={Camera}
            label="Kits Alugados"
            value="34"
            trend="98% disp."
            delay="delay-500"
          />
        </div>

        {/* Floating Decorative Elements */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
          aria-hidden="true"
        >
          <path
            d="M 200 250 Q 400 200 600 350"
            stroke="#3B82F6"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="4 4"
          />
        </svg>
      </div>

      {/* Subtle overlay to soften edges */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-transparent to-slate-950/70" />
    </div>
  );
}

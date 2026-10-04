"use client";

import Image from "next/image";
import { Film, Video, Sparkles } from "lucide-react";

interface HeroFeature {
  icon: React.ReactNode;
  label: string;
}

interface HeroImageSideProps {
  source?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  features?: HeroFeature[];
}

export function HeroImageSide({
  source = "/auth-cinema-production.jpg",
  title = "Gestão operacional e planeamento para produtoras e estúdios.",
  subtitle = "Do guião, planeamento e folhas de chamada ao timecode review e faturação profissional integrada.",
  badge = "NORA AUDIOVISUAL — GESTÃO & PRODUÇÃO",
  features,
}: HeroImageSideProps) {
  const defaultFeatures: HeroFeature[] = [
    {
      icon: <Film className="h-4 w-4 text-primary shrink-0" />,
      label: "Call Sheets & Folhas de Rodagem",
    },
    {
      icon: <Video className="h-4 w-4 text-primary shrink-0" />,
      label: "Client Portal & Timecode Review",
    },
  ];

  const displayFeatures = features && features.length > 0 ? features : defaultFeatures;

  return (
    <div className="relative hidden min-h-dvh w-full flex-col justify-between overflow-hidden bg-slate-950 border-l border-border lg:flex select-none">
      {/* Background Image: Crisp, High-Definition & In Focus */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          fill
          src={source}
          alt="Produção Audiovisual Nora"
          className="object-cover object-[center_35%] brightness-[0.95] contrast-[1.06] dark:brightness-[0.90] dark:contrast-[1.10] transition-transform duration-1000"
          sizes="50vw"
          priority
        />

        {/* Top Vignette strictly behind the cinema HUD */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/70 via-black/20 to-transparent pointer-events-none z-10" />

        {/* Left Blend to soften transition to the form column */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background via-background/25 to-transparent pointer-events-none z-10" />

        {/* Bottom Cinematic Vignette strictly covering the text area */}
        <div className="absolute bottom-0 inset-x-0 h-[55%] bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none z-10" />
      </div>

      {/* Top Cinema HUD Overlay (Authentic Camera Viewfinder) */}
      <div className="relative z-20 flex items-center justify-between p-8 md:p-10 pointer-events-none">
        <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-black/50 px-3.5 py-1 text-[11px] font-mono font-medium text-white/95 backdrop-blur-md shadow-lg shadow-black/40">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-sm shadow-red-500/80" />
          <span className="font-semibold text-red-400">REC</span>
          <span className="text-white/30">|</span>
          <span className="tracking-wider">TC 01:24:58:12</span>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3.5 py-1 text-[11px] font-mono font-medium text-white/90 backdrop-blur-md shadow-lg shadow-black/40">
          <span>4K DCI · 25 FPS</span>
          <span className="text-white/30">·</span>
          <span>PRORES 4444</span>
        </div>
      </div>

      {/* Bottom Content Section - Clear Typography with High Legibility */}
      <div className="relative z-20 w-full p-8 md:p-12 lg:p-14 max-w-2xl space-y-5 pb-10 lg:pb-14 text-white">
        {badge && (
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/20 px-3.5 py-1 text-[11px] font-semibold tracking-wider text-white backdrop-blur-md uppercase shadow-sm">
            <Sparkles className="h-3 w-3 text-primary shrink-0" />
            <span>{badge}</span>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug drop-shadow-md">
            {title}
          </h2>
          <p className="text-sm md:text-base text-white/85 font-normal leading-relaxed max-w-xl drop-shadow-sm">
            {subtitle}
          </p>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 gap-3 max-w-lg pt-1">
          {displayFeatures.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-black/50 backdrop-blur-md px-3 py-2.5 text-xs text-white/95 shadow-md hover:border-primary/50 transition-colors"
            >
              {item.icon}
              <span className="font-medium truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

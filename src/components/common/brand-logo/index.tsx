"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  variant?: "full" | "symbol";
  theme?: "auto" | "light" | "dark";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
}

const SIZE_MAP = {
  symbol: {
    xs: "w-5 h-5",
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  },
  full: {
    xs: "h-6 w-auto max-w-[100px]",
    sm: "h-8 w-auto max-w-[130px]",
    md: "h-10 w-auto max-w-[160px]",
    lg: "h-12 w-auto max-w-[200px]",
    xl: "h-16 w-auto max-w-[240px]",
  },
};

export function BrandLogo({
  variant = "full",
  theme = "auto",
  size = "md",
  className,
  priority = false,
}: BrandLogoProps) {
  const isSymbol = variant === "symbol";
  const sizeClass = SIZE_MAP[variant][size];

  if (theme === "dark") {
    const src = isSymbol ? "/dark-favicon.png" : "/logo-dark.png";
    return (
      <img
        src={src}
        alt="Nora Audiovisual"
        className={cn("object-contain", sizeClass, className)}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  if (theme === "light") {
    const src = isSymbol ? "/light-favicon.png" : "/logo-light.png";
    return (
      <img
        src={src}
        alt="Nora Audiovisual"
        className={cn("object-contain", sizeClass, className)}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  // Auto theme: renders both with responsive dark/light classes to avoid SSR flash
  const lightSrc = isSymbol ? "/light-favicon.png" : "/logo-light.png";
  const darkSrc = isSymbol ? "/dark-favicon.png" : "/logo-dark.png";

  return (
    <div className={cn("inline-flex items-center justify-center shrink-0", className)}>
      <img
        src={lightSrc}
        alt="Nora Audiovisual"
        className={cn("object-contain dark:hidden", sizeClass)}
        loading={priority ? "eager" : "lazy"}
      />
      <img
        src={darkSrc}
        alt="Nora Audiovisual"
        className={cn("object-contain hidden dark:block", sizeClass)}
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  );
}

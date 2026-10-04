import { ComponentProps } from "react";
import { icons } from "lucide-react";

export type IconProps = ComponentProps<"button"> & {
  name: keyof typeof icons;
  color?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

const ICON_ALIASES: Record<string, keyof typeof icons> = {
  BarChart3: 'ChartColumn',
  BarChart2: 'ChartColumn',
  BarChart: 'ChartColumn',
  PieChart: 'ChartPie',
  AlertCircle: 'CircleAlert',
  AlertTriangle: 'TriangleAlert',
  HelpCircle: 'CircleHelp',
};

export function Icon({
  name,
  color,
  size,
  strokeWidth,
  className,
}: IconProps) {
  const resolvedName = (ICON_ALIASES[name as string] || name) as keyof typeof icons;
  const LucideIcon = icons[resolvedName] || icons.CircleAlert || icons.Activity;

  if (!LucideIcon) {
    return null;
  }

  return (
    <LucideIcon
      color={color}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}
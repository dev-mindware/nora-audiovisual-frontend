import { Separator } from "@/components/ui";

export interface TitleListProps {
  title?: string;
  suTitle?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function TitleList({
  title,
  suTitle,
  subtitle,
  children,
}: TitleListProps) {
  const subtitleText = subtitle || suTitle;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
      <div className="min-w-0">
        {title && (
          <h2 className="text-2xl font-semibold tracking-tight text-foreground text-start">
            {title}
          </h2>
        )}
        {subtitleText && (
          <p className="text-start text-sm text-muted-foreground mt-0.5">
            {subtitleText}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}

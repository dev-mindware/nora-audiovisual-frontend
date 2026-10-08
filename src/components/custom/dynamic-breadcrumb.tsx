import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui";

interface Props {
  routePath?: string;
  routeLabel?: string;  
  subRoute: string;     
  showSeparator?: boolean;
}

export function DinamicBreadcrumb({
  routePath,
  routeLabel,
  subRoute,
  showSeparator = true,
}: Props) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs">
        {routeLabel && (
          <BreadcrumbItem>
            {routePath ? (
              <BreadcrumbLink
                href={routePath}
                className="font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {routeLabel}
              </BreadcrumbLink>
            ) : (
              <span className="font-medium text-muted-foreground">{routeLabel}</span>
            )}
          </BreadcrumbItem>
        )}
        {showSeparator && routeLabel && (
          <BreadcrumbSeparator />
        )}
        <BreadcrumbItem>
          <BreadcrumbPage className="font-semibold text-foreground truncate max-w-[160px] sm:max-w-xs md:max-w-none">
            {subRoute}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

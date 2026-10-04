import { Checkbox } from "@/components/ui";
import { Button, Icon } from "@/components";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui";
import { icons } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

interface FilterPopoverProps {
  label: string;
  icon: keyof typeof icons;
  options: Option[];
  value?: string | null;
  onChange: (value?: string | null) => void;
}

export function FilterPopover({
  label,
  icon,
  options,
  value,
  onChange,
}: FilterPopoverProps) {
  const sanitizedOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase() !== "todos" &&
      opt.label.toLowerCase() !== "tudo" &&
      opt.value.toLowerCase() !== "all"
  );

  const isFiltered = Boolean(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={cn(
            "w-full h-10 gap-2 sm:w-auto rounded-none transition-colors",
            isFiltered
              ? "border-primary text-primary bg-primary/10 hover:bg-primary/15 font-medium"
              : "border-input text-muted-foreground bg-transparent hover:bg-muted/40 hover:text-foreground font-normal"
          )}
        >
          <Icon
            name={icon}
            className={cn(
              "w-4 h-4",
              isFiltered ? "text-primary" : "text-muted-foreground"
            )}
          />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 space-y-2 rounded-none">
        <p className="p-1 text-sm font-medium">
          Seleccionar {label.toLowerCase()}
        </p>
        {sanitizedOptions.map((opt) => (
          <div
            key={opt.value}
            className="flex items-center gap-2 p-1 rounded-none hover:bg-muted"
          >
            <Checkbox
              id={`${label}-${opt.value}`}
              className="rounded-none"
              checked={value === opt.value}
              onCheckedChange={(checked) =>
                onChange(checked ? opt.value : null)
              }
            />
            <label
              htmlFor={`${label}-${opt.value}`}
              className="text-sm cursor-pointer"
            >
              {opt.label}
            </label>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}

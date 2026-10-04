import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib";

type Props = {
  options: { value: string; label: string }[];
  value: string;
  className?: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export function SelectFilter({ options, value, onChange, className, placeholder = "Filtrar..." }: Props) {
  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase() !== "todos" &&
      opt.label.toLowerCase() !== "tudo" &&
      opt.value.toLowerCase() !== "all"
  );

  const isFiltered = Boolean(value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "w-[180px] rounded-none transition-colors",
          isFiltered
            ? "border-primary text-primary bg-primary/10 hover:bg-primary/15 font-medium"
            : "border-input text-muted-foreground bg-transparent hover:bg-muted/40 hover:text-foreground font-normal",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-none">
        {filteredOptions.map((option) => (
          <SelectItem key={option.value} value={option.value} className="rounded-none">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
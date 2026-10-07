"use client"

import * as React from "react"
import { ArrowDownUp, ArrowDown, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface SortOption {
  label: string
  value: string
}

export interface SortFilterProps {
  options: SortOption[]
  sortBy: string
  sortOrder: "asc" | "desc"
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void
  className?: string
}

export function SortFilter({
  options,
  sortBy,
  sortOrder,
  onSortChange,
  className,
}: SortFilterProps) {
  const currentOption = options.find((opt) => opt.value === sortBy)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-10 sm:h-9 min-h-[44px] sm:min-h-0 px-3 gap-2 border-border font-medium text-xs rounded-none transition-colors",
            className
          )}
        >
          <ArrowDownUp className="h-3.5 w-3.5 opacity-70" />
          <span>Ordenar: {currentOption?.label || "Padrão"}</span>
          {sortOrder === "asc" ? (
            <ArrowUp className="h-3 w-3 text-primary ml-0.5" />
          ) : (
            <ArrowDown className="h-3 w-3 text-primary ml-0.5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-none">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Critério de Ordenação
        </DropdownMenuLabel>
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onSortChange(opt.value, sortOrder)}
            className={cn(
              "text-xs flex items-center justify-between cursor-pointer rounded-none",
              sortBy === opt.value && "font-semibold text-primary bg-primary/10"
            )}
          >
            <span>{opt.label}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Sentido
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => onSortChange(sortBy, "asc")}
          className={cn(
            "text-xs flex items-center gap-2 cursor-pointer rounded-none",
            sortOrder === "asc" && "font-semibold text-primary bg-primary/10"
          )}
        >
          <ArrowUp className="h-3.5 w-3.5" />
          <span>Ascendente (A-Z / Menor)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSortChange(sortBy, "desc")}
          className={cn(
            "text-xs flex items-center gap-2 cursor-pointer rounded-none",
            sortOrder === "desc" && "font-semibold text-primary bg-primary/10"
          )}
        >
          <ArrowDown className="h-3.5 w-3.5" />
          <span>Descendente (Z-A / Maior)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

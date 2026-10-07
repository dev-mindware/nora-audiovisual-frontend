"use client"

import * as React from "react"
import { LucideIcon, Filter, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface FilterPopoverOption {
  label: string
  value: string
  count?: number
}

export interface FilterPopoverProps {
  label: string
  icon?: LucideIcon
  options: FilterPopoverOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  multiple?: boolean
  className?: string
}

export function FilterPopover({
  label,
  icon: IconComponent = Filter,
  options,
  selectedValues = [],
  onChange,
  multiple = true,
  className,
}: FilterPopoverProps) {
  const hasValues = selectedValues.length > 0

  const handleToggle = (value: string) => {
    if (!multiple) {
      onChange(selectedValues.includes(value) ? [] : [value])
      return
    }
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value))
    } else {
      onChange([...selectedValues, value])
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={hasValues ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-10 sm:h-9 min-h-[44px] sm:min-h-0 px-3 gap-2 border-border font-medium text-xs rounded-none transition-colors",
            hasValues && "bg-primary text-primary-foreground hover:bg-primary/90",
            className
          )}
        >
          <IconComponent className="h-3.5 w-3.5 opacity-80" />
          <span>{label}</span>
          {hasValues && (
            <Badge
              variant="secondary"
              className="ml-1 px-1.5 py-0 text-[10px] font-mono leading-none rounded-none"
            >
              {selectedValues.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2 rounded-none space-y-1">
        <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border mb-1">
          {label}
        </div>
        <div className="max-h-56 overflow-y-auto space-y-0.5">
          {options.map((option) => {
            const isChecked = selectedValues.includes(option.value)
            const inputId = `popover-${label}-${option.value}`
            return (
              <div
                key={option.value}
                onClick={() => handleToggle(option.value)}
                className={cn(
                  "flex items-center justify-between px-2 py-1.5 rounded-none text-xs cursor-pointer transition-colors",
                  isChecked
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted/60 text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={inputId}
                    checked={isChecked}
                    onCheckedChange={() => handleToggle(option.value)}
                    className="h-3.5 w-3.5 rounded-none pointer-events-none"
                  />
                  <label htmlFor={inputId} className="cursor-pointer">
                    {option.label}
                  </label>
                </div>
                {option.count !== undefined && (
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {option.count}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        {hasValues && (
          <div className="pt-1.5 border-t border-border mt-1">
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full text-center text-[11px] text-destructive hover:underline py-1 font-medium cursor-pointer"
            >
              Limpar selecção
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

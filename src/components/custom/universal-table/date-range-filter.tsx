"use client"

import * as React from "react"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface DateRangeFilterProps {
  label?: string
  startDate?: string
  endDate?: string
  onChange: (startDate?: string, endDate?: string) => void
  className?: string
}

export function DateRangeFilter({
  label = "Período",
  startDate,
  endDate,
  onChange,
  className,
}: DateRangeFilterProps) {
  const hasRange = Boolean(startDate || endDate)

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined, undefined)
  }

  const startObj = startDate ? new Date(startDate) : undefined
  const endObj = endDate ? new Date(endDate) : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={hasRange ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-10 sm:h-9 min-h-[44px] sm:min-h-0 px-3 gap-2 border-border font-medium text-xs rounded-none transition-colors",
            hasRange && "bg-primary text-primary-foreground hover:bg-primary/90",
            className
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 opacity-80" />
          <span>
            {hasRange
              ? `${startDate ? new Date(startDate).toLocaleDateString("pt-PT") : "Início"} - ${
                  endDate ? new Date(endDate).toLocaleDateString("pt-PT") : "Fim"
                }`
              : label}
          </span>
          {hasRange && (
            <span
              onClick={handleClear}
              className="ml-1 p-0.5 hover:bg-primary-foreground/20 rounded cursor-pointer"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-4 rounded-none space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5">
          Filtrar por Período
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Data de Início
            </label>
            <DatePicker
              value={startObj}
              onChange={(_, formatted) => onChange(formatted, endDate)}
              placeholder="Seleccionar início"
              className="rounded-none text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Data de Fim
            </label>
            <DatePicker
              value={endObj}
              onChange={(_, formatted) => onChange(startDate, formatted)}
              placeholder="Seleccionar fim"
              className="rounded-none text-xs"
            />
          </div>
        </div>

        {hasRange && (
          <div className="pt-2 border-t border-border flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(undefined, undefined)}
              className="h-8 text-xs text-destructive hover:bg-destructive/10 rounded-none px-2"
            >
              Limpar Datas
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

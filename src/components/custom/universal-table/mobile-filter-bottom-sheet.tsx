"use client"

import * as React from "react"
import { Filter, RotateCcw, Check, ArrowDownUp, ArrowUp, ArrowDown, Calendar, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { SortOption } from "./sort-filter"

export interface FilterOption {
  label: string
  value: string
  count?: number
}

export interface FilterSectionConfig {
  id: string
  title: string
  options: FilterOption[]
  multiple?: boolean
}

export interface MobileFilterBottomSheetExtra {
  sortBy?: string
  sortOrder?: "asc" | "desc"
  startDate?: string
  endDate?: string
}

export interface MobileFilterBottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sections?: FilterSectionConfig[]
  appliedFilters: Record<string, string[]>
  onApply: (
    filters: Record<string, string[]>,
    extra?: MobileFilterBottomSheetExtra
  ) => void
  onClear?: () => void
  title?: string
  description?: string
  sortConfig?: {
    options: SortOption[]
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }
  dateRangeConfig?: {
    label?: string
    startDate?: string
    endDate?: string
  }
}

export function MobileFilterBottomSheet({
  open,
  onOpenChange,
  sections = [],
  appliedFilters,
  onApply,
  onClear,
  title = "Filtros de Produção",
  description = "Refine os registos seleccionando os critérios pretendidos.",
  sortConfig,
  dateRangeConfig,
}: MobileFilterBottomSheetProps) {
  // Estado de rascunho temporário (draftFilters) isolado de appliedFilters
  const [draftFilters, setDraftFilters] = React.useState<Record<string, string[]>>(appliedFilters)
  const [draftSortBy, setDraftSortBy] = React.useState<string>(sortConfig?.sortBy || "createdAt")
  const [draftSortOrder, setDraftSortOrder] = React.useState<"asc" | "desc">(sortConfig?.sortOrder || "desc")
  const [draftStartDate, setDraftStartDate] = React.useState<string | undefined>(dateRangeConfig?.startDate)
  const [draftEndDate, setDraftEndDate] = React.useState<string | undefined>(dateRangeConfig?.endDate)

  // Sincroniza o rascunho quando o sheet é aberto
  React.useEffect(() => {
    if (open) {
      setDraftFilters({ ...appliedFilters })
      setDraftSortBy(sortConfig?.sortBy || "createdAt")
      setDraftSortOrder(sortConfig?.sortOrder || "desc")
      setDraftStartDate(dateRangeConfig?.startDate)
      setDraftEndDate(dateRangeConfig?.endDate)
    }
  }, [open, appliedFilters, sortConfig, dateRangeConfig])

  const handleToggleOption = (sectionId: string, optionValue: string, multiple = true) => {
    setDraftFilters((prev) => {
      const current = prev[sectionId] || []
      if (!multiple) {
        return {
          ...prev,
          [sectionId]: current.includes(optionValue) ? [] : [optionValue],
        }
      }
      const next = current.includes(optionValue)
        ? current.filter((val) => val !== optionValue)
        : [...current, optionValue]
      return {
        ...prev,
        [sectionId]: next,
      }
    })
  }

  const handleClearDraft = () => {
    const empty: Record<string, string[]> = {}
    sections.forEach((sec) => {
      empty[sec.id] = []
    })
    setDraftFilters(empty)
    setDraftStartDate(undefined)
    setDraftEndDate(undefined)
    if (sortConfig?.options?.[0]) {
      setDraftSortBy(sortConfig.options[0].value)
    }
    setDraftSortOrder("desc")

    if (onClear) {
      onClear()
    }
  }

  const handleApplyFilters = () => {
    onApply(draftFilters, {
      sortBy: draftSortBy,
      sortOrder: draftSortOrder,
      startDate: draftStartDate,
      endDate: draftEndDate,
    })
    onOpenChange(false)
  }

  // Contagem de filtros activos no rascunho
  const totalCheckboxesSelected = Object.values(draftFilters).reduce(
    (acc, list) => acc + (list ? list.length : 0),
    0
  )
  const hasDateSelected = Boolean(draftStartDate || draftEndDate)
  const hasCustomSort = Boolean(
    sortConfig &&
      (draftSortBy !== (sortConfig.options[0]?.value || "createdAt") || draftSortOrder !== "desc")
  )

  const totalSelectedInDraft =
    totalCheckboxesSelected + (hasDateSelected ? 1 : 0) + (hasCustomSort ? 1 : 0)

  const startDateObj = draftStartDate ? new Date(draftStartDate) : undefined
  const endDateObj = draftEndDate ? new Date(draftEndDate) : undefined

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92dvh] h-[88dvh] p-0 rounded-t-2xl flex flex-col border-border bg-background shadow-2xl"
      >
        {/* Puxador visual suave para smartphone */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Cabeçalho fixo do Sheet */}
        <SheetHeader className="shrink-0 border-b border-border px-5 py-3 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Filter className="h-4 w-4" />
              </div>
              <div>
                <SheetTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <span>{title}</span>
                  {totalSelectedInDraft > 0 && (
                    <Badge variant="secondary" className="px-1.5 py-0 text-xs font-mono">
                      {totalSelectedInDraft}
                    </Badge>
                  )}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {description}
                </SheetDescription>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Corpo com scroll independente */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 divide-y divide-border/60">
          {/* Secção de Ordenação Padrão */}
          {sortConfig && sortConfig.options.length > 0 && (
            <div className="py-4 first:pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ArrowDownUp className="h-3.5 w-3.5 text-primary" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ordenação
                  </h4>
                </div>
              </div>

              {/* Critério de Ordenação */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Ordenar por
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {sortConfig.options.map((opt) => {
                    const isSelected = draftSortBy === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDraftSortBy(opt.value)}
                        className={`flex items-center justify-between p-2.5 px-3 rounded-lg border text-left transition-all min-h-[44px] text-xs ${
                          isSelected
                            ? "border-primary bg-primary/10 text-foreground font-semibold shadow-xs"
                            : "border-border bg-card/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        }`}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sentido da Ordenação */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Sentido
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDraftSortOrder("asc")}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-all min-h-[44px] text-xs ${
                      draftSortOrder === "asc"
                        ? "border-primary bg-primary/10 text-foreground font-semibold shadow-xs"
                        : "border-border bg-card/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    <ArrowUp className="h-3.5 w-3.5 text-primary" />
                    <span>Ascendente (A-Z)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDraftSortOrder("desc")}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-all min-h-[44px] text-xs ${
                      draftSortOrder === "desc"
                        ? "border-primary bg-primary/10 text-foreground font-semibold shadow-xs"
                        : "border-border bg-card/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    <ArrowDown className="h-3.5 w-3.5 text-primary" />
                    <span>Descendente (Z-A)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Secção de Intervalo de Datas Padrão */}
          {dateRangeConfig && (
            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {dateRangeConfig.label || "Período / Datas"}
                  </h4>
                </div>
                {(draftStartDate || draftEndDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setDraftStartDate(undefined)
                      setDraftEndDate(undefined)
                    }}
                    className="text-[11px] text-destructive hover:underline flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    <span>Limpar Datas</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Data de Início
                  </label>
                  <DatePicker
                    value={startDateObj}
                    onChange={(_, formatted) => setDraftStartDate(formatted || undefined)}
                    placeholder="Seleccionar início"
                    className="w-full rounded-lg text-xs min-h-[44px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Data de Fim
                  </label>
                  <DatePicker
                    value={endDateObj}
                    onChange={(_, formatted) => setDraftEndDate(formatted || undefined)}
                    placeholder="Seleccionar fim"
                    className="w-full rounded-lg text-xs min-h-[44px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Secções de Filtros de Selecção / Categorias */}
          {sections.map((section) => {
            const selected = draftFilters[section.id] || []
            return (
              <div key={section.id} className="py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </h4>
                  {selected.length > 0 && (
                    <span className="text-[11px] font-medium text-primary">
                      {selected.length} {selected.length === 1 ? "seleccionado" : "seleccionados"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {section.options.map((opt) => {
                    const isChecked = selected.includes(opt.value)
                    const inputId = `filter-${section.id}-${opt.value}`
                    return (
                      <div
                        key={opt.value}
                        onClick={() => handleToggleOption(section.id, opt.value, section.multiple ?? true)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer min-h-[44px] ${
                          isChecked
                            ? "border-primary bg-primary/5 text-foreground shadow-xs font-medium"
                            : "border-border bg-card/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={inputId}
                            checked={isChecked}
                            onCheckedChange={() => handleToggleOption(section.id, opt.value, section.multiple ?? true)}
                            className="pointer-events-none"
                          />
                          <Label htmlFor={inputId} className="cursor-pointer text-sm">
                            {opt.label}
                          </Label>
                        </div>
                        {opt.count !== undefined && (
                          <span className="text-xs font-mono text-muted-foreground/80 px-1.5 py-0.5 rounded bg-muted/60">
                            {opt.count}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Rodapé fixo com acções de toque confortável (min-h-[44px]) */}
        <SheetFooter className="shrink-0 border-t border-border px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-card/40 flex-row gap-3 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClearDraft}
            disabled={totalSelectedInDraft === 0}
            className="flex-1 h-11 min-h-[44px] gap-2 border-border text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/40"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Limpar Rascunho</span>
          </Button>

          <Button
            type="button"
            onClick={handleApplyFilters}
            className="flex-1 h-11 min-h-[44px] gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs"
          >
            <Check className="h-4 w-4" />
            <span>Aplicar Filtros</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

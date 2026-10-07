/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useId, useMemo, useRef, useState } from "react"
import { Table } from "@tanstack/react-table"
import {
  CircleAlertIcon,
  CircleXIcon,
  Columns3Icon,
  FilterIcon,
  ListFilterIcon,
  RotateCcw,
  TrashIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  MobileFilterBottomSheet,
  FilterSectionConfig,
} from "./mobile-filter-bottom-sheet"
import { SortFilter, SortOption } from "./sort-filter"
import { DateRangeFilter } from "./date-range-filter"

const COLUMN_LABEL_MAP: Record<string, string> = {
  name: "Nome / Entidade",
  taxId: "NIF Fiscal",
  taxid: "NIF Fiscal",
  email: "Email Comercial",
  phone: "Telefone",
  address: "Endereço",
  actions: "Acções",
  title: "Produção / Título",
  client: "Cliente / Produtora",
  clientName: "Cliente",
  productionStage: "Fase de Produção",
  stage: "Fase",
  lifecycleStatus: "Estado do Projecto",
  status: "Estado",
  responsible: "Responsável",
  dates: "Prazos / Datas",
  startDate: "Data de Início",
  endDate: "Data de Fim",
  createdAt: "Data de Registo",
  updatedAt: "Data de Actualização",
  serialNumber: "Nº de Série / Tag",
  category: "Categoria",
  location: "Localização",
  dailyRate: "Diária Interna",
  code: "Código",
  total: "Valor Total",
  currency: "Moeda",
  notes: "Observações",
  version: "Versão",
  role: "Função / Cargo",
  roles: "Funções",
  userEmail: "Email",
  userName: "Nome do Membro",
  projectRole: "Função Audiovisual",
  joinedAt: "Escalado em",
  filename: "Nome do Ficheiro",
  fileType: "Tipo de Ficheiro",
  sizeBytes: "Tamanho",
  priority: "Prioridade",
  membersCount: "Membros",
  projectsCount: "Projectos",
  equipmentCount: "Equipamentos",
  storageUsedGb: "Armazenamento",
  activeSessionsCount: "Sessões Activas",
  activeProjectsCount: "Projectos Activos",
}

function getColumnDisplayTitle(column: { id: string; columnDef: { header?: any } }): string {
  if (typeof column.columnDef.header === "string" && column.columnDef.header.trim().length > 0) {
    return column.columnDef.header
  }
  const idLower = column.id.toLowerCase()
  if (COLUMN_LABEL_MAP[column.id]) {
    return COLUMN_LABEL_MAP[column.id]
  }
  if (COLUMN_LABEL_MAP[idLower]) {
    return COLUMN_LABEL_MAP[idLower]
  }
  return column.id.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchableColumns?: string[]
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (val: string) => void
  filterableColumns?: {
    id: string
    title: string
    options?: {
      label: string
      value: string
    }[]
  }[]
  customFilters?: React.ReactNode
  mobileSections?: FilterSectionConfig[]
  appliedMobileFilters?: Record<string, string[]>
  onApplyMobileFilters?: (
    filters: Record<string, string[]>,
    extra?: {
      sortBy?: string
      sortOrder?: "asc" | "desc"
      startDate?: string
      endDate?: string
    }
  ) => void
  onClearFilters?: () => void
  sortFilter?: {
    options: SortOption[]
    sortBy: string
    sortOrder: "asc" | "desc"
    onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void
  }
  dateRangeFilter?: {
    label?: string
    startDate?: string
    endDate?: string
    onChange: (startDate?: string, endDate?: string) => void
  }
  enableColumnVisibility?: boolean
  onDelete?: (selectedRows: any[]) => void
  toolbar?: {
    actions?: React.ReactNode
    title?: string
    description?: string
  }
}

export function DataTableToolbar<TData>({
  table,
  searchableColumns = [],
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filterableColumns = [],
  customFilters,
  mobileSections = [],
  appliedMobileFilters = {},
  onApplyMobileFilters,
  onClearFilters,
  sortFilter,
  dateRangeFilter,
  enableColumnVisibility = true,
  onDelete,
  toolbar,
}: DataTableToolbarProps<TData>) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const searchColumn = searchableColumns[0]
  const searchColumnObj = searchColumn ? table.getColumn(searchColumn) : null
  const shouldShowSearch = Boolean(searchColumnObj || onSearchChange || searchPlaceholder)

  const handleDeleteRows = () => {
    if (onDelete) {
      const selectedRows = table.getSelectedRowModel().rows
      onDelete(selectedRows)
      table.resetRowSelection()
    }
  }

  // Prepara as secções para o MobileFilterBottomSheet
  const internalFilterSections: FilterSectionConfig[] = useMemo(() => {
    return filterableColumns.map((fc) => {
      const col = table.getColumn(fc.id)
      const options =
        fc.options ||
        (col
          ? Array.from(col.getFacetedUniqueValues().keys()).map((v) => ({
              label: String(v),
              value: String(v),
            }))
          : [])
      return {
        id: fc.id,
        title: fc.title,
        options,
      }
    })
  }, [filterableColumns, table])

  const effectiveFilterSections: FilterSectionConfig[] = useMemo(() => {
    return [...mobileSections, ...internalFilterSections]
  }, [mobileSections, internalFilterSections])

  // Mapeia os filtros actualmente aplicados em cada coluna
  const appliedFiltersMap: Record<string, string[]> = useMemo(() => {
    const map: Record<string, string[]> = { ...appliedMobileFilters }
    filterableColumns.forEach((fc) => {
      const col = table.getColumn(fc.id)
      const val = col?.getFilterValue() as string[] | undefined
      if (val && val.length > 0) {
        map[fc.id] = val
      }
    })
    return map
  }, [filterableColumns, table, appliedMobileFilters])

  // Contagem de filtros activos
  const totalActiveFilters = useMemo(() => {
    let count = Object.values(appliedFiltersMap).reduce(
      (acc, list) => acc + (list ? list.length : 0),
      0
    )
    if (dateRangeFilter?.startDate || dateRangeFilter?.endDate) {
      count += 1
    }
    if (
      sortFilter &&
      (sortFilter.sortBy !== (sortFilter.options[0]?.value || "createdAt") ||
        sortFilter.sortOrder !== "desc")
    ) {
      count += 1
    }
    return count
  }, [appliedFiltersMap, dateRangeFilter, sortFilter])

  const handleApplyMobileFilters = (
    newFilters: Record<string, string[]>,
    extra?: {
      sortBy?: string
      sortOrder?: "asc" | "desc"
      startDate?: string
      endDate?: string
    }
  ) => {
    if (onApplyMobileFilters) {
      onApplyMobileFilters(newFilters, extra)
    }
    Object.entries(newFilters).forEach(([colId, values]) => {
      const col = table.getColumn(colId)
      if (col) {
        col.setFilterValue(values.length > 0 ? values : undefined)
      }
    })
    if (sortFilter && extra?.sortBy && extra?.sortOrder) {
      sortFilter.onSortChange(extra.sortBy, extra.sortOrder)
    }
    if (dateRangeFilter && (extra?.startDate !== undefined || extra?.endDate !== undefined)) {
      dateRangeFilter.onChange(extra.startDate, extra.endDate)
    }
  }

  const handleClearAllFilters = () => {
    if (onClearFilters) {
      onClearFilters()
    }
    filterableColumns.forEach((fc) => {
      const col = table.getColumn(fc.id)
      if (col) {
        col.setFilterValue(undefined)
      }
    })
    if (dateRangeFilter) {
      dateRangeFilter.onChange(undefined, undefined)
    }
    if (sortFilter && sortFilter.options[0]) {
      sortFilter.onSortChange(sortFilter.options[0].value, "desc")
    }
  }

  const currentSearchValue = onSearchChange
    ? (searchValue ?? "")
    : ((searchColumnObj?.getFilterValue() ?? "") as string)

  return (
    <div className="space-y-4">
      {toolbar && (toolbar.title || toolbar.description) && (
        <div>
          {toolbar.title && (
            <h2 className="text-2xl font-semibold tracking-tight">{toolbar.title}</h2>
          )}
          {toolbar.description && (
            <p className="text-muted-foreground">{toolbar.description}</p>
          )}
        </div>
      )}

      {/* Barra de Filtros Responsiva e Unificada */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 w-full">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center w-full sm:w-auto">
          {shouldShowSearch && (
            <div className="relative w-full sm:w-64">
              <Input
                id={`${id}-input`}
                ref={inputRef}
                className={cn(
                  "peer w-full sm:w-64 ps-9 rounded-none border-border h-11 sm:h-9 text-base sm:text-xs min-h-[44px] sm:min-h-0",
                  Boolean(currentSearchValue) && "pe-9"
                )}
                value={currentSearchValue}
                onChange={(e) => {
                  if (onSearchChange) {
                    onSearchChange(e.target.value)
                  }
                  if (searchColumnObj) {
                    searchColumnObj.setFilterValue(e.target.value)
                  }
                }}
                placeholder={searchPlaceholder || `Pesquisar...`}
                type="text"
                aria-label={searchPlaceholder || `Filtrar registos`}
              />
              <div className="absolute inset-y-0 flex items-center justify-center pointer-events-none text-muted-foreground/80 start-0 ps-3 peer-disabled:opacity-50">
                <ListFilterIcon size={16} aria-hidden="true" />
              </div>
              {Boolean(currentSearchValue) && (
                <button
                  className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-none transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] min-w-[36px]"
                  aria-label="Limpar filtro"
                  onClick={() => {
                    if (onSearchChange) {
                      onSearchChange("")
                    }
                    if (searchColumnObj) {
                      searchColumnObj.setFilterValue("")
                    }
                    if (inputRef.current) {
                      inputRef.current.focus()
                    }
                  }}
                >
                  <CircleXIcon size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {/* Botão de Filtros Mobile (Bottom Sheet) */}
          {(effectiveFilterSections.length > 0 || Boolean(sortFilter) || Boolean(dateRangeFilter)) && (
            <div className="flex sm:hidden w-full items-center gap-2">
              <Button
                variant={totalActiveFilters > 0 ? "default" : "outline"}
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex-1 h-11 min-h-[44px] gap-2 rounded-none border-border text-xs font-semibold"
              >
                <FilterIcon className="h-4 w-4" />
                <span>Filtros</span>
                {totalActiveFilters > 0 && (
                  <Badge variant="secondary" className="px-1.5 py-0 text-xs font-mono rounded-none">
                    {totalActiveFilters}
                  </Badge>
                )}
              </Button>

              {totalActiveFilters > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearAllFilters}
                  className="h-11 min-h-[44px] px-3 rounded-none border-border text-xs text-destructive hover:text-destructive"
                  title="Limpar todos os filtros"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}

              {toolbar?.actions && (
                <div className="shrink-0 flex items-center">
                  {toolbar.actions}
                </div>
              )}
            </div>
          )}

          {/* Filtros em Linha para Desktop - Barra Unificada sem Repetições */}
          <div className="hidden sm:flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            {customFilters}

            {filterableColumns.map((filterConfig) => (
              <FilterDropdown
                key={filterConfig.id}
                table={table}
                column={filterConfig}
              />
            ))}

            {dateRangeFilter && (
              <DateRangeFilter
                label={dateRangeFilter.label}
                startDate={dateRangeFilter.startDate}
                endDate={dateRangeFilter.endDate}
                onChange={dateRangeFilter.onChange}
              />
            )}

            {sortFilter && (
              <SortFilter
                options={sortFilter.options}
                sortBy={sortFilter.sortBy}
                sortOrder={sortFilter.sortOrder}
                onSortChange={sortFilter.onSortChange}
              />
            )}

            {totalActiveFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAllFilters}
                className="h-9 px-2.5 text-xs text-destructive hover:bg-destructive/10 rounded-none gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Limpar filtros</span>
              </Button>
            )}

            {enableColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none rounded-none border-border h-10 sm:h-9 min-h-[44px] sm:min-h-0">
                    <Columns3Icon
                      className="-ms-1 opacity-60"
                      size={16}
                      aria-hidden="true"
                    />
                    <span>Colunas</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none">
                  <DropdownMenuLabel>Visualizar colunas</DropdownMenuLabel>
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        onSelect={(event) => event.preventDefault()}
                        className="text-xs"
                      >
                        {getColumnDisplayTitle(column)}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Modal Bottom Sheet Mobile */}
        <MobileFilterBottomSheet
          open={isMobileFilterOpen}
          onOpenChange={setIsMobileFilterOpen}
          sections={effectiveFilterSections}
          appliedFilters={appliedFiltersMap}
          sortConfig={sortFilter}
          dateRangeConfig={dateRangeFilter}
          onApply={handleApplyMobileFilters}
          onClear={handleClearAllFilters}
          title="Filtros de Tabela"
          description="Seleccione os critérios para refinar os registos apresentados."
        />

        {/* Acções à Direita no Desktop */}
        <div className="hidden sm:flex flex-row items-center gap-2 w-full sm:w-auto justify-end">
          {onDelete && table.getSelectedRowModel().rows.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full sm:w-auto h-10 sm:h-9 min-h-[44px] sm:min-h-0" variant="outline">
                  <TrashIcon
                    className="-ms-1 opacity-60"
                    size={16}
                    aria-hidden="true"
                  />
                  <span>Eliminar</span>
                  <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                    {table.getSelectedRowModel().rows.length}
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-lg mx-4">
                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                  <div
                    className="flex items-center justify-center border rounded-full size-9 shrink-0"
                    aria-hidden="true"
                  >
                    <CircleAlertIcon className="opacity-80" size={16} />
                  </div>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-left">
                      Tem a certeza absoluta?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-left">
                      Esta acção não pode ser desfeita. Isto irá eliminar permanentemente{" "}
                      {table.getSelectedRowModel().rows.length}{" "}
                      {table.getSelectedRowModel().rows.length === 1
                        ? "registo seleccionado"
                        : "registos seleccionados"}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                </div>
                <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
                  <AlertDialogCancel className="w-full sm:w-auto min-h-[44px] sm:min-h-0">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteRows}
                    className="w-full sm:w-auto min-h-[44px] sm:min-h-0 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {toolbar?.actions}
        </div>
      </div>
    </div>
  )
}

function FilterDropdown<TData>({
  table,
  column: filterConfig,
}: {
  table: Table<TData>
  column: {
    id: string
    title: string
    options?: {
      label: string
      value: string
    }[]
  }
}) {
  const id = useId()
  const column = table.getColumn(filterConfig.id)

  const uniqueValues = useMemo(() => {
    if (!column) return []

    if (filterConfig.options) {
      return filterConfig.options
    }

    const values = Array.from(column.getFacetedUniqueValues().keys())
    return values.map((value) => ({
      label: String(value),
      value: String(value),
    }))
  }, [column, filterConfig.options])

  const selectedValues = useMemo(() => {
    if (!column) return []
    const filterValue = column.getFilterValue() as string[]
    return filterValue ?? []
  }, [column])

  if (!column) return null

  const handleValueChange = (checked: boolean, value: string) => {
    const filterValue = column.getFilterValue() as string[]
    const newFilterValue = filterValue ? [...filterValue] : []

    if (checked) {
      newFilterValue.push(value)
    } else {
      const index = newFilterValue.indexOf(value)
      if (index > -1) {
        newFilterValue.splice(index, 1)
      }
    }

    column.setFilterValue(newFilterValue.length ? newFilterValue : undefined)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex-1 sm:flex-none rounded-none border-border">
          <FilterIcon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
          <span>{filterConfig.title}</span>
          {selectedValues.length > 0 && (
            <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded-none border px-1 font-[inherit] text-[0.625rem] font-medium">
              {selectedValues.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 min-w-36 rounded-none border-border" align="start">
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground">
            {filterConfig.title}
          </div>
          <div className="space-y-3">
            {uniqueValues.map((option, i) => (
              <div key={option.value} className="flex items-center gap-2">
                <Checkbox
                  id={`${id}-${i}`}
                  className="rounded-none"
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked: boolean) =>
                    handleValueChange(checked, option.value)
                  }
                />
                <Label
                  htmlFor={`${id}-${i}`}
                  className="flex justify-between gap-2 font-normal grow"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
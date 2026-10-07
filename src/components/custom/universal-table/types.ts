import { ColumnDef, FilterFn, Row } from "@tanstack/react-table"
import { ReactNode } from "react"
import { SortOption } from "./sort-filter"
import { FilterSectionConfig } from "./mobile-filter-bottom-sheet"

export interface DataTableConfig<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  searchableColumns?: string[]
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
  customFilters?: ReactNode
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
  enableSelection?: boolean
  enablePagination?: boolean
  enableSorting?: boolean
  enableColumnVisibility?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  onSelectionChange?: (selectedRows: Row<TData>[]) => void
  onDelete?: (selectedRows: Row<TData>[]) => void
  toolbar?: {
    actions?: ReactNode
    title?: string
    description?: string
  }
  emptyState?: {
    title?: string
    description?: string
    action?: ReactNode
  }
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
}

export interface DataTableFilterConfig {
  type: 'search' | 'select' | 'date' | 'range'
  id: string
  title: string
  placeholder?: string
  options?: Array<{
    label: string
    value: string
    count?: number
  }>
}

export interface DataTableAction<TData> {
  label: string
  icon?: ReactNode
  onClick: (rows: Row<TData>[]) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  disabled?: (rows: Row<TData>[]) => boolean
}

export interface DataTableRowAction<TData> {
  label: string
  icon?: ReactNode
  onClick: (row: Row<TData>) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  disabled?: (row: Row<TData>) => boolean
  shortcut?: string
}

export type DataTableFilterFn<TData> = FilterFn<TData>
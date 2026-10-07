"use client";
import { useEffect, useState } from "react";
import {
  Row,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
  Table as TanStackTable,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTableConfig } from "./types";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { Icon } from "@/components/common/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";

interface DataTableProps<TData> extends DataTableConfig<TData> {
  isLoading?: boolean;
  error?: string;
  renderMobileCard?: (row: Row<TData>) => React.ReactNode;
}

function DefaultMobileCard<TData>({ row }: { row: Row<TData> }) {
  const visibleCells = row.getVisibleCells().filter((c) => c.column.id !== "select");
  if (visibleCells.length === 0) return null;
  const primaryCell = visibleCells[0];
  const secondaryCells = visibleCells.slice(1);

  return (
    <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2.5 shadow-2xs hover:border-border transition-colors">
      <div className="font-semibold text-sm text-foreground border-b border-border/40 pb-2 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1 truncate">
          {flexRender(primaryCell.column.columnDef.cell, primaryCell.getContext())}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {secondaryCells.map((cell) => {
          const header = cell.column.columnDef.header;
          const label = typeof header === "string" ? header : cell.column.id;
          return (
            <div key={cell.id} className="space-y-0.5 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground truncate block">
                {label}
              </span>
              <div className="text-foreground font-normal truncate">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DataTable<TData>({
  data,
  columns: userColumns,
  searchKey,
  searchPlaceholder,
  searchableColumns = [],
  filterableColumns = [],
  customFilters,
  mobileSections,
  appliedMobileFilters,
  onApplyMobileFilters,
  onClearFilters,
  searchValue,
  onSearchChange,
  sortFilter,
  dateRangeFilter,
  enableSelection = false,
  enablePagination = true,
  enableSorting = true,
  enableColumnVisibility = true,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  onSelectionChange,
  onDelete,
  toolbar,
  emptyState,
  isLoading = false,
  error,
  renderMobileCard,
}: DataTableProps<TData>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const effectiveSearchableColumns = searchKey ? [searchKey, ...searchableColumns.filter(c => c !== searchKey)] : searchableColumns;

  const columns = enableSelection
    ? [
        {
          id: "select",
          header: ({ table }: { table: TanStackTable<TData> }) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          ),
          cell: ({ row }: { row: Row<TData> }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          ),
          size: 28,
          enableSorting: false,
          enableHiding: false,
        },
        ...userColumns,
      ]
    : userColumns;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection: enableSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableSortingRemoval: false,
  });

  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows;
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, onSelectionChange, table]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-32 text-destructive">
        <p>Erro ao carregar dados: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <DataTableToolbar
        table={table}
        searchableColumns={effectiveSearchableColumns}
        searchPlaceholder={searchPlaceholder}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        filterableColumns={filterableColumns}
        customFilters={customFilters}
        mobileSections={mobileSections}
        appliedMobileFilters={appliedMobileFilters}
        onApplyMobileFilters={onApplyMobileFilters}
        onClearFilters={onClearFilters}
        sortFilter={sortFilter}
        dateRangeFilter={dateRangeFilter}
        enableColumnVisibility={enableColumnVisibility}
        onDelete={onDelete}
        toolbar={toolbar}
      />

      <div className="hidden md:block overflow-hidden border border-border/70 rounded-none bg-card w-full">
        <div className="overflow-x-auto w-full">
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border/70 bg-muted/20">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{
                        width: (header.column.columnDef as any).size
                          ? `${(header.column.columnDef as any).size}px`
                          : undefined,
                      }}
                      className="h-10 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            "flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          }}
                          tabIndex={0}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: (
                              <Icon
                                size={16}
                                name="ChevronUp"
                                className="shrink-0 opacity-60"
                                aria-hidden="true"
                              />
                            ),
                            desc: (
                              <Icon
                                size={16}
                                name="ChevronDown"
                                className="shrink-0 opacity-60"
                                aria-hidden="true"
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <TableRow key={`skeleton-row-${rIdx}`} className="border-b border-border/40">
                    {columns.map((_, cIdx) => (
                      <TableCell key={`skeleton-cell-${rIdx}-${cIdx}`} className="px-4 py-3.5">
                        <Skeleton
                          className={cn(
                            "h-4 rounded-md",
                            cIdx === 0
                              ? "w-3/4"
                              : cIdx === 1
                              ? "w-1/2"
                              : cIdx === columns.length - 1
                              ? "w-16 ml-auto"
                              : "w-2/3"
                          )}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-muted/30 border-b border-border/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3 text-sm text-foreground">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="p-8 text-center"
                  >
                    <EmptyState
                      title={emptyState?.title || "Nenhum resultado encontrado"}
                      description={
                        emptyState?.description ||
                        "Não foram encontrados registos com os critérios especificados."
                      }
                      action={emptyState?.action}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 2. Mobile Cards View (< md) */}
      <div className="md:hidden w-full">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={`skeleton-card-${idx}`} className="rounded-none border border-border/70 bg-card p-4 space-y-3">
                <Skeleton className="h-5 w-3/4 rounded-none" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-4 w-1/2 rounded-none" />
                  <Skeleton className="h-4 w-2/3 rounded-none" />
                </div>
              </div>
            ))}
          </div>
        ) : table.getRowModel().rows?.length ? (
          <div className="grid grid-cols-1 gap-3">
            {table.getRowModel().rows.map((row) =>
              renderMobileCard ? (
                <div key={row.id}>{renderMobileCard(row)}</div>
              ) : (
                <DefaultMobileCard key={row.id} row={row} />
              )
            )}
          </div>
        ) : (
          <div className="rounded-none border border-border/70 bg-card p-6 text-center">
            <EmptyState
              title={emptyState?.title || "Nenhum resultado encontrado"}
              description={
                emptyState?.description ||
                "Não foram encontrados registos com os critérios especificados."
              }
              action={emptyState?.action}
            />
          </div>
        )}
      </div>

      {enablePagination && (
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      )}
    </div>
  );
}

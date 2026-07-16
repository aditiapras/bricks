"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
  FilterFn,
} from "@tanstack/react-table"
import { rankItem } from "@tanstack/match-sorter-utils"
import { ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// Fuzzy filter function
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

// Column configuration type
export interface ColumnConfig<TData, TValue> {
  column: ColumnDef<TData, TValue>
  enableFilter?: boolean
  filterPlaceholder?: string
  enableSort?: boolean
  defaultSort?: "asc" | "desc"
  filterOptions?: string[]
}

// DataTable props
interface DataTableProps<TData, TValue> {
  columns: ColumnConfig<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  enableGlobalSearch?: boolean
  enableColumnFilter?: boolean
  tableActions?: (selectedRows: TData[]) => React.ReactNode
  emptyState?: React.ReactNode
  pageSize?: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  enableGlobalSearch = true,
  enableColumnFilter = true,
  tableActions,
  emptyState,
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  // Add select column to the beginning
  const tableColumns = React.useMemo(() => {
    const selectColumn: ColumnDef<TData> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }

    return [selectColumn, ...columns.map((col) => col.column)]
  }, [columns])

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  const selectedRows = React.useMemo(() => {
    return table.getSelectedRowModel().rows.map((row) => row.original)
  }, [table.getSelectedRowModel()])

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between py-4 gap-4">
        <div className="flex flex-1 items-center gap-2">
          {enableGlobalSearch && (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-8 max-w-sm bg-background"
              />
              {globalFilter && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setGlobalFilter("")}
                >
                  <X data-icon="inline-end" />
                </Button>
              )}
            </div>
          )}

          {enableColumnFilter && (
            <div className="flex gap-2">
              {columns
                .filter((col) => col.enableFilter)
                .map((col, index) => {
                  const columnId = col.column.id || `column-${index}`
                  const column = table.getColumn(columnId)
                  if (!column) return null

                  // Get unique values for dropdown filter
                  const uniqueValues = React.useMemo(() => {
                    if (col.filterOptions) return col.filterOptions

                    const values = new Set<string>()
                    table.getFilteredRowModel().rows.forEach((row) => {
                      const value = row.getValue(columnId)
                      if (value !== null && value !== undefined) {
                        values.add(String(value))
                      }
                    })
                    return Array.from(values).sort()
                  }, [col.filterOptions, columnId, table.getFilteredRowModel()])

                  return (
                    <DropdownMenu key={columnId}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="bg-background capitalize">
                          {col.filterPlaceholder || `Filter by ${columnId}`}
                          <ChevronDown data-icon="inline-end" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[150px]">
                        <DropdownMenuCheckboxItem
                          checked={!column.getFilterValue()}
                          onCheckedChange={() => column.setFilterValue(undefined)}
                        >
                          All
                        </DropdownMenuCheckboxItem>
                        {uniqueValues.map((value) => (
                          <DropdownMenuCheckboxItem
                            key={value}
                            className="capitalize"
                            checked={column.getFilterValue() === value}
                            onCheckedChange={(checked) => {
                              column.setFilterValue(checked ? value : undefined)
                            }}
                          >
                            {value}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Table Actions */}
          {tableActions && selectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              {tableActions(selectedRows)}
            </div>
          )}

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-background">
                Columns <ChevronDown data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted">
                {headerGroup.headers.map((header) => {
                  const columnConfig = columns.find((col) => col.column.id === header.id || col.column.id === undefined)
                  const enableSort = columnConfig?.enableSort !== false

                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "flex items-center gap-2",
                            enableSort && header.column.getCanSort() && "cursor-pointer select-none hover:text-primary"
                          )}
                          onClick={enableSort && header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {enableSort && header.column.getIsSorted() === "asc" && (
                            <ChevronDown className="size-3 rotate-180" />
                          )}
                          {enableSort && header.column.getIsSorted() === "desc" && (
                            <ChevronDown className="size-3" />
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  {emptyState || "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-xs text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}

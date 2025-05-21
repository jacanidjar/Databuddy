import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ListFilterIcon, DatabaseIcon, ArrowUpDown, ArrowDown, ArrowUp, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { type ColumnDef, type RowData, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, type SortingState, type PaginationState } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";

interface DataTableProps<TData extends RowData, TValue> {
  data: TData[] | undefined;
  columns: ColumnDef<TData, TValue>[];
  title: string;
  description?: string;
  isLoading?: boolean;
  initialPageSize?: number;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: TData) => void;
  minHeight?: string | number;
}

export function DataTable<TData extends RowData, TValue>(
  {
    data,
    columns,
    title,
    description,
    isLoading = false,
    initialPageSize,
    emptyMessage = "No data available",
    className,
    onRowClick,
    minHeight = 200
  }: DataTableProps<TData, TValue>
) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize ?? 10,
  });

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const displayData = table.getRowModel().rows;

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="px-3 flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <h3 className="font-semibold text-foreground tracking-tight text-sm md:text-base leading-tight">{title}</h3>
            {description && (
              <div className="text-xs md:text-sm text-muted-foreground mt-0.5 leading-snug">{description}</div>
            )}
          </div>
          <Input 
            placeholder="Search all columns..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="h-8 max-w-xs text-xs"
          />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="space-y-1.5" style={{ minHeight }}>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="px-3 flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <h3 className="font-semibold text-foreground tracking-tight text-sm md:text-base leading-tight">{title}</h3>
          {description && (
            <div className="text-xs md:text-sm text-muted-foreground mt-0.5 leading-snug">{description}</div>
          )}
        </div>
        <Input 
          placeholder="Search all columns..."
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="h-8 max-w-xs text-xs"
        />
      </CardHeader>
      <CardContent className="px-3 pb-2">
        {!table.getRowModel().rows.length ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-xs" style={{ minHeight }}>
            <div className="relative mb-3">
              <ListFilterIcon className="h-10 w-10 text-muted-foreground/30" strokeWidth={1} />
              <DatabaseIcon className="h-4 w-4 text-primary absolute -bottom-1 -right-1" />
            </div>
            <p className="text-center max-w-[200px]">{emptyMessage}</p>
            <p className="text-center text-[10px] text-muted-foreground/70 mt-1">
              Data will appear here once collected
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border" style={{ minHeight }}>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                    {headerGroup.headers.map(header => (
                      <TableHead 
                        key={header.id}
                        className={cn(
                          "h-7 text-[11px] font-medium select-none",
                          (header.column.columnDef.meta as any)?.className,
                          header.column.getCanSort() ? 'cursor-pointer' : ''
                        )}
                        style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {header.column.getCanSort() && !header.column.getIsSorted() && <ArrowUpDown className="h-3 w-3 text-muted-foreground/70" />}
                          {header.column.getIsSorted() === 'asc' && <ArrowUp className="h-3 w-3 text-primary" />}
                          {header.column.getIsSorted() === 'desc' && <ArrowDown className="h-3 w-3 text-primary" />}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {displayData.map((row, rowIndex) => (
                  <TableRow 
                    key={row.id}
                    className={cn(
                      "h-8 hover:bg-muted/30",
                      rowIndex % 2 === 0 ? "" : "bg-muted/20",
                      onRowClick ? "cursor-pointer" : ""
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell 
                        key={cell.id}
                        className={cn(
                          "py-1.5 px-3 text-xs",
                          (cell.column.columnDef.meta as any)?.className
                        )}
                        style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {(table.getFilteredRowModel().rows.length > 0 || table.getPageCount() > 1) && (
          <div className="flex items-center justify-between pt-3 text-xs">
            <div className="flex-1 text-muted-foreground">
              {(() => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                const filteredRowCount = table.getFilteredRowModel().rows.length;
                const firstVisibleRow = pageIndex * pageSize + 1;
                const lastVisibleRow = Math.min(firstVisibleRow + pageSize - 1, filteredRowCount);
                if (filteredRowCount === 0 && !globalFilter) return "No data available";
                if (filteredRowCount === 0 && globalFilter) return "No results found";
                return `Showing ${firstVisibleRow}-${lastVisibleRow} of ${filteredRowCount} rows`;
              })()}
            </div>
            {table.getPageCount() > 1 && (
              <div className="flex items-center space-x-1">

                <Button
                  variant="outline"
                  className="h-7 w-7 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </Button>
                  <span className="text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1}/{table.getPageCount()}
                  </span>
                <Button
                  variant="outline"
                  className="h-7 w-7 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
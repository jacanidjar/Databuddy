import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ListFilterIcon, DatabaseIcon, ArrowUpDown, ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { type ColumnDef, type RowData, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, type SortingState, type PaginationState } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";

interface TabConfig<TData> {
  id: string;
  label: string;
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
}

interface DataTableProps<TData extends RowData, TValue> {
  data?: TData[] | undefined;
  columns?: ColumnDef<TData, TValue>[];
  tabs?: TabConfig<TData>[];
  title: string;
  description?: string;
  isLoading?: boolean;
  initialPageSize?: number;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: TData) => void;
  minHeight?: string | number;
  showSearch?: boolean;
}

// Helper function to get percentage value from row data
function getRowPercentage(row: any): number {
  // Try to find percentage in common property names
  if (typeof row.percentage === 'number') return row.percentage;
  if (typeof row.percent === 'number') return row.percent;
  if (typeof row.share === 'number') return row.share;
  return 0;
}

// Enhanced helper function for gradient colors with sophisticated aesthetics
function getPercentageGradient(percentage: number): { 
  background: string; 
  hoverBackground: string;
  borderColor: string;
  accentColor: string;
  glowColor: string;
} {
  if (percentage >= 50) {
    return {
      background: `linear-gradient(90deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.15) ${percentage * 0.8}%, rgba(34, 197, 94, 0.12) ${percentage}%, rgba(34, 197, 94, 0.02) ${percentage + 5}%, transparent 100%)`,
      hoverBackground: `linear-gradient(90deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.22) ${percentage * 0.8}%, rgba(34, 197, 94, 0.18) ${percentage}%, rgba(34, 197, 94, 0.04) ${percentage + 5}%, transparent 100%)`,
      borderColor: 'rgba(34, 197, 94, 0.3)',
      accentColor: 'rgba(34, 197, 94, 0.8)',
      glowColor: 'rgba(34, 197, 94, 0.2)'
    };
  }
  if (percentage >= 25) {
    return {
      background: `linear-gradient(90deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.15) ${percentage * 0.8}%, rgba(59, 130, 246, 0.12) ${percentage}%, rgba(59, 130, 246, 0.02) ${percentage + 5}%, transparent 100%)`,
      hoverBackground: `linear-gradient(90deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.22) ${percentage * 0.8}%, rgba(59, 130, 246, 0.18) ${percentage}%, rgba(59, 130, 246, 0.04) ${percentage + 5}%, transparent 100%)`,
      borderColor: 'rgba(59, 130, 246, 0.3)',
      accentColor: 'rgba(59, 130, 246, 0.8)',
      glowColor: 'rgba(59, 130, 246, 0.2)'
    };
  }
  if (percentage >= 10) {
    return {
      background: `linear-gradient(90deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.15) ${percentage * 0.8}%, rgba(245, 158, 11, 0.12) ${percentage}%, rgba(245, 158, 11, 0.02) ${percentage + 5}%, transparent 100%)`,
      hoverBackground: `linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.22) ${percentage * 0.8}%, rgba(245, 158, 11, 0.18) ${percentage}%, rgba(245, 158, 11, 0.04) ${percentage + 5}%, transparent 100%)`,
      borderColor: 'rgba(245, 158, 11, 0.3)',
      accentColor: 'rgba(245, 158, 11, 0.8)',
      glowColor: 'rgba(245, 158, 11, 0.2)'
    };
  }
  return {
    background: `linear-gradient(90deg, rgba(107, 114, 128, 0.06) 0%, rgba(107, 114, 128, 0.12) ${percentage * 0.8}%, rgba(107, 114, 128, 0.1) ${percentage}%, rgba(107, 114, 128, 0.02) ${percentage + 5}%, transparent 100%)`,
    hoverBackground: `linear-gradient(90deg, rgba(107, 114, 128, 0.1) 0%, rgba(107, 114, 128, 0.18) ${percentage * 0.8}%, rgba(107, 114, 128, 0.15) ${percentage}%, rgba(107, 114, 128, 0.03) ${percentage + 5}%, transparent 100%)`,
    borderColor: 'rgba(107, 114, 128, 0.2)',
    accentColor: 'rgba(107, 114, 128, 0.7)',
    glowColor: 'rgba(107, 114, 128, 0.15)'
  };
}

// Enhanced skeleton loading component
const EnhancedSkeleton = ({ minHeight }: { minHeight: string | number }) => (
  <div className="space-y-3 animate-pulse" style={{ minHeight }}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24 rounded-md" />
      <Skeleton className="h-8 w-32 rounded-lg" />
    </div>
    <div className="space-y-2">
      {Array.from({ length: 5 }, (_, index) => index).map((itemIndex) => (
        <div key={`skeleton-${itemIndex}`} className="flex items-center space-x-4 p-3 bg-muted/20 rounded-lg animate-pulse">
          <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-16 rounded-sm" />
              <Skeleton className="h-3 w-12 rounded-sm" />
              <Skeleton className="h-3 w-8 rounded-sm" />
            </div>
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-4 w-12 rounded-md" />
            <Skeleton className="h-3 w-8 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export function DataTable<TData extends RowData, TValue>(
  {
    data,
    columns,
    tabs,
    title,
    description,
    isLoading = false,
    initialPageSize,
    emptyMessage = "No data available",
    className,
    onRowClick,
    minHeight = 200,
    showSearch = true
  }: DataTableProps<TData, TValue>
) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize ?? 10,
  });
  const [activeTab, setActiveTab] = React.useState(tabs?.[0]?.id || '');
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Use tab data if tabs are provided, otherwise use direct data/columns
  const currentTabData = tabs?.find(tab => tab.id === activeTab);
  const tableData = React.useMemo(() => currentTabData?.data || data || [], [currentTabData?.data, data]);
  const tableColumns = React.useMemo(() => currentTabData?.columns || columns || [], [currentTabData?.columns, columns]);

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    state: {
      sorting,
      globalFilter: showSearch ? globalFilter : '',
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

  // Enhanced tab switching with transition
  const handleTabChange = React.useCallback((tabId: string) => {
    if (tabId === activeTab) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tabId);
      // Reset pagination when switching tabs
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
      setIsTransitioning(false);
    }, 150);
  }, [activeTab]);

  if (isLoading) {
    return (
      <Card className={cn("w-full border-0 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden", className)}>
        <CardHeader className="px-3 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Skeleton className="h-5 w-32 rounded-md" />
              {description && <Skeleton className="h-3 w-48 rounded-sm mt-0.5" />}
            </div>
            {showSearch && (
              <div className="flex-shrink-0">
                <Skeleton className="h-7 w-36 rounded-md" />
              </div>
            )}
          </div>
          
          {/* Enhanced tabs loading state */}
          {tabs && tabs.length > 1 && (
            <div className="mt-3">
              <div className="flex gap-0.5 p-0.5 bg-muted/20 rounded-lg">
                {tabs.map((tab) => (
                  <Skeleton key={tab.id} className="h-8 w-20 rounded-md" />
                ))}
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <EnhancedSkeleton minHeight={minHeight} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full border-0 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden", className)}>
      <CardHeader className="px-3 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          
          {showSearch && (
            <div className="relative flex-shrink-0">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
              <Input 
                placeholder="Filter data..."
                value={globalFilter ?? ''}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="h-7 w-36 pl-7 pr-2 text-xs bg-muted/30 border-0 focus:bg-background focus:ring-1 focus:ring-primary/20"
                aria-label={`Search ${title}`}
              />
            </div>
          )}
        </div>
        
        {/* Enhanced Internal Tabs */}
        {tabs && tabs.length > 1 && (
          <div className="mt-3">
            <nav className="flex gap-0.5 p-0.5 bg-muted/40 rounded-lg" role="tablist" aria-label="Data view options">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const itemCount = tab.data?.length || 0;
                
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    disabled={isTransitioning}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`tabpanel-${tab.id}`}
                    tabIndex={isActive ? 0 : -1}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1",
                      "disabled:opacity-60",
                      isActive 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                    )}
                  >
                    <span>{tab.label}</span>
                    {itemCount > 0 && (
                      <span className={cn(
                        "inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-semibold",
                        isActive 
                          ? "bg-primary/15 text-primary" 
                          : "bg-muted-foreground/20 text-muted-foreground/70"
                      )}>
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="px-3 pb-2 overflow-hidden">
        <div className={cn(
          "transition-all duration-300 ease-out relative",
          isTransitioning && "opacity-40 scale-[0.98]"
        )}>
          {/* Transition loading overlay */}
          {isTransitioning && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-20 flex items-center justify-center">
              <div className="flex items-center gap-2 px-3 py-2 bg-background/80 rounded-lg border border-border/50 shadow-sm">
                <div className="w-3 h-3 bg-primary/60 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground">Loading...</span>
              </div>
            </div>
          )}
          
          {!table.getRowModel().rows.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center" style={{ minHeight }}>
              <div className="mb-4">
                <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mb-3 mx-auto">
                  {globalFilter ? (
                    <Search className="h-7 w-7 text-muted-foreground/50" />
                  ) : (
                    <DatabaseIcon className="h-7 w-7 text-muted-foreground/50" />
                  )}
                </div>
              </div>
              <h4 className="text-base font-medium text-foreground mb-2">
                {globalFilter ? 'No results found' : emptyMessage}
              </h4>
              <p className="text-sm text-muted-foreground max-w-[280px] mb-4">
                {globalFilter 
                  ? `No data matches your search for "${globalFilter}". Try adjusting your search terms.`
                  : 'Data will appear here when available and ready to display.'
                }
              </p>
              {globalFilter && (
                <button
                  onClick={() => setGlobalFilter('')}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/15 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div 
              className="overflow-hidden rounded-lg border border-border/50 bg-background/50 relative" 
              style={{ minHeight }}
              role="tabpanel"
              id={`tabpanel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
            >
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id} className="bg-muted/20 border-border/30 sticky top-0 z-10">
                      {headerGroup.headers.map(header => (
                        <TableHead 
                          key={header.id}
                          className={cn(
                            "h-11 text-xs font-semibold px-4 text-muted-foreground uppercase tracking-wide bg-muted/20 backdrop-blur-sm",
                            (header.column.columnDef.meta as any)?.className,
                            header.column.getCanSort() 
                              ? 'cursor-pointer hover:text-foreground hover:bg-muted/30 transition-all duration-200 select-none group' 
                              : 'select-none'
                          )}
                          style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                          onClick={header.column.getToggleSortingHandler()}
                          tabIndex={header.column.getCanSort() ? 0 : -1}
                          role={header.column.getCanSort() ? "button" : undefined}
                          aria-sort={
                            header.column.getIsSorted() === 'asc' ? 'ascending' :
                            header.column.getIsSorted() === 'desc' ? 'descending' : 
                            header.column.getCanSort() ? 'none' : undefined
                          }
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="truncate">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </span>
                            {header.column.getCanSort() && (
                              <div className="flex flex-col items-center justify-center w-3 h-3">
                                {!header.column.getIsSorted() && (
                                  <ArrowUpDown className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
                                )}
                                {header.column.getIsSorted() === 'asc' && (
                                  <ArrowUp className="h-3 w-3 text-primary" />
                                )}
                                {header.column.getIsSorted() === 'desc' && (
                                  <ArrowDown className="h-3 w-3 text-primary" />
                                )}
                              </div>
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody className="overflow-hidden">
                  {displayData.map((row, rowIndex) => {
                    const percentage = getRowPercentage(row.original);
                    const gradient = getPercentageGradient(percentage);
                    
                    return (
                      <TableRow 
                        key={row.id}
                        className={cn(
                          "h-12 border-border/20 relative transition-all duration-200 animate-in fade-in-0",
                          "hover:bg-muted/20 focus-within:bg-muted/20",
                          onRowClick && "cursor-pointer hover:bg-muted/30 focus-within:bg-muted/30 active:bg-muted/40",
                          rowIndex % 2 === 0 ? "bg-background/50" : "bg-muted/10"
                        )}
                        onClick={() => onRowClick?.(row.original)}
                        tabIndex={onRowClick ? 0 : -1}
                        role={onRowClick ? "button" : undefined}
                        aria-label={onRowClick ? `View details for row ${rowIndex + 1}` : undefined}
                        onKeyDown={(e) => {
                          if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            onRowClick(row.original);
                          }
                        }}
                        style={{
                          background: percentage > 0 ? gradient.background : undefined,
                          boxShadow: percentage > 0 ? `inset 3px 0 0 ${gradient.borderColor}` : undefined,
                          animationDelay: `${rowIndex * 30}ms`,
                          animationFillMode: 'both'
                        }}
                        onMouseEnter={(e) => {
                          if (percentage > 0) {
                            const target = e.currentTarget as HTMLElement;
                            target.style.background = gradient.hoverBackground;
                          } else {
                            const target = e.currentTarget as HTMLElement;
                          }
                        }}
                        onMouseLeave={(e) => {
                          const target = e.currentTarget as HTMLElement;
                          if (percentage > 0) {
                            target.style.background = gradient.background;
                            target.style.boxShadow = `inset 3px 0 0 ${gradient.borderColor}`;
                          } else {
                            target.style.boxShadow = '';
                          }
                        }}
                      >
                        {row.getVisibleCells().map((cell, cellIndex) => (
                          <TableCell 
                            key={cell.id}
                            className={cn(
                              "py-3 text-sm font-medium transition-colors duration-150 px-4",
                              cellIndex === 0 && "font-semibold text-foreground",
                              (cell.column.columnDef.meta as any)?.className
                            )}
                            style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}
                          >
                            <div className="truncate">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced pagination */}
        {(table.getFilteredRowModel().rows.length > table.getState().pagination.pageSize || table.getPageCount() > 1) && (
          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {(() => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                const filteredRowCount = table.getFilteredRowModel().rows.length;
                const totalRowCount = (data || []).length;
                const firstVisibleRow = pageIndex * pageSize + 1;
                const lastVisibleRow = Math.min(firstVisibleRow + pageSize - 1, filteredRowCount);
                
                return (
                  <>
                    <span className="font-medium">
                      {firstVisibleRow}-{lastVisibleRow} of {filteredRowCount}
                    </span>
                    {filteredRowCount !== totalRowCount && (
                      <span className="text-muted-foreground/60">
                        (filtered from {totalRowCount})
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
            
            {table.getPageCount() > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-muted/50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                
                <div className="flex items-center gap-1 px-2 py-1 bg-muted/20 rounded-md">
                  <span className="text-xs font-medium min-w-0">
                    {table.getState().pagination.pageIndex + 1}
                  </span>
                  <span className="text-xs text-muted-foreground/70">/</span>
                  <span className="text-xs text-muted-foreground">
                    {table.getPageCount()}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-muted/50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
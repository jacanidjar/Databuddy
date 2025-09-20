import {
	ArrowDownIcon,
	ArrowsDownUpIcon,
	ArrowUpIcon,
	DatabaseIcon,
	MagnifyingGlassIcon,
	XIcon,
} from '@phosphor-icons/react';
import { flexRender, type Table } from '@tanstack/react-table';
import { Fragment, useCallback, useState } from 'react';
import {
	TableBody,
	TableCell,
	Table as TableComponent,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useTableRowPercentage } from '../hooks/use-table-row-percentage';

interface TableContentProps<TData extends { name: string | number }> {
	table: Table<TData>;
	title?: string;
	minHeight?: string | number;
	expandable?: boolean;
	getSubRows?: (row: TData) => TData[] | undefined;
	renderSubRow?: (
		subRow: TData,
		parentRow: TData,
		index: number
	) => React.ReactNode;
	onAddFilter?: (field: string, value: string, tableTitle?: string) => void;
	onRowAction?: (row: TData) => void;
	onRowClick?: (field: string, value: string | number) => void;
	tabs?: any[];
	activeTab?: string;
	emptyMessage?: string;
	globalFilter?: string;
	onGlobalFilterChange?: (value: string) => void;
	className?: string;
}

export function TableContent<TData extends { name: string | number }>({
	table,
	title,
	minHeight = 200,
	expandable = false,
	getSubRows,
	renderSubRow,
	onAddFilter,
	onRowAction,
	onRowClick,
	tabs,
	activeTab,
	emptyMessage = 'No data available',
	globalFilter,
	onGlobalFilterChange,
	className,
}: TableContentProps<TData>) {
	const [expandedRow, setExpandedRow] = useState<string | null>(null);
	const { getRowPercentage, getRowGradient, hasPercentageColumn } =
		useTableRowPercentage();

	const toggleRowExpansion = useCallback((rowId: string) => {
		setExpandedRow((prev) => (prev === rowId ? null : rowId));
	}, []);

	const displayData = table.getRowModel().rows;
	const tableData = displayData.map((row) => row.original);
	const hasPercentageData = hasPercentageColumn(tableData);

	if (!displayData.length) {
		return (
			<div
				className="flex flex-col items-center justify-center py-8 text-center sm:py-16"
				style={{ minHeight }}
			>
				<div className="mb-4">
					<div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/20">
						{globalFilter ? (
							<MagnifyingGlassIcon className="h-7 w-7 text-muted-foreground/50" />
						) : (
							<DatabaseIcon className="h-7 w-7 text-muted-foreground/50" />
						)}
					</div>
				</div>
				<h4 className="mb-2 font-medium text-base text-foreground">
					{globalFilter ? 'No results found' : emptyMessage}
				</h4>
				<p className="mb-4 max-w-sm text-muted-foreground text-sm">
					{globalFilter
						? `No data matches your search for "${globalFilter}". Try adjusting your search terms.`
						: 'Data will appear here when available and ready to display.'}
				</p>
				{globalFilter && onGlobalFilterChange && (
					<button
						className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 font-medium text-primary text-sm transition-colors hover:bg-primary/15 hover:text-primary/80"
						onClick={() => onGlobalFilterChange('')}
						type="button"
					>
						<XIcon className="h-4 w-4" />
						Clear search
					</button>
				)}
			</div>
		);
	}

	return (
		<div
			aria-labelledby={`tab-${activeTab}`}
			className={cn(
				'custom-scrollbar relative overflow-auto border-sidebar-border bg-sidebar',
				className
			)}
			id={`tabpanel-${activeTab}`}
			role="tabpanel"
			style={{ height: minHeight }}
		>
			<TableComponent className="w-full table-fixed">
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow
							className="sticky top-0 z-10 border-sidebar-border/30 bg-sidebar-accent"
							key={headerGroup.id}
						>
							{headerGroup.headers.map((header) => (
								<TableHead
									aria-sort={
										header.column.getIsSorted() === 'asc'
											? 'ascending'
											: header.column.getIsSorted() === 'desc'
												? 'descending'
												: header.column.getCanSort()
													? 'none'
													: undefined
									}
									className={cn(
										'h-10 bg-sidebar-accent px-2 font-semibold text-sidebar-foreground/70 text-xs uppercase tracking-wide',
										(header.column.columnDef.meta as any)?.className,
										header.column.getCanSort()
											? 'group cursor-pointer select-none transition-colors hover:text-sidebar-foreground'
											: 'select-none'
									)}
									key={header.id}
									onClick={header.column.getToggleSortingHandler()}
									onKeyDown={(e) => {
										if (
											header.column.getCanSort() &&
											(e.key === 'Enter' || e.key === ' ')
										) {
											e.preventDefault();
											header.column.getToggleSortingHandler()?.(e);
										}
									}}
									role={header.column.getCanSort() ? 'button' : undefined}
									style={{
										width:
											header.getSize() !== 150
												? `${Math.min(header.getSize(), 300)}px`
												: undefined,
										maxWidth: '300px',
										minWidth: '80px',
									}}
									tabIndex={header.column.getCanSort() ? 0 : -1}
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
											<div className="flex h-3 w-3 flex-col items-center justify-center">
												{!header.column.getIsSorted() && (
													<ArrowsDownUpIcon className="h-3 w-3 text-sidebar-foreground/40 transition-colors group-hover:text-sidebar-foreground/70" />
												)}
												{header.column.getIsSorted() === 'asc' && (
													<ArrowUpIcon className="h-3 w-3 text-sidebar-ring" />
												)}
												{header.column.getIsSorted() === 'desc' && (
													<ArrowDownIcon className="h-3 w-3 text-sidebar-ring" />
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
						const subRows =
							expandable && getSubRows ? getSubRows(row.original) : undefined;
						const hasSubRows = subRows && subRows.length > 0;
						const isExpanded = expandedRow === row.id;
						const percentage = hasPercentageData
							? getRowPercentage(row.original)
							: 0;
						const gradient = hasPercentageData
							? getRowGradient(row.original)
							: null;

						return (
							<Fragment key={row.id}>
								<TableRow
									className={cn(
										'relative h-11 border-border/20 pl-3 transition-all duration-300 ease-in-out',
										(onRowClick && !hasSubRows) ||
											hasSubRows ||
											onAddFilter ||
											onRowAction
											? 'cursor-pointer'
											: '',
										!(percentage > 0 && gradient) &&
											(rowIndex % 2 === 0 ? 'bg-background/50' : 'bg-muted/10')
									)}
									onClick={() => {
										if (hasSubRows) {
											toggleRowExpansion(row.id);
										} else if (onRowAction) {
											onRowAction(row.original);
										} else if (onAddFilter && row.original.name) {
											const activeTabConfig = tabs?.find(
												(tab) => tab.id === activeTab
											);
											const filterFunc = activeTabConfig?.getFilter;
											if (!filterFunc) {
												return;
											}

											const { field, value } = filterFunc(row.original);
											onAddFilter(field, value, title);
										} else if (onRowClick) {
											onRowClick('name', row.original.name);
										}
									}}
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											e.currentTarget.click();
										}
									}}
									role={
										(onRowClick && !hasSubRows) ||
										hasSubRows ||
										onAddFilter ||
										onRowAction
											? 'button'
											: undefined
									}
									style={{
										background:
											percentage > 0 && gradient
												? gradient.background
												: undefined,
										boxShadow:
											percentage > 0 && gradient
												? `inset 3px 0 0 0 ${gradient.accentColor}`
												: undefined,
									}}
									tabIndex={
										(onRowClick && !hasSubRows) ||
										hasSubRows ||
										onAddFilter ||
										onRowAction
											? 0
											: -1
									}
								>
									{row.getVisibleCells().map((cell, cellIndex) => (
										<TableCell
											className={cn(
												'px-2 py-2 font-medium text-sm transition-colors',
												cellIndex === 0 &&
													'font-semibold text-sidebar-foreground',
												'text-sidebar-foreground/80',
												(cell.column.columnDef.meta as any)?.className
											)}
											key={cell.id}
											style={{
												width:
													cell.column.getSize() !== 150
														? `${Math.min(cell.column.getSize(), 300)}px`
														: undefined,
												maxWidth: '300px',
												minWidth: '80px',
											}}
										>
											<div className="flex items-center gap-2">
												{cellIndex === 0 && hasSubRows && (
													<button
														aria-label={
															isExpanded ? 'Collapse row' : 'Expand row'
														}
														className="flex-shrink-0 rounded p-0.5 transition-colors hover:bg-sidebar-accent/60"
														onClick={(e) => {
															e.stopPropagation();
															toggleRowExpansion(row.id);
														}}
														type="button"
													>
														{isExpanded ? (
															<ArrowDownIcon className="h-3.5 w-3.5 text-sidebar-foreground/70" />
														) : (
															<ArrowUpIcon className="h-3.5 w-3.5 text-sidebar-foreground/70" />
														)}
													</button>
												)}
												<div className="flex-1 overflow-hidden truncate">
													<div className="truncate">
														{flexRender(
															cell.column.columnDef.cell,
															cell.getContext()
														)}
													</div>
												</div>
											</div>
										</TableCell>
									))}
								</TableRow>

								{hasSubRows &&
									isExpanded &&
									subRows.map((subRow, subIndex) => (
										<TableRow
											className="border-sidebar-border/10 bg-sidebar-accent/5 transition-colors hover:bg-sidebar-accent/10"
											key={`${row.id}-sub-${subIndex}`}
										>
											{renderSubRow ? (
												<TableCell
													className="p-0"
													colSpan={row.getVisibleCells().length}
												>
													{renderSubRow(subRow, row.original, subIndex)}
												</TableCell>
											) : (
												row.getVisibleCells().map((cell, cellIndex) => (
													<TableCell
														className={cn(
															'py-2 text-sidebar-foreground/70 text-sm',
															cellIndex === 0 ? 'pl-8' : 'px-2'
														)}
														key={`sub-${cell.id}`}
														style={{
															width:
																cell.column.getSize() !== 150
																	? `${Math.min(cell.column.getSize(), 300)}px`
																	: undefined,
															maxWidth: '300px',
															minWidth: '80px',
														}}
													>
														<div className="truncate">
															{cellIndex === 0 ? (
																<span className="text-xs">
																	↳ {(subRow as any)[cell.column.id] || ''}
																</span>
															) : (
																(subRow as any)[cell.column.id] || ''
															)}
														</div>
													</TableCell>
												))
											)}
										</TableRow>
									))}
							</Fragment>
						);
					})}
				</TableBody>
			</TableComponent>
		</div>
	);
}

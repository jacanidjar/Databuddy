'use client';

import type { ErrorTab } from '@databuddy/shared';
import dynamic from 'next/dynamic';
import {
	createErrorTypeColumns,
	createPageColumn,
	errorColumns,
} from './error-table-columns';

// Dynamically import DataTable for better performance
const DataTable = dynamic(
	() =>
		import('@/components/analytics/data-table').then((mod) => ({
			default: mod.DataTable,
		})),
	{
		ssr: false,
		loading: () => <div className="h-96 animate-pulse rounded bg-muted/20" />,
	}
);

interface ErrorDataTableProps {
	processedData: {
		error_types: Record<string, unknown>[];
		errors_by_page: Record<string, unknown>[];
	};
	isLoading: boolean;
	isRefreshing: boolean;
}

export const ErrorDataTable = ({
	processedData,
	isLoading,
	isRefreshing,
}: ErrorDataTableProps) => {
	const errorTabs: ErrorTab[] = [
		{
			id: 'error_types',
			label: 'Error Types',
			data: processedData.error_types,
			columns: createErrorTypeColumns(),
		},
		{
			id: 'errors_by_page',
			label: 'By Page',
			data: processedData.errors_by_page,
			columns: [createPageColumn(), ...errorColumns],
		},
	];

	return (
		<DataTable
			description="Comprehensive error breakdown across different dimensions"
			initialPageSize={15}
			isLoading={isLoading || isRefreshing}
			minHeight={400}
			tabs={errorTabs}
			title="Error Analysis"
		/>
	);
};

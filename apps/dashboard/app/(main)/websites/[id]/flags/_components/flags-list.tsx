'use client';

import { FlagIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { EmptyState } from './empty-state';
import { FlagRow } from './flag-row';
import type { Flag } from './types';

interface FlagsListProps {
	flags: Flag[];
	isLoading: boolean;
	onCreateFlag: () => void;
	onEditFlag: (flag: Flag) => void;
}

type FlagStatus = 'active' | 'inactive' | 'archived';

export function FlagsList({
	flags,
	isLoading,
	onCreateFlag,
	onEditFlag,
}: FlagsListProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<FlagStatus | 'all'>('all');

	const filteredFlags = flags.filter((flag) => {
		// Status filter
		if (statusFilter !== 'all' && flag.status !== statusFilter) {
			return false;
		}

		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			return (
				flag.key.toLowerCase().includes(query) ||
				flag.name?.toLowerCase().includes(query) ||
				flag.description?.toLowerCase().includes(query)
			);
		}

		return true;
	});

	if (isLoading) {
		return null; // Skeleton is handled by parent
	}

	if (flags.length === 0) {
		return <EmptyState onCreateFlag={onCreateFlag} />;
	}

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-1 gap-4">
					<Input
						className="max-w-sm"
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search flags..."
						value={searchQuery}
					/>
					<Select
						onValueChange={(value: FlagStatus | 'all') =>
							setStatusFilter(value)
						}
						value={statusFilter}
					>
						<SelectTrigger className="w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							<SelectItem value="active">Active</SelectItem>
							<SelectItem value="inactive">Inactive</SelectItem>
							<SelectItem value="archived">Archived</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="text-muted-foreground text-sm">
					{filteredFlags.length} flag{filteredFlags.length !== 1 ? 's' : ''}
				</div>
			</div>

			{/* Flags List */}
			{filteredFlags.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<FlagIcon
						className="h-12 w-12 text-muted-foreground"
						weight="duotone"
					/>
					<h3 className="mt-4 font-medium">No flags found</h3>
					<p className="mt-2 text-muted-foreground text-sm">
						Try adjusting your search or filters
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{filteredFlags.map((flag) => (
						<FlagRow
							flag={flag}
							key={flag.id}
							onEdit={() => onEditFlag(flag)}
						/>
					))}
				</div>
			)}
		</div>
	);
}

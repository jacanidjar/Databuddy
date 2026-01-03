"use client";

import { GATED_FEATURES } from "@databuddy/shared/types/features";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { FeatureGate } from "@/components/feature-gate";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { orpc } from "@/lib/orpc";
import { isFlagSheetOpenAtom } from "@/stores/jotai/flagsAtoms";
import { FlagSheet } from "./_components/flag-sheet";
import { FlagsList } from "./_components/flags-list";
import type { Flag } from "./_components/types";

const FlagsListSkeleton = () => (
	<div className="border-border border-t">
		{[...new Array(5)].map((_, i) => (
			<div
				className="flex animate-pulse items-center border-border border-b px-4 py-4 sm:px-6"
				key={`skeleton-${i + 1}`}
			>
				<div className="flex flex-1 items-center gap-4">
					<div className="min-w-0 flex-1 space-y-2">
						<div className="flex items-center gap-2">
							<div className="h-5 w-40 rounded bg-muted" />
							<div className="h-5 w-16 rounded bg-muted" />
							<div className="h-5 w-20 rounded bg-muted" />
						</div>
						<div className="h-4 w-48 rounded bg-muted" />
					</div>
					<div className="h-6 w-10 rounded-full bg-muted" />
					<div className="size-8 rounded bg-muted" />
				</div>
			</div>
		))}
	</div>
);

export default function FlagsPage() {
	const { id } = useParams();
	const websiteId = id as string;
	const queryClient = useQueryClient();
	const [isFlagSheetOpen, setIsFlagSheetOpen] = useAtom(isFlagSheetOpenAtom);
	const [editingFlag, setEditingFlag] = useState<Flag | null>(null);
	const [flagToDelete, setFlagToDelete] = useState<Flag | null>(null);

	const { data: flags, isLoading: flagsLoading } = useQuery({
		...orpc.flags.list.queryOptions({ input: { websiteId } }),
	});

	const activeFlags = useMemo(
		() => flags?.filter((f) => f.status !== "archived") ?? [],
		[flags]
	);

	const deleteFlagMutation = useMutation({
		...orpc.flags.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: orpc.flags.list.key({ input: { websiteId } }),
			});
		},
	});

	const handleCreateFlag = () => {
		setEditingFlag(null);
		setIsFlagSheetOpen(true);
	};

	const handleEditFlag = (flag: Flag) => {
		setEditingFlag(flag);
		setIsFlagSheetOpen(true);
	};

	const handleDeleteFlagRequest = (flagId: string) => {
		const flag = flags?.find((f) => f.id === flagId);
		if (flag) {
			setFlagToDelete(flag as Flag);
		}
	};

	const handleConfirmDelete = async () => {
		if (flagToDelete) {
			await deleteFlagMutation.mutateAsync({ id: flagToDelete.id });
			setFlagToDelete(null);
		}
	};

	const handleFlagSheetClose = () => {
		setIsFlagSheetOpen(false);
		setEditingFlag(null);
	};

	return (
		<FeatureGate feature={GATED_FEATURES.FEATURE_FLAGS}>
			<ErrorBoundary>
				<div className="h-full overflow-y-auto">
					<Suspense fallback={<FlagsListSkeleton />}>
						<FlagsList
							flags={activeFlags as Flag[]}
							isLoading={flagsLoading}
							onCreateFlagAction={handleCreateFlag}
							onDeleteFlag={handleDeleteFlagRequest}
							onEditFlagAction={handleEditFlag}
						/>
					</Suspense>

					{isFlagSheetOpen && (
						<Suspense fallback={null}>
							<FlagSheet
								flag={editingFlag}
								isOpen={isFlagSheetOpen}
								onCloseAction={handleFlagSheetClose}
								websiteId={websiteId}
							/>
						</Suspense>
					)}

					<DeleteDialog
						isDeleting={deleteFlagMutation.isPending}
						isOpen={flagToDelete !== null}
						itemName={flagToDelete?.name || flagToDelete?.key}
						onClose={() => setFlagToDelete(null)}
						onConfirm={handleConfirmDelete}
						title="Delete Feature Flag"
					/>
				</div>
			</ErrorBoundary>
		</FeatureGate>
	);
}

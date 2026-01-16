"use client";

import { LinkIcon } from "@phosphor-icons/react/dist/ssr/Link";
import { TrendDownIcon } from "@phosphor-icons/react/dist/ssr/TrendDown";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { type Link, useDeleteLink, useLinks } from "@/hooks/use-links";
import { LinkDialog } from "./_components/link-dialog";
import { LinkItemSkeleton } from "./_components/link-item";
import { LinksList } from "./_components/links-list";
import { LinksPageHeader } from "./_components/links-page-header";

function LinksListSkeleton() {
	return (
		<div>
			{[1, 2, 3].map((i) => (
				<LinkItemSkeleton key={i} />
			))}
		</div>
	);
}

export default function LinksPage() {
	const router = useRouter();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingLink, setEditingLink] = useState<Link | null>(null);
	const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);

	const { links, isLoading, isError, isFetching, refetch } = useLinks();
	const deleteLinkMutation = useDeleteLink();

	const handleDeleteLink = async (linkId: string) => {
		try {
			await deleteLinkMutation.mutateAsync({ id: linkId });
			setDeletingLinkId(null);
		} catch (error) {
			console.error("Failed to delete link:", error);
		}
	};

	if (isError) {
		return (
			<div className="p-4">
				<Card className="border-destructive/20 bg-destructive/5">
					<CardContent className="pt-6">
						<div className="flex items-center gap-2">
							<TrendDownIcon
								className="size-5 text-destructive"
								weight="duotone"
							/>
							<p className="font-medium text-destructive">
								Error loading links
							</p>
						</div>
						<p className="mt-2 text-destructive/80 text-sm">
							There was an issue fetching your links. Please try again.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="relative flex h-full flex-col">
			<LinksPageHeader
				createActionLabel="Create Link"
				currentCount={links.length}
				description="Create and track short links with analytics"
				icon={
					<LinkIcon
						className="size-6 text-accent-foreground"
						weight="duotone"
					/>
				}
				isLoading={isLoading}
				isRefreshing={isFetching}
				onCreateAction={() => {
					setEditingLink(null);
					setIsDialogOpen(true);
				}}
				onRefreshAction={() => refetch()}
				subtitle={
					isLoading
						? undefined
						: `${links.length} link${links.length !== 1 ? "s" : ""}`
				}
				title="Links"
			/>

			{isLoading ? (
				<LinksListSkeleton />
			) : (
				<LinksList
					isLoading={isLoading}
					links={links}
					onCreateLink={() => {
						setEditingLink(null);
						setIsDialogOpen(true);
					}}
					onDeleteLink={(linkId) => setDeletingLinkId(linkId)}
					onEditLink={(link) => {
						setEditingLink(link);
						setIsDialogOpen(true);
					}}
					onLinkClick={(link) => router.push(`/links/${link.id}`)}
				/>
			)}

			{isDialogOpen && (
				<LinkDialog
					link={editingLink}
					onOpenChange={(open) => {
						if (!open) {
							setIsDialogOpen(false);
							setEditingLink(null);
						}
					}}
					open={isDialogOpen}
				/>
			)}

			{deletingLinkId && (
				<DeleteDialog
					confirmLabel="Delete Link"
					description="Are you sure you want to delete this link? This action cannot be undone and will permanently remove all click data."
					isDeleting={deleteLinkMutation.isPending}
					isOpen={!!deletingLinkId}
					onClose={() => setDeletingLinkId(null)}
					onConfirm={() => deletingLinkId && handleDeleteLink(deletingLinkId)}
					title="Delete Link"
				/>
			)}
		</div>
	);
}

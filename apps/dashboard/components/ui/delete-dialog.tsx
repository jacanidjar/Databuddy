"use client";

import { TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface DeleteDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title?: string;
	description?: string;
	itemName?: string;
	confirmLabel?: string;
	cancelLabel?: string;
}

export function DeleteDialog({
	isOpen,
	onClose,
	onConfirm,
	title = "Delete",
	description,
	itemName,
	confirmLabel = "Delete",
	cancelLabel = "Cancel",
}: DeleteDialogProps) {
	const defaultDescription = itemName
		? `Are you sure you want to delete ${itemName}? This action cannot be undone and will permanently remove it.`
		: "Are you sure you want to delete this item? This action cannot be undone and will permanently remove it.";

	return (
		<Dialog onOpenChange={onClose} open={isOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						{description || defaultDescription}
					</DialogDescription>
				</DialogHeader>
				<div className="flex items-center gap-3 py-2">
					<div className="flex size-10 shrink-0 items-center justify-center border border-destructive/20 bg-destructive/10">
						<TrashIcon
							className="text-destructive"
							size={18}
							weight="duotone"
						/>
					</div>
					<p className="text-muted-foreground text-sm">
						This action cannot be undone.
					</p>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						{cancelLabel}
					</Button>
					<Button variant="destructive" onClick={onConfirm}>
						{confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}


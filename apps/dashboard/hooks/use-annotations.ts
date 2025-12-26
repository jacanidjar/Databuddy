"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/lib/orpc";

interface ListAnnotationsInput {
	websiteId: string;
	chartType: "metrics";
	chartContext: {
		dateRange: {
			start_date: string;
			end_date: string;
			granularity: "hourly" | "daily" | "weekly" | "monthly";
		};
		filters?: Array<{
			field: string;
			operator: "eq" | "ne" | "gt" | "lt" | "contains";
			value: string;
		}>;
		metrics?: string[];
		tabId?: string;
	};
}

export function useAnnotations(input: ListAnnotationsInput) {
	const {
		data: annotations,
		isLoading,
		error,
	} = useQuery({
		...orpc.annotations.list.queryOptions({ input }),
		enabled: !!input.websiteId,
	});

	const createAnnotation = useMutation({
		...orpc.annotations.create.mutationOptions(),
		onSuccess: () => {
			toast.success("Annotation created successfully");
		},
		onError: (error) => {
			const message =
				error instanceof Error ? error.message : "Failed to create annotation";
			toast.error(message);
		},
	});

	const updateAnnotation = useMutation({
		...orpc.annotations.update.mutationOptions(),
		onSuccess: () => {
			toast.success("Annotation updated successfully");
		},
		onError: (error) => {
			const message =
				error instanceof Error ? error.message : "Failed to update annotation";
			toast.error(message);
		},
	});

	const deleteAnnotation = useMutation({
		...orpc.annotations.delete.mutationOptions(),
		onSuccess: () => {
			toast.success("Annotation deleted successfully");
		},
		onError: (error) => {
			const message =
				error instanceof Error ? error.message : "Failed to delete annotation";
			toast.error(message);
		},
	});

	return {
		annotations: annotations ?? [],
		isLoading,
		error,
		createAnnotation,
		updateAnnotation,
		deleteAnnotation,
	};
}

export function useAnnotationById(id: string) {
	return useQuery({
		...orpc.annotations.getById.queryOptions({ input: { id } }),
		enabled: !!id,
	});
}

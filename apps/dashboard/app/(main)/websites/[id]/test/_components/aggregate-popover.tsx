"use client";

import { PlusIcon } from "@phosphor-icons/react";
import type { TableColumn } from "@databuddy/shared/schema/analytics-tables";
import type {
	AggregateFunction,
	CustomQuerySelect,
} from "@databuddy/shared/types/custom-query";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface AggregatePopoverProps {
	columns: TableColumn[];
	existingSelects: CustomQuerySelect[];
	onAddAction: (select: CustomQuerySelect) => void;
	disabled?: boolean;
}

// Aggregates that work for single-value results
const AGGREGATES: {
	value: AggregateFunction;
	label: string;
	forTypes: ("string" | "number")[];
}[] = [
	{ value: "count", label: "Count", forTypes: ["string", "number"] },
	{ value: "uniq", label: "Count Unique", forTypes: ["string", "number"] },
	{ value: "sum", label: "Sum", forTypes: ["number"] },
	{ value: "avg", label: "Average", forTypes: ["number"] },
	{ value: "max", label: "Maximum", forTypes: ["number"] },
	{ value: "min", label: "Minimum", forTypes: ["number"] },
];

export function AggregatePopover({
	columns,
	existingSelects,
	onAddAction,
	disabled,
}: AggregatePopoverProps) {
	const [open, setOpen] = useState(false);
	const [field, setField] = useState("");
	const [aggregate, setAggregate] = useState<AggregateFunction>("count");

	// Check if a field+aggregate combo already exists
	const isAlreadySelected = (f: string, agg: AggregateFunction) => {
		return existingSelects.some((s) => s.field === f && s.aggregate === agg);
	};

	// Group columns by type
	const { stringColumns, numberColumns } = useMemo(() => {
		return {
			stringColumns: columns.filter((c) => c.type === "string"),
			numberColumns: columns.filter(
				(c) => c.type === "number" && c.aggregatable
			),
		};
	}, [columns]);

	// Get available aggregates based on selected field, excluding already selected
	const availableAggregates = useMemo(() => {
		if (!field) {
			return [];
		}
		let baseAggregates = AGGREGATES;
		if (field === "*") {
			baseAggregates = AGGREGATES.filter((a) => a.value === "count");
		} else {
			const isNumber = numberColumns.some((c) => c.name === field);
			const fieldType = isNumber ? "number" : "string";
			baseAggregates = AGGREGATES.filter((a) => a.forTypes.includes(fieldType));
		}
		// Filter out already selected combinations
		return baseAggregates.filter((a) => !isAlreadySelected(field, a.value));
	}, [field, numberColumns, existingSelects]);

	const resetForm = () => {
		setField("");
		setAggregate("count");
	};

	const handleFieldChange = (newField: string) => {
		setField(newField);
		// Auto-select best available aggregate for field type
		const isNumber = numberColumns.some((c) => c.name === newField);

		// Determine preferred aggregates in order
		const preferredOrder: AggregateFunction[] =
			newField === "*"
				? ["count"]
				: isNumber
					? ["sum", "avg", "max", "min", "count", "uniq"]
					: ["uniq", "count"];

		// Find first available that's not already selected
		const firstAvailable = preferredOrder.find(
			(agg) => !isAlreadySelected(newField, agg)
		);
		setAggregate(firstAvailable || "count");
	};

	const handleAdd = () => {
		const col = [...stringColumns, ...numberColumns].find(
			(c) => c.name === field
		);

		// Build a readable alias
		const prefix =
			aggregate === "uniq"
				? "Unique "
				: aggregate === "avg"
					? "Avg "
					: aggregate === "sum"
						? "Total "
						: aggregate === "max"
							? "Max "
							: aggregate === "min"
								? "Min "
								: "";
		const alias = field === "*" ? "Count" : `${prefix}${col?.label || field}`;

		onAddAction({
			field,
			aggregate,
			alias,
		});

		resetForm();
		setOpen(false);
	};

	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger asChild>
				<Button
					className="size-7 p-0"
					disabled={disabled}
					size="icon"
					variant="ghost"
				>
					<PlusIcon className="size-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-64 space-y-3">
				<div className="space-y-2">
					<Select
						disabled={disabled}
						onValueChange={handleFieldChange}
						value={field}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select field..." />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="*">All rows</SelectItem>

							{stringColumns.length > 0 && (
								<SelectGroup>
									<SelectLabel>Text fields</SelectLabel>
									{stringColumns.map((col) => (
										<SelectItem key={col.name} value={col.name}>
											{col.label}
										</SelectItem>
									))}
								</SelectGroup>
							)}

							{numberColumns.length > 0 && (
								<SelectGroup>
									<SelectLabel>Numeric fields</SelectLabel>
									{numberColumns.map((col) => (
										<SelectItem key={col.name} value={col.name}>
											{col.label}
										</SelectItem>
									))}
								</SelectGroup>
							)}
						</SelectContent>
					</Select>
				</div>

				{field && availableAggregates.length === 0 && (
					<p className="text-muted-foreground text-sm">
						All calculations for this field are already added.
					</p>
				)}

				{field && availableAggregates.length > 0 && (
					<>
						{availableAggregates.length > 1 && (
							<div className="space-y-2">
								<Select
									disabled={disabled}
									onValueChange={(v) => setAggregate(v as AggregateFunction)}
									value={aggregate}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{availableAggregates.map((agg) => (
											<SelectItem key={agg.value} value={agg.value}>
												{agg.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						<Button
							className="w-full"
							disabled={disabled || availableAggregates.length === 0}
							onClick={handleAdd}
							size="sm"
						>
							Add
						</Button>
					</>
				)}
			</PopoverContent>
		</Popover>
	);
}

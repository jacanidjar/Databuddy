"use client";

import {
	ANALYTICS_TABLES,
	getTableDefinition,
} from "@databuddy/shared/schema/analytics-tables";
import type { CustomQueryConfig } from "@databuddy/shared/types/custom-query";
import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

/**
 * Smart metric options - pre-configured combinations that make sense
 */
interface MetricOption {
	id: string;
	label: string;
	aggregate: "count" | "sum" | "avg" | "max" | "min" | "uniq";
	field: string;
}

function getMetricOptionsForTable(tableName: string): MetricOption[] {
	const table = getTableDefinition(tableName);
	if (!table) {
		return [];
	}

	const options: MetricOption[] = [
		// Always available
		{ id: "count_all", label: "Total Count", aggregate: "count", field: "*" },
	];

	// Add unique counts for string fields
	for (const col of table.columns) {
		if (col.type === "string" && col.filterable) {
			options.push({
				id: `uniq_${col.name}`,
				label: `Unique ${col.label}`,
				aggregate: "uniq",
				field: col.name,
			});
		}
	}

	// Add numeric aggregates
	for (const col of table.columns) {
		if (col.type === "number" && col.aggregatable) {
			options.push({
				id: `sum_${col.name}`,
				label: `Total ${col.label}`,
				aggregate: "sum",
				field: col.name,
			});
			options.push({
				id: `avg_${col.name}`,
				label: `Average ${col.label}`,
				aggregate: "avg",
				field: col.name,
			});
		}
	}

	return options;
}

interface CustomQueryBuilderProps {
	value: CustomQueryConfig | null;
	onChangeAction: (config: CustomQueryConfig) => void;
	disabled?: boolean;
}

export function CustomQueryBuilder({
	value,
	onChangeAction,
	disabled,
}: CustomQueryBuilderProps) {
	const tables = useMemo(
		() =>
			ANALYTICS_TABLES.map((t) => ({
				name: t.name,
				label: t.label,
			})),
		[]
	);

	const metricOptions = useMemo(
		() => (value?.table ? getMetricOptionsForTable(value.table) : []),
		[value?.table]
	);

	// Get current metric ID from value
	const currentMetricId = useMemo(() => {
		if (!value?.selects?.length) {
			return "";
		}
		const sel = value.selects.at(0);
		if (!sel) {
			return "";
		}
		return `${sel.aggregate}_${sel.field === "*" ? "all" : sel.field}`;
	}, [value?.selects]);

	const handleTableChange = (tableName: string) => {
		onChangeAction({
			table: tableName,
			selects: [{ field: "*", aggregate: "count", alias: "Total Count" }],
		});
	};

	const handleMetricChange = (metricId: string) => {
		if (!value?.table) {
			return;
		}
		const metric = metricOptions.find((m) => m.id === metricId);
		if (!metric) {
			return;
		}
		onChangeAction({
			...value,
			selects: [
				{
					field: metric.field,
					aggregate: metric.aggregate,
					alias: metric.label,
				},
			],
		});
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label>Table</Label>
				<Select
					disabled={disabled}
					onValueChange={handleTableChange}
					value={value?.table || ""}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select table..." />
					</SelectTrigger>
					<SelectContent>
						{tables.map((t) => (
							<SelectItem key={t.name} value={t.name}>
								{t.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{value?.table && (
				<div className="space-y-2">
					<Label>Metric</Label>
					<Select
						disabled={disabled}
						onValueChange={handleMetricChange}
						value={currentMetricId}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select metric..." />
						</SelectTrigger>
						<SelectContent>
							{metricOptions.map((m) => (
								<SelectItem key={m.id} value={m.id}>
									{m.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}
		</div>
	);
}

"use client";

import {
	EnvelopeIcon,
	PlusIcon,
	TrashIcon,
	UserIcon,
	WrenchIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { TagsChat } from "@/components/ui/tags";
import { cn } from "@/lib/utils";
import type { UserRule, UserRulesBuilderProps } from "./types";

const TARGET_TYPES = [
	{ value: "user_id", label: "User ID", icon: UserIcon },
	{ value: "email", label: "Email", icon: EnvelopeIcon },
	{ value: "property", label: "Property", icon: WrenchIcon },
] as const;

const CONDITIONS = [
	{ value: "equals", label: "is", needsValue: true, multi: false },
	{ value: "contains", label: "contains", needsValue: true, multi: false },
	{
		value: "starts_with",
		label: "starts with",
		needsValue: true,
		multi: false,
	},
	{ value: "ends_with", label: "ends with", needsValue: true, multi: false },
	{ value: "in", label: "is one of", needsValue: true, multi: true },
	{ value: "not_in", label: "is not one of", needsValue: true, multi: true },
	{ value: "exists", label: "exists", needsValue: false, multi: false },
	{
		value: "not_exists",
		label: "doesn't exist",
		needsValue: false,
		multi: false,
	},
] as const;

function getConditionsForType(type: UserRule["type"]) {
	if (type === "property") {
		return CONDITIONS;
	}
	return CONDITIONS.filter(
		(c) => c.value !== "exists" && c.value !== "not_exists"
	);
}

function getCurrentValues(rule: UserRule): string[] {
	if (rule.batch) {
		return rule.batchValues || [];
	}
	if (rule.values?.length) {
		return rule.values;
	}
	if (rule.value) {
		return [rule.value];
	}
	return [];
}

function RuleRow({
	rule,
	onUpdate,
	onRemove,
}: {
	rule: UserRule;
	onUpdate: (updates: Partial<UserRule>) => void;
	onRemove: () => void;
}) {
	const conditions = getConditionsForType(rule.type);
	const condition = CONDITIONS.find((c) => c.value === rule.operator);
	const needsValue = condition?.needsValue ?? true;
	const isMulti = condition?.multi ?? false;
	const isBatch = rule.batch && needsValue;

	const handleConditionChange = (newOperator: UserRule["operator"]) => {
		const newCondition = CONDITIONS.find((c) => c.value === newOperator);
		const currentValues = getCurrentValues(rule);
		const updates: Partial<UserRule> = { operator: newOperator };

		if (newCondition?.multi) {
			updates.values = currentValues.length > 0 ? currentValues : [];
			updates.value = "";
			updates.batchValues = [];
		} else {
			updates.value = currentValues[0] || "";
			updates.values = [];
			updates.batchValues = [];
		}

		if (newOperator === "exists" || newOperator === "not_exists") {
			updates.batch = false;
		}

		onUpdate(updates);
	};

	const handleBatchToggle = () => {
		const currentValues = getCurrentValues(rule);
		const newBatch = !rule.batch;
		const updates: Partial<UserRule> = {
			batch: newBatch,
			batchValues: newBatch ? currentValues : [],
			value: newBatch ? "" : currentValues[0] || "",
			values: newBatch ? [] : isMulti ? currentValues : [],
		};
		onUpdate(updates);
	};

	const handleTypeChange = (newType: UserRule["type"]) => {
		const updates: Partial<UserRule> = { type: newType };
		if (
			newType !== "property" &&
			(rule.operator === "exists" || rule.operator === "not_exists")
		) {
			updates.operator = "equals";
		}
		onUpdate(updates);
	};

	const placeholderText =
		rule.type === "email"
			? "emails"
			: rule.type === "user_id"
				? "user IDs"
				: "values";

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="group rounded border bg-card"
			exit={{ opacity: 0, scale: 0.95 }}
			initial={{ opacity: 0, y: -10 }}
			layout
		>
			<div className="flex items-center gap-2 p-3">
				<Select
					onValueChange={(v) => handleTypeChange(v as UserRule["type"])}
					value={rule.type}
				>
					<SelectTrigger className="h-9 w-auto gap-2 border-0 bg-secondary px-2.5">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{TARGET_TYPES.map((t) => {
							const TypeIcon = t.icon;
							return (
								<SelectItem key={t.value} value={t.value}>
									<div className="flex items-center gap-2">
										<TypeIcon size={14} weight="duotone" />
										{t.label}
									</div>
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>

				{rule.type === "property" && (
					<Input
						className="h-9 w-28"
						onChange={(e) => onUpdate({ field: e.target.value })}
						placeholder="field…"
						value={rule.field || ""}
					/>
				)}

				<Select
					onValueChange={(v) =>
						handleConditionChange(v as UserRule["operator"])
					}
					value={rule.operator}
				>
					<SelectTrigger className="h-9 w-auto border-0 bg-transparent px-2 text-muted-foreground">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{conditions.map((c) => (
							<SelectItem key={c.value} value={c.value}>
								{c.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{needsValue && !isBatch && (
					<div className="min-w-0 flex-1">
						{isMulti ? (
							<TagsChat
								allowDuplicates={false}
								maxTags={20}
								onChange={(values: string[]) => onUpdate({ values })}
								placeholder="Type and press Enter…"
								values={rule.values || []}
							/>
						) : (
							<Input
								className="h-9"
								onChange={(e) => onUpdate({ value: e.target.value })}
								placeholder="Enter value…"
								value={rule.value || ""}
							/>
						)}
					</div>
				)}

				{isBatch && (
					<span className="text-muted-foreground text-xs">
						{(rule.batchValues || []).length} values
					</span>
				)}

				{!needsValue && <div className="flex-1" />}

				<button
					className={cn(
						"shrink-0 rounded px-2.5 py-1.5 font-medium text-xs transition-colors",
						rule.enabled
							? "bg-green-500/15 text-green-600 hover:bg-green-500/25"
							: "bg-red-500/15 text-red-500 hover:bg-red-500/25"
					)}
					onClick={() => onUpdate({ enabled: !rule.enabled })}
					type="button"
				>
					{rule.enabled ? "Enable" : "Disable"}
				</button>

				<button
					className="shrink-0 rounded p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
					onClick={onRemove}
					type="button"
				>
					<TrashIcon size={14} />
				</button>
			</div>

			{isBatch && (
				<div className="border-t px-3 py-2">
					<TagsChat
						allowDuplicates={false}
						maxTags={100}
						onChange={(values: string[]) => onUpdate({ batchValues: values })}
						placeholder={`Type ${placeholderText} and press Enter…`}
						values={rule.batchValues || []}
					/>
				</div>
			)}

			{needsValue && (
				<div className="flex items-center justify-end border-t px-3 py-1.5">
					<button
						className={cn(
							"rounded px-2 py-1 text-xs transition-colors",
							rule.batch
								? "bg-primary/10 text-primary"
								: "text-muted-foreground hover:text-foreground"
						)}
						onClick={handleBatchToggle}
						type="button"
					>
						{rule.batch ? "Batch mode on" : "Enable batch mode"}
					</button>
				</div>
			)}
		</motion.div>
	);
}

export function UserRulesBuilder({ rules, onChange }: UserRulesBuilderProps) {
	const addRule = () => {
		onChange([
			...rules,
			{
				type: "user_id",
				operator: "equals",
				value: "",
				enabled: true,
				batch: false,
			},
		]);
	};

	const updateRule = (index: number, updates: Partial<UserRule>) => {
		const newRules = [...rules];
		newRules[index] = { ...newRules[index], ...updates };
		onChange(newRules);
	};

	const removeRule = (index: number) => {
		onChange(rules.filter((_, i) => i !== index));
	};

	if (rules.length === 0) {
		return (
			<div className="py-4 text-center">
				<p className="mb-3 text-balance text-muted-foreground text-sm">
					Target specific users, emails, or properties
				</p>
				<Button onClick={addRule} size="sm" type="button" variant="outline">
					<PlusIcon size={14} />
					Add Rule
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<AnimatePresence mode="popLayout">
				{rules.map((rule, index) => (
					<RuleRow
						key={index}
						onRemove={() => removeRule(index)}
						onUpdate={(updates) => updateRule(index, updates)}
						rule={rule}
					/>
				))}
			</AnimatePresence>

			<Button
				className="w-full text-muted-foreground"
				onClick={addRule}
				size="sm"
				type="button"
				variant="outline"
			>
				<PlusIcon size={14} />
				Add Rule
			</Button>
		</div>
	);
}

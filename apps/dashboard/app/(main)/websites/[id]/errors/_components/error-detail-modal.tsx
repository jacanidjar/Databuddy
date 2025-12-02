"use client";

import {
	CheckIcon,
	ClockIcon,
	CodeIcon,
	CopyIcon,
	GlobeIcon,
	HashIcon,
	LinkIcon,
	StackIcon,
	UserIcon,
} from "@phosphor-icons/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { toast } from "sonner";
import { BrowserIcon, CountryFlag, OSIcon } from "@/components/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { getDeviceIcon, getErrorTypeIcon } from "./error-icons";
import type { RecentError } from "./types";
import {
	formatDateTimeSeconds,
	getErrorCategory,
	getSeverityColor,
} from "./utils";

dayjs.extend(relativeTime);

interface ErrorDetailModalProps {
	error: RecentError;
	isOpen: boolean;
	onClose: () => void;
}

type CopiedSection = "message" | "stack" | "url" | "session" | "user" | "all" | null;

const CopyButton = ({
	text,
	section,
	copiedSection,
	onCopy,
}: {
	text: string;
	section: CopiedSection;
	copiedSection: CopiedSection;
	onCopy: (text: string, section: CopiedSection) => void;
}) => {
	const isCopied = copiedSection === section;

	return (
		<Button
			aria-label={`Copy ${section}`}
			className="h-7 w-7 shrink-0"
			onClick={() => onCopy(text, section)}
			size="icon"
			variant="ghost"
		>
			{isCopied ? (
				<CheckIcon className="h-3.5 w-3.5 text-green-500" weight="bold" />
			) : (
				<CopyIcon className="h-3.5 w-3.5 text-muted-foreground" />
			)}
		</Button>
	);
};

const SeverityIndicator = ({ severity }: { severity: "high" | "medium" | "low" }) => {
	const config = {
		high: { color: "bg-primary" },
		medium: { color: "bg-chart-2" },
		low: { color: "bg-chart-3" },
	};

	return (
		<div className="flex items-center gap-2">
			<span className={`h-2.5 w-2.5 rounded-full ${config[severity].color}`} />
			<span className="text-muted-foreground text-xs capitalize">{severity} severity</span>
		</div>
	);
};

export const ErrorDetailModal = ({
	error,
	isOpen,
	onClose,
}: ErrorDetailModalProps) => {
	const [copiedSection, setCopiedSection] = useState<CopiedSection>(null);

	if (!error) {
		return null;
	}

	const copyToClipboard = async (text: string, section: CopiedSection) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedSection(section);
			toast.success("Copied to clipboard");
			setTimeout(() => setCopiedSection(null), 2000);
		} catch (err) {
			toast.error("Failed to copy", {
				description: err instanceof Error ? err.message : "Unknown error",
			});
		}
	};

	const { type, severity } = getErrorCategory(error.message);
	const relativeTimeStr = dayjs(error.timestamp).fromNow();

	const fullErrorInfo = `Error: ${error.message}
${error.stack ? `\nStack Trace:\n${error.stack}` : ""}

Context:
• URL: ${error.path}
• Session: ${error.session_id || "Unknown"}
• User: ${error.anonymous_id}
• Time: ${formatDateTimeSeconds(error.timestamp)}
• Browser: ${error.browser_name || "Unknown"}
• OS: ${error.os_name || "Unknown"}
• Device: ${error.device_type || "Unknown"}
• Location: ${error.country_name || error.country || "Unknown"}`;

	return (
		<Sheet onOpenChange={onClose} open={isOpen}>
			<SheetContent className="sm:max-w-xl" side="right">
				<SheetHeader>
					<div className="flex items-center gap-4">
						<div className="flex h-11 w-11 items-center justify-center rounded border bg-secondary-brighter">
							{getErrorTypeIcon(type)}
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-2">
								<SheetTitle className="text-lg">{type}</SheetTitle>
								<Badge className={getSeverityColor(severity)}>{severity}</Badge>
							</div>
							<SheetDescription className="flex items-center gap-1.5">
								<ClockIcon className="h-3.5 w-3.5" weight="duotone" />
								<span>{relativeTimeStr}</span>
								<span className="text-muted-foreground/50">•</span>
								<span className="font-mono text-xs">{formatDateTimeSeconds(error.timestamp)}</span>
							</SheetDescription>
						</div>
					</div>
				</SheetHeader>

				<SheetBody className="space-y-6">
					{/* Error Message */}
					<section className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<CodeIcon className="h-4 w-4 text-primary" weight="duotone" />
								<span className="font-medium text-sm">Error Message</span>
							</div>
							<CopyButton
								copiedSection={copiedSection}
								onCopy={copyToClipboard}
								section="message"
								text={error.message}
							/>
						</div>
						<div className="rounded border bg-card p-4">
							<p className="wrap-break-word text-sm leading-relaxed">
								{error.message}
							</p>
						</div>
					</section>

					{/* Stack Trace */}
					{error.stack && (
						<section className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<StackIcon className="h-4 w-4 text-chart-2" weight="duotone" />
									<span className="font-medium text-sm">Stack Trace</span>
								</div>
								<CopyButton
									copiedSection={copiedSection}
									onCopy={copyToClipboard}
									section="stack"
									text={error.stack}
								/>
							</div>
							<div className="rounded border bg-card p-4">
								<pre className="max-h-48 overflow-auto whitespace-pre-wrap wrap-break-word font-mono text-xs leading-relaxed text-muted-foreground">
									{error.stack}
								</pre>
							</div>
						</section>
					)}

					{/* Source Location */}
					{(error.filename || error.lineno) && (
						<section className="space-y-3">
							<div className="flex items-center gap-2">
								<CodeIcon className="h-4 w-4 text-chart-3" weight="duotone" />
								<span className="font-medium text-sm">Source Location</span>
							</div>
							<div className="rounded border bg-card p-3">
								<div className="flex items-center gap-1 font-mono text-sm">
									<span className="text-muted-foreground">{error.filename || "Unknown file"}</span>
									{error.lineno && (
										<>
											<span className="text-muted-foreground/50">:</span>
											<span className="text-primary">{error.lineno}</span>
										</>
									)}
									{error.colno && (
										<>
											<span className="text-muted-foreground/50">:</span>
											<span className="text-chart-2">{error.colno}</span>
										</>
									)}
								</div>
							</div>
						</section>
					)}

					{/* Context */}
					<section className="space-y-3">
						<span className="font-medium text-sm">Context</span>
						<div className="rounded border bg-card p-1">
							<div className="grid grid-cols-1 gap-1">
								{/* Page URL */}
								<div className="flex items-center justify-between gap-3 rounded px-3 py-2.5">
									<div className="flex min-w-0 items-center gap-3">
										<LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" weight="duotone" />
										<div className="min-w-0">
											<span className="text-muted-foreground text-xs">Page URL</span>
											<p className="truncate font-mono text-sm" title={error.path}>
												{error.path}
											</p>
										</div>
									</div>
									<CopyButton
										copiedSection={copiedSection}
										onCopy={copyToClipboard}
										section="url"
										text={error.path}
									/>
								</div>

								{/* Session ID */}
								<div className="flex items-center justify-between gap-3 rounded px-3 py-2.5">
									<div className="flex min-w-0 items-center gap-3">
										<HashIcon className="h-4 w-4 shrink-0 text-muted-foreground" weight="duotone" />
										<div className="min-w-0">
											<span className="text-muted-foreground text-xs">Session ID</span>
											<p className="truncate font-mono text-sm" title={error.session_id}>
												{error.session_id || "—"}
											</p>
										</div>
									</div>
									{error.session_id && (
										<CopyButton
											copiedSection={copiedSection}
											onCopy={copyToClipboard}
											section="session"
											text={error.session_id}
										/>
									)}
								</div>

								{/* User ID */}
								<div className="flex items-center justify-between gap-3 rounded px-3 py-2.5">
									<div className="flex min-w-0 items-center gap-3">
										<UserIcon className="h-4 w-4 shrink-0 text-muted-foreground" weight="duotone" />
										<div className="min-w-0">
											<span className="text-muted-foreground text-xs">User ID</span>
											<p className="truncate font-mono text-sm" title={error.anonymous_id}>
												{error.anonymous_id}
											</p>
										</div>
									</div>
									<CopyButton
										copiedSection={copiedSection}
										onCopy={copyToClipboard}
										section="user"
										text={error.anonymous_id}
									/>
								</div>
							</div>
						</div>
					</section>

					{/* Environment */}
					<section className="space-y-3">
						<span className="font-medium text-sm">Environment</span>
						<div className="grid grid-cols-2 gap-3">
							{/* Browser */}
							<div className="flex flex-col gap-1.5 rounded border bg-card p-3">
								<span className="text-muted-foreground text-xs">Browser</span>
								<div className="flex items-center gap-2">
									{error.browser_name ? (
										<>
											<BrowserIcon name={error.browser_name} size="sm" />
											<span className="text-sm">{error.browser_name}</span>
										</>
									) : (
										<span className="text-muted-foreground text-sm">—</span>
									)}
								</div>
							</div>

							{/* OS */}
							<div className="flex flex-col gap-1.5 rounded border bg-card p-3">
								<span className="text-muted-foreground text-xs">Operating System</span>
								<div className="flex items-center gap-2">
									{error.os_name ? (
										<>
											<OSIcon name={error.os_name} size="sm" />
											<span className="text-sm">{error.os_name}</span>
										</>
									) : (
										<span className="text-muted-foreground text-sm">—</span>
									)}
								</div>
							</div>

							{/* Device */}
							<div className="flex flex-col gap-1.5 rounded border bg-card p-3">
								<span className="text-muted-foreground text-xs">Device</span>
								<div className="flex items-center gap-2">
									{error.device_type ? (
										<>
											{getDeviceIcon(error.device_type)}
											<span className="text-sm capitalize">{error.device_type}</span>
										</>
									) : (
										<span className="text-muted-foreground text-sm">—</span>
									)}
								</div>
							</div>

							{/* Location */}
							<div className="flex flex-col gap-1.5 rounded border bg-card p-3">
								<span className="text-muted-foreground text-xs">Location</span>
								<div className="flex items-center gap-2">
									{error.country_code || error.country ? (
										<>
											<CountryFlag
												country={error.country_code || error.country || ""}
												size={16}
											/>
											<span className="text-sm">
												{error.country_name || error.country}
											</span>
										</>
									) : (
										<>
											<GlobeIcon className="h-4 w-4 text-muted-foreground" />
											<span className="text-muted-foreground text-sm">Unknown</span>
										</>
									)}
								</div>
							</div>
						</div>

						{/* Severity */}
						<div className="flex items-center justify-between rounded border bg-card p-3">
							<span className="text-muted-foreground text-xs">Severity Level</span>
							<SeverityIndicator severity={severity} />
						</div>
					</section>
				</SheetBody>

				<SheetFooter>
					<Button onClick={onClose} variant="ghost">
						Close
					</Button>
					<Button
						className="gap-2"
						onClick={() => copyToClipboard(fullErrorInfo, "all")}
						variant="outline"
					>
						{copiedSection === "all" ? (
							<CheckIcon className="h-4 w-4 text-green-500" weight="bold" />
						) : (
							<CopyIcon className="h-4 w-4" />
						)}
						Copy All
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
};

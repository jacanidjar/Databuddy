'use client';

import {
	CheckCircleIcon,
	GitBranchIcon,
	GlobeIcon,
	PlusIcon,
	WarningIcon,
} from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import type { Domain, Project } from './types';
import {
	generateWebsiteName,
	generateWebsitePlaceholder,
	inferTargetFromDomain,
} from './utils';

interface WebsiteConfig {
	domain: Domain;
	name: string;
	target: string[];
}

interface CreateWebsiteDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (configs: WebsiteConfig[]) => Promise<void>;
	selectedProject: Project | null;
	selectedDomains: Domain[];
	isSaving: boolean;
}

export function CreateWebsiteDialog({
	isOpen,
	onClose,
	onSave,
	selectedProject,
	selectedDomains,
	isSaving,
}: CreateWebsiteDialogProps) {
	const [websiteConfigs, setWebsiteConfigs] = useState<WebsiteConfig[]>([]);
	const isMultipleMode = selectedDomains.length > 1;

	useEffect(() => {
		if (selectedDomains.length > 0) {
			const configs = selectedDomains.map((domain) => ({
				domain,
				name: '', // Start with empty name, will use placeholder
				target: isMultipleMode
					? inferTargetFromDomain(domain)
					: (['production', 'preview'] as string[]),
			}));
			setWebsiteConfigs(configs);
		}
	}, [selectedDomains, isMultipleMode]);

	const handleSubmit = async () => {
		if (websiteConfigs.length === 0) {
			return;
		}

		// Use domain name as default if name is empty
		const configsWithDefaults = websiteConfigs.map((config) => ({
			...config,
			name: config.name.trim() || generateWebsiteName(config.domain.name),
		}));

		await onSave(configsWithDefaults);
	};

	const updateWebsiteConfig = useCallback(
		(index: number, updates: Partial<WebsiteConfig>) => {
			setWebsiteConfigs((prev) =>
				prev.map((config, i) =>
					i === index ? { ...config, ...updates } : config
				)
			);
		},
		[]
	);

	const handleClose = useCallback(() => {
		onClose();
		setWebsiteConfigs([]);
	}, [onClose]);

	const isFormValid = useMemo(() => {
		return (
			websiteConfigs.length > 0 &&
			websiteConfigs.every((config) => config.target.length > 0)
		);
	}, [websiteConfigs]);

	if (selectedDomains.length === 0) {
		return null;
	}

	return (
		<Sheet onOpenChange={handleClose} open={isOpen}>
			<SheetContent
				className="w-full overflow-y-auto p-6 sm:max-w-2xl"
				side="right"
			>
				<SheetHeader className="space-y-3 border-border/50 border-b pb-6">
					<div className="flex items-center gap-3">
						<div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
							<GlobeIcon className="h-6 w-6 text-primary" weight="duotone" />
						</div>
						<div>
							<SheetTitle className="font-semibold text-foreground text-xl">
								{isMultipleMode
									? `Integrate ${websiteConfigs.length} Websites`
									: 'Integrate Website'}
							</SheetTitle>
							<SheetDescription className="mt-1 text-muted-foreground">
								{isMultipleMode
									? `Integrate websites for ${selectedProject?.name} and configure environment variables`
									: `Integrate website for ${websiteConfigs[0]?.domain.name} and configure environment variables`}
							</SheetDescription>
						</div>
					</div>
				</SheetHeader>

				<div className="space-y-6 pt-6">
					{websiteConfigs.map((config, index) => (
						<div
							className="space-y-4 rounded-lg border bg-card p-4"
							key={config.domain.name}
						>
							<div className="flex items-center justify-between border-border/50 border-b pb-3">
								<div className="flex items-center gap-3">
									<div className="rounded bg-muted p-1.5">
										<GlobeIcon className="h-4 w-4 text-muted-foreground" />
									</div>
									<div className="flex items-center gap-2">
										<span className="font-medium">{config.domain.name}</span>
										{config.domain.verified ? (
											<Badge
												className="border-green-200 bg-green-50 text-green-700 text-xs"
												variant="outline"
											>
												<CheckCircleIcon className="mr-1 h-3 w-3" />
												Verified
											</Badge>
										) : (
											<Badge
												className="border-yellow-200 bg-yellow-50 text-xs text-yellow-700"
												variant="outline"
											>
												<WarningIcon className="mr-1 h-3 w-3" />
												Pending
											</Badge>
										)}
									</div>
								</div>
								{config.domain.gitBranch && (
									<Badge
										className="border-muted bg-muted/50 text-muted-foreground text-xs"
										variant="outline"
									>
										<GitBranchIcon className="mr-1 h-3 w-3" />
										{config.domain.gitBranch}
									</Badge>
								)}
							</div>

							<div className="space-y-2">
								<Label
									className="font-medium text-sm"
									htmlFor={`name-${index}`}
								>
									Website Name
								</Label>
								<Input
									className="h-9 rounded border-border/50 transition-colors hover:border-border focus:border-primary/50 focus:ring-primary/20"
									id={`name-${index}`}
									onChange={(e) =>
										updateWebsiteConfig(index, { name: e.target.value })
									}
									placeholder={generateWebsitePlaceholder(config.domain.name)}
									value={config.name}
								/>
							</div>

							<div className="space-y-3">
								<Label className="font-medium text-sm">
									Target Environments
								</Label>
								<div className="flex flex-wrap gap-2">
									{['production', 'preview'].map((env) => (
										<Button
											className="h-8 rounded text-xs transition-colors"
											key={env}
											onClick={() => {
												const newTarget = config.target.includes(env)
													? config.target.filter((t) => t !== env)
													: [...config.target, env];
												updateWebsiteConfig(index, { target: newTarget });
											}}
											size="sm"
											variant={
												config.target.includes(env) ? 'default' : 'outline'
											}
										>
											{env.charAt(0).toUpperCase() + env.slice(1)}
										</Button>
									))}
								</div>
								<p className="text-muted-foreground text-xs">
									Select which Vercel environments should receive the
									DATABUDDY_CLIENT_ID variable
								</p>
							</div>

							<div className="rounded border bg-muted/30 p-3">
								<div className="mb-2 flex items-center gap-2">
									<div className="h-2 w-2 rounded-full bg-green-500" />
									<Label className="font-medium text-sm">
										Environment Variable Preview
									</Label>
								</div>
								<div className="space-y-2 text-sm">
									<div className="flex items-center justify-between">
										<span className="font-mono text-muted-foreground">
											DATABUDDY_CLIENT_ID
										</span>
										<Badge
											className="bg-primary/10 text-primary text-xs"
											variant="outline"
										>
											Auto-generated
										</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">
											Target Environments:
										</span>
										<div className="flex gap-1">
											{config.target.length > 0 ? (
												config.target.map((env) => (
													<Badge
														className="text-xs"
														key={env}
														variant="secondary"
													>
														{env}
													</Badge>
												))
											) : (
												<span className="text-muted-foreground text-xs">
													None selected
												</span>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					))}

					<div className="rounded border border-primary/20 bg-primary/5 p-4">
						<div className="mb-3 flex items-center gap-2">
							<CheckCircleIcon className="h-5 w-5 text-primary" />
							<h4 className="font-medium text-primary">Summary</h4>
						</div>
						<ul className="space-y-2 text-primary/80 text-sm">
							<li className="flex items-center gap-2">
								<div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
								<span>
									Integrate {websiteConfigs.length} website
									{websiteConfigs.length !== 1 ? 's' : ''} in Databuddy
								</span>
							</li>
							<li className="flex items-center gap-2">
								<div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
								<span>Generate unique client IDs for each website</span>
							</li>
							<li className="flex items-center gap-2">
								<div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
								<span>
									Add DATABUDDY_CLIENT_ID environment variables to Vercel
								</span>
							</li>
						</ul>
					</div>

					<div className="flex justify-end gap-3 border-border/50 border-t pt-6">
						<Button
							className="rounded transition-colors hover:bg-muted"
							disabled={isSaving}
							onClick={handleClose}
							variant="outline"
						>
							Cancel
						</Button>
						<Button
							className="relative rounded bg-gradient-to-r from-primary to-primary/90 transition-colors hover:from-primary/90 hover:to-primary"
							disabled={!isFormValid || isSaving}
							onClick={handleSubmit}
						>
							{isSaving && (
								<div className="absolute left-3">
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
								</div>
							)}
							<span className={isSaving ? 'ml-6' : ''}>
								{isSaving ? (
									'Integrating...'
								) : (
									<>
										<PlusIcon className="mr-2 h-4 w-4" />
										Integrate {websiteConfigs.length} Website
										{websiteConfigs.length !== 1 ? 's' : ''}
									</>
								)}
							</span>
						</Button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}

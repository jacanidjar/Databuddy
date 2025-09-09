import {
	ArrowRightIcon,
	CaretRightIcon,
	GitBranchIcon,
	GlobeIcon,
	PlusIcon,
} from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { FaviconImage } from '@/components/analytics/favicon-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc';
import type { Domain, Project } from './types';

interface ProjectRowProps {
	project: Project;
	isExpanded: boolean;
	onToggle: () => void;
	onCreateWebsite: (domain: Domain) => void;
	onCreateMultipleWebsites: (project: Project, domains: Domain[]) => void;
}

const formatTimeAgo = (timestamp: number): string => {
	const now = Date.now();
	const diff = now - timestamp;
	const minutes = Math.floor(diff / (1000 * 60));
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));

	if (minutes < 60) {
		return `${minutes}m ago`;
	}
	if (hours < 24) {
		return `${hours}h ago`;
	}
	return `${days}d ago`;
};

const GitHubIcon = () => (
	<svg
		className="h-4 w-4 flex-shrink-0"
		fill="currentColor"
		viewBox="0 0 24 24"
	>
		<title>GitHub Repository</title>
		<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
	</svg>
);

export function ProjectRow({
	project,
	isExpanded,
	onToggle,
	onCreateWebsite,
	onCreateMultipleWebsites,
}: ProjectRowProps) {
	const [selectedDomains, setSelectedDomains] = useState<Set<string>>(
		new Set()
	);

	const { data: domainsData, isLoading: isLoadingDomains } =
		trpc.vercel.getProjectDomains.useQuery(
			{ projectId: project.id },
			{ enabled: isExpanded }
		);

	// Filter out domains that redirect to other domains that already exist
	const filteredDomains =
		domainsData?.domains?.filter((domain) => {
			if (!domain.redirect) {
				return true;
			}

			// Check if the redirect target exists in the same domain list
			const redirectTargetExists = domainsData.domains.some(
				(otherDomain) =>
					otherDomain.name === domain.redirect &&
					otherDomain.name !== domain.name
			);

			return !redirectTargetExists;
		}) || [];

	const handleDomainSelection = (domainName: string, checked: boolean) => {
		const newSelected = new Set(selectedDomains);
		if (checked) {
			newSelected.add(domainName);
		} else {
			newSelected.delete(domainName);
		}
		setSelectedDomains(newSelected);
	};

	const handleSelectAll = () => {
		if (selectedDomains.size === filteredDomains.length) {
			setSelectedDomains(new Set());
		} else {
			setSelectedDomains(new Set(filteredDomains.map((d) => d.name)));
		}
	};

	const handleCreateSelected = () => {
		const selectedDomainObjects = filteredDomains.filter((domain) =>
			selectedDomains.has(domain.name)
		);
		if (selectedDomainObjects.length > 0) {
			onCreateMultipleWebsites(project, selectedDomainObjects);
		}
	};

	return (
		<motion.div
			animate={{
				backgroundColor: isExpanded
					? 'hsl(var(--muted) / 0.3)'
					: 'hsl(var(--card))',
			}}
			className="overflow-hidden border-b bg-card transition-colors hover:bg-muted/20"
			initial={false}
			transition={{ duration: 0.2 }}
		>
			<div
				className="flex cursor-pointer items-center justify-between p-4"
				onClick={onToggle}
			>
				<div className="flex items-center">
					<motion.div
						animate={{ rotate: isExpanded ? 90 : 0 }}
						className="mr-3"
						transition={{ duration: 0.2 }}
					>
						<CaretRightIcon className="h-4 w-4 text-muted-foreground" />
					</motion.div>

					{project.primaryDomain ? (
						<div className="mr-3">
							<FaviconImage
								className="size-8"
								domain={project.primaryDomain}
								fallbackIcon={
									<div className="flex h-8 w-8 items-center justify-center rounded bg-muted font-medium text-muted-foreground text-sm">
										{project.name.charAt(0).toUpperCase()}
									</div>
								}
								size={32}
							/>
						</div>
					) : (
						<div className="mr-3 flex h-8 w-8 items-center justify-center rounded bg-muted font-medium text-muted-foreground text-sm">
							{project.name.charAt(0).toUpperCase()}
						</div>
					)}

					<div className="flex flex-col">
						<div className="flex items-center">
							<span className="font-medium text-foreground">
								{project.name}
							</span>
							{project.framework && (
								<Badge className="ml-2 text-xs" variant="secondary">
									{project.framework}
								</Badge>
							)}
							{project.live && (
								<Badge
									className="ml-2 bg-green-100 text-green-800 text-xs dark:bg-green-900 dark:text-green-100"
									variant="default"
								>
									Live
								</Badge>
							)}
						</div>
					</div>
				</div>

				<div className="grid min-w-0 grid-cols-[1fr_auto] items-center gap-2 text-muted-foreground text-sm sm:grid-cols-[150px_1fr_100px_70px] sm:gap-4 lg:grid-cols-[200px_1fr_120px_80px]">
					<div className="flex justify-start">
						{project.link?.repo ? (
							<Badge className="max-w-full" variant="outline">
								<div className="flex min-w-0 items-center space-x-1">
									<GitHubIcon />
									<span className="hidden truncate sm:inline">
										{project.link.org}/{project.link.repo}
									</span>
								</div>
							</Badge>
						) : (
							<span className="text-muted-foreground">—</span>
						)}
					</div>

					<div className="flex justify-center truncate">
						{project.live ? (
							<span className="text-blue-600">fix: meta</span>
						) : (
							<span className="text-muted-foreground">
								No Production Deployment
							</span>
						)}
					</div>

					<div className="hidden justify-center sm:flex">
						{project.link?.productionBranch ? (
							<div className="flex min-w-0 items-center space-x-1">
								<GitBranchIcon className="h-4 w-4 flex-shrink-0" />
								<span className="truncate">
									{project.link.productionBranch}
								</span>
							</div>
						) : (
							<span className="text-muted-foreground">—</span>
						)}
					</div>

					<div className="flex justify-end">
						{project.updatedAt ? (
							<span className="whitespace-nowrap">
								{formatTimeAgo(project.updatedAt)}
							</span>
						) : (
							<span className="text-muted-foreground">—</span>
						)}
					</div>
				</div>
			</div>

			<AnimatePresence>
				{isExpanded && (
					<motion.div
						animate={{ height: 'auto', opacity: 1 }}
						className="overflow-hidden"
						exit={{ height: 0, opacity: 0 }}
						initial={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
					>
						<div className="bg-muted/30">
							{isLoadingDomains ? (
								<div>
									<div className="flex items-center justify-between border-border/20 border-b bg-muted/20 px-4 py-2">
										<div className="flex items-center">
											<GlobeIcon className="mr-2 h-3 w-3 text-muted-foreground" />
											<div className="flex flex-col">
												<Skeleton className="h-4 w-40" />
												<Skeleton className="mt-1 h-3 w-24" />
											</div>
										</div>
										<Skeleton className="h-6 w-16" />
									</div>
								</div>
							) : filteredDomains.length ? (
								<div>
									{filteredDomains.length > 1 && (
										<div className="border-border/20 border-b bg-muted/20 px-4 py-2">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div
														className="flex cursor-pointer items-center gap-2"
														onClick={handleSelectAll}
													>
														<Checkbox
															checked={
																selectedDomains.size ===
																	filteredDomains.length &&
																filteredDomains.length > 0
															}
															className="cursor-pointer"
															onCheckedChange={handleSelectAll}
														/>
														<span className="text-muted-foreground text-xs">
															Select All
														</span>
													</div>
													<div className="flex items-center text-muted-foreground text-xs">
														<GlobeIcon className="mr-2 h-3 w-3" />
														<span>
															{filteredDomains.length} domains found
															{selectedDomains.size > 0 &&
																` (${selectedDomains.size} selected)`}
														</span>
													</div>
												</div>
												<div className="flex gap-2">
													{selectedDomains.size > 0 && (
														<Button
															className="h-6 text-xs"
															onClick={(e) => {
																e.stopPropagation();
																handleCreateSelected();
															}}
															size="sm"
															variant="default"
														>
															<PlusIcon className="mr-1 h-2 w-2" />
															Integrate Selected ({selectedDomains.size})
														</Button>
													)}
													<Button
														className="h-6 text-xs"
														onClick={(e) => {
															e.stopPropagation();
															onCreateMultipleWebsites(
																project,
																filteredDomains
															);
														}}
														size="sm"
														variant="outline"
													>
														<PlusIcon className="mr-1 h-2 w-2" />
														Integrate All
													</Button>
												</div>
											</div>
										</div>
									)}

									{filteredDomains.map((domain) => (
										<div
											className="border-border/20 border-b bg-muted/10 px-4 py-2 transition-colors hover:bg-muted/20"
											key={domain.name}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<Checkbox
														checked={selectedDomains.has(domain.name)}
														className="cursor-pointer"
														onCheckedChange={(checked) =>
															handleDomainSelection(
																domain.name,
																checked as boolean
															)
														}
													/>
													<GlobeIcon className="h-3 w-3 text-muted-foreground" />
													<div className="flex flex-col">
														<div className="flex items-center">
															<span className="font-medium text-sm">
																{domain.name}
															</span>
															{!domain.verified && (
																<Badge
																	className="ml-2 border-yellow-200 bg-yellow-50 text-xs text-yellow-600"
																	variant="outline"
																>
																	Pending
																</Badge>
															)}
														</div>
														<div className="mt-0.5 flex flex-wrap items-center gap-3 text-muted-foreground/70 text-xs">
															{domain.redirect && (
																<span className="flex items-center">
																	<ArrowRightIcon className="mr-1 h-2 w-2" />
																	Redirects to: {domain.redirect}
																	{domain.redirectStatusCode &&
																		` (${domain.redirectStatusCode})`}
																</span>
															)}
															{domain.gitBranch && (
																<span className="flex items-center">
																	<GitBranchIcon className="mr-1 h-2 w-2" />
																	{domain.gitBranch}
																</span>
															)}
															{domain.customEnvironmentId && (
																<Badge
																	className="border-muted bg-muted/50 text-muted-foreground text-xs"
																	variant="outline"
																>
																	{domain.customEnvironmentId}
																</Badge>
															)}
															<span>
																Created{' '}
																{new Date(
																	domain.createdAt
																).toLocaleDateString()}
															</span>
														</div>
													</div>
												</div>
												<Button
													className="h-6 text-xs"
													onClick={(e) => {
														e.stopPropagation();
														onCreateWebsite(domain);
													}}
													size="sm"
													variant="outline"
												>
													<PlusIcon className="mr-1 h-2 w-2" />
													Integrate
												</Button>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="bg-muted/10 py-4 text-center text-muted-foreground/70 text-xs">
									<span>No domains found for this project</span>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}

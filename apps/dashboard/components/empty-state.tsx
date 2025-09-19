'use client';

import { PlusIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface EmptyStateAction {
	label: string;
	onClick: () => void;
	variant?: 'default' | 'outline' | 'secondary';
}

export interface EmptyStateProps {
	/** Main icon to display */
	icon: ReactNode;
	/** Main heading */
	title: string;
	/** Description text */
	description: string | ReactNode;
	/** Primary action button */
	action?: EmptyStateAction;
	/** Secondary action button */
	secondaryAction?: EmptyStateAction;
	/** Custom styling variants */
	variant?: 'default' | 'simple' | 'minimal';
	/** Custom className */
	className?: string;
	/** Whether to show the plus badge on the icon */
	showPlusBadge?: boolean;
	/** Custom padding */
	padding?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
	icon,
	title,
	description,
	action,
	secondaryAction,
	variant = 'default',
	className,
	showPlusBadge = true,
	padding = 'lg',
}: EmptyStateProps) {
	const getPadding = () => {
		switch (padding) {
			case 'sm':
				return 'px-6 py-12';
			case 'md':
				return 'px-8 py-14';
			case 'lg':
				return 'px-8 py-16';
			default:
				return 'px-8 py-16';
		}
	};

	const renderIcon = () => {
		if (variant === 'simple' || variant === 'minimal') {
			return (
				<div className="mb-4 rounded-full border border-muted bg-muted/20 p-6">
					{icon}
				</div>
			);
		}

		return (
			<div className="group relative mb-8">
				<div className="rounded-full border-2 border-primary/20 bg-primary/10 p-6">
					{icon}
				</div>
				{showPlusBadge && (
					<div
						aria-label="Create new item"
						className="-top-2 -right-2 absolute cursor-pointer rounded-full border-2 border-primary/20 bg-background p-2 shadow-sm"
						onClick={(e) => {
							e.stopPropagation();
							action?.onClick();
						}}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								action?.onClick();
							}
						}}
						role="button"
						tabIndex={0}
					>
						<PlusIcon className="h-6 w-6 text-primary" size={16} />
					</div>
				)}
			</div>
		);
	};

	const renderCard = () => {
		const cardClasses = cn(
			variant === 'default' &&
				'rounded-xl border-2 border-dashed bg-gradient-to-br from-background to-muted/20',
			variant === 'simple' && 'rounded border-dashed bg-muted/10',
			variant === 'minimal' && 'rounded border-none bg-transparent shadow-none',
			className
		);

		const contentClasses = cn(
			'flex flex-col items-center justify-center text-center',
			getPadding()
		);

		return (
			<Card className={cardClasses}>
				<CardContent className={contentClasses}>
					{renderIcon()}
					<div
						className={cn(
							'space-y-4',
							variant === 'minimal' && 'max-w-sm',
							variant !== 'minimal' && 'max-w-md'
						)}
					>
						<h3
							className={cn(
								'font-semibold text-foreground',
								variant === 'minimal' ? 'text-lg' : 'text-2xl'
							)}
						>
							{title}
						</h3>
						<div
							className={cn(
								'text-muted-foreground leading-relaxed',
								variant === 'minimal' ? 'text-sm' : 'text-base'
							)}
						>
							{description}
						</div>
						{(action || secondaryAction) && (
							<div
								className={cn(
									'flex gap-3 pt-2',
									variant === 'minimal' ? 'justify-center' : 'justify-center'
								)}
							>
								{action && (
									<Button
										className={cn(
											variant === 'default' &&
												'group relative cursor-pointer gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary/90 px-8 py-4 font-medium text-base transition-all duration-300 hover:from-primary/90 hover:to-primary',
											variant === 'simple' && 'gap-2',
											variant === 'minimal' && 'gap-2'
										)}
										onClick={action.onClick}
										size="lg"
										variant={action.variant || 'default'}
									>
										{variant === 'default' && (
											<div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 group-hover:translate-x-[100%]" />
										)}
										{variant === 'default' && (
											<PlusIcon
												className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:rotate-90"
												size={16}
											/>
										)}
										<span
											className={cn(variant === 'default' && 'relative z-10')}
										>
											{action.label}
										</span>
									</Button>
								)}
								{secondaryAction && (
									<Button
										onClick={secondaryAction.onClick}
										size="lg"
										variant={secondaryAction.variant || 'outline'}
									>
										{secondaryAction.label}
									</Button>
								)}
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		);
	};

	return renderCard();
}

export function FeatureEmptyState({
	icon,
	title,
	description,
	actionLabel,
	onAction,
	feature,
}: {
	icon: ReactNode;
	title: string;
	description: string;
	actionLabel: string;
	onAction: () => void;
	feature: string;
}) {
	return (
		<EmptyState
			action={{ label: actionLabel, onClick: onAction }}
			description={description}
			icon={icon}
			title={title}
			variant="default"
		/>
	);
}

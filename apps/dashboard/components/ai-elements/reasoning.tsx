'use client';

import { useControllableState } from '@radix-ui/react-use-controllable-state';
import type { ComponentProps } from 'react';
import { createContext, memo, useContext, useEffect, useState } from 'react';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

type ReasoningContextValue = {
	isStreaming: boolean;
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	duration: number;
};

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

const useReasoning = () => {
	const context = useContext(ReasoningContext);
	if (!context) {
		throw new Error('Reasoning components must be used within Reasoning');
	}
	return context;
};

export type ReasoningProps = ComponentProps<typeof Collapsible> & {
	isStreaming?: boolean;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	duration?: number;
};

const AUTO_CLOSE_DELAY = 1000;

export const Reasoning = memo(
	({
		className,
		isStreaming = false,
		open,
		defaultOpen = false,
		onOpenChange,
		duration: durationProp,
		children,
		...props
	}: ReasoningProps) => {
		const [isOpen, setIsOpen] = useControllableState({
			prop: open,
			defaultProp: defaultOpen,
			onChange: onOpenChange,
		});
		const [duration, setDuration] = useControllableState({
			prop: durationProp,
			defaultProp: 0,
		});

		const [hasAutoClosedRef, setHasAutoClosedRef] = useState(false);
		const [startTime, setStartTime] = useState<number | null>(null);

		// Track duration when streaming starts and ends
		useEffect(() => {
			if (isStreaming) {
				if (startTime === null) {
					setStartTime(Date.now());
				}
			} else if (startTime !== null) {
				setDuration(Math.round((Date.now() - startTime) / 1000));
				setStartTime(null);
			}
		}, [isStreaming, startTime, setDuration]);

		// Auto-open when streaming starts, auto-close when streaming ends (once only)
		useEffect(() => {
			if (isStreaming && !isOpen) {
				setIsOpen(true);
			} else if (!isStreaming && isOpen && !defaultOpen && !hasAutoClosedRef) {
				// Add a small delay before closing to allow user to see the content
				const timer = setTimeout(() => {
					setIsOpen(false);
					setHasAutoClosedRef(true);
				}, AUTO_CLOSE_DELAY);
				return () => clearTimeout(timer);
			}
		}, [isStreaming, isOpen, defaultOpen, setIsOpen, hasAutoClosedRef]);

		const handleOpenChange = (newOpen: boolean) => {
			setIsOpen(newOpen);
		};

		return (
			<ReasoningContext.Provider
				value={{ isStreaming, isOpen, setIsOpen, duration }}
			>
				<Collapsible
					className={cn('not-prose mb-4', className)}
					onOpenChange={handleOpenChange}
					open={isOpen}
					{...props}
				>
					{children}
				</Collapsible>
			</ReasoningContext.Provider>
		);
	}
);

export type ReasoningTriggerProps = ComponentProps<
	typeof CollapsibleTrigger
> & {
	title?: string;
};

export const ReasoningTrigger = memo(
	({
		className,
		title = 'Reasoning',
		children,
		...props
	}: ReasoningTriggerProps) => {
		const { isStreaming, duration } = useReasoning();

		return (
			<CollapsibleTrigger
				className={cn('text-muted-foreground text-sm', className)}
				{...props}
			>
				{children ??
					(isStreaming || duration === 0 ? (
						<span>Thinking...</span>
					) : (
						<span>Show reasoning</span>
					))}
			</CollapsibleTrigger>
		);
	}
);

export type ReasoningContentProps = ComponentProps<
	typeof CollapsibleContent
> & {
	children: string;
};

export const ReasoningContent = memo(
	({ className, children, ...props }: ReasoningContentProps) => (
		<CollapsibleContent
			className={cn('mt-2 text-muted-foreground text-xs', className)}
			{...props}
		>
			<div className="rounded bg-muted/30 p-2">
				<pre className="whitespace-pre-wrap font-mono text-xs">{children}</pre>
			</div>
		</CollapsibleContent>
	)
);

Reasoning.displayName = 'Reasoning';
ReasoningTrigger.displayName = 'ReasoningTrigger';
ReasoningContent.displayName = 'ReasoningContent';

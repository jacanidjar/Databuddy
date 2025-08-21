import {
	ChartBarIcon,
	ChartLineIcon,
	ChartPieIcon,
	HashIcon,
} from '@phosphor-icons/react/ssr';
import { Loader } from '@/components/ai-elements/loader';
import {
	Message as AIMessage,
	MessageAvatar,
	MessageContent,
} from '@/components/ai-elements/message';
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Response } from '@/components/ai-elements/response';
import type { Message } from '../types/message';

interface MessageBubbleProps {
	message: Message;
}

const getChartIcon = (chartType: string) => {
	switch (chartType) {
		case 'bar':
			return <ChartBarIcon className="h-4 w-4" />;
		case 'line':
			return <ChartLineIcon className="h-4 w-4" />;
		case 'pie':
			return <ChartPieIcon className="h-4 w-4" />;
		default:
			return <ChartBarIcon className="h-4 w-4" />;
	}
};

function ThinkingStepsReasoning({
	steps,
	isStreaming = false,
}: {
	steps: string[];
	isStreaming?: boolean;
}) {
	if (steps.length === 0) {
		return null;
	}

	const reasoningContent = steps.map((step) => `• ${step}`).join('\n');

	return (
		<Reasoning defaultOpen={false} isStreaming={isStreaming}>
			<ReasoningTrigger>
				<span className="cursor-pointer text-muted-foreground/60 text-xs hover:text-muted-foreground">
					{isStreaming ? 'Thinking...' : 'Show reasoning'}
				</span>
			</ReasoningTrigger>
			<ReasoningContent>{reasoningContent}</ReasoningContent>
		</Reasoning>
	);
}

function InProgressMessage({ message }: { message: Message }) {
	const hasThinkingSteps =
		message.thinkingSteps && message.thinkingSteps.length > 0;

	return (
		<AIMessage from="assistant">
			<MessageAvatar name="Databunny" src="/databunny.webp" />
			<MessageContent>
				<div className="flex items-center gap-2">
					<Loader size={16} />
					<span className="text-muted-foreground">
						Databunny is analyzing...
					</span>
				</div>

				{hasThinkingSteps && (
					<div className="mt-2 border-border/30 border-t pt-2">
						<ThinkingStepsReasoning
							isStreaming={true}
							steps={message.thinkingSteps || []}
						/>
					</div>
				)}
			</MessageContent>
		</AIMessage>
	);
}

function CompletedMessage({
	message,
	isUser,
}: {
	message: Message;
	isUser: boolean;
}) {
	const hasThinkingSteps =
		message.thinkingSteps && message.thinkingSteps.length > 0;

	return (
		<AIMessage from={isUser ? 'user' : 'assistant'}>
			{!isUser && (
				<MessageAvatar
					name={isUser ? 'You' : 'Databunny'}
					src={'/databunny.webp'}
				/>
			)}
			<MessageContent>
				<Response>{message.content}</Response>

				{hasThinkingSteps && !isUser && message.content && (
					<div className="mt-2">
						<ThinkingStepsReasoning steps={message.thinkingSteps || []} />
					</div>
				)}

				{message.responseType === 'metric' &&
					message.metricValue !== undefined &&
					!isUser && (
						<div className="mt-4 rounded border border-primary/20 bg-primary/5 p-4">
							<div className="flex min-w-0 items-center gap-3">
								<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-primary/10">
									<HashIcon className="h-4 w-4 text-primary" />
								</div>
								<div className="min-w-0 flex-1">
									<div className="truncate font-medium text-muted-foreground text-xs uppercase tracking-wide">
										{message.metricLabel || 'Result'}
									</div>
									<div className="mt-2 break-words font-bold text-foreground text-lg">
										{typeof message.metricValue === 'number'
											? message.metricValue.toLocaleString()
											: message.metricValue}
									</div>
								</div>
							</div>
						</div>
					)}

				{message.hasVisualization && !isUser && (
					<div className="mt-3 border-border/30 border-t pt-3">
						<div className="flex items-center gap-2 text-muted-foreground text-xs">
							{getChartIcon(message.chartType || 'bar')}
							<span>Visualization generated in the data panel.</span>
						</div>
					</div>
				)}
			</MessageContent>
		</AIMessage>
	);
}

export function MessageBubble({ message }: MessageBubbleProps) {
	const isUser = message.type === 'user';
	const isInProgress = message.type === 'assistant' && !message.content;

	if (isInProgress) {
		return <InProgressMessage message={message} />;
	}

	return <CompletedMessage isUser={isUser} message={message} />;
}

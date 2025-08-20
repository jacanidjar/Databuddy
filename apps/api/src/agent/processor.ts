import type { User } from '@databuddy/auth';
import type { Website } from '@databuddy/shared';
import type { AssistantRequestType } from '../schemas';
import { AssistantOrchestrator } from './core/assistant-orchestrator';
import type { StreamingUpdate } from './utils/stream-utils';

/**
 * Clean, simple processor using object-oriented architecture
 */
export async function processAssistantRequest(
	request: AssistantRequestType,
	user: User,
	website: Website
): Promise<StreamingUpdate[]> {
	const orchestrator = new AssistantOrchestrator();
	return await orchestrator.processRequest(request, user, website);
}

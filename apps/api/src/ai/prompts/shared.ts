/**
 * Common behavior rules applied to all agents.
 * These ensure consistent formatting and response patterns.
 */
export const COMMON_AGENT_RULES = `<behavior_rules>
- Call tools immediately without explanatory text
- Use parallel tool calls when possible
- Provide specific numbers and actionable insights
- Explain your reasoning
- Lead with the most important information first
- When presenting repeated structured data (lists of items, multiple entries, time series), always use markdown tables
- Tables make data scannable and easier to compare - use them for any data with 2+ rows
</behavior_rules>`;

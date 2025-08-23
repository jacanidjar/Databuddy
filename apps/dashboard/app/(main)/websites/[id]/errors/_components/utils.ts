import type { ErrorCategory } from '@databuddy/shared';

export { formatDateTime, formatDateTimeSeconds } from '@/lib/formatters';

export const getErrorCategory = (errorMessage: string): ErrorCategory => {
	if (!errorMessage) {
		return { type: 'Unknown Error', category: 'Other', severity: 'low' };
	}

	const message = errorMessage.toLowerCase();

	if (message.includes('react error')) {
		return { type: 'React Error', category: 'React', severity: 'high' };
	}
	if (message.includes('script error')) {
		return { type: 'Script Error', category: 'JavaScript', severity: 'medium' };
	}
	if (message.includes('network')) {
		return { type: 'Network Error', category: 'Network', severity: 'medium' };
	}
	if (message.includes('syntax')) {
		return { type: 'Syntax Error', category: 'JavaScript', severity: 'high' };
	}
	if (message.includes('reference')) {
		return {
			type: 'Reference Error',
			category: 'JavaScript',
			severity: 'high',
		};
	}
	if (message.includes('type')) {
		return { type: 'Type Error', category: 'JavaScript', severity: 'medium' };
	}

	return { type: 'Unknown Error', category: 'Other', severity: 'low' };
};

export const getSeverityColor = (
	severity: 'high' | 'medium' | 'low'
): string => {
	const colors = {
		high: 'bg-red-100 text-red-800 border-red-200',
		medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
		low: 'bg-blue-100 text-blue-800 border-blue-200',
	};
	return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
};

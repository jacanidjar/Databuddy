const PERCENTAGE_THRESHOLDS = {
	HIGH: 50,
	MEDIUM: 25,
	LOW: 10,
} as const;

const GRADIENT_COLORS = {
	high: {
		rgb: '34, 197, 94',
		opacity: {
			background: 0.08,
			hover: 0.12,
			border: 0.3,
			accent: 0.8,
			glow: 0.2,
		},
	},
	medium: {
		rgb: '59, 130, 246',
		opacity: {
			background: 0.08,
			hover: 0.12,
			border: 0.3,
			accent: 0.8,
			glow: 0.2,
		},
	},
	low: {
		rgb: '245, 158, 11',
		opacity: {
			background: 0.08,
			hover: 0.12,
			border: 0.3,
			accent: 0.8,
			glow: 0.2,
		},
	},
	default: {
		rgb: '107, 114, 128',
		opacity: {
			background: 0.06,
			hover: 0.1,
			border: 0.2,
			accent: 0.7,
			glow: 0.15,
		},
	},
} as const;

function createGradient(
	rgb: string,
	opacity: {
		readonly background: number;
		readonly hover: number;
		readonly border: number;
		readonly accent: number;
		readonly glow: number;
	},
	percentage: number
) {
	const {
		background: bgOpacity,
		hover: hoverOpacity,
		border: borderOpacity,
		accent: accentOpacity,
		glow: glowOpacity,
	} = opacity;

	return {
		background: `linear-gradient(90deg, rgba(${rgb}, ${bgOpacity}) 0%, rgba(${rgb}, ${bgOpacity + 0.07}) ${percentage * 0.8}%, rgba(${rgb}, ${bgOpacity + 0.04}) ${percentage}%, rgba(${rgb}, ${bgOpacity - 0.06}) ${percentage + 5}%, transparent 100%)`,
		hoverBackground: `linear-gradient(90deg, rgba(${rgb}, ${hoverOpacity}) 0%, rgba(${rgb}, ${hoverOpacity + 0.1}) ${percentage * 0.8}%, rgba(${rgb}, ${hoverOpacity + 0.06}) ${percentage}%, rgba(${rgb}, ${hoverOpacity - 0.08}) ${percentage + 5}%, transparent 100%)`,
		borderColor: `rgba(${rgb}, ${borderOpacity})`,
		accentColor: `rgba(${rgb}, ${accentOpacity})`,
		glowColor: `rgba(${rgb}, ${glowOpacity})`,
	};
}

function getPercentageGradient(percentage: number) {
	if (percentage >= PERCENTAGE_THRESHOLDS.HIGH) {
		return createGradient(
			GRADIENT_COLORS.high.rgb,
			GRADIENT_COLORS.high.opacity,
			percentage
		);
	}
	if (percentage >= PERCENTAGE_THRESHOLDS.MEDIUM) {
		return createGradient(
			GRADIENT_COLORS.medium.rgb,
			GRADIENT_COLORS.medium.opacity,
			percentage
		);
	}
	if (percentage >= PERCENTAGE_THRESHOLDS.LOW) {
		return createGradient(
			GRADIENT_COLORS.low.rgb,
			GRADIENT_COLORS.low.opacity,
			percentage
		);
	}
	return createGradient(
		GRADIENT_COLORS.default.rgb,
		GRADIENT_COLORS.default.opacity,
		percentage
	);
}

export function useTableRowPercentage<TData>() {
	const getRowPercentage = (row: TData): number => {
		const value = (row as any).percentage;
		return value !== undefined ? Number.parseFloat(String(value)) || 0 : 0;
	};

	const getRowGradient = (row: TData) => {
		const percentage = getRowPercentage(row);
		return getPercentageGradient(percentage);
	};

	const hasPercentageColumn = (data: TData[]): boolean => {
		if (!data || data.length === 0) {
			return false;
		}
		const firstRow = data[0] as any;
		return firstRow.percentage !== undefined;
	};

	return {
		getRowPercentage,
		getRowGradient,
		hasPercentageColumn,
	};
}

"use client";

import { memo } from "react";
import {
	Label,
	PolarGrid,
	PolarRadiusAxis,
	RadialBar,
	RadialBarChart,
} from "recharts";
import {
	type ChartConfig,
	ChartContainer,
} from "@/components/ui/chart";

type GaugeRating = "good" | "needs-improvement" | "poor";

type GaugeChartProps = {
	/** Current value to display */
	value: number;
	/** Maximum value for the gauge (100% fill) */
	max: number;
	/** Rating determines the color */
	rating: GaugeRating;
	/** Size of the chart in pixels */
	size?: number;
	/** Format the center label value */
	formatValue?: (value: number) => string;
	/** Optional unit to display below the value */
	unit?: string;
};

// Direct hex colors that match the theme
const RATING_COLORS: Record<GaugeRating, string> = {
	good: "#10b981", // emerald-500
	"needs-improvement": "#f59e0b", // amber-500
	poor: "#ef4444", // red-500
};

export const GaugeChart = memo(function GaugeChart({
	value,
	max,
	rating,
	size = 120,
	formatValue,
	unit,
}: GaugeChartProps) {
	// Calculate the end angle based on progress (0-360 degrees)
	const progress = Math.max(0, Math.min(value / max, 1));
	const endAngle = progress * 360;

	const displayValue = formatValue
		? formatValue(value)
		: Math.round(value).toString();

	const fillColor = RATING_COLORS[rating];

	const chartData = [
		{
			name: "value",
			value: value,
			fill: fillColor,
		},
	];

	const chartConfig = {
		value: {
			label: "Value",
			color: fillColor,
		},
	} satisfies ChartConfig;

	// Scale radii based on size
	const outerRadius = Math.round(size * 0.45);
	const innerRadius = Math.round(size * 0.33);
	const polarRadius1 = Math.round(innerRadius + (outerRadius - innerRadius) * 0.7);
	const polarRadius2 = Math.round(innerRadius + (outerRadius - innerRadius) * 0.3);

	return (
		<ChartContainer
			className="mx-auto aspect-square"
			config={chartConfig}
			style={{ height: size, width: size }}
		>
			<RadialBarChart
				data={chartData}
				endAngle={endAngle}
				innerRadius={innerRadius}
				outerRadius={outerRadius}
				startAngle={0}
			>
				<PolarGrid
					className="first:fill-muted last:fill-background"
					gridType="circle"
					polarRadius={[polarRadius1, polarRadius2]}
					radialLines={false}
					stroke="none"
				/>
				<RadialBar
					background
					cornerRadius={10}
					dataKey="value"
				/>
				<PolarRadiusAxis axisLine={false} tick={false} tickLine={false}>
					<Label
						content={({ viewBox }) => {
							if (viewBox && "cx" in viewBox && "cy" in viewBox) {
								return (
									<text
										dominantBaseline="middle"
										textAnchor="middle"
										x={viewBox.cx}
										y={viewBox.cy}
									>
										<tspan
											fill="var(--foreground)"
											fontSize="18"
											fontWeight="600"
											x={viewBox.cx}
											y={unit ? (viewBox.cy ?? 0) - 6 : viewBox.cy}
										>
											{displayValue}
										</tspan>
										{unit && (
											<tspan
												fill="var(--muted-foreground)"
												fontSize="10"
												x={viewBox.cx}
												y={(viewBox.cy ?? 0) + 10}
											>
												{unit}
											</tspan>
										)}
									</text>
								);
							}
							return null;
						}}
					/>
				</PolarRadiusAxis>
			</RadialBarChart>
		</ChartContainer>
	);
});

export type { GaugeRating, GaugeChartProps };

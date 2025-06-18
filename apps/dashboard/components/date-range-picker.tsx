"use client";

import * as React from "react";
import { CalendarIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
    className?: string;
    value?: DateRange;
    onChange?: (dateRange: DateRange | undefined) => void;
    disabled?: boolean;
    placeholder?: string;
    maxDate?: Date;
    minDate?: Date;
}

export function DateRangePicker({
    className,
    value,
    onChange,
    disabled = false,
    placeholder = "Pick a date range",
    maxDate,
    minDate,
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [tempRange, setTempRange] = React.useState<DateRange | undefined>(value);
    const [appliedRange, setAppliedRange] = React.useState<DateRange | undefined>(value);

    // Sync with external value changes
    React.useEffect(() => {
        setAppliedRange(value);
        setTempRange(value);
    }, [value]);

    // Handle temporary date selection (doesn't trigger onChange yet)
    const handleTempSelect = React.useCallback((range: DateRange | undefined) => {
        setTempRange(range);
    }, []);

    // Apply the selected range
    const handleApply = React.useCallback(() => {
        if (tempRange?.from && tempRange?.to) {
            setAppliedRange(tempRange);
            onChange?.(tempRange);
            setIsOpen(false);
        }
    }, [tempRange, onChange]);

    // Cancel changes and revert to applied range
    const handleCancel = React.useCallback(() => {
        setTempRange(appliedRange);
        setIsOpen(false);
    }, [appliedRange]);

    // Quick preset handlers
    const handlePreset = React.useCallback((days: number) => {
        const preset = {
            from: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
            to: new Date(),
        };
        setTempRange(preset);
        setAppliedRange(preset);
        onChange?.(preset);
        setIsOpen(false);
    }, [onChange]);

    // Clear selection
    const handleClear = React.useCallback(() => {
        setTempRange(undefined);
        setAppliedRange(undefined);
        onChange?.(undefined);
        setIsOpen(false);
    }, [onChange]);

    // Format display text
    const getDisplayText = React.useCallback(() => {
        if (!appliedRange?.from) {
            return "Select dates";
        }

        if (appliedRange.from && !appliedRange.to) {
            return format(appliedRange.from, "MMM d, yyyy");
        }

        if (appliedRange.from && appliedRange.to) {
            if (appliedRange.from.getTime() === appliedRange.to.getTime()) {
                return format(appliedRange.from, "MMM d, yyyy");
            }

            // Show year for both dates if they're different years
            if (appliedRange.from.getFullYear() !== appliedRange.to.getFullYear()) {
                return `${format(appliedRange.from, "MMM d, yyyy")} - ${format(appliedRange.to, "MMM d, yyyy")}`;
            }

            // Same year, show full format
            return `${format(appliedRange.from, "MMM d")} - ${format(appliedRange.to, "MMM d, yyyy")}`;
        }

        return "Select dates";
    }, [appliedRange]);

    const hasSelection = appliedRange?.from && appliedRange?.to;
    const hasValidTempSelection = tempRange?.from && tempRange?.to;

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={disabled}
                        className={cn(
                            "h-8 text-sm gap-2 whitespace-nowrap px-3 justify-start text-left font-normal border shadow-xs transition-[color,box-shadow]",
                            !hasSelection && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon size={16} className="h-4 w-4 shrink-0" />
                        <span className="truncate text-sm font-medium">
                            {getDisplayText()}
                        </span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border shadow-md rounded" align="end">
                    {/* Header showing current selection */}
                    <div className="p-4 border-b bg-muted/20">
                        <div className="text-sm text-muted-foreground">
                            {tempRange?.from && tempRange?.to ? (
                                <span className="text-foreground font-medium">
                                    {format(tempRange.from, "MMM d")} - {format(tempRange.to, "MMM d, yyyy")}
                                </span>
                            ) : tempRange?.from ? (
                                <span>
                                    <span className="text-foreground font-medium">{format(tempRange.from, "MMM d")}</span>
                                    <span className="text-muted-foreground"> → Select end date</span>
                                </span>
                            ) : (
                                <span className="font-medium">Select start date</span>
                            )}
                        </div>
                    </div>

                    <div className="p-4">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={tempRange?.from || appliedRange?.from || new Date()}
                            selected={tempRange}
                            onSelect={handleTempSelect}
                            numberOfMonths={2}
                            disabled={(date) => {
                                if (minDate && date < minDate) return true;
                                if (maxDate && date > maxDate) return true;
                                return false;
                            }}
                        />
                    </div>

                    {/* Quick presets */}
                    <div className="border-t p-4 bg-muted/20">
                        <div className="text-sm font-medium text-muted-foreground mb-3">Quick select:</div>
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-sm transition-[color,box-shadow]"
                                onClick={() => handlePreset(7)}
                            >
                                Last 7 days
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-sm transition-[color,box-shadow]"
                                onClick={() => handlePreset(30)}
                            >
                                Last 30 days
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-sm transition-[color,box-shadow]"
                                onClick={() => handlePreset(90)}
                            >
                                Last 90 days
                            </Button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t p-4 flex justify-between items-center bg-muted/20">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="text-muted-foreground hover:text-foreground h-8 transition-[color,box-shadow]"
                        >
                            Clear
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancel}
                                className="h-8 transition-[color,box-shadow]"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleApply}
                                disabled={!hasValidTempSelection}
                                className="h-8 shadow-xs transition-[color,box-shadow]"
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
} 
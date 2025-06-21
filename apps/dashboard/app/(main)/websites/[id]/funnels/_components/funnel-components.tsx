"use client";

import { useState, useEffect, useRef, memo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrashIcon, DotsNineIcon } from "@phosphor-icons/react";
import type { FunnelStep } from "@/hooks/use-funnels";

// Optimized Autocomplete Component
export const AutocompleteInput = memo(({
    value,
    onValueChange,
    suggestions,
    placeholder,
    className
}: {
    value: string;
    onValueChange: (value: string) => void;
    suggestions: string[];
    placeholder?: string;
    className?: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleInputChange = (newValue: string) => {
        onValueChange(newValue);

        if (newValue.trim()) {
            const filtered = suggestions.filter(s =>
                s.toLowerCase().includes(newValue.toLowerCase())
            ).slice(0, 8);
            setFilteredSuggestions(filtered);
            setIsOpen(filtered.length > 0);
        } else {
            setFilteredSuggestions(suggestions.slice(0, 8));
            setIsOpen(suggestions.length > 0);
        }
    };

    const handleFocus = () => {
        if (value.trim()) {
            const filtered = suggestions.filter(s =>
                s.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 8);
            setFilteredSuggestions(filtered);
            setIsOpen(filtered.length > 0);
        } else {
            setFilteredSuggestions(suggestions.slice(0, 8));
            setIsOpen(suggestions.length > 0);
        }
    };

    const handleSelect = (suggestion: string) => {
        onValueChange(suggestion);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <Input
                value={value || ''}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={handleFocus}
                placeholder={placeholder}
                className={className}
            />
            {isOpen && filteredSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredSuggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground border-b last:border-b-0"
                            onClick={() => handleSelect(suggestion)}
                        >
                            {suggestion}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

AutocompleteInput.displayName = 'AutocompleteInput';

// Optimized Draggable Step Component
export const DraggableStep = memo(({
    step,
    index,
    updateStep,
    removeStep,
    canRemove,
    getStepSuggestions,
    isDragging
}: {
    step: FunnelStep;
    index: number;
    updateStep: (index: number, field: keyof FunnelStep, value: string) => void;
    removeStep: (index: number) => void;
    canRemove: boolean;
    getStepSuggestions: (stepType: string) => string[];
    isDragging?: boolean;
}) => {
    return (
        <div
            className={`flex items-center gap-4 p-4 border rounded-xl transition-all duration-150 ${isDragging
                ? 'opacity-60 scale-[0.98] shadow-xl bg-background/95 border-primary/30'
                : 'hover:shadow-sm hover:border-border'
                }`}
        >
            {/* Drag Handle */}
            <div className="cursor-grab active:cursor-grabbing flex-shrink-0">
                <DotsNineIcon size={16} className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </div>

            {/* Step Number */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-2 border-primary/20 flex items-center justify-center text-sm font-semibold shadow-sm flex-shrink-0">
                {index + 1}
            </div>

            {/* Step Fields */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select
                    value={step.type}
                    onValueChange={(value) => updateStep(index, 'type', value)}
                >
                    <SelectTrigger className="rounded-lg border-border/50 focus:border-primary/50">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                        <SelectItem value="PAGE_VIEW">Page View</SelectItem>
                        <SelectItem value="EVENT">Event</SelectItem>
                    </SelectContent>
                </Select>
                <AutocompleteInput
                    value={step.target || ''}
                    onValueChange={(value) => updateStep(index, 'target', value)}
                    suggestions={getStepSuggestions(step.type)}
                    placeholder={step.type === 'PAGE_VIEW' ? '/path' : 'event_name'}
                    className="rounded-lg border-border/50 focus:border-primary/50 focus:ring-primary/20"
                />
                <Input
                    value={step.name}
                    onChange={(e) => updateStep(index, 'name', e.target.value)}
                    placeholder="Step name"
                    className="rounded-lg border-border/50 focus:border-primary/50 focus:ring-primary/20"
                />
            </div>

            {/* Remove Button */}
            {canRemove && (
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeStep(index)}
                    className="rounded-lg h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors flex-shrink-0"
                >
                    <TrashIcon size={16} weight="duotone" className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
});

DraggableStep.displayName = 'DraggableStep'; 
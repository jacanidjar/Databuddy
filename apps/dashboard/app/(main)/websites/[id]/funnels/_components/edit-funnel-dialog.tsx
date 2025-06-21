"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    PencilIcon,
    ChartBarIcon,
    PlusIcon,
    TrashIcon,
    FunnelIcon
} from "@phosphor-icons/react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import type { Funnel, FunnelStep, FunnelFilter, AutocompleteData, CreateFunnelData } from "@/hooks/use-funnels";
import { AutocompleteInput, DraggableStep } from "./funnel-components";


interface EditFunnelDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (funnel: Funnel) => Promise<void>;
    onCreate?: (data: CreateFunnelData) => Promise<void>;
    funnel: Funnel | null;
    isUpdating: boolean;
    isCreating?: boolean;
    autocompleteData?: AutocompleteData;
}

export function EditFunnelDialog({ isOpen, onClose, onSubmit, onCreate, funnel, isUpdating, isCreating = false, autocompleteData }: EditFunnelDialogProps) {
    const [formData, setFormData] = useState<Funnel | null>(null);
    const isCreateMode = !funnel;

    useEffect(() => {
        if (funnel) {
            setFormData({
                ...funnel,
                filters: funnel.filters || []
            });
        } else {
            // Initialize for create mode
            setFormData({
                id: '',
                name: '',
                description: '',
                steps: [
                    { type: 'PAGE_VIEW' as const, target: '/', name: 'Landing Page' },
                    { type: 'PAGE_VIEW' as const, target: '/signup', name: 'Sign Up Page' }
                ],
                filters: [],
                isActive: true,
                createdAt: '',
                updatedAt: ''
            });
        }
    }, [funnel]);

    const handleSubmit = async () => {
        if (!formData) return;

        if (isCreateMode && onCreate) {
            const createData: CreateFunnelData = {
                name: formData.name,
                description: formData.description,
                steps: formData.steps,
                filters: formData.filters || []
            };
            await onCreate(createData);
            resetForm();
        } else {
            await onSubmit(formData);
        }
    };

    const resetForm = useCallback(() => {
        if (isCreateMode) {
            setFormData({
                id: '',
                name: '',
                description: '',
                steps: [
                    { type: 'PAGE_VIEW' as const, target: '/', name: 'Landing Page' },
                    { type: 'PAGE_VIEW' as const, target: '/signup', name: 'Sign Up Page' }
                ],
                filters: [],
                isActive: true,
                createdAt: '',
                updatedAt: ''
            });
        }
    }, [isCreateMode]);

    const addStep = useCallback(() => {
        if (!formData) return;
        setFormData(prev => prev ? ({
            ...prev,
            steps: [...prev.steps, { type: 'PAGE_VIEW' as const, target: '', name: '' }]
        }) : prev);
    }, [formData]);

    const removeStep = useCallback((index: number) => {
        if (!formData || formData.steps.length <= 2) return;
        setFormData(prev => prev ? ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== index)
        }) : prev);
    }, [formData]);

    const updateStep = useCallback((index: number, field: keyof FunnelStep, value: string) => {
        if (!formData) return;
        setFormData(prev => prev ? ({
            ...prev,
            steps: prev.steps.map((step, i) =>
                i === index ? { ...step, [field]: value } : step
            )
        }) : prev);
    }, [formData]);

    const reorderSteps = useCallback((result: DropResult) => {
        if (!result.destination || !formData) return;

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        // No change needed
        if (sourceIndex === destinationIndex) return;

        const items = [...formData.steps];
        const [reorderedItem] = items.splice(sourceIndex, 1);
        items.splice(destinationIndex, 0, reorderedItem);

        setFormData(prev => prev ? ({
            ...prev,
            steps: items
        }) : prev);
    }, [formData]);

    const addFilter = useCallback(() => {
        if (!formData) return;
        setFormData(prev => prev ? ({
            ...prev,
            filters: [...(prev.filters || []), { field: 'browser_name', operator: 'equals' as const, value: '' }]
        }) : prev);
    }, [formData]);

    const removeFilter = useCallback((index: number) => {
        if (!formData) return;
        setFormData(prev => prev ? ({
            ...prev,
            filters: (prev.filters || []).filter((_, i) => i !== index)
        }) : prev);
    }, [formData]);

    const updateFilter = useCallback((index: number, field: keyof FunnelFilter, value: string) => {
        if (!formData) return;
        setFormData(prev => prev ? ({
            ...prev,
            filters: (prev.filters || []).map((filter, i) =>
                i === index ? { ...filter, [field]: value } : filter
            )
        }) : prev);
    }, [formData]);

    const filterOptions = useMemo(() => [
        { value: 'browser_name', label: 'Browser' },
        { value: 'os_name', label: 'Operating System' },
        { value: 'country', label: 'Country' },
        { value: 'device_type', label: 'Device Type' },
        { value: 'utm_source', label: 'UTM Source' },
        { value: 'utm_medium', label: 'UTM Medium' },
        { value: 'utm_campaign', label: 'UTM Campaign' },
    ], []);

    const operatorOptions = useMemo(() => [
        { value: 'equals', label: 'equals' },
        { value: 'contains', label: 'contains' },
        { value: 'not_equals', label: 'does not equal' },
    ], []);

    const getSuggestions = useCallback((field: string): string[] => {
        if (!autocompleteData) return [];

        switch (field) {
            case 'browser_name':
                return autocompleteData.browsers || [];
            case 'os_name':
                return autocompleteData.operatingSystems || [];
            case 'country':
                return autocompleteData.countries || [];
            case 'device_type':
                return autocompleteData.deviceTypes || [];
            case 'utm_source':
                return autocompleteData.utmSources || [];
            case 'utm_medium':
                return autocompleteData.utmMediums || [];
            case 'utm_campaign':
                return autocompleteData.utmCampaigns || [];
            default:
                return [];
        }
    }, [autocompleteData]);

    const getStepSuggestions = useCallback((stepType: string): string[] => {
        if (!autocompleteData) return [];

        if (stepType === 'PAGE_VIEW') {
            return autocompleteData.pagePaths || [];
        } else if (stepType === 'EVENT') {
            return autocompleteData.customEvents || [];
        }

        return [];
    }, [autocompleteData]);

    const handleClose = useCallback(() => {
        onClose();
        if (isCreateMode) {
            resetForm();
        }
    }, [onClose, isCreateMode, resetForm]);

    // Memoize form validation
    const isFormValid = useMemo(() => {
        if (!formData) return false;
        return formData.name &&
            !formData.steps.some(s => !s.name || !s.target) &&
            !(formData.filters || []).some(f => !f.value || f.value === '');
    }, [formData]);



    if (!formData) return null;

    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent side="right" className="w-[60vw] overflow-y-auto"
                style={{ width: '40vw', padding: '1rem', maxWidth: '1200px' }}
            >
                <SheetHeader className="space-y-3 pb-6 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                            {isCreateMode ? (
                                <FunnelIcon size={16} weight="duotone" className="h-6 w-6 text-primary" />
                            ) : (
                                <PencilIcon size={16} weight="duotone" className="h-6 w-6 text-primary" />
                            )}
                        </div>
                        <div>
                            <SheetTitle className="text-xl font-semibold text-foreground">
                                {isCreateMode ? 'Create New Funnel' : 'Edit Funnel'}
                            </SheetTitle>
                            <SheetDescription className="text-muted-foreground mt-1">
                                {isCreateMode
                                    ? 'Set up a new conversion funnel to track user journeys'
                                    : 'Update funnel configuration and steps'
                                }
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name" className="text-sm font-medium text-foreground">Funnel Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => prev ? ({ ...prev, name: e.target.value }) : prev)}
                                placeholder="e.g., Sign Up Flow"
                                className="rounded border-border/50 focus:border-primary/50 focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description" className="text-sm font-medium text-foreground">Description</Label>
                            <Input
                                id="edit-description"
                                value={formData.description || ''}
                                onChange={(e) => setFormData(prev => prev ? ({ ...prev, description: e.target.value }) : prev)}
                                placeholder="Optional description"
                                className="rounded border-border/50 focus:border-primary/50 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <ChartBarIcon size={16} weight="duotone" className="h-5 w-5 text-primary" />
                            <Label className="text-base font-semibold text-foreground">Funnel Steps</Label>
                            <span className="text-xs text-muted-foreground">(drag to reorder)</span>
                        </div>
                        <DragDropContext onDragEnd={reorderSteps}>
                            <Droppable droppableId="funnel-steps">
                                {(provided: any, snapshot: any) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`space-y-4 transition-colors duration-150 ${snapshot.isDraggingOver ? 'bg-accent/10 rounded-lg p-1' : ''
                                            }`}
                                    >
                                        {formData.steps.map((step, index) => (
                                            <Draggable
                                                key={`step-${index}`}
                                                draggableId={`step-${index}`}
                                                index={index}
                                            >
                                                {(provided: any, snapshot: any) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <DraggableStep
                                                            step={step}
                                                            index={index}
                                                            updateStep={updateStep}
                                                            removeStep={removeStep}
                                                            canRemove={formData.steps.length > 2}
                                                            getStepSuggestions={getStepSuggestions}
                                                            isDragging={snapshot.isDragging}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                        <Button
                            type="button"
                            variant="outline"
                            size="default"
                            className="rounded border-dashed border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
                            onClick={addStep}
                            disabled={formData.steps.length >= 10}
                        >
                            <PlusIcon size={16} className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                            Add Step
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <FunnelIcon size={16} weight="duotone" className="h-5 w-5 text-primary" />
                            <Label className="text-base font-semibold text-foreground">Filters</Label>
                            <span className="text-xs text-muted-foreground">(optional)</span>
                        </div>

                        {formData.filters && formData.filters.length > 0 && (
                            <div className="space-y-3">
                                {formData.filters.map((filter, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 border rounded bg-muted/30">
                                        <Select
                                            value={filter.field}
                                            onValueChange={(value) => updateFilter(index, 'field', value)}
                                        >
                                            <SelectTrigger className="w-40 rounded border-border/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded">
                                                {filterOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={filter.operator}
                                            onValueChange={(value) => updateFilter(index, 'operator', value)}
                                        >
                                            <SelectTrigger className="w-32 rounded border-border/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded">
                                                {operatorOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <AutocompleteInput
                                            value={filter.value as string || ''}
                                            onValueChange={(value) => updateFilter(index, 'value', value)}
                                            suggestions={getSuggestions(filter.field)}
                                            placeholder="Filter value"
                                            className="flex-1 rounded border-border/50 focus:border-primary/50 focus:ring-primary/20"
                                        />

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeFilter(index)}
                                            className="rounded h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <TrashIcon size={16} className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded border-dashed border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                            onClick={addFilter}
                        >
                            <PlusIcon size={16} className="h-4 w-4 mr-2" />
                            Add Filter
                        </Button>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="rounded"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={
                                !isFormValid ||
                                (isCreateMode ? isCreating : isUpdating)
                            }
                            className="rounded relative"
                        >
                            {(isCreateMode ? isCreating : isUpdating) && (
                                <div className="absolute left-3">
                                    <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin"></div>
                                </div>
                            )}
                            <span className={(isCreateMode ? isCreating : isUpdating) ? 'ml-6' : ''}>
                                {isCreateMode
                                    ? (isCreating ? 'Creating...' : 'Create Funnel')
                                    : (isUpdating ? 'Updating...' : 'Update Funnel')
                                }
                            </span>
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
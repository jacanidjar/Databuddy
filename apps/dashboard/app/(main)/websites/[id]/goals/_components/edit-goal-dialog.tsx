"use client";

import { Eye, MouseMiddleClick, PencilIcon, Target } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { AutocompleteData, CreateFunnelData, Funnel, FunnelStep } from "@/hooks/use-funnels";
import { AutocompleteInput } from "../../funnels/_components/funnel-components";

interface EditGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: Funnel) => Promise<void>;
  onCreate?: (data: CreateFunnelData) => Promise<void>;
  goal: Funnel | null;
  isUpdating: boolean;
  isCreating?: boolean;
  autocompleteData?: AutocompleteData;
}

export function EditGoalDialog({
  isOpen,
  onClose,
  onSubmit,
  onCreate,
  goal,
  isUpdating,
  isCreating = false,
  autocompleteData,
}: EditGoalDialogProps) {
  const [formData, setFormData] = useState<Funnel | null>(null);
  const isCreateMode = !goal;

  useEffect(() => {
    if (goal) {
      setFormData({
        ...goal,
        filters: goal.filters || [],
      });
    } else {
      // Initialize for create mode with a single step
      setFormData({
        id: "",
        name: "",
        description: "",
        steps: [{ type: "PAGE_VIEW" as const, target: "", name: "" }],
        filters: [],
        isActive: true,
        createdAt: "",
        updatedAt: "",
      });
    }
  }, [goal]);

  const handleSubmit = async () => {
    if (!formData) return;

    if (isCreateMode && onCreate) {
      const createData: CreateFunnelData = {
        name: formData.name,
        description: formData.description,
        steps: formData.steps,
        filters: formData.filters || [],
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
        id: "",
        name: "",
        description: "",
        steps: [{ type: "PAGE_VIEW" as const, target: "", name: "" }],
        filters: [],
        isActive: true,
        createdAt: "",
        updatedAt: "",
      });
    }
  }, [isCreateMode]);

  const updateStep = useCallback(
    (field: keyof FunnelStep, value: string) => {
      if (!formData) return;
      setFormData((prev) =>
        prev
          ? {
              ...prev,
              steps: [
                {
                  ...prev.steps[0],
                  [field]: value,
                },
              ],
            }
          : prev
      );
    },
    [formData]
  );

  const getStepSuggestions = useCallback(
    (stepType: string): string[] => {
      if (!autocompleteData) return [];

      if (stepType === "PAGE_VIEW") {
        return autocompleteData.pagePaths || [];
      }
      if (stepType === "EVENT") {
        return autocompleteData.customEvents || [];
      }

      return [];
    },
    [autocompleteData]
  );

  const handleClose = useCallback(() => {
    onClose();
    if (isCreateMode) {
      resetForm();
    }
  }, [onClose, isCreateMode, resetForm]);

  // Memoize form validation
  const isFormValid = useMemo(() => {
    if (!formData) return false;
    return formData.name && formData.steps[0]?.target;
  }, [formData]);

  const getStepIcon = (type: string) => {
    switch (type) {
      case "PAGE_VIEW":
        return <Eye className="text-blue-600" size={16} weight="duotone" />;
      case "EVENT":
        return <MouseMiddleClick className="text-green-600" size={16} weight="duotone" />;
      default:
        return <Target className="text-muted-foreground" size={16} weight="duotone" />;
    }
  };

  const step = formData?.steps[0];

  if (!formData) return null;

  return (
    <Sheet onOpenChange={handleClose} open={isOpen}>
      <SheetContent
        className="w-[60vw] overflow-y-auto"
        side="right"
        style={{ width: "40vw", padding: "1rem", maxWidth: "1200px" }}
      >
        <SheetHeader className="space-y-3 border-border/50 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-3">
              {isCreateMode ? (
                <Target className="h-6 w-6 text-primary" size={16} weight="duotone" />
              ) : (
                <PencilIcon className="h-6 w-6 text-primary" size={16} weight="duotone" />
              )}
            </div>
            <div>
              <SheetTitle className="font-semibold text-foreground text-xl">
                {isCreateMode ? "Create New Goal" : "Edit Goal"}
              </SheetTitle>
              <SheetDescription className="mt-1 text-muted-foreground">
                {isCreateMode
                  ? "Set up a new goal to track single-step conversions"
                  : "Update goal configuration and tracking settings"}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 pt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="font-medium text-foreground text-sm" htmlFor="edit-name">
                Goal Name
              </Label>
              <Input
                className="rounded-lg border-border/50 focus:border-primary/50 focus:ring-primary/20"
                id="edit-name"
                onChange={(e) =>
                  setFormData((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                }
                placeholder="e.g., Newsletter Signup"
                value={formData.name}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-medium text-foreground text-sm" htmlFor="edit-description">
                Description
              </Label>
              <Input
                className="rounded-lg border-border/50 focus:border-primary/50 focus:ring-primary/20"
                id="edit-description"
                onChange={(e) =>
                  setFormData((prev) => (prev ? { ...prev, description: e.target.value } : prev))
                }
                placeholder="Optional description"
                value={formData.description || ""}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" size={16} weight="duotone" />
              <Label className="font-semibold text-base text-foreground">Goal Target</Label>
            </div>

            <div className="flex items-center gap-4 rounded-xl border p-4 transition-all duration-150 hover:border-border hover:shadow-sm">
              {/* Goal Number */}
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-gradient-to-br from-primary to-primary/80 font-semibold text-primary-foreground text-sm shadow-sm">
                1
              </div>

              {/* Goal Fields */}
              <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3">
                <Select onValueChange={(value) => updateStep("type", value)} value={step?.type}>
                  <SelectTrigger className="rounded-lg border-border/50 focus:border-primary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="PAGE_VIEW">Page View</SelectItem>
                    <SelectItem value="EVENT">Event</SelectItem>
                  </SelectContent>
                </Select>
                <AutocompleteInput
                  className="rounded-lg border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  onValueChange={(value) => updateStep("target", value)}
                  placeholder={step?.type === "PAGE_VIEW" ? "/path" : "event_name"}
                  suggestions={getStepSuggestions(step?.type || "PAGE_VIEW")}
                  value={step?.target || ""}
                />
                <Input
                  className="rounded-lg border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  onChange={(e) => updateStep("name", e.target.value)}
                  placeholder="Goal name"
                  value={step?.name || ""}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-border/50 border-t pt-6">
            <Button className="rounded-lg" onClick={handleClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button
              className="relative rounded-lg"
              disabled={!isFormValid || (isCreateMode ? isCreating : isUpdating)}
              onClick={handleSubmit}
            >
              {(isCreateMode ? isCreating : isUpdating) && (
                <div className="absolute left-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                </div>
              )}
              <span className={(isCreateMode ? isCreating : isUpdating) ? "ml-6" : ""}>
                {isCreateMode
                  ? isCreating
                    ? "Creating..."
                    : "Create Goal"
                  : isUpdating
                    ? "Updating..."
                    : "Update Goal"}
              </span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

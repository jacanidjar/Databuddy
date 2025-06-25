"use client";

import { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BuildingsIcon, UsersIcon } from "@phosphor-icons/react";
import { useOrganizations } from "@/hooks/use-organizations";
import { useRouter } from "next/navigation";

interface CreateOrganizationData {
    name: string;
    slug: string;
    logo: string;
    metadata: Record<string, any>;
}

interface CreateOrganizationDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateOrganizationDialog({ isOpen, onClose }: CreateOrganizationDialogProps) {
    const { createOrganization, isCreatingOrganization } = useOrganizations();
    const router = useRouter();

    const [formData, setFormData] = useState<CreateOrganizationData>({
        name: "",
        slug: "",
        logo: "",
        metadata: {},
    });

    // Auto-generate slug from name
    useEffect(() => {
        if (formData.name && !formData.slug) {
            const generatedSlug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();
            setFormData((prev: CreateOrganizationData) => ({ ...prev, slug: generatedSlug }));
        }
    }, [formData.name, formData.slug]);

    const resetForm = () => {
        setFormData({
            name: "",
            slug: "",
            logo: "",
            metadata: {},
        });
    };

    const handleClose = () => {
        onClose();
        resetForm();
    };

    const handleSubmit = async () => {
        if (!isFormValid) return;

        try {
            createOrganization(formData);
            handleClose();
            // Navigate to organizations page after creation
            router.push("/organizations");
        } catch (error) {
            // Error is handled by the mutation
        }
    };

    // Form validation
    const isFormValid = useMemo(() => {
        return formData.name.trim().length >= 2 &&
            (formData.slug || "").trim().length >= 2 &&
            /^[a-z0-9-]+$/.test(formData.slug || "");
    }, [formData.name, formData.slug]);

    const handleSlugChange = (value: string) => {
        // Only allow lowercase letters, numbers, and hyphens
        const cleanSlug = value
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "")
            .replace(/-+/g, "-");
        setFormData((prev: CreateOrganizationData) => ({ ...prev, slug: cleanSlug }));
    };

    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent side="right" className="w-[40vw] overflow-y-auto p-6" style={{ maxWidth: '600px', minWidth: '500px' }}>
                <SheetHeader className="space-y-3 pb-6 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded bg-primary/10 border border-primary/20">
                            <BuildingsIcon size={16} weight="duotone" className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <SheetTitle className="text-xl font-semibold text-foreground">
                                Create New Organization
                            </SheetTitle>
                            <SheetDescription className="text-muted-foreground mt-1">
                                Set up a new organization to collaborate with your team
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-6 pt-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="org-name" className="text-sm font-medium text-foreground">
                                Organization Name *
                            </Label>
                            <Input
                                id="org-name"
                                value={formData.name}
                                onChange={(e) => setFormData((prev: CreateOrganizationData) => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Acme Corporation"
                                className="rounded border-border/50 focus:border-primary/50 focus:ring-primary/20"
                                maxLength={100}
                            />
                            <p className="text-xs text-muted-foreground">
                                This is the display name for your organization
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="org-slug" className="text-sm font-medium text-foreground">
                                Organization Slug *
                            </Label>
                            <Input
                                id="org-slug"
                                value={formData.slug}
                                onChange={(e) => handleSlugChange(e.target.value)}
                                placeholder="e.g., acme-corp"
                                className="rounded border-border/50 focus:border-primary/50 focus:ring-primary/20"
                                maxLength={50}
                            />
                            <p className="text-xs text-muted-foreground">
                                Used in URLs and must be unique. Only lowercase letters, numbers, and hyphens allowed.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="org-logo" className="text-sm font-medium text-foreground">
                                Logo URL
                                <span className="text-muted-foreground font-normal"> (optional)</span>
                            </Label>
                            <Input
                                id="org-logo"
                                type="url"
                                value={formData.logo || ""}
                                onChange={(e) => setFormData((prev: CreateOrganizationData) => ({ ...prev, logo: e.target.value }))}
                                placeholder="https://example.com/logo.png"
                                className="rounded border-border/50 focus:border-primary/50 focus:ring-primary/20"
                            />
                            <p className="text-xs text-muted-foreground">
                                URL to your organization's logo image
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <UsersIcon size={16} weight="duotone" className="h-5 w-5 text-primary" />
                            <Label className="text-base font-semibold text-foreground">Getting Started</Label>
                        </div>
                        <div className="p-4 rounded border border-border/50 bg-muted/30">
                            <p className="text-sm text-muted-foreground">
                                After creating your organization, you'll be able to:
                            </p>
                            <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    Invite team members with different roles
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    Share websites and analytics data
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    Manage organization settings and permissions
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="rounded"
                            disabled={isCreatingOrganization}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!isFormValid || isCreatingOrganization}
                            className="rounded relative"
                        >
                            {isCreatingOrganization && (
                                <div className="absolute left-3">
                                    <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin"></div>
                                </div>
                            )}
                            <span className={isCreatingOrganization ? 'ml-6' : ''}>
                                {isCreatingOrganization ? 'Creating...' : 'Create Organization'}
                            </span>
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
} 
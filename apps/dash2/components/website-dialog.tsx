"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Globe, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Website } from "@/hooks/use-websites";
import { createWebsite as createWebsiteAction, updateWebsite } from "@/app/actions/websites";
import type { CreateWebsiteData } from "@/hooks/use-websites";
import type { UseMutateFunction } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type VerifiedDomain = {
  id: string;
  name: string;
  verificationStatus: "PENDING" | "VERIFIED" | "FAILED";
};

const createFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  domainId: z.string().min(1, "Please select a verified domain"),
  subdomain: z.string().optional(),
});

const editFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type CreateFormData = z.infer<typeof createFormSchema>;
type EditFormData = z.infer<typeof editFormSchema>;

interface WebsiteDialogProps {
  website?: Website | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  verifiedDomains: VerifiedDomain[];
  trigger?: React.ReactNode;
  initialValues?: {
    name?: string;
    domainId?: string;
  } | null;
  onCreate?: UseMutateFunction<Website, Error, CreateWebsiteData, unknown>;
}

export function WebsiteDialog({
  website,
  open,
  onOpenChange,
  isLoading,
  verifiedDomains = [],
  trigger,
  initialValues = null,
  onCreate,
}: WebsiteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!website;

  const form = useForm<CreateFormData | EditFormData>({
    resolver: zodResolver(isEditing ? editFormSchema : createFormSchema),
    defaultValues: {
      name: initialValues?.name || website?.name || "",
      ...(isEditing ? {} : {
        subdomain: "",
        domainId: initialValues?.domainId || "",
      }),
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: initialValues?.name || website?.name || "",
        ...(isEditing ? {} : {
          subdomain: "",
          domainId: initialValues?.domainId || "",
        }),
      });
    }
  }, [form, initialValues, website, open, isEditing]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (data: CreateFormData | EditFormData) => {
    setIsSubmitting(true);
    try {
      if (!website && onCreate) {
        const createData = data as CreateFormData;
        const selectedDomain = verifiedDomains.find(d => d.id === createData.domainId);
        if (!selectedDomain) {
          toast.error("Please select a verified domain");
          setIsSubmitting(false);
          return;
        }

        await onCreate({
          name: createData.name,
          domainId: createData.domainId,
          domain: selectedDomain.name,
          subdomain: createData.subdomain,
        }, {
          onSuccess: () => {
            toast.success("Website created successfully");
            handleClose();
          },
          onError: (error) => {
            toast.error(error.message || "Failed to create website");
          },
          onSettled: () => {
            setIsSubmitting(false);
          }
        });
      } else if (website) {
        const editData = data as EditFormData;
        const result = await updateWebsite(website.id, editData.name);

        if (result.error) {
          toast.error(result.error);
          setIsSubmitting(false);
          return;
        }
        toast.success("Website updated successfully");
        handleClose();
      } else if (!onCreate) {
        console.error("onCreate prop is required for creating a new website but was not provided.");
        toast.error("Configuration error: Cannot create website.");
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      console.error("[WebsiteDialog] Unexpected error:", error);
      if (!isSubmitting) {
          toast.error(error instanceof Error ? error.message : "Failed to save website");
      }
    } finally {
      if (website || !onCreate) {
        setIsSubmitting(false);
      }
    }
  };

  const selectedDomain = verifiedDomains.find(d => d.id === (form.watch("domainId") as string));
  const isLocalhost = selectedDomain?.name.includes('localhost') || selectedDomain?.name.includes('127.0.0.1');
  const verifiedDomainsList = verifiedDomains.filter(domain => domain.verificationStatus === "VERIFIED");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            {isLocalhost ? <Terminal className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
            <DialogTitle>{isEditing ? "Edit Website" : "Add Website"}</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Update your website settings"
              : "Configure a new website for analytics tracking"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Website" {...field} className="h-9" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            
            {!isEditing && (
              <>
                <FormField
                  control={form.control}
                  name="domainId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-1.5">
                        <FormLabel className="text-xs font-medium">Domain</FormLabel>
                        {field.value && selectedDomain?.verificationStatus === "VERIFIED" && (
                          <Badge variant="outline" className="h-5 px-1.5 text-xs font-normal">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select a verified domain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {verifiedDomainsList.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">
                              No verified domains available
                            </div>
                          ) : (
                            verifiedDomainsList.map((domain) => (
                              <SelectItem key={domain.id} value={domain.id}>
                                {domain.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {selectedDomain && (
                  <FormField
                    control={form.control}
                    name="subdomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Subdomain (Optional)</FormLabel>
                        <div className="flex items-center">
                          <FormControl>
                            <Input 
                              placeholder="blog" 
                              {...field} 
                              className="h-9 rounded-r-none border-r-0"
                            />
                          </FormControl>
                          <div className="flex h-9 items-center rounded-r-md border bg-muted px-3 text-sm text-muted-foreground">
                            .{selectedDomain.name}
                          </div>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
            
            <DialogFooter className="pt-2">
              <div className="flex w-full gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting || isLoading}
                  className="flex-1 h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="flex-1 h-9"
                >
                  {isSubmitting || isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Globe, Terminal } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import type { Website } from "@/hooks/use-websites";
import { useWebsitesStore } from "@/stores/use-websites-store";

// Helper to normalize a domain (remove protocol, www, and trailing slash)
function normalizeDomain(domain: string): string {
  let normalized = domain.trim().toLowerCase();
  normalized = normalized.replace(/^(https?:\/\/)?(www\.)?/i, '');
  normalized = normalized.replace(/\/+$/, '');
  return normalized;
}

// Helper to extract domain string from domain object or string
function getDomainString(domain: string | { name: string } | any): string {
  if (typeof domain === 'string') {
    return domain;
  }
  
  if (domain && typeof domain === 'object' && 'name' in domain) {
    return domain.name;
  }
  
  return '';
}

// Parse a full domain into subdomain and domain parts
function parseDomain(fullDomain: string): { subdomain: string; domain: string } {
  const normalized = normalizeDomain(fullDomain);
  const parts = normalized.split('.');
  
  if (parts.length > 2) {
    const subdomain = parts[0];
    const domain = parts.slice(1).join('.');
    return { subdomain, domain };
  }
  
  return { subdomain: '', domain: normalized };
}

// Combine subdomain and domain
function combineDomain(subdomain: string, domain: string): string {
  if (!subdomain || subdomain.trim() === '') {
    return domain;
  }
  return `${subdomain}.${domain}`;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subdomain: z.string().optional(),
  domainId: z.string().min(1, "Please select a verified domain"),
});

interface WebsiteDialogProps {
  website?: Website | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
  verifiedDomains: Array<{
    id: string;
    name: string;
    verificationStatus: "PENDING" | "VERIFIED" | "FAILED";
  }>;
  trigger?: React.ReactNode;
  initialValues?: {
    name?: string;
    domain?: string;
    domainId?: string;
  } | null;
}

export function WebsiteDialog({
  website,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  verifiedDomains = [],
  trigger,
  initialValues = null,
}: WebsiteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBaseDomain, setSelectedBaseDomain] = useState('');
  const setSelectedWebsite = useWebsitesStore(state => state.setSelectedWebsite);
  const websites = useWebsitesStore(state => state.websites);
  
  // Get domain as string and extract subdomain
  const domainString = website ? getDomainString(website.domain) : '';
  const { subdomain } = parseDomain(domainString);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name || website?.name || "",
      subdomain: subdomain || "",
      domainId: initialValues?.domainId || website?.domainId || undefined,
    },
  });

  // Reset form when dialog opens or initialValues/website changes
  useEffect(() => {
    if (open) {
      const updatedDomainString = website ? getDomainString(website.domain) : '';
      const { subdomain } = parseDomain(updatedDomainString);
      
      // Check for verified domain
      let hasVerified = false;
      const domainId = initialValues?.domainId || website?.domainId;
      
      if (domainId) {
        const verifiedDomain = verifiedDomains.find(d => d.id === domainId);
        if (verifiedDomain) {
          const baseDomain = normalizeDomain(verifiedDomain.name);
          hasVerified = true;
          setSelectedBaseDomain(baseDomain);
        }
      }
      
      // Only reset if values have changed
      const currentValues = form.getValues();
      const newValues = {
        name: initialValues?.name || website?.name || "",
        subdomain: subdomain || "",
        domainId: domainId || undefined,
      };
      
      if (JSON.stringify(currentValues) !== JSON.stringify(newValues)) {
        form.reset(newValues);
      }
    }
  }, [form, initialValues, website, open, verifiedDomains]);

  const handleClose = () => {
    setSelectedWebsite(null);
    setSelectedBaseDomain('');
    onOpenChange(false);
  };

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    // Get the selected domain
    const selectedDomain = verifiedDomains.find(d => d.id === data.domainId);
    if (!selectedDomain) {
      form.setError('domainId', { 
        type: 'required', 
        message: 'Please select a verified domain' 
      });
      return;
    }
    
    // Get full domain
    const fullDomain = combineDomain(data.subdomain || '', normalizeDomain(selectedDomain.name));
    
    // Check for duplicates
    if (!website) {
      const normalizedInput = normalizeDomain(fullDomain);
      const domainExists = websites.some(w => {
        const normalizedExisting = normalizeDomain(getDomainString(w.domain));
        return normalizedExisting === normalizedInput;
      });
      
      if (domainExists) {
        form.setError('subdomain', {
          type: 'manual',
          message: 'A website with this domain already exists'
        });
        return;
      }
    }
    
    // Submit data
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: data.name,
        domain: fullDomain,
        domainId: data.domainId
      });
      handleClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save website");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!website;
  const isLocalhost = domainString.includes('localhost') || domainString.includes('127.0.0.1');

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
            {/* Name field */}
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
            
            {/* Domain selection */}
            <FormField
              control={form.control}
              name="domainId"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between mb-1.5">
                    <FormLabel className="text-xs font-medium">Domain</FormLabel>
                    {field.value && (
                      <Badge variant="outline" className="h-5 px-1.5 text-xs font-normal">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      
                      const selectedDomain = verifiedDomains.find(d => d.id === value);
                      if (selectedDomain) {
                        const normalizedDomain = normalizeDomain(selectedDomain.name);
                        setSelectedBaseDomain(normalizedDomain);
                      }
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select a verified domain" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {verifiedDomains.map((domain) => (
                        <SelectItem key={domain.id} value={domain.id}>
                          {domain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            
            {/* Subdomain field */}
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
                        disabled={isEditing}
                        className={`h-9 rounded-r-none border-r-0 ${isEditing ? "bg-muted" : ""}`}
                      />
                    </FormControl>
                    <div className="flex h-9 items-center rounded-r-md border bg-muted px-3 text-sm text-muted-foreground">
                      .{selectedBaseDomain}
                    </div>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            
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
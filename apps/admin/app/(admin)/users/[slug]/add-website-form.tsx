'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { addWebsite, getUserDomains } from "../actions";
import { useEffect } from "react";

const addWebsiteSchema = z.object({
  name: z.string().optional(),
  domainId: z.string().min(1, "Please select a domain"),
  subdomain: z.string().optional().refine((val) => {
    if (!val) return true;
    return /^[a-zA-Z0-9-]+$/.test(val);
  }, "Subdomain can only contain letters, numbers, and hyphens"),
  status: z.enum(['ACTIVE', 'HEALTHY', 'UNHEALTHY', 'INACTIVE', 'PENDING']).default('PENDING'),
});

type AddWebsiteForm = z.infer<typeof addWebsiteSchema>;

interface Domain {
  id: string;
  name: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
}

interface AddWebsiteFormProps {
  userId: string;
}

export function AddWebsiteForm({ userId }: AddWebsiteFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(false);

  const form = useForm<AddWebsiteForm>({
    resolver: zodResolver(addWebsiteSchema),
    defaultValues: {
      name: '',
      domainId: '',
      subdomain: '',
      status: 'PENDING',
    },
  });

  useEffect(() => {
    if (isOpen) {
      loadUserDomains();
    }
  }, [isOpen]);

  const loadUserDomains = async () => {
    setLoadingDomains(true);
    try {
      const result = await getUserDomains(userId);
      if (result.error) {
        toast.error(result.error);
        setDomains([]);
      } else {
        setDomains(result.domains || []);
      }
    } catch (error) {
      toast.error('Failed to load domains');
      setDomains([]);
    } finally {
      setLoadingDomains(false);
    }
  };

  const onSubmit = async (data: AddWebsiteForm) => {
    setIsLoading(true);
    try {
      const selectedDomain = domains.find(d => d.id === data.domainId);
      if (!selectedDomain) {
        toast.error('Selected domain not found');
        return;
      }

      const websiteData = {
        name: data.name || null,
        domainId: data.domainId,
        subdomain: data.subdomain || undefined,
        status: data.status,
      };

      const result = await addWebsite(userId, websiteData);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }

      const fullDomain = data.subdomain ? `${data.subdomain}.${selectedDomain.name}` : selectedDomain.name;
      toast.success(`Website "${data.name || fullDomain}" added successfully with ${data.status.toLowerCase()} status`);
      form.reset();
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to add website');
      console.error('Error adding website:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Website
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Website</DialogTitle>
          <DialogDescription>
            Add a new website to this user's account. Select from their verified domains.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {form.watch('domainId') && (
              <div className="rounded-lg border p-3 bg-muted/30">
                <div className="text-sm font-medium text-muted-foreground mb-1">Website URL Preview:</div>
                <div className="text-sm font-mono">
                  {(() => {
                    const selectedDomain = domains.find(d => d.id === form.watch('domainId'));
                    const subdomain = form.watch('subdomain');
                    if (!selectedDomain) return '';
                    const fullDomain = subdomain ? `${subdomain}.${selectedDomain.name}` : selectedDomain.name;
                    return `https://${fullDomain}`;
                  })()}
                </div>
              </div>
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website Name (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="My Awesome Website" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    A friendly name for the website (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="domainId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isLoading || loadingDomains}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingDomains ? "Loading domains..." : "Select a domain"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {domains.length === 0 && !loadingDomains && (
                        <SelectItem value="no-domains" disabled>
                          No domains available
                        </SelectItem>
                      )}
                      {domains.map((domain) => (
                        <SelectItem 
                          key={domain.id} 
                          value={domain.id}
                          disabled={domain.verificationStatus !== 'VERIFIED'}
                        >
                          <div className="flex items-center gap-2">
                            <span>{domain.name}</span>
                            {domain.verificationStatus === 'VERIFIED' ? (
                              <span className="text-xs text-green-600">✓ Verified</span>
                            ) : (
                              <span className="text-xs text-amber-600">⚠ {domain.verificationStatus}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a verified domain owned by this user
                    {domains.some(d => d.verificationStatus !== 'VERIFIED') && (
                      <span className="block text-xs text-amber-600 mt-1">
                        Note: Only verified domains can be used for websites
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subdomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subdomain (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="www, api, app, etc." 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional subdomain (e.g., "www" for www.example.com)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select initial status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="HEALTHY">Healthy</SelectItem>
                      <SelectItem value="UNHEALTHY">Unhealthy</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Set the initial status for this website
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Website'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
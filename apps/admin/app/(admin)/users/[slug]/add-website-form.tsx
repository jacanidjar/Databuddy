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
import { addWebsite } from "../actions";
import { useEffect } from "react";

const addWebsiteSchema = z.object({
  name: z.string().optional(),
  domain: z.string().min(1, "Please enter a domain"),
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

  const form = useForm<AddWebsiteForm>({
    defaultValues: {
      name: '',
      domain: '',
      status: 'PENDING',
    },
  });


  const onSubmit = async (data: AddWebsiteForm) => {
    setIsLoading(true);
    try {
      const websiteData = {
        name: data.name || null,
        domain: data.domain,
        status: data.status,
      };

      const result = await addWebsite(userId, websiteData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`Website "${data.name || data.domain}" added successfully with ${data.status.toLowerCase()} status`);
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
            {form.watch('domain') && (
              <div className="rounded-lg border p-3 bg-muted/30">
                <div className="text-sm font-medium text-muted-foreground mb-1">Website URL Preview:</div>
                <div className="text-sm font-mono">
                  {(() => {
                    return `https://${form.watch('domain')}`;
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
                        <SelectValue placeholder="Pending, Active, Healthy, Unhealthy, Inactive" />
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
                    Set the initial status for this website (optional)
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
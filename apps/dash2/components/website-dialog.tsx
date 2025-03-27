"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

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

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  domain: z.string().url("Must be a valid URL"),
});

type FormValues = z.infer<typeof formSchema>;

type WebsiteDialogProps = {
  children: React.ReactNode;
  website?: {
    id: string;
    name: string | null;
    domain: string;
  };
  onSubmit: (values: FormValues) => void;
  isSubmitting?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function WebsiteDialog({
  children,
  website,
  onSubmit,
  isSubmitting = false,
  open,
  onOpenChange,
}: WebsiteDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isEditing = !!website;
  
  // Determine if we're using controlled or uncontrolled mode
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: website?.name || "",
      domain: website?.domain || "",
    },
  });

  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    try {
      await onSubmit(values);
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Website" : "Add New Website"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your website details"
              : "Add a new website to track with Databuddy"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Website"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Website"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
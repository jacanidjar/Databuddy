"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Copy, ExternalLink, RefreshCw, Check, Loader2, X } from "lucide-react";

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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { checkDomainVerification, regenerateVerificationToken } from "@/app/actions/websites";

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  domain: z.string().url("Must be a valid URL"),
  verificationToken: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type WebsiteDialogProps = {
  children: React.ReactNode;
  website?: {
    id: string;
    name: string | null;
    domain: string;
    verifiedAt?: Date | null;
    verificationToken?: string | null;
    status?: string;
    verificationStatus?: string;
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
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'unverified'>(
    website?.verifiedAt ? 'verified' : 'unverified'
  );
  const [verificationToken, setVerificationToken] = useState(website?.verificationToken || '');
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [isRegeneratingToken, setIsRegeneratingToken] = useState(false);
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

  // Copy verification token to clipboard
  const copyVerificationToken = () => {
    navigator.clipboard.writeText(verificationToken);
    toast.success("Verification token copied to clipboard");
  };

  // Check verification status
  const checkVerificationStatus = async () => {
    if (!website?.id) return;
    
    setIsCheckingVerification(true);
    try {
      const result = await checkDomainVerification(website.id);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      if (result.data?.verified) {
        setVerificationStatus('verified');
        toast.success(result.data.message || "Domain verified successfully");
      } else {
        toast.error(result.data?.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verification check error:", error);
      toast.error("Failed to check verification status");
    } finally {
      setIsCheckingVerification(false);
    }
  };

  // Regenerate verification token
  const handleRegenerateToken = async () => {
    if (!website?.id) return;
    
    setIsRegeneratingToken(true);
    try {
      const result = await regenerateVerificationToken(website.id);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      if (result.data) {
        setVerificationToken(result.data.verificationToken || '');
        setVerificationStatus('unverified');
        toast.success("Verification token regenerated");
      }
    } catch (error) {
      console.error("Token regeneration error:", error);
      toast.error("Failed to regenerate token");
    } finally {
      setIsRegeneratingToken(false);
    }
  };

  // Extract domain from URL for DNS instructions
  const getDomainForDNS = () => {
    if (!website?.domain) return '';
    try {
      return new URL(website.domain).hostname;
    } catch (e) {
      return website.domain;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
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
                      disabled={isSubmitting || isEditing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Domain Verification</h4>
                    <p className="text-sm text-muted-foreground">
                      Your website must be verified before it can be used. Add the following DNS record to verify ownership:
                    </p>
                    <div className="rounded-md bg-muted p-3 font-mono text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">TXT Record:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => {
                            navigator.clipboard.writeText(`_databuddy.${new URL(website?.domain || '').hostname.replace(/^www\./, '')}`);
                            toast("DNS record name copied to clipboard");
                          }}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="mt-1">_databuddy.{new URL(website?.domain || '').hostname.replace(/^www\./, '')}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-muted-foreground">Value:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => {
                            navigator.clipboard.writeText(website?.verificationToken || '');
                            toast("Verification token copied to clipboard");
                          }}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="mt-1">{website?.verificationToken}</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Note: DNS changes can take up to 48 hours to propagate. If verification fails, wait a while and try again.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={checkVerificationStatus}
                      disabled={isCheckingVerification}
                    >
                      {isCheckingVerification ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Verify Domain
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRegenerateToken}
                      disabled={isRegeneratingToken}
                    >
                      {isRegeneratingToken ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Regenerate Token
                        </>
                      )}
                    </Button>
                  </div>
                  {verificationStatus === "verified" && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Domain verified successfully</span>
                    </div>
                  )}  
                  {verificationStatus === "pending" && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Domain verification pending</span>
                    </div>
                  )}
                  {verificationStatus === "unverified" && (
                    <div className="flex items-center gap-2 text-red-600">
                      <X className="h-4 w-4" />
                      <span className="text-sm font-medium">Domain verification failed</span>
                    </div>
                  )}
                </div>
              </>
            )}

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
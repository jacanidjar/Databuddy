"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw, Plus, Trash2, AlertCircle } from "lucide-react";
import type { Domain, DomainActions } from "../types";

interface DomainRowActionsProps {
  domain: Domain;
  actions: DomainActions;
  domainIsVerifying: boolean;
  domainVerificationProgress: number;
  isRetrying: boolean;
  onVerify: () => void;
  onDelete: () => void;
  onRegenerate: () => void;
  onRetry: () => void;
  onCreate: () => void;
  updateActions: (updates: Partial<DomainActions>) => void;
}

export function DomainRowActions({
  domain,
  actions,
  domainIsVerifying,
  domainVerificationProgress,
  isRetrying,
  onVerify,
  onDelete,
  onRegenerate,
  onRetry,
  onCreate,
  updateActions
}: DomainRowActionsProps) {
  const domainIsDeleting = actions.isDeleting[domain.id] || false;
  const domainIsRegenerating = actions.isRegenerating[domain.id] || false;
  const deleteDialogOpen = actions.deleteDialogOpen[domain.id] || false;
  const regenerateDialogOpen = actions.regenerateDialogOpen[domain.id] || false;

  return (
    <div className="flex justify-end space-x-2">
      {domain.verificationStatus === "PENDING" && (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onVerify}
                  disabled={domainIsVerifying}
                >
                  {domainIsVerifying ? (
                    <span className="flex items-center">
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      {domainVerificationProgress}%
                    </span>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Verify domain ownership</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog 
                  open={regenerateDialogOpen} 
                  onOpenChange={(open) => updateActions({ 
                    regenerateDialogOpen: { ...actions.regenerateDialogOpen, [domain.id]: open }
                  })}
                >
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      disabled={domainIsRegenerating}
                      className="text-amber-600 hover:text-amber-800 border-amber-200 hover:border-amber-300"
                    >
                      <RefreshCw className={`h-4 w-4 ${domainIsRegenerating ? "animate-spin" : ""}`} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Regenerate Verification Token</DialogTitle>
                      <DialogDescription>
                        This will generate a new verification token for <strong>{domain.name}</strong>. 
                        You'll need to update your DNS record with the new token value.
                      </DialogDescription>
                    </DialogHeader>
                    <Alert className="my-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Important</AlertTitle>
                      <AlertDescription>
                        After regenerating, your current DNS record will no longer work. 
                        Make sure to update it with the new token immediately.
                      </AlertDescription>
                    </Alert>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => updateActions({ 
                          regenerateDialogOpen: { ...actions.regenerateDialogOpen, [domain.id]: false }
                        })}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={onRegenerate}
                        disabled={domainIsRegenerating}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        {domainIsRegenerating ? (
                          <span className="flex items-center">
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Regenerating...
                          </span>
                        ) : (
                          "Regenerate Token"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>Regenerate verification token</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
      
      {domain.verificationStatus === "FAILED" && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="default" 
                onClick={onRetry}
                disabled={domainIsRegenerating || isRetrying}
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${domainIsRegenerating || isRetrying ? "animate-spin" : ""}`} />
                Retry
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset and retry verification</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {domain.verificationStatus === "VERIFIED" && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onCreate}
                className="text-green-600 hover:text-green-800"
              >
                <Plus className="h-4 w-4 mr-1" />
                Website
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create website with this domain</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Dialog 
              open={deleteDialogOpen} 
              onOpenChange={(open) => updateActions({ 
                deleteDialogOpen: { ...actions.deleteDialogOpen, [domain.id]: open }
              })}
            >
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Domain</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete {domain.name}? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => updateActions({ 
                      deleteDialogOpen: { ...actions.deleteDialogOpen, [domain.id]: false }
                    })}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={onDelete}
                    disabled={domainIsDeleting}
                  >
                    {domainIsDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete domain</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
} 
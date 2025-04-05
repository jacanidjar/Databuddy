"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebsiteDialog } from "@/components/website-dialog";
import { useWebsites } from "@/hooks/use-websites";
import { LoadingState } from "@/components/websites/loading-state";
import { EmptyState } from "@/components/websites/empty-state";
import { ErrorState } from "@/components/websites/error-state";
import { WebsiteCard } from "@/components/websites/website-card";
import { VerificationDialog } from "@/components/websites/verification-dialog";

export default function WebsitesPage() {
  const searchParams = useSearchParams();
  const shouldOpenDialog = searchParams.get('new') === 'true';
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const {
    websites,
    selectedWebsite,
    isLoading,
    isError,
    isCreating,
    isUpdating,
    isDeleting,
    isVerifying,
    isRegenerating,
    showVerificationDialog,
    setSelectedWebsite,
    setShowVerificationDialog,
    createWebsite,
    updateWebsite,
    deleteWebsite,
    verifyDomain,
    regenerateToken,
    refetch,
  } = useWebsites();

  // Handle the query parameter to open the dialog
  useEffect(() => {
    if (shouldOpenDialog) {
      setDialogOpen(true);
    }
  }, [shouldOpenDialog]);

  if (isError) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Websites</h1>
          <p className="text-muted-foreground mt-1">
            Manage your websites for analytics tracking
          </p>
        </div>
        <WebsiteDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={createWebsite}
          isSubmitting={isCreating}
        >
          <Button size="default" className="h-10">
            <Plus className="h-4 w-4 mr-2" />
            Add Website
          </Button>
        </WebsiteDialog>
      </div>

      {/* Show loading state */}
      {isLoading && <LoadingState />}

      {/* Show empty state */}
      {!isLoading && websites.length === 0 && (
        <EmptyState onCreateWebsite={createWebsite} isCreating={isCreating} />
      )}

      {/* Show website grid */}
      {!isLoading && websites.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {websites.map((website) => (
            <WebsiteCard
              key={website.id}
              website={website}
              onUpdate={(id, data) => updateWebsite({ id, data })}
              onVerify={(website) => {
                setSelectedWebsite(website);
                setShowVerificationDialog(true);
              }}
              isUpdating={isUpdating}
              isVerifying={isVerifying}
            />
          ))}
        </div>
      )}

      {/* Verification Dialog */}
      <VerificationDialog
        website={selectedWebsite}
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        onVerify={verifyDomain}
        onRegenerateToken={async (id) => {
          try {
            await regenerateToken(id);
            // Refetch to get the latest data
            await refetch();
            // Find the updated website
            const updatedWebsite = websites.find(w => w.id === id);
            if (!updatedWebsite) {
              return { error: "Failed to find updated website" };
            }
            // Update the selected website with new data
            setSelectedWebsite(updatedWebsite);
            return { data: updatedWebsite };
          } catch (error) {
            console.error('Error regenerating token:', error);
            return { error: "Failed to regenerate token" };
          }
        }}
        isVerifying={isVerifying}
        isRegenerating={isRegenerating}
      />
    </div>
  );
} 
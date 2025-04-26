"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebsiteDialog } from "@/components/website-dialog";
import { useWebsites } from "@/hooks/use-websites";
import { LoadingState } from "@/components/websites/loading-state";
import { EmptyState } from "@/components/websites/empty-state";
import { ErrorState } from "@/components/websites/error-state";
import { WebsiteCard } from "@/components/websites/website-card";

function WebsitesPage() {
  const searchParams = useSearchParams();
  const shouldOpenDialog = searchParams.get('new') === 'true';
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const {
    websites,
    isLoading,
    isError,
    isCreating,
    isUpdating,
    createWebsite,
    updateWebsite,
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
          isLoading={isCreating}
          trigger={
            <Button size="default" className="h-10">
              <Plus className="h-4 w-4 mr-2" />
              Add Website
            </Button>
          }
        />
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
              isUpdating={isUpdating}
            />
          ))}
        </div>
      )}
    </div>
  );
} 

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WebsitesPage />
    </Suspense>
  )
}
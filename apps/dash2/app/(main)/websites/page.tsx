"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Globe, MoreHorizontal, Plus, ExternalLink, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { WebsiteDialog } from "@/components/website-dialog";
import { useWebsites } from "@/hooks/use-websites";

export default function WebsitesPage() {
  const searchParams = useSearchParams();
  const shouldOpenDialog = searchParams.get('new') === 'true';
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const {
    websites,
    isLoading,
    isError,
    createWebsite,
    isCreating,
    updateWebsite,
    isUpdating,
    deleteWebsite,
    isDeleting,
    refetch,
  } = useWebsites();
  
  const [websiteToDelete, setWebsiteToDelete] = useState<string | null>(null);

  // Handle the query parameter to open the dialog
  useEffect(() => {
    if (shouldOpenDialog) {
      setDialogOpen(true);
    }
  }, [shouldOpenDialog]);

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (websiteToDelete) {
      deleteWebsite(websiteToDelete);
      setWebsiteToDelete(null);
    }
  };

  if (isError) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Websites</h1>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">
            Failed to load websites. Please try again.
          </p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Websites</h1>
          <p className="text-muted-foreground">
            Manage your websites for analytics tracking
          </p>
        </div>
        <WebsiteDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={(data) => createWebsite(data)}
          isSubmitting={isCreating}
        >
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Website
          </Button>
        </WebsiteDialog>
      </div>

      {/* Show loading skeletons */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardHeader className="gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Show empty state */}
      {!isLoading && websites.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
          <Globe className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-1">No websites added yet</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-4">
            Add your first website to start tracking analytics and insights.
          </p>
          <WebsiteDialog
            onSubmit={(data) => createWebsite(data)}
            isSubmitting={isCreating}
          >
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Website
            </Button>
          </WebsiteDialog>
        </div>
      )}

      {/* Show website grid */}
      {!isLoading && websites.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {websites.map((website) => (
            <Card key={website.id} className="relative overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{website.name}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/websites/${website.id}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <WebsiteDialog
                        website={website}
                        onSubmit={(data) =>
                          updateWebsite({
                            id: website.id,
                            data,
                          })
                        }
                        isSubmitting={isUpdating}
                      >
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Website
                        </DropdownMenuItem>
                      </WebsiteDialog>
                      <AlertDialog open={websiteToDelete === website.id}>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={(e) => {
                              e.preventDefault();
                              setWebsiteToDelete(website.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Website
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Website</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {website.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setWebsiteToDelete(null)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteConfirm}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeleting && websiteToDelete === website.id
                                ? "Deleting..."
                                : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardTitle>
                <CardDescription className="truncate">
                  {website.domain}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div>
                    Created{" "}
                    {new Date(website.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/websites/${website.id}`}>
                    View Analytics
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
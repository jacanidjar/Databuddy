import { Globe, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebsiteDialog } from "@/components/website-dialog";

interface EmptyStateProps {
  onCreateWebsite: (data: any) => void;
  isCreating: boolean;
}

export function EmptyState({ onCreateWebsite, isCreating }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-lg bg-accent/20">
      <Globe className="h-16 w-16 text-muted-foreground mb-5 opacity-80" />
      <h3 className="text-xl font-semibold mb-2">No websites added yet</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Add your first website to start tracking analytics and insights.
      </p>
      <WebsiteDialog
        onSubmit={onCreateWebsite}
        isSubmitting={isCreating}
      >
        <Button size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Website
        </Button>
      </WebsiteDialog>
    </div>
  );
} 
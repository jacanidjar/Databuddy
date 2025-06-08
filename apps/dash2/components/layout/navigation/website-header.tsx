import Link from "next/link";
import { ChevronLeft, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface WebsiteHeaderProps {
  website: {
    name?: string | null;
    domain: string;
  } | null | undefined;
}

export function WebsiteHeader({ website }: WebsiteHeaderProps) {
  return (
    <>
      <div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground hover:text-foreground cursor-pointer group"
          asChild
        >
          <Link href="/websites">
            <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Websites</span>
          </Link>
        </Button>
      </div>
      
      <div className="px-2 py-2 bg-accent/30 rounded-lg border border-border/50">
        <h2 className="text-base font-semibold truncate flex items-center">
          <Globe className="h-4 w-4 mr-2 text-primary/70" />
          {website?.name || website?.domain || (
            <Skeleton className="h-5 w-36" />
          )}
        </h2>
        <div className="text-xs text-muted-foreground truncate mt-1 pl-6">
          {website?.domain || <Skeleton className="h-4 w-24" />}
        </div>
      </div>
    </>
  );
} 
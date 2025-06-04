import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavigationItem as NavigationItemType } from "./types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface NavigationItemProps extends Omit<NavigationItemType, 'icon'> {
  icon: NavigationItemType['icon'];
  isActive: boolean;
  isRootLevel: boolean;
  isExternal?: boolean;
  isHighlighted?: boolean;
  currentWebsiteId?: string | null;
}

export function NavigationItem({
  name,
  icon: Icon,
  href,
  alpha,
  isActive,
  isRootLevel,
  isExternal,
  isHighlighted,
  currentWebsiteId
}: NavigationItemProps) {
  const router = useRouter();
  const fullPath = isRootLevel ? href : `/websites/${currentWebsiteId}${href}`;
  const LinkComponent = isExternal ? 'a' : Link;

  // Pre-fetch the route when component mounts
  useEffect(() => {
    if (!isExternal) {
      router.prefetch(fullPath);
    }
  }, [fullPath, isExternal, router]);

  const linkProps = isExternal 
    ? { href, target: "_blank", rel: "noopener noreferrer" } 
    : { 
        href: fullPath,
        prefetch: true
      };

  return (
    <LinkComponent
      {...linkProps}
      className={cn(
        "flex items-center gap-x-3 px-3 py-2 text-sm rounded-md transition-all cursor-pointer",
        isActive
          ? "bg-primary/15 text-primary font-medium"
          : isHighlighted 
            ? "text-foreground hover:text-primary hover:bg-accent/50" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      )}
    >
      <span className={cn("flex-shrink-0", isActive && "text-primary")}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-grow truncate">{name}</span>
      <div className="flex items-center gap-1">
        {alpha && (
          <span className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 text-xs font-medium text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50">
            Alpha
          </span>
        )}
        {isExternal && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
      </div>
    </LinkComponent>
  );
} 
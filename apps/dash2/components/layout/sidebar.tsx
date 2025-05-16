"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Globe, 
  BarChart, 
  Settings, 
  CreditCard, 
  Clock, 
  Users, 
  ChevronLeft,
  Link as LinkIcon,
  Map as MapIcon,
  MessageCircle,
  Home,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import { TopHeader } from "./top-header";
import { useWebsites } from "@/hooks/use-websites";

interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  rootLevel?: boolean;
  external?: boolean;
  highlight?: boolean;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

// Main navigation items
const mainNavigation: NavigationSection[] = [
  {
    title: "Main",
    items: [
      { name: "Websites", icon: <Globe className="h-4 w-4" />, href: "/websites", rootLevel: true, highlight: true },
      { name: "Domains", icon: <LinkIcon className="h-4 w-4" />, href: "/domains", rootLevel: true },
      { name: "Settings", icon: <Settings className="h-4 w-4" />, href: "/settings", rootLevel: true },
      { name: "Billing", icon: <CreditCard className="h-4 w-4" />, href: "/billing", rootLevel: true },
    ],
  },
  {
    title: "Resources",
    items: [
      { name: "Roadmap", icon: <MapIcon className="h-4 w-4" />, href: "https://trello.com/b/SOUXD4wE/databuddy", rootLevel: true, external: true },
      { name: "Feedback", icon: <MessageCircle className="h-4 w-4" />, href: "https://databuddy.featurebase.app/", rootLevel: true, external: true },
    ],
  }
];

// Website-specific navigation items
const websiteNavigation: NavigationSection[] = [
  {
    title: "Analytics",
    items: [
      { name: "Overview", icon: <Home className="h-4 w-4" />, href: "", highlight: true },
      { name: "Sessions", icon: <Clock className="h-4 w-4" />, href: "/sessions" },
      { name: "Profiles", icon: <Users className="h-4 w-4" />, href: "/profiles" },
      { name: "Map", icon: <MapIcon className="h-4 w-4" />, href: "/map" },
      // { name: "Charts", icon: <BarChart className="h-4 w-4" />, href: "/charts" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { websites, isLoading } = useWebsites();

  // Check if we're on a specific website page
  const websitePathMatch = pathname.match(/^\/websites\/([^\/]+)(?:\/(.*))?$/);
  const currentWebsiteId = websitePathMatch ? websitePathMatch[1] : null;
  const isInWebsiteContext = !!currentWebsiteId;

  // Find current website details
  const currentWebsite = isInWebsiteContext 
    ? websites?.find((site: any) => site.id === currentWebsiteId) 
    : null;

  const renderNavigationItems = (items: NavigationItem[], currentPath: string) => {
    return items.map((item) => {
      const fullPath = item.rootLevel ? item.href : `/websites/${currentWebsiteId}${item.href}`;
      const isActive = item.rootLevel 
        ? pathname === item.href
        : (item.href === "" 
            ? pathname === `/websites/${currentWebsiteId}` 
            : pathname === fullPath);
      
      const LinkComponent = item.external ? 'a' : Link;
      const linkProps = item.external ? { href: item.href, target: "_blank", rel: "noopener noreferrer" } : { href: fullPath };
      
      return (
        <LinkComponent
          key={item.name}
          {...linkProps}
          className={cn(
            "flex items-center gap-x-3 px-3 py-2 text-sm rounded-md transition-all cursor-pointer",
            isActive
              ? "bg-primary/15 text-primary font-medium"
              : item.highlight 
                ? "text-foreground hover:text-primary hover:bg-accent/50" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          <span className={cn("flex-shrink-0", isActive && "text-primary")}>
            {item.icon}
          </span>
          <span className="flex-grow truncate">{item.name}</span>
          {item.external && <ExternalLink className="h-3 w-3 ml-1 text-muted-foreground" />}
        </LinkComponent>
      );
    });
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <TopHeader setMobileOpen={setIsMobileOpen} />

      {/* Mobile sidebar backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsMobileOpen(false);
            }
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border/40 transition-transform duration-300 ease-in-out md:translate-x-0 pt-16",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="p-4 space-y-6">
            {isInWebsiteContext ? (
              // Website-specific navigation
              <>
                {/* Back to websites button */}
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
                
                {/* Current website name */}
                <div className="px-2 py-2 bg-accent/30 rounded-lg border border-border/50">
                  <h2 className="text-base font-semibold truncate flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-primary/70" />
                    {currentWebsite?.name || currentWebsite?.domain || (
                      <Skeleton className="h-5 w-36" />
                    )}
                  </h2>
                  <div className="text-xs text-muted-foreground truncate mt-1 pl-6">
                    {currentWebsite ? 
                      currentWebsite.domain : 
                      <Skeleton className="h-4 w-24" />
                    }
                  </div>
                </div>
                
                {/* Website navigation sections */}
                {websiteNavigation.map((section) => (
                  <div key={section.title}>
                    <h3 className="px-2 mb-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                      {section.title}
                    </h3>
                    <div className="space-y-1 ml-1">
                      {renderNavigationItems(section.items, pathname)}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              // Main navigation
              <>
                {/* Main navigation sections */}
                {mainNavigation.map((section) => (
                  <div key={section.title}>
                    <h3 className="px-2 mb-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                      {section.title}
                    </h3>
                    <div className="space-y-1 ml-1">
                      {renderNavigationItems(section.items, pathname)}
                    </div>
                  </div>
                ))}

                {/* Websites section */}
                <div>
                  <h3 className="px-2 mb-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase flex items-center">
                    <Globe className="h-3 w-3 mr-1.5 text-primary/70" />
                    Websites
                  </h3>
                  <div className="space-y-1 ml-1 mt-3">
                    {isLoading ? (
                      // Loading skeletons
                      <>
                        <div className="px-2 py-1.5">
                          <Skeleton className="h-7 w-full rounded-md" />
                        </div>
                        <div className="px-2 py-1.5">
                          <Skeleton className="h-7 w-full rounded-md" />
                        </div>
                      </>
                    ) : websites?.length === 0 ? (
                      // No websites message
                      <div className="px-3 py-2 text-sm text-muted-foreground bg-accent/30 rounded-md border border-border/50">
                        No websites yet
                      </div>
                    ) : (
                      // Website list
                      <div className="bg-accent/20 rounded-md py-1">
                        {websites.map((site: any) => (
                          <Link
                            key={site.id}
                            href={`/websites/${site.id}`}
                            className={cn(
                              "flex items-center gap-x-3 px-3 py-2 text-sm rounded-md transition-all cursor-pointer mx-1",
                              pathname === `/websites/${site.id}`
                                ? "bg-primary/15 text-primary font-medium"
                                : "text-foreground hover:bg-accent/70"
                            )}
                          >
                            <Globe className={cn("h-4 w-4", pathname === `/websites/${site.id}` && "text-primary")} />
                            <span className="truncate">{site.name || site.domain}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}   

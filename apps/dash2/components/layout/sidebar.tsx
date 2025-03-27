"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard,
  Settings,
  Sun,
  Moon,
  BarChart,
  FileText,
  Globe,
  PlusCircle,
  Filter,
  Target,
  TestTube,
  CreditCard,
  BookOpen,
  LifeBuoy,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { TopNav } from "./top-nav";
import { useWebsites } from "@/hooks/use-websites";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
// import { OrganizationSelector } from "./organization-selector";

const navigation = [
  {
    title: "OVERVIEW",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { name: "Analytics", icon: BarChart, href: "/analytics" },
      { name: "Reports", icon: FileText, href: "/reports" },
    ],
  },
  {
    title: "ANALYSIS",
    items: [
      { name: "Funnels", icon: Filter, href: "/funnels" },
      { name: "Goals", icon: Target, href: "/goals" },
      { name: "A/B Testing", icon: TestTube, href: "/experiments" },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { name: "Settings", icon: Settings, href: "/settings" },
      { name: "Billing", icon: CreditCard, href: "/billing" },
    ],
  },
  {
    title: "HELP",
    items: [
      { name: "Documentation", icon: BookOpen, href: "/docs" },
      { name: "Support", icon: LifeBuoy, href: "/support" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [websitesOpen, setWebsitesOpen] = useState(true);
  const { websites, isLoading } = useWebsites();

  // Auto-expand websites section when on a website page
  useEffect(() => {
    if (pathname.startsWith('/websites')) {
      setWebsitesOpen(true);
    }
  }, [pathname]);

  // This effect runs once after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Top Navigation Bar */}
      <TopNav setMobileOpen={setIsMobileOpen} />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transition-transform duration-200 ease-in-out md:translate-x-0 pt-16",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Navigation */}
        <div className="px-4 py-4 h-[calc(100vh-8rem)] overflow-y-auto">
          {/* OVERVIEW SECTION */}
          <div className="mb-6">
            <h3 className="px-2 mb-2 text-xs font-medium text-muted-foreground">
              OVERVIEW
            </h3>
            <div className="space-y-1">
              {navigation[0].items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-x-3 px-2 py-2 text-sm rounded-lg transition-colors group",
                    pathname === item.href
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5",
                    pathname === item.href 
                      ? "opacity-100" 
                      : "opacity-75 group-hover:opacity-100"
                  )} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* WEBSITES SECTION WITH DROPDOWN */}
          <div className="mb-6">
            <h3 className="px-2 mb-2 text-xs font-medium text-muted-foreground">
              WEBSITES
            </h3>
            <div className="space-y-1">
              {/* All Websites Link */}
              <Link
                href="/websites"
                className={cn(
                  "flex items-center gap-x-3 px-2 py-2 text-sm rounded-lg transition-colors group",
                  pathname === "/websites"
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Globe className={cn(
                  "h-5 w-5", 
                  pathname === "/websites" 
                    ? "opacity-100" 
                    : "opacity-75 group-hover:opacity-100"
                )} />
                <span>All Websites</span>
              </Link>


              {/* Websites Collapsible */}
              <Collapsible open={websitesOpen} onOpenChange={setWebsitesOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-between px-2 py-1.5 text-sm font-normal",
                      "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>My Websites</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        websitesOpen ? "transform rotate-180" : ""
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-2 space-y-1">
                  {isLoading ? (
                    // Loading skeletons
                    <>
                      <div className="px-2 py-1.5">
                        <Skeleton className="h-5 w-full rounded" />
                      </div>
                      <div className="px-2 py-1.5">
                        <Skeleton className="h-5 w-full rounded" />
                      </div>
                    </>
                  ) : websites.length === 0 ? (
                    // No websites message
                    <div className="px-4 py-2 text-xs text-muted-foreground">
                      No websites yet
                    </div>
                  ) : (
                    // Website list
                    websites.map((website) => (
                      <Link
                        key={website.id}
                        href={`/websites/${website.id}`}
                        className={cn(
                          "flex items-center gap-x-3 px-2 py-1.5 text-sm rounded-lg transition-colors",
                          pathname === `/websites/${website.id}`
                            ? "bg-accent/70 text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                      >
                        <span className="text-xs truncate max-w-[180px]">
                          {website.name || website.domain}
                        </span>
                      </Link>
                    ))
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* REMAINING SECTIONS */}
          {navigation.slice(1).map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="px-2 mb-2 text-xs font-medium text-muted-foreground">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-x-3 px-2 py-2 text-sm rounded-lg transition-colors group",
                      pathname === item.href
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5",
                      pathname === item.href 
                        ? "opacity-100" 
                        : "opacity-75 group-hover:opacity-100"
                    )} />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Theme Toggle */}
        <div className="absolute bottom-4 left-0 right-0 px-6">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "flex w-full items-center justify-between p-2 rounded-lg",
              "bg-accent/50 text-muted-foreground hover:text-foreground",
              "transition-colors"
            )}
            type="button"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            <span className="text-sm">Theme</span>
            <div className="h-5 w-5">
              {mounted && (
                theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
} 
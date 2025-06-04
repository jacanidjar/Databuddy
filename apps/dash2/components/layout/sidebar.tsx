"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, X } from "lucide-react";
import { TopHeader } from "./top-header";
import { useWebsites } from "@/hooks/use-websites";
import { WebsiteHeader } from "./navigation/website-header";
import { mainNavigation, websiteNavigation } from "./navigation/navigation-config";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const WebsiteList = dynamic(() => import("./navigation/website-list").then(mod => mod.WebsiteList), {
  ssr: false,
  loading: () => null
});

const NavigationSection = dynamic(() => import("./navigation/navigation-section").then(mod => mod.NavigationSection), {
  ssr: false,
  loading: () => null
});

interface SwipeGestureProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  children: React.ReactNode;
  className?: string;
}

function SwipeGesture({ onSwipeLeft, onSwipeRight, children, className }: SwipeGestureProps) {
  const [startX, setStartX] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!startX || !isDragging) return;
    setCurrentX(e.touches[0].clientX);
  }, [startX, isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!startX || !currentX || !isDragging) {
      setIsDragging(false);
      setStartX(null);
      setCurrentX(null);
      return;
    }

    const deltaX = currentX - startX;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    setIsDragging(false);
    setStartX(null);
    setCurrentX(null);
  }, [startX, currentX, isDragging, onSwipeLeft, onSwipeRight]);

  return (
    <div
      ref={containerRef}
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { websites, isLoading } = useWebsites();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Check if we're on a specific website page
  const websitePathMatch = pathname.match(/^\/websites\/([^\/]+)(?:\/(.*))?$/);
  const currentWebsiteId = websitePathMatch ? websitePathMatch[1] : null;
  const isInWebsiteContext = !!currentWebsiteId;

  // Find current website details
  const currentWebsite = isInWebsiteContext 
    ? websites?.find((site: any) => site.id === currentWebsiteId) 
    : null;

  // Close sidebar when route changes on mobile
  useEffect(() => {
    pathname
    setIsMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMobileOpen]);

  // Handle swipe to close sidebar
  const handleSwipeLeft = useCallback(() => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [isMobileOpen]);

  // Handle swipe to open sidebar (from edge of screen)
  const handleSwipeRight = useCallback(() => {
    if (!isMobileOpen) {
      setIsMobileOpen(true);
    }
  }, [isMobileOpen]);

  // Smooth open/close with animation states
  const openSidebar = useCallback(() => {
    setIsAnimating(true);
    setIsMobileOpen(true);
    setTimeout(() => setIsAnimating(false), 300);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsAnimating(true);
    setIsMobileOpen(false);
    setTimeout(() => setIsAnimating(false), 300);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        closeSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, closeSidebar]);

  // Add edge swipe detection for opening sidebar
  useEffect(() => {
    let startX: number | null = null;
    let isEdgeSwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      isEdgeSwipe = startX < 20; // Edge swipe area (20px from left edge)
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX || !isEdgeSwipe || isMobileOpen) return;
      
      const currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;
      
      // Only trigger if swiping right from the edge
      if (deltaX > 50) {
        setIsMobileOpen(true);
        isEdgeSwipe = false;
      }
    };

    const handleTouchEnd = () => {
      startX = null;
      isEdgeSwipe = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Top Navigation Bar */}
      <TopHeader setMobileOpen={openSidebar} />

      {/* Mobile sidebar backdrop with swipe support */}
      {isMobileOpen && (
        <SwipeGesture
          onSwipeLeft={handleSwipeLeft}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
        >
          <div 
            className="w-full h-full"
            onClick={closeSidebar}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                closeSidebar();
              }
            }}
          />
        </SwipeGesture>
      )}

      {/* Sidebar with improved mobile animations */}
      <SwipeGesture onSwipeLeft={handleSwipeLeft}>
        <div
          ref={sidebarRef}
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 bg-background border-r border-border/40 transition-all duration-300 ease-out md:translate-x-0 pt-16 shadow-2xl md:shadow-none",
            isMobileOpen ? "translate-x-0" : "-translate-x-full",
            isAnimating && "transition-transform"
          )}
        >
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 md:hidden h-8 w-8 bg-background/80 backdrop-blur-sm border border-border/40"
            onClick={closeSidebar}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>

          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-4 space-y-6 pb-8">
              {isInWebsiteContext ? (
                // Website-specific navigation
                <>
                  <WebsiteHeader website={currentWebsite} />
                  
                  {/* Website navigation sections */}
                  {websiteNavigation.map((section) => (
                    <NavigationSection
                      key={section.title}
                      title={section.title}
                      items={section.items}
                      pathname={pathname}
                      currentWebsiteId={currentWebsiteId}
                    />
                  ))}
                </>
              ) : (
                // Main navigation
                <>
                  {/* Main navigation sections */}
                  {mainNavigation.map((section) => (
                    <NavigationSection
                      key={section.title}
                      title={section.title}
                      items={section.items}
                      pathname={pathname}
                    />
                  ))}

                  {/* Websites section */}
                  <div>
                    <h3 className="px-2 mb-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase flex items-center">
                      <Globe className="h-3 w-3 mr-1.5 text-primary/70" />
                      Websites
                    </h3>
                    <div className="space-y-1 ml-1 mt-3">
                      <WebsiteList
                        websites={websites}
                        isLoading={isLoading}
                        pathname={pathname}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Mobile-only bottom padding for safe area */}
              <div className="h-8 md:hidden" />
            </div>
          </ScrollArea>

          {/* Mobile visual indicator for swipe gesture */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 md:hidden">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground/60">
              <div className="w-8 h-1 bg-muted-foreground/20 rounded-full" />
              <span>Swipe left to close</span>
            </div>
          </div>
        </div>
      </SwipeGesture>
    </>
  );
}   

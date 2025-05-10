"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSession, signOut } from "@databuddy/auth/client";
import { toast } from "sonner";
import { 
  Menu, 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  HelpCircle, 
  User,
  BookOpen,
  Moon,
  Sun,
  MessageSquare,
  Laptop,
  Search
} from "lucide-react";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NotificationsPopover } from "@/components/notifications/notifications-popover";
import { CommandSearch } from "@/components/ui/command-search";
import { useWebsites } from "@/hooks/use-websites";
import { redirect } from "next/navigation";

// Interface for website items for CommandSearch
interface WebsiteItem {
  id: string;
  name: string;
}

interface TopHeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export function TopHeader({ setMobileOpen }: TopHeaderProps) {
  const { data: session, isPending: isSessionPending } = useSession();
  const { theme, setTheme } = useTheme();
  const { websites: fetchedWebsites, isLoading: isLoadingWebsites } = useWebsites();
  
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [commandSearchOpen, setCommandSearchOpen] = useState(false);

  // Transform fetched websites for CommandSearch
  const commandSearchWebsites = useMemo((): WebsiteItem[] => {
    if (!fetchedWebsites) return [];
    return fetchedWebsites
      .filter((site: { name: string }) => site.name) // Ensure name is not null
      .map((site: { id: string; name: string }) => ({
        id: site.id,
        name: site.name
      }));
  }, [fetchedWebsites]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getUserInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      redirect("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full h-16 border-b bg-background/95 backdrop-blur-md">
      <div className="flex items-center h-full px-4 md:px-6">
        {/* Left side: Logo + Mobile menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <Link href="/websites" className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-md bg-primary shadow-sm group-hover:shadow-md transition-all duration-200">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">Databuddy</span>
          </Link>
        </div>

        {/* Placeholder for a more central search bar - Step 2 */}
        <div className="flex-1 flex justify-center px-4">
          {/* This will be replaced by the styled search bar button */}
          <Button
            variant="outline"
            className="w-full max-w-xs md:max-w-md lg:max-w-lg justify-start text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors duration-200"
            onClick={() => setCommandSearchOpen(true)}
            disabled={isLoadingWebsites} // Disable if websites are loading
          >
            <Search className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              {isLoadingWebsites ? "Loading websites..." : "Search websites, pages, actions..."}
            </span>
            <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 md:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        {/* Right Side - User Controls - adjusted to remove the small search icon */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Theme toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:flex h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Help */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:flex h-8 w-8"
            onClick={() => setHelpOpen(true)}
          >
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">Help</span>
          </Button>

          {/* Notifications */}
          <NotificationsPopover />

          {/* User Menu */}
          {!mounted || isSessionPending ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9 border border-border/50">
                    <AvatarImage
                      src={session?.user?.image || ""}
                      alt={session?.user?.name || "User"}
                    />
                    <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <div className="flex items-center justify-start gap-3 p-2 mb-1">
                  <Avatar className="h-9 w-9 border border-border/50">
                    <AvatarImage
                      src={session?.user?.image || ""}
                      alt={session?.user?.name || "User"}
                    />
                    <AvatarFallback className="text-sm font-medium">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <span className="text-sm font-medium leading-none">
                      {session?.user?.name || "User"}
                    </span>
                    <span className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email || ""}
                    </span>
                  </div>
                </div>
                
                <DropdownMenuSeparator className="my-1" />
                
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="h-9 rounded-md">
                    <Link href="/websites" className="flex items-center w-full">
                      <LayoutDashboard className="mr-2.5 h-4 w-4" />
                      Websites
                      <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="h-9 rounded-md">
                    <Link href="/settings/profile" className="flex items-center w-full">
                      <User className="mr-2.5 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="h-9 rounded-md">
                    <Link href="/settings" className="flex items-center w-full">
                      <Settings className="mr-2.5 h-4 w-4" />
                      Settings
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator className="my-1" />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer h-9 rounded-md text-destructive focus:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="mr-2.5 h-4 w-4" />
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {/* Help dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Help & Resources</DialogTitle>
            <DialogDescription>
              Get assistance and learn more about Databuddy
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <Button variant="outline" className="justify-start text-left h-auto py-3">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Documentation</h4>
                  <span className="text-xs text-muted-foreground mt-1 block">Read guides and API references</span>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start text-left h-auto py-3">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Contact Support</h4>
                  <span className="text-xs text-muted-foreground mt-1 block">Get help from our support team</span>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start text-left h-auto py-3">
              <div className="flex items-start gap-3">
                <Laptop className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Tutorials</h4>
                  <span className="text-xs text-muted-foreground mt-1 block">Learn Databuddy step by step</span>
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Command Search Dialog */}
      <CommandSearch 
        open={commandSearchOpen} 
        onOpenChange={setCommandSearchOpen} 
        userWebsites={commandSearchWebsites} // Pass transformed websites
      />
    </header>
  );
} 
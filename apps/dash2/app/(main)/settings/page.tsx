"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { EmailForm } from "@/components/settings/email-form";
import { PasswordForm } from "@/components/settings/password-form";
import { TwoFactorForm } from "@/components/settings/two-factor-form";
import { SessionsForm } from "@/components/settings/sessions-form";
import { AccountDeletion } from "@/components/settings/account-deletion";
import { ProfileForm } from "@/components/settings/profile-form";
import { Separator } from "@/components/ui/separator";
import { 
  ShieldOff, 
  User, 
  Shield, 
  Mail, 
  Lock, 
  Bell, 
  Settings,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  // Handle URL params for direct navigation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, []);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    router.push(url.pathname + url.search, { scroll: false });
  };

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "Manage your personal information and profile settings",
    },
    {
      id: "account",
      label: "Account",
      icon: Settings,
      description: "Manage your account settings and preferences",
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      description: "Manage your security settings and authentication methods",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Configure your notification preferences",
      disabled: true,
    },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="container max-w-6xl py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>
        {isMobile && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden"
          >
            {isSidebarOpen ? "Hide Menu" : "Show Menu"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className={cn(
          "col-span-12 md:col-span-3 transition-all duration-300",
          isMobile && !isSidebarOpen && "hidden md:block"
        )}>
          <Card className="h-full">
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="space-y-1 p-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-2",
                          activeTab === tab.id && "bg-secondary"
                        )}
                        onClick={() => {
                          handleTabChange(tab.id);
                          if (isMobile) setIsSidebarOpen(false);
                        }}
                        disabled={tab.disabled}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                        {tab.disabled && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            Soon
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className={cn(
          "col-span-12 md:col-span-9",
          isMobile && isSidebarOpen && "hidden md:block"
        )}>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsContent value="profile" className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Profile Information</AlertTitle>
                <AlertDescription>
                  Your profile information is used to personalize your experience and how others see you on the platform.
                  This information is visible to other users.
                </AlertDescription>
              </Alert>
              
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal information and profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Address</CardTitle>
                  <CardDescription>
                    Update your email address and manage email preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmailForm />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Change your password and manage password security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PasswordForm />
                </CardContent>
              </Card>

              <Card className="border-destructive">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ShieldOff className="h-5 w-5 text-destructive" />
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  </div>
                  <CardDescription className="text-destructive/80">
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AccountDeletion />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TwoFactorForm />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>
                    Manage and review your active sessions across devices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SessionsForm />
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-4">
                  <Button variant="outline" onClick={() => router.push("/security-log")}>
                    View Security Log
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Configure how you want to be notified
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground space-y-2">
                    <Bell className="h-8 w-8 text-muted-foreground/50" />
                    <p>Notification settings coming soon</p>
                    <p className="text-sm">We're working on this feature</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 
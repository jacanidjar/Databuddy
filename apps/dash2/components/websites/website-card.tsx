"use client";

import { AlertCircle, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";

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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { WebsiteDialog } from "@/components/website-dialog";
import { Website } from "@/hooks/use-websites";
import { useWebsitesStore } from "@/stores/use-websites-store";

interface WebsiteCardProps {
  website: Website;
  onUpdate: (id: string, data: { domain?: string }) => void;
  onVerify: (website: Website) => void;
  isUpdating: boolean;
  isVerifying: boolean;
}

export function WebsiteCard({
  website,
  onUpdate,
  onVerify,
  isUpdating,
  isVerifying,
}: WebsiteCardProps) {
  const setSelectedWebsite = useWebsitesStore(state => state.setSelectedWebsite);
  const setShowVerificationDialog = useWebsitesStore(state => state.setShowVerificationDialog);
  const [localVerifying, setLocalVerifying] = useState(false);

  const handleVerifyClick = () => {
    setSelectedWebsite(website);
    setShowVerificationDialog(true);
    onVerify(website);
  };

  const handleUnverifiedClick = () => {
    toast.error("Please verify your domain first", {
      description: "You need to verify your domain before accessing analytics.",
    });
  };

  const isVerifyingNow = isVerifying || localVerifying;
  const isLocalhost = website.domain.includes('localhost') || website.domain.includes('127.0.0.1');
  const isVerified = isLocalhost || website.verificationStatus === "VERIFIED";

  return (
    <Card className={`relative overflow-hidden border-border/60 shadow-sm card-hover-effect ${!isVerified ? 'bg-muted/50' : ''}`}>
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{website.domain}</CardTitle>
            <CardDescription>Added on {new Date(website.createdAt).toLocaleDateString()}</CardDescription>
          </div>
          <WebsiteDialog
            website={website}
            onSubmit={(data) => onUpdate(website.id, data)}
            isSubmitting={isUpdating}
          >
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </WebsiteDialog>
        </div>
        {!isVerified && !isLocalhost && (
          <Badge variant="outline" className="absolute top-2 right-12 bg-background">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unverified
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {!isVerified && !isLocalhost ? (
          <div className="text-sm text-muted-foreground">
            Please verify your domain ownership to start tracking analytics.
          </div>
        ) : (
          <div className="text-sm">
            <Badge variant="outline" className="bg-background">
              {isLocalhost ? "Local Development" : "Verified"}
            </Badge>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {isVerified || isLocalhost ? (
          <Button asChild variant="default" className="w-full">
            <Link href={`/websites/${website.id}`}>
              View Analytics
            </Link>
          </Button>
        ) : (
          <Button
            variant="default"
            className="w-full"
            onClick={handleVerifyClick}
            disabled={isVerifyingNow}
          >
            Verify Domain
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 
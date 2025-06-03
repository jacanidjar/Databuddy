"use client";

import { useState } from "react";
import { Check, AlertCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

import { WebsiteDialog } from "@/components/website-dialog";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead,
  TableCell 
} from "@/components/ui/table";
import type { Website } from "@/hooks/use-websites";
import { MiniChart } from "@/components/websites/mini-chart";
import { cn } from "@/lib/utils";

type VerifiedDomain = {
  id: string;
  name: string;
  verificationStatus: "PENDING" | "VERIFIED" | "FAILED";
};

interface WebsiteListProps {
  websites: Website[];
  onUpdate: (id: string, name: string) => void;
  isUpdating: boolean;
  verifiedDomains: VerifiedDomain[];
}

export function WebsiteList({
  websites,
  onUpdate,
  isUpdating,
  verifiedDomains
}: WebsiteListProps) {
  return (
    <div className="rounded-lg border bg-background shadow-sm overflow-hidden">
      <Table className="min-w-full text-sm">
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
            <TableHead className="w-[60%] font-medium py-3 px-4">Website</TableHead>
            <TableHead className="w-[40%] font-medium py-3 px-4">Traffic</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {websites.map((website) => (
            <WebsiteRow
              key={website.id}
              website={website}
              onUpdate={onUpdate}
              isUpdating={isUpdating}
              verifiedDomains={verifiedDomains}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


interface WebsiteRowProps {
  website: Website;
  onUpdate: (id: string, name: string) => void;
  isUpdating: boolean;
  verifiedDomains: VerifiedDomain[];
}

function WebsiteRow({
  website,
  onUpdate,
  isUpdating,
  verifiedDomains
}: WebsiteRowProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  
  const domainValue = website.domain;

  const isLocalhost = domainValue.includes('localhost') || domainValue.includes('127.0.0.1');

  // Get verification status and badge
  const getVerificationStatus = () => {
    if (isLocalhost) {
      return {
        label: "Local",
        variant: "outline" as const,
        icon: <Check className="h-3 w-3" />
      };
    }
    
    let domainDetail: VerifiedDomain | undefined;
    if (website.domainId) {
      domainDetail = verifiedDomains.find(d => d.id === website.domainId);
    } else if (website.domain) {
      domainDetail = verifiedDomains.find(d => d.name === website.domain);
    }
    
    if (!domainDetail) {
      return {
        label: "Unknown",
        variant: "outline" as const,
        icon: null
      };
    }
    
    switch (domainDetail.verificationStatus) {
      case "VERIFIED":
        return {
          label: "Verified",
          variant: "success" as const,
          icon: <Check className="h-3 w-3" />
        };
      case "FAILED":
        return {
          label: "Failed",
          variant: "destructive" as const,
          icon: <AlertCircle className="h-3 w-3" />
        };
      case "PENDING":
        return {
          label: "Pending",
          variant: "warning" as const,
          icon: <Clock className="h-3 w-3" />
        };
      default:
        return {
          label: "Unknown",
          variant: "outline" as const,
          icon: null
        };
    }
  };

  const status = getVerificationStatus();
  const badgeClass = {
    success: "bg-[color-mix(in_oklch,var(--background),var(--success)_20%)] text-[var(--success)]",
    destructive: "bg-[color-mix(in_oklch,var(--background),var(--destructive)_20%)] text-[var(--destructive)]",
    warning: "bg-[color-mix(in_oklch,var(--background),var(--warning)_20%)] text-[var(--warning)]",
    outline: "bg-[color-mix(in_oklch,var(--background),var(--muted-foreground)_15%)] text-muted-foreground"
  };

  const viewAnalyticsLink = `/websites/${website.id}`;

  const handleRowClick = (e: React.MouseEvent) => {
    // Only navigate if the click is not on a button or link
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[role="menu"]')
    ) {
      return;
    }
    router.push(viewAnalyticsLink);
  };

  return (
    <>
      <TableRow
        className="border-b last:border-b-0 cursor-pointer group transition-all duration-150 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary/60 focus-within:ring-2 focus-within:ring-primary/60"
        tabIndex={0}
        aria-label={`View analytics for ${website.name || 'website'}`}
        onClick={handleRowClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleRowClick(e as unknown as React.MouseEvent);
          }
        }}
      >
        <TableCell className="py-3 px-4 align-middle">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="font-medium group-hover:text-primary transition-colors truncate">
                {website.name || 'Unnamed Website'}
              </span>
              <div className={cn(
                "text-xs py-1 px-2 rounded-full flex items-center gap-1.5 font-medium",
                badgeClass[status.variant]
              )}>
                {status.icon && <span>{status.icon}</span>}
                <span>{status.label}</span>
              </div>
            </div>
            <span className="text-sm text-muted-foreground mt-1 truncate">
              {domainValue}
            </span>
          </div>
        </TableCell>
        <TableCell className="py-3 px-4 align-middle">
          <MiniChart
            websiteId={website.id}
            className="h-12"
          />
        </TableCell>
      </TableRow>
      <WebsiteDialog
        website={website}
        verifiedDomains={verifiedDomains}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
} 
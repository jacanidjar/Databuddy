"use client";

import type React from 'react';
import { TooltipBubble } from '@/components/ui/tooltip-bubble';
import { Link2, Eye, Users } from 'lucide-react';
import Link from 'next/link';

export interface PageTooltipProps {
  path?: string;
  visitors?: number;
  pageviews?: number;
  websiteDomain?: string;
}

const StatItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | number }) => (
  <div className="flex items-center justify-between text-xs">
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </div>
    <span className="font-medium text-foreground">{value ?? 'N/A'}</span>
  </div>
);

export const PageTooltip: React.FC<PageTooltipProps> = ({ path, visitors, pageviews, websiteDomain }) => {
  const isExternal = websiteDomain && !path?.startsWith('/');
  const fullUrl = isExternal ? path : `${websiteDomain}${path}`;
  
  return (
    <TooltipBubble>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-medium text-sm text-foreground truncate">
            <Link2 className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{path}</span>
        </div>
        
        {fullUrl && (
            <Link href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline -mt-1 truncate">
                Open Link
            </Link>
        )}

        <div className="border-t border-border/50 my-1 -mx-2" />

        <div className="flex flex-col gap-1.5">
          <StatItem icon={Users} label="Visitors" value={visitors} />
          <StatItem icon={Eye} label="Pageviews" value={pageviews} />
        </div>
      </div>
    </TooltipBubble>
  );
}; 
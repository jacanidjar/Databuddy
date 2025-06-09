"use client";

import type React from 'react';
import { TooltipBubble } from '@/components/ui/tooltip-bubble';
import ReferrerSourceCell from '@/components/atomic/ReferrerSourceCell';
import { TrendingUp, Eye } from 'lucide-react';

export interface ReferrerTooltipProps {
  name?: string;
  domain?: string;
  visitors?: number;
  pageviews?: number;
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

export const ReferrerTooltip: React.FC<ReferrerTooltipProps> = ({ name, domain, visitors, pageviews }) => {
  return (
    <TooltipBubble>
      <div className="flex flex-col gap-2">
        <ReferrerSourceCell name={name} domain={domain} />
        <div className="border-t border-border/50 my-1 -mx-2" />
        <div className="flex flex-col gap-1.5">
          <StatItem icon={TrendingUp} label="Visitors" value={visitors} />
          <StatItem icon={Eye} label="Pageviews" value={pageviews} />
        </div>
      </div>
    </TooltipBubble>
  );
}; 
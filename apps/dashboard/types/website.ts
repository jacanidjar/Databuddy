export interface Website {
  id: string;
  name: string;
  domain: string;
  trackingId?: string;
  userId: string;
  visitors?: number;
  pageViews?: number;
  bounceRate?: number;
  trend?: string;
  averageTime?: number;
  createdAt: Date;
  updatedAt: Date;
} 
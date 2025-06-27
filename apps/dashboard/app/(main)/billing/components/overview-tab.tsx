"use client";

import { BarChart3, Crown, DollarSign, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface OverviewTabProps {
  currentPlan: string;
  usageData: {
    websites: { current: number; limit: number | null };
    pageviews: { current: number; limit: number | null };
    teamMembers: { current: number; limit: number | null };
    billingCycle: string;
    nextBillingDate: string;
    renewalAmount: number;
  };
  onUpgrade: () => void;
  onCancel: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

const getUsagePercentage = (current: number, limit: number | null) => {
  if (!limit) return 0;
  return Math.min((current / limit) * 100, 100);
};

const getUsageColor = (percentage: number) => {
  if (percentage >= 90) return "text-destructive";
  if (percentage >= 75) return "text-warning";
  return "text-success";
};

export function OverviewTab({
  currentPlan,
  usageData,
  onUpgrade,
  onCancel,
  formatCurrency,
  formatDate,
}: OverviewTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className="h-4 w-4 text-yellow-500" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl">{currentPlan}</h3>
                <p className="text-muted-foreground text-sm">
                  {formatCurrency(usageData.renewalAmount)}/{usageData.billingCycle}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-700" variant="secondary">
                Active
              </Badge>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Next billing</p>
                <p className="font-medium">{formatDate(usageData.nextBillingDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium">{formatCurrency(usageData.renewalAmount)}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={onUpgrade} size="sm" variant="outline">
                <TrendingUp className="mr-1 h-3 w-3" />
                Upgrade
              </Button>
              <Button onClick={onCancel} size="sm" variant="ghost">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-4 w-4 text-green-500" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-bold text-xl">{formatCurrency(29.0)}</p>
              <p className="text-muted-foreground text-xs">Total spent</p>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subscription</span>
                <span>{formatCurrency(29.0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Add-ons</span>
                <span>{formatCurrency(0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            Usage Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Websites", ...usageData.websites },
              { label: "Monthly Pageviews", ...usageData.pageviews },
              { label: "Team Members", ...usageData.teamMembers },
            ].map((item) => {
              const percentage = getUsagePercentage(item.current, item.limit);
              return (
                <div className="space-y-2" key={item.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className={getUsageColor(percentage)}>
                      {item.current.toLocaleString()} / {item.limit?.toLocaleString() || "∞"}
                    </span>
                  </div>
                  <Progress className="h-1.5" value={percentage} />
                  <p className="text-muted-foreground text-xs">
                    {item.limit
                      ? `${(item.limit - item.current).toLocaleString()} remaining`
                      : "Unlimited"}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

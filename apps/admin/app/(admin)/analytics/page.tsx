import { getAnalyticsOverviewData } from "./actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Users2,
  Globe2,
  Network,
  ShieldCheck,
  BarChart3
} from "lucide-react";
import LineChart from "@/components/ui/line-chart";
import BarChart from "@/components/ui/bar-chart";
import BotRequestsWidget from '@/components/BotRequestsWidget';

function formatNumber(val: number | null | undefined) {
  return typeof val === 'number' && !Number.isNaN(val) ? val.toLocaleString() : '0';
}

export default async function AdminAnalyticsOverviewPage() {
  const { data, error } = await getAnalyticsOverviewData();

  if (error || !data) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-destructive" />
            Analytics Unavailable
          </CardTitle>
          <CardDescription>
            Could not load analytics data. Please try again later.
          </CardDescription>
        </CardHeader>
        {error && (
          <CardContent>
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-none bg-gradient-to-br from-primary/5 to-muted/0">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-6 pb-2">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary bg-primary/10 rounded-full p-1.5" />
            <div>
              <CardTitle className="text-2xl font-bold">Analytics Overview</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Platform metrics at a glance</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
      <div className="mb-2">
        <BotRequestsWidget />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center border-0 bg-card/90">
          <CardHeader>
            <CardTitle className="flex flex-col items-center text-2xl font-bold gap-1">
              <Users2 className="h-6 w-6 text-primary" />
              {formatNumber(data.totalUsers)}
            </CardTitle>
            <CardDescription>Users</CardDescription>
          </CardHeader>
        </Card>
        <Card className="text-center border-0 bg-card/90">
          <CardHeader>
            <CardTitle className="flex flex-col items-center text-2xl font-bold gap-1">
              <Globe2 className="h-6 w-6 text-blue-600" />
              {formatNumber(data.totalWebsites)}
            </CardTitle>
            <CardDescription>Websites</CardDescription>
          </CardHeader>
        </Card>
        <Card className="text-center border-0 bg-card/90">
          <CardHeader>
            <CardTitle className="flex flex-col items-center text-2xl font-bold gap-1">
              <Network className="h-6 w-6 text-purple-600" />
              {formatNumber(data.totalDomains)}
            </CardTitle>
            <CardDescription>Domains</CardDescription>
          </CardHeader>
        </Card>
        <Card className="text-center border-0 bg-card/90">
          <CardHeader>
            <CardTitle className="flex flex-col items-center text-2xl font-bold gap-1">
              <ShieldCheck className="h-6 w-6 text-green-600" />
              {formatNumber(data.verifiedDomains)}
            </CardTitle>
            <CardDescription>Verified</CardDescription>
          </CardHeader>
        </Card>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4">Trends</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md border-0 bg-gradient-to-br from-primary/5 to-muted/0">
            <CardHeader>
              <CardTitle>Events Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {data.eventsOverTime && data.eventsOverTime.length > 0 ? (
                <LineChart data={data.eventsOverTime} />
              ) : (
                <div className="text-muted-foreground text-center py-8">No event data.</div>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-md border-0 bg-gradient-to-br from-blue-500/5 to-muted/0">
            <CardHeader>
              <CardTitle>Top Websites</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topWebsites && data.topWebsites.length > 0 ? (
                <BarChart data={data.topWebsites} />
              ) : (
                <div className="text-muted-foreground text-center py-8">No website data.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, LayoutDashboard, Activity, Home, Globe, UserPlus, Zap, Globe2 } from 'lucide-react';
import { getAnalyticsOverviewData } from './(admin)/analytics/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function StatCard({ icon: Icon, label, value, accent, sub }: { icon: any, label: string, value: string | number, accent?: string, sub?: string }) {
  return (
    <Card className="flex-1 min-w-0 border rounded-md bg-card/95 shadow-sm p-5 flex flex-col gap-1 h-full">
      <div className="flex items-center gap-3 mb-1">
        <span className={`rounded bg-muted/60 p-2 flex items-center justify-center ${accent || ''}`}><Icon className="h-6 w-6" /></span>
        <span className="text-muted-foreground text-base font-semibold tracking-wide">{label}</span>
      </div>
      <div className="flex items-end justify-between mt-1">
        <span className="text-3xl font-bold text-foreground leading-tight">{value}</span>
      </div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </Card>
  );
}

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default async function AdminHomePage() {
  let stats = { users: 0, websites: 0, events: 0 };
  const kpm = {
    usersToday: 0,
    websitesToday: 0,
    events24h: 0,
    topWebsite: null as null | { name: string | null, domain: string | null, value: number },
    topCountry: null as null | { country: string, visitors: number },
  };
  let recentWebsites: { id: string, name: string | null, domain: string | null, status: string | null, createdAt: string, user: { name: string | null, email: string | null, image?: string | null } | null }[] = [];
  try {
    const { data } = await getAnalyticsOverviewData();
    stats = {
      users: data?.totalUsers || 0,
      websites: data?.totalWebsites || 0,
      events: Array.isArray(data?.eventsOverTime) ? data.eventsOverTime.reduce((sum, d) => sum + (d.value || 0), 0) : 0,
    };
    kpm.usersToday = data?.usersToday || 0;
    kpm.websitesToday = data?.websitesToday || 0;
    kpm.events24h = data?.events24h || 0;
    kpm.topWebsite = (data?.topWebsites && data.topWebsites.length > 0) ? data.topWebsites[0] : null;
    kpm.topCountry = (data?.topCountries && data.topCountries.length > 0) ? data.topCountries[0] : null;
    recentWebsites = data?.recentWebsitesWithUsers || [];
  } catch { }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-2">
      <div className="w-full max-w-6xl space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-2">
          <div>
            <h1 className="text-4xl font-extrabold flex items-center gap-3 mb-2 tracking-tight text-foreground">
              <span className="rounded bg-primary/10 p-2"><Home className="h-8 w-8 text-primary" /></span>
              Dashboard
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">Your latest snapshot: users, websites, and analytics at a glance.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/analytics" className="rounded bg-primary px-5 py-2.5 text-white font-semibold shadow-sm">View Analytics</Link>
            <Link href="/websites" className="rounded bg-muted px-5 py-2.5 text-primary font-semibold border">Manage Websites</Link>
          </div>
        </div>

        {/* Stat Cards - Primary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard icon={Users} label="Total Users" value={stats.users} accent="text-primary" />
          <StatCard icon={LayoutDashboard} label="Total Websites" value={stats.websites} accent="text-blue-600 dark:text-blue-400" />
          <StatCard icon={Activity} label="Events (30d)" value={stats.events} accent="text-orange-600 dark:text-orange-400" />
          <StatCard icon={Zap} label="Events (24h)" value={kpm.events24h} accent="text-green-600 dark:text-green-400" />
        </div>

        {/* Stat Cards - Secondary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard icon={UserPlus} label="New Users (24h)" value={kpm.usersToday} accent="text-primary" />
          <StatCard icon={Globe2} label="New Websites (24h)" value={kpm.websitesToday} accent="text-blue-600 dark:text-blue-400" />
          <StatCard icon={LayoutDashboard} label="Top Website" value={kpm.topWebsite ? (kpm.topWebsite.name || kpm.topWebsite.domain || '-') : '-'} sub={kpm.topWebsite ? `${kpm.topWebsite.value} events` : ''} accent="text-blue-600 dark:text-blue-400" />
          <StatCard icon={Globe} label="Top Country" value={kpm.topCountry ? kpm.topCountry.country : '-'} sub={kpm.topCountry ? `${kpm.topCountry.visitors} visitors` : ''} accent="text-primary" />
        </div>

        {/* Recent Websites */}
        <Card className="border rounded-md shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground"><Globe className="h-5 w-5 text-primary" /> Recent Websites</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">Newest websites added to your platform</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-2 px-3 text-left font-semibold">Website</th>
                  <th className="py-2 px-3 text-left font-semibold">Domain</th>
                  <th className="py-2 px-3 text-left font-semibold">Owner</th>
                  <th className="py-2 px-3 text-left font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentWebsites.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground">No websites found.</td>
                  </tr>
                ) : (
                  recentWebsites.map((website) => (
                    <tr key={website.id} className="border-b last:border-b-0 hover:bg-muted/40">
                      <td className="py-2 px-3 flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={website.user?.image ?? undefined} />
                          <AvatarFallback>{(website.name || website.domain || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{website.name || website.domain}</span>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">{website.domain}</td>
                      <td className="py-2 px-3 text-muted-foreground">{website.user?.name || website.user?.email || '-'}</td>
                      <td className="py-2 px-3 text-muted-foreground">{formatDate(website.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

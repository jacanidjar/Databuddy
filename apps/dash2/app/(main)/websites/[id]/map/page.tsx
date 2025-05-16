"use client";

import { useState, Suspense, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapComponent } from "@/components/analytics/map-component";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebsitesStore } from "@/stores/use-websites-store";
import { useWebsites } from "@/hooks/use-websites";
import { useParams } from "next/navigation";
import { useAnalyticsLocations } from "@/hooks/use-analytics";
import { AlertCircle, Globe, HelpCircle, Info, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function WebsiteMapPage() {
  const { id } = useParams<{ id: string }>();
  const { websites } = useWebsites();
  const { setSelectedWebsite } = useWebsitesStore();
  const [mode, setMode] = useState<"total" | "perCapita">("total");
  
  useEffect(() => {
    if (id && websites) {
      const website = websites.find((site: any) => site.id === id);
      if (website) setSelectedWebsite(website);
    }
  }, [id, websites, setSelectedWebsite]);
  
  const { data: locationData, isLoading } = useAnalyticsLocations(id);
  const topCountries = locationData?.countries?.slice(0, 5) || [];
  const totalVisitors = locationData?.countries?.reduce((sum, country) => sum + country.visitors, 0) || 0;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-3 sm:p-4 md:p-6 space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Geographic Distribution</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Visitor distribution by country</p>
          </div>
        </div>

        <Tabs 
          defaultValue="total" 
          className="w-full sm:w-auto"
          onValueChange={(value) => setMode(value as "total" | "perCapita")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="total">Total Visits</TabsTrigger>
            <TabsTrigger value="perCapita">Per Capita</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-4 flex-1 overflow-hidden">
        <Card className="lg:col-span-3 flex flex-col overflow-hidden relative group">
          <CardHeader className="py-2 px-3 md:px-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
              {mode === "total" ? "Total Visitor Count" : "Visitors Per Million"}
              {!isLoading && totalVisitors > 0 && (
                <Badge variant="outline" className="ml-2 text-xs font-normal">
                  {totalVisitors.toLocaleString()} visitors
                </Badge>
              )}
            </CardTitle>
            
            <Badge variant="secondary" className="text-xs opacity-60">
              <Info className="h-3 w-3 mr-1" /> Hover for details
            </Badge>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <MapComponent height="100%" mode={mode} />
          </CardContent>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader className="py-2 px-3 md:px-4 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" strokeWidth={2} />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
            {isLoading ? (
              <div className="space-y-2 p-3">
                {Array(5).fill(0).map((_, i) => (
                  <div key={`skeleton-${i+1}`} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-5 rounded-sm" />
                      <Skeleton className="h-4 w-20 rounded-md" />
                    </div>
                    <Skeleton className="h-4 w-10 rounded-md" />
                  </div>
                ))}
              </div>
            ) : topCountries.length > 0 ? (
              <div className="divide-y">
                {topCountries.map((country, index) => (
                  <div 
                    key={country.country || "unknown"} 
                    className={cn(
                      "flex justify-between items-center px-3 py-2",
                      index === 0 ? "bg-primary/5" : "hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {country.country ? (
                        <div className="w-5 h-3 relative overflow-hidden rounded-sm shadow-sm">
                          <img 
                            src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${country.country.toUpperCase()}.svg`}
                            alt={country.country}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-5 h-3 flex items-center justify-center rounded-sm bg-muted">
                          <HelpCircle className="h-2 w-2 text-muted-foreground" />
                        </div>
                      )}
                      <span className={cn("text-sm", index === 0 && "font-medium")}>
                        {country.country ? country.country : "Unknown"}
                      </span>
                    </div>
                    <span className={cn("text-sm font-medium", index === 0 && "text-primary")}>
                      {country.visitors.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">No geographic data</p>
                </div>
              </div>
            )}
            
            <div className="mt-auto p-3 text-xs text-muted-foreground border-t bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="font-medium mb-0.5">Total Visits</p>
                  <p>Absolute visitor count</p>
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-0.5">Per Capita</p>
                  <p>Normalized by population</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    }>
      <WebsiteMapPage />
    </Suspense>
  );
} 
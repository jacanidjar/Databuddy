"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { FaviconImage } from "@/components/analytics/favicon-image";
import { useDomainManagement } from "../hooks/use-domain-management";
import { useDomainRanks } from "@/hooks/use-domain-info";
import { getRankColor } from "../utils";
import { DomainRankDetails } from "./domain-rank-details";

export function DomainRanksTab() {
  const { state } = useDomainManagement();
  const { ranks, isLoading: isLoadingRanks } = useDomainRanks();
  const [selectedRankDetails, setSelectedRankDetails] = useState<{domainName: string; domainId: string} | null>(null);

  if (isLoadingRanks) {
    return (
      <Card className="rounded-lg border bg-background shadow-sm h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Domain Rankings
          </CardTitle>
          <CardDescription>
            View Domain Rank (DR) scores for your verified domains. DR is a metric that represents the strength of a domain's backlink profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <Card key={`skeleton-${i+1}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const rankedDomains = state.domains.map(domain => ({
    ...domain,
    rank: ranks[domain.id]?.page_rank_decimal || 0
  })).sort((a, b) => b.rank - a.rank);

  if (rankedDomains.length === 0) {
    return (
      <Card className="rounded-lg border bg-background shadow-sm h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Domain Rankings
          </CardTitle>
          <CardDescription>
            View Domain Rank (DR) scores for your verified domains. DR is a metric that represents the strength of a domain's backlink profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Domain Ranks Available</h3>
            <p className="text-muted-foreground">Add and verify domains to see their rankings.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-lg border bg-background shadow-sm h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Domain Rankings
          </CardTitle>
          <CardDescription>
            View Domain Rank (DR) scores for your verified domains. DR is a metric that represents the strength of a domain's backlink profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <div className="space-y-4">
            {rankedDomains.map(domain => {
              const rankData = ranks[domain.id];
              const hasData = rankData && rankData.status_code === 200;
              
              return (
                <Card key={domain.id} className="hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <FaviconImage 
                            domain={domain.name} 
                            className="h-10 w-10 rounded-full ring-2 ring-border" 
                          />
                          {hasData && (
                            <div className="absolute -bottom-1 -right-1 bg-background border rounded-full w-5 h-5 flex items-center justify-center">
                              <div className={`w-2 h-2 rounded-full ${
                                rankData.page_rank_decimal >= 70 ? 'bg-green-500' :
                                rankData.page_rank_decimal >= 40 ? 'bg-blue-500' :
                                rankData.page_rank_decimal >= 20 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold truncate">{domain.name}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-muted-foreground">
                              Global: {hasData && rankData.rank ? `#${rankData.rank.toLocaleString()}` : 'N/A'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Score: {hasData ? rankData.page_rank_decimal.toFixed(1) : 'N/A'}/100
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${hasData ? getRankColor(rankData.page_rank_decimal) : 'text-muted-foreground'}`}>
                            {hasData ? rankData.page_rank_decimal.toFixed(1) : '—'}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">DR Score</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRankDetails({domainName: domain.name, domainId: domain.id})}
                            disabled={!hasData}
                          >
                            View Details
                          </Button>
                          {domain.verificationStatus === "VERIFIED" && hasData && (
                            <Badge variant="secondary" className="text-xs">
                              {rankData.page_rank_decimal >= 70 ? 'Excellent' :
                               rankData.page_rank_decimal >= 40 ? 'Good' :
                               rankData.page_rank_decimal >= 20 ? 'Fair' : 'Poor'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {hasData && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Authority Progress</span>
                          <span className="font-medium">{Math.round(rankData.page_rank_decimal)}%</span>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                rankData.page_rank_decimal >= 70 ? 'bg-green-500' :
                                rankData.page_rank_decimal >= 40 ? 'bg-blue-500' :
                                rankData.page_rank_decimal >= 20 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(100, rankData.page_rank_decimal)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <DomainRankDetails
        isOpen={!!selectedRankDetails}
        onClose={() => setSelectedRankDetails(null)}
        rankData={selectedRankDetails ? ranks[selectedRankDetails.domainId] || null : null}
        domainName={selectedRankDetails?.domainName || ''}
      />
    </>
  );
} 
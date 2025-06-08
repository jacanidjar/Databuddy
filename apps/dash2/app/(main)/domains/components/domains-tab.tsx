"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Circle, RefreshCw, Globe, AlertCircle, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FaviconImage } from "@/components/analytics/favicon-image";
import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "./status-badge";
import { useDomainManagement } from "../hooks/use-domain-management";
import { useDomainRanks } from "@/hooks/use-domain-info";
import type { Domain } from "../types";
import { copyToClipboard } from "../utils";
import React from "react";
import { DomainRowActions } from "./domain-row-actions";
import { VerificationDetails } from "./verification-details";

export function DomainsTab() {
  const {
    state,
    actions,
    domainsPerPage,
    updateState,
    updateActions,
    toggleExpanded,
    handleVerifyDomain,
    handleDeleteDomain,
    handleRegenerateToken,
    handleRetryFailedDomain,
    handleCreateWebsite,
    fetchDomains
  } = useDomainManagement();

  const filteredDomains = () => {
    let filtered = state.domains;
    
    if (state.filterStatus !== "all") {
      filtered = filtered.filter(domain => domain.verificationStatus === state.filterStatus);
    }
    
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(domain => 
        domain.name.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  // Get current page of domains
  const getCurrentPageDomains = () => {
    const filtered = filteredDomains();
    const indexOfLastDomain = state.currentPage * domainsPerPage;
    const indexOfFirstDomain = indexOfLastDomain - domainsPerPage;
    return filtered.slice(indexOfFirstDomain, indexOfLastDomain);
  };

  // Calculate total pages
  const totalPages = Math.ceil(filteredDomains().length / domainsPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    updateState({ currentPage: page });
  };

  const renderDomainRow = (domain: Domain) => {
    const domainIsVerifying = actions.isVerifying[domain.id] || false;
    const domainVerificationProgress = actions.verificationProgress[domain.id] || 0;
    const isExpanded = state.expandedDomains.has(domain.id);
    const canExpand = domain.verificationStatus === "PENDING" || domain.verificationStatus === "FAILED";
    const isRetrying = actions.retryingDomains[domain.id] || false;
    
    return (
      <TableRow key={domain.id}>
        <TableCell className="font-medium">
          <div className="flex items-center">
            {canExpand && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                aria-label={isExpanded ? "Collapse details" : "Expand details"}
                onClick={() => toggleExpanded(domain.id)}
              >
                {/* Icon handled in component */}
              </Button>
            )}
            <FaviconImage 
              domain={domain.name} 
              size={20} 
              className="h-5 w-5 mr-3 flex-shrink-0" 
            />
            {domain.name}
          </div>
        </TableCell>
        <TableCell>
          <StatusBadge 
            status={domain.verificationStatus} 
            isRetrying={isRetrying}
          />
        </TableCell>
        <TableCell>
          {domain.verifiedAt 
            ? formatDistanceToNow(new Date(domain.verifiedAt), { addSuffix: true })
            : domain.verificationStatus === "PENDING" 
              ? "Not verified yet" 
              : "—"}
        </TableCell>
        <TableCell>
          {formatDistanceToNow(new Date(domain.createdAt), { addSuffix: true })}
        </TableCell>
        <TableCell className="text-right">
          <DomainRowActions
            domain={domain}
            actions={actions}
            domainIsVerifying={domainIsVerifying}
            domainVerificationProgress={domainVerificationProgress}
            isRetrying={isRetrying}
            onVerify={() => handleVerifyDomain(domain.id)}
            onDelete={() => handleDeleteDomain(domain.id)}
            onRegenerate={() => handleRegenerateToken(domain.id)}
            onRetry={() => handleRetryFailedDomain(domain.id)}
            onCreate={() => handleCreateWebsite(domain.id, domain.name)}
            updateActions={updateActions}
          />
        </TableCell>
      </TableRow>
    );
  };

  const renderVerificationDetails = (domain: Domain) => {
    if ((domain.verificationStatus !== "PENDING" && domain.verificationStatus !== "FAILED") || !state.expandedDomains.has(domain.id)) return null;
    
    return (
      <TableRow>
        <TableCell colSpan={6} className="!p-0">
          <VerificationDetails
            domain={domain}
            actions={actions}
            verificationResult={actions.verificationResult[domain.id]}
            onVerify={() => handleVerifyDomain(domain.id)}
            onRetry={() => handleRetryFailedDomain(domain.id)}
            onCopy={copyToClipboard}
          />
        </TableCell>
      </TableRow>
    );
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between border-t pt-4 mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {((state.currentPage - 1) * domainsPerPage) + 1} to {Math.min(state.currentPage * domainsPerPage, filteredDomains().length)} of {filteredDomains().length} domains
        </div>
        <div className="flex items-center space-x-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handlePageChange(state.currentPage - 1)}
            disabled={state.currentPage === 1}
            className="h-8 w-8 p-0"
          >
            &lt;
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = state.currentPage;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (state.currentPage <= 3) {
              pageNum = i + 1;
            } else if (state.currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = state.currentPage - 2 + i;
            }
            
            return (
              <Button 
                key={`page-${pageNum}`}
                variant={state.currentPage === pageNum ? "default" : "outline"} 
                size="sm" 
                onClick={() => handlePageChange(pageNum)}
                className="h-8 w-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handlePageChange(state.currentPage + 1)}
            disabled={state.currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            &gt;
          </Button>
        </div>
      </div>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    const isFiltering = state.searchQuery || state.filterStatus !== "all";
    
    return (
      <div className="py-8 text-center">
        {isFiltering ? (
          <>
            <div className="bg-muted/30 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-3">
              <Filter className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium mb-2">No matching domains</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto text-sm">
              No domains match your current filters. Try adjusting your search or filter criteria.
            </p>
            <Button variant="outline" size="sm" onClick={() => {
              updateState({ searchQuery: "", filterStatus: "all" });
            }}>
              Clear Filters
            </Button>
          </>
        ) : state.hasError ? (
          <>
            <div className="bg-red-100 dark:bg-red-950/20 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-base font-medium mb-2">Failed to load domains</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto text-sm">
              There was a problem loading your domains. Please try again.
            </p>
            <Button size="sm" onClick={fetchDomains}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </>
        ) : (
          <>
            <div className="bg-muted/30 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-3">
              <Globe className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium mb-2">No domains yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto text-sm">
              Add your first domain to get started. Once verified, you can create websites and track analytics.
            </p>
          </>
        )}
      </div>
    );
  };

  return (
    <Card className="rounded-lg border bg-background shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search domains..."
              value={state.searchQuery}
              onChange={(e) => updateState({ searchQuery: e.target.value })}
              className="h-9 w-[200px]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={state.filterStatus} onValueChange={(value) => updateState({ filterStatus: value })}>
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all"><Circle className="h-4 w-4 text-muted-foreground" fill="currentColor" /> All Domains</SelectItem>
                <SelectItem value="VERIFIED"><Circle className="h-4 w-4 text-green-500" fill="currentColor" /> Verified</SelectItem>
                <SelectItem value="PENDING"><Circle className="h-4 w-4 text-yellow-500" fill="currentColor" /> Pending</SelectItem>
                <SelectItem value="FAILED"><Circle className="h-4 w-4 text-red-500" fill="currentColor" /> Failed</SelectItem>
              </SelectContent>
            </Select>
            {(state.searchQuery || state.filterStatus !== "all") && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => updateState({ searchQuery: "", filterStatus: "all" })}
                className="h-9"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {state.isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-4 mr-2" />
                      <Skeleton className="h-4 w-[180px]" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : filteredDomains().length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCurrentPageDomains().map(domain => (
                  <React.Fragment key={domain.id}>
                    {renderDomainRow(domain)}
                    {renderVerificationDetails(domain)}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
            
            {renderPagination()}
          </>
        )}
      </CardContent>
    </Card>
  );
} 
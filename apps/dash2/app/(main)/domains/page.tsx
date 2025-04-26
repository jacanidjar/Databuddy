"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createDomain, getUserDomains, checkDomainVerification, deleteDomain, regenerateVerificationToken } from "@/app/actions/domains";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Clock, Copy, Filter, Globe, Plus, RefreshCw, Search, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

type Domain = {
  id: string;
  name: string;
  verificationStatus: "PENDING" | "VERIFIED" | "FAILED";
  verificationToken: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
};

type VerificationResult = {
  verified: boolean;
  message: string;
};

// Reusable copy field for DNS info
function CopyField({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="flex flex-col gap-1 min-w-0 flex-1">
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <code className="block p-2 bg-background rounded text-sm break-all min-w-0 flex-1">{value}</code>
        <Button size="icon" variant="outline" onClick={onCopy}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function DomainsPage() {
  const [domain, setDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [isRegenerating, setIsRegenerating] = useState<Record<string, boolean>>({});
  const [verificationResult, setVerificationResult] = useState<Record<string, VerificationResult>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<Record<string, boolean>>({});
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDomainId, setExpandedDomainId] = useState<string | null>(null);

  // Helper function to clean domain input
  const cleanDomainInput = (input: string): string => {
    // Remove protocol if present
    let cleaned = input.replace(/^(https?:\/\/)?(www\.)?/, '');
    
    // Remove any subdomains, keeping only the top-level domain
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts.slice(-2).join('.');
    }
    
    return cleaned;
  };

  // Fetch domains on component mount
  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    setIsLoading(true);
    try {
      const result = await getUserDomains();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setDomains(result.data || []);
    } catch (error) {
      console.error("Error fetching domains:", error);
      toast.error("Failed to fetch domains");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!domain) {
      toast.error("Please enter a domain");
      return;
    }

    // Clean the domain input
    const cleanedDomain = cleanDomainInput(domain);
    
    // Validate domain format (only domain.tld, no subdomains or protocols)
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(cleanedDomain)) {
      toast.error("Please enter a valid top-level domain (e.g., example.com)");
      return;
    }

    setIsAdding(true);
    try {
      const result = await createDomain({ name: cleanedDomain });
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      toast.success(`Domain ${cleanedDomain} added successfully`);
      setDomain("");
      setAddDialogOpen(false);
      fetchDomains(); // Refresh domains list
    } catch (error) {
      console.error("Error adding domain:", error);
      toast.error("Failed to add domain");
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    setIsVerifying(prev => ({ ...prev, [domainId]: true }));
    try {
      const result = await checkDomainVerification(domainId);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      if (result.data) {
        setVerificationResult(prev => ({ 
          ...prev, 
          [domainId]: result.data 
        }));
        
        if (result.data.verified) {
          toast.success("Domain verified successfully");
          fetchDomains(); // Refresh domains list
        } else {
          toast.error(result.data.message);
        }
      }
    } catch (error) {
      console.error("Error verifying domain:", error);
      toast.error("Failed to verify domain");
    } finally {
      setIsVerifying(prev => ({ ...prev, [domainId]: false }));
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    setIsDeleting(prev => ({ ...prev, [domainId]: true }));
    try {
      const result = await deleteDomain(domainId);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      toast.success("Domain deleted successfully");
      setDeleteDialogOpen(prev => ({ ...prev, [domainId]: false }));
      fetchDomains(); // Refresh domains list
    } catch (error) {
      console.error("Error deleting domain:", error);
      toast.error("Failed to delete domain");
    } finally {
      setIsDeleting(prev => ({ ...prev, [domainId]: false }));
    }
  };

  const handleRegenerateToken = async (domainId: string) => {
    setIsRegenerating(prev => ({ ...prev, [domainId]: true }));
    try {
      const result = await regenerateVerificationToken(domainId);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      toast.success("Verification token regenerated");
      fetchDomains(); // Refresh domains list
    } catch (error) {
      console.error("Error regenerating token:", error);
      toast.error("Failed to regenerate token");
    } finally {
      setIsRegenerating(prev => ({ ...prev, [domainId]: false }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <AlertCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredDomains = () => {
    let filtered = domains;
    
    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(domain => domain.verificationStatus === filterStatus);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(domain => 
        domain.name.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const renderDomainRow = (domain: Domain) => {
    const domainIsVerifying = isVerifying[domain.id] || false;
    const domainIsDeleting = isDeleting[domain.id] || false;
    const domainIsRegenerating = isRegenerating[domain.id] || false;
    const domainVerificationResult = verificationResult[domain.id];
    const isExpanded = expandedDomainId === domain.id;
    const canExpand = domain.verificationStatus === "PENDING";
    
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
                onClick={() => setExpandedDomainId(isExpanded ? null : domain.id)}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
            <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
            {domain.name}
          </div>
        </TableCell>
        <TableCell>{getStatusBadge(domain.verificationStatus)}</TableCell>
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
          <div className="flex justify-end space-x-2">
            {domain.verificationStatus === "PENDING" && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleVerifyDomain(domain.id)}
                        disabled={domainIsVerifying}
                      >
                        {domainIsVerifying ? "Verifying..." : "Verify"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Verify domain ownership</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleRegenerateToken(domain.id)}
                        disabled={domainIsRegenerating}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Regenerate verification token</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog open={deleteDialogOpen[domain.id]} onOpenChange={(open) => setDeleteDialogOpen(prev => ({ ...prev, [domain.id]: open }))}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Domain</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete {domain.name}? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setDeleteDialogOpen(prev => ({ ...prev, [domain.id]: false }))}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => handleDeleteDomain(domain.id)}
                          disabled={domainIsDeleting}
                        >
                          {domainIsDeleting ? "Deleting..." : "Delete"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete domain</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const renderVerificationDetails = (domain: Domain) => {
    if (domain.verificationStatus !== "PENDING" || expandedDomainId !== domain.id) return null;
    
    const domainVerificationResult = verificationResult[domain.id];
    const verificationToken = domain.verificationToken;
    const host = `_databuddy.${domain.name}`;
    
    return (
      <TableRow>
        <TableCell colSpan={5} className="!p-0">
          <div className="rounded-lg border bg-muted/60 p-6 my-2 mx-1 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h4 className="font-medium text-base mb-1">Verification Required</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Add this TXT record to your DNS settings to verify domain ownership:
              </p>
              <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full">
                <CopyField label="Name / Host" value={host} onCopy={() => copyToClipboard(host)} />
                <CopyField label="Value" value={verificationToken || ""} onCopy={() => copyToClipboard(verificationToken || "")} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Example: <code className="bg-background rounded px-1">{host} IN TXT "{verificationToken}"</code>
              </div>
            </div>
            {domainVerificationResult && !domainVerificationResult.verified && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>
                  {domainVerificationResult.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Domains</h1>
          <p className="text-muted-foreground">
            Manage your domains and DNS settings
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Domain</DialogTitle>
              <DialogDescription>
                Add a new domain to your account
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter only the top-level domain (e.g., example.com). Subdomains and protocols will be removed.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDomain} disabled={isAdding}>
                {isAdding ? "Adding..." : "Add Domain"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search domains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-[200px]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              ))}
            </div>
          ) : filteredDomains().length === 0 ? (
            <div className="py-8 text-center">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No domains found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterStatus !== "all" 
                  ? "Try adjusting your search or filter" 
                  : "Add your first domain to get started"}
              </p>
              {!searchQuery && filterStatus === "all" && (
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Domain
                </Button>
              )}
            </div>
          ) : (
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
                {filteredDomains().map(domain => (
                  <React.Fragment key={domain.id}>
                    {renderDomainRow(domain)}
                    {renderVerificationDetails(domain)}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
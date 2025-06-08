"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { 
  createDomain, 
  getUserDomains, 
  checkDomainVerification, 
  deleteDomain, 
  regenerateVerificationToken 
} from "@/app/actions/domains";
import type { Domain, VerificationResult, DomainState, DomainActions } from "../types";
import { cleanDomainInput, validateDomainFormat } from "../utils";

export const useDomainManagement = () => {
  const router = useRouter();
  
  // State
  const [state, setState] = useState<DomainState>({
    domains: [],
    isLoading: true,
    hasError: false,
    currentPage: 1,
    searchQuery: "",
    filterStatus: "all",
    expandedDomains: new Set()
  });

  // Actions state
  const [actions, setActions] = useState<DomainActions>({
    isVerifying: {},
    isDeleting: {},
    isRegenerating: {},
    verificationResult: {},
    verificationProgress: {},
    retryingDomains: {},
    deleteDialogOpen: {},
    regenerateDialogOpen: {}
  });

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const domainsPerPage = 10;

  // Fetch domains
  const fetchDomains = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, hasError: false }));
    try {
      const result = await getUserDomains();
      if (result.error) {
        setState(prev => ({ ...prev, hasError: true, isLoading: false }));
        toast.error(result.error, {
          action: {
            label: "Retry",
            onClick: () => fetchDomains()
          }
        });
        return;
      }
      
      const domains = result.data || [];
      const domainsNeedingVerification = domains
        .filter(domain => domain.verificationStatus === "PENDING" || domain.verificationStatus === "FAILED")
        .map(domain => domain.id);
        
      setState(prev => ({
        ...prev,
        domains,
        isLoading: false,
        currentPage: 1,
        expandedDomains: new Set(domainsNeedingVerification)
      }));
    } catch (error) {
      console.error("Error fetching domains:", error);
      setState(prev => ({ ...prev, hasError: true, isLoading: false }));
      toast.error("Failed to fetch domains", {
        action: {
          label: "Retry",
          onClick: () => fetchDomains()
        }
      });
    }
  }, []);

  // Add domain
  const handleAddDomain = async () => {
    if (!domain) {
      toast.error("Please enter a domain");
      return;
    }

    const cleanedDomain = cleanDomainInput(domain);
    
    if (!validateDomainFormat(cleanedDomain)) {
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
      fetchDomains();
    } catch (error) {
      console.error("Error adding domain:", error);
      toast.error("Failed to add domain");
    } finally {
      setIsAdding(false);
    }
  };

  // Verify domain
  const handleVerifyDomain = async (domainId: string) => {
    if (!domainId) {
      toast.error("Invalid domain ID");
      return;
    }

    setActions(prev => ({ 
      ...prev, 
      isVerifying: { ...prev.isVerifying, [domainId]: true },
      verificationProgress: { ...prev.verificationProgress, [domainId]: 25 }
    }));
    
    try {
      const domainToVerify = state.domains.find(d => d.id === domainId);
      
      setActions(prev => ({ 
        ...prev, 
        verificationProgress: { ...prev.verificationProgress, [domainId]: 50 }
      }));
      
      if (domainToVerify?.verificationStatus === "FAILED") {
        setActions(prev => ({ 
          ...prev, 
          retryingDomains: { ...prev.retryingDomains, [domainId]: true }
        }));
      }
      
      const result = await checkDomainVerification(domainId);
      
      setActions(prev => ({ 
        ...prev, 
        verificationProgress: { ...prev.verificationProgress, [domainId]: 75 }
      }));
      
      if (!result || result.error) {
        setActions(prev => ({ 
          ...prev, 
          verificationResult: { 
            ...prev.verificationResult, 
            [domainId]: {
              verified: false,
              message: result?.error || "Verification failed - no response from server",
              error: result?.error,
              lastChecked: new Date()
            }
          }
        }));
        
        toast.error(result?.error || "Verification failed - please try again", {
          action: {
            label: "Retry",
            onClick: () => handleVerifyDomain(domainId)
          }
        });
        return;
      }
      
      setActions(prev => ({ 
        ...prev, 
        verificationProgress: { ...prev.verificationProgress, [domainId]: 90 }
      }));
      
      if (result.data) {
        setActions(prev => ({ 
          ...prev, 
          verificationResult: { 
            ...prev.verificationResult, 
            [domainId]: {
              verified: Boolean(result.data.verified),
              message: String(result.data.message || ""),
              lastChecked: new Date()
            }
          }
        }));
        
        if (result.data.verified) {
          toast.success("Domain verified successfully");
          setTimeout(() => fetchDomains(), 500);
        } else {
          toast.error(result.data.message || "Verification failed", {
            action: {
              label: "Retry",
              onClick: () => handleVerifyDomain(domainId)
            }
          });
        }
      } else {
        toast.error("Verification returned invalid data", {
          action: {
            label: "Retry",
            onClick: () => handleVerifyDomain(domainId)
          }
        });
      }
      
      setActions(prev => ({ 
        ...prev, 
        verificationProgress: { ...prev.verificationProgress, [domainId]: 100 }
      }));
    } catch (error) {
      console.error("Error verifying domain:", error);
      let errorMessage = "Failed to verify domain";
      
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      setActions(prev => ({ 
        ...prev, 
        verificationResult: { 
          ...prev.verificationResult, 
          [domainId]: {
            verified: false,
            message: errorMessage,
            error: error instanceof Error ? error.message : String(error),
            lastChecked: new Date()
          }
        }
      }));
      
      toast.error(errorMessage, {
        action: {
          label: "Retry",
          onClick: () => handleVerifyDomain(domainId)
        }
      });
    } finally {
      setActions(prev => ({
        ...prev,
        isVerifying: { ...prev.isVerifying, [domainId]: false },
        retryingDomains: { ...prev.retryingDomains, [domainId]: false }
      }));
      
      setTimeout(() => {
        setActions(prev => ({ 
          ...prev, 
          verificationProgress: { ...prev.verificationProgress, [domainId]: 0 }
        }));
      }, 1000);
    }
  };

  // Delete domain
  const handleDeleteDomain = async (domainId: string) => {
    setActions(prev => ({ 
      ...prev, 
      isDeleting: { ...prev.isDeleting, [domainId]: true }
    }));
    try {
      const result = await deleteDomain(domainId);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      toast.success("Domain deleted successfully");
      setActions(prev => ({ 
        ...prev, 
        deleteDialogOpen: { ...prev.deleteDialogOpen, [domainId]: false }
      }));
      fetchDomains();
    } catch (error) {
      console.error("Error deleting domain:", error);
      toast.error("Failed to delete domain");
    } finally {
      setActions(prev => ({ 
        ...prev, 
        isDeleting: { ...prev.isDeleting, [domainId]: false }
      }));
    }
  };

  // Regenerate token
  const handleRegenerateToken = async (domainId: string) => {
    setActions(prev => ({ 
      ...prev, 
      isRegenerating: { ...prev.isRegenerating, [domainId]: true }
    }));
    try {
      const result = await regenerateVerificationToken(domainId);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      toast.success("Verification token regenerated", {
        description: "Please update your DNS record with the new token"
      });
      setActions(prev => ({ 
        ...prev, 
        regenerateDialogOpen: { ...prev.regenerateDialogOpen, [domainId]: false }
      }));
      fetchDomains();
    } catch (error) {
      console.error("Error regenerating token:", error);
      toast.error("Failed to regenerate token");
    } finally {
      setActions(prev => ({ 
        ...prev, 
        isRegenerating: { ...prev.isRegenerating, [domainId]: false }
      }));
    }
  };

  // Retry failed domain
  const handleRetryFailedDomain = async (domainId: string) => {
    try {
      setActions(prev => ({ 
        ...prev, 
        isRegenerating: { ...prev.isRegenerating, [domainId]: true }
      }));
      
      const regenerateResult = await regenerateVerificationToken(domainId);
      
      if (regenerateResult.error) {
        toast.error(`Failed to regenerate token: ${regenerateResult.error}`);
        return;
      }
      
      toast.success("Verification token regenerated", {
        description: "Try adding the new DNS record and verify again"
      });
      
      await fetchDomains();
      
      setState(prev => ({
        ...prev,
        expandedDomains: new Set([...prev.expandedDomains, domainId])
      }));
    } catch (error) {
      console.error("Error retrying failed domain:", error);
      toast.error("Failed to retry domain verification");
    } finally {
      setActions(prev => ({ 
        ...prev, 
        isRegenerating: { ...prev.isRegenerating, [domainId]: false }
      }));
    }
  };

  // Create website
  const handleCreateWebsite = (domainId: string, domainName: string) => {
    router.push(`/websites?new=true&domain=${domainName}&domainId=${domainId}`);
  };

  // Toggle expanded
  const toggleExpanded = (domainId: string) => {
    setState(prev => {
      const newExpandedDomains = new Set(prev.expandedDomains);
      if (newExpandedDomains.has(domainId)) {
        newExpandedDomains.delete(domainId);
      } else {
        newExpandedDomains.add(domainId);
      }
      return {
        ...prev,
        expandedDomains: newExpandedDomains
      };
    });
  };

  // Update state setters
  const updateState = (updates: Partial<DomainState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const updateActions = (updates: Partial<DomainActions>) => {
    setActions(prev => ({ ...prev, ...updates }));
  };

  // Initialize
  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  return {
    // State
    state,
    actions,
    domain,
    setDomain,
    isAdding,
    addDialogOpen,
    setAddDialogOpen,
    domainsPerPage,
    
    // Actions
    fetchDomains,
    handleAddDomain,
    handleVerifyDomain,
    handleDeleteDomain,
    handleRegenerateToken,
    handleRetryFailedDomain,
    handleCreateWebsite,
    toggleExpanded,
    updateState,
    updateActions
  };
}; 
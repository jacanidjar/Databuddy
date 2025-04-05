"use client";

import { useEffect } from 'react';
import { useWebsitesStore } from '@/stores/use-websites-store';
import { toast } from 'sonner';
import { 
  createWebsite as createWebsiteAction, 
  deleteWebsite as deleteWebsiteAction, 
  getUserWebsites,
  updateWebsite as updateWebsiteAction,
  checkDomainVerification,
  regenerateVerificationToken
} from "@/app/actions/websites";
import { useQuery } from '@tanstack/react-query';

export interface Website {
  id: string;
  name: string | null;
  domain: string;
  userId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  status?: string;
  verificationToken?: string | null;
  verificationStatus?: "PENDING" | "VERIFIED" | "FAILED";
  verifiedAt?: Date | null;
}

interface CreateWebsiteData {
  name: string;
  domain: string;
}

interface UpdateWebsiteData {
  name?: string;
  domain?: string;
}

export function useWebsites() {
  const store = useWebsitesStore();
  
  const fetchWebsites = async () => {
    store.setIsLoading(true);
    store.setIsError(false);
    
    try {
      const result = await getUserWebsites();
      if (result.error) {
        toast.error(result.error);
        store.setIsError(true);
        return;
      }
      store.setWebsites(result.data || []);
    } catch (error) {
      console.error('Error fetching websites:', error);
      store.setIsError(true);
    } finally {
      store.setIsLoading(false);
    }
  };

  const createWebsite = async (data: CreateWebsiteData) => {
    store.setIsCreating(true);
    
    try {
      const result = await createWebsiteAction(data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      toast.success("Website created successfully");
      await fetchWebsites();
    } catch (error) {
      console.error('Error creating website:', error);
      toast.error("Failed to create website");
    } finally {
      store.setIsCreating(false);
    }
  };

  const updateWebsite = async ({ id, data }: { id: string; data: UpdateWebsiteData }) => {
    store.setIsUpdating(true);
    
    try {
      const result = await updateWebsiteAction(id, data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      toast.success("Website updated successfully");
      await fetchWebsites();
    } catch (error) {
      console.error('Error updating website:', error);
      toast.error("Failed to update website");
    } finally {
      store.setIsUpdating(false);
    }
  };

  const deleteWebsite = async (id: string) => {
    store.setIsDeleting(true);
    
    try {
      const result = await deleteWebsiteAction(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      toast.success("Website deleted successfully");
      await fetchWebsites();
    } catch (error) {
      console.error('Error deleting website:', error);
      toast.error("Failed to delete website");
    } finally {
      store.setIsDeleting(false);
    }
  };

  const verifyDomain = async (id: string) => {
    store.setIsVerifying(true);
    
    try {
      const result = await checkDomainVerification(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      if (result.data?.verified) {
        toast.success(result.data.message);
      } else {
        toast.error(result.data?.message || "Verification failed");
      }
      
      await fetchWebsites();
    } catch (error) {
      console.error('Error verifying domain:', error);
      toast.error("Failed to verify domain");
    } finally {
      store.setIsVerifying(false);
    }
  };

  const regenerateToken = async (id: string) => {
    store.setIsRegenerating(true);
    
    try {
      const result = await regenerateVerificationToken(id);
      if (result.error) {
        toast.error(result.error);
        return result;
      }
      
      // First update the websites list
      await fetchWebsites();
      
      // Then find the updated website and update the selected website in the store
      const updatedWebsite = store.websites.find(w => w.id === id);
      if (updatedWebsite) {
        store.setSelectedWebsite(updatedWebsite);
      }
      
      toast.success("Verification token regenerated");
      return result;
    } catch (error) {
      console.error('Error regenerating token:', error);
      toast.error("Failed to regenerate token");
      throw error;
    } finally {
      store.setIsRegenerating(false);
    }
  };

  // Fetch websites on mount
  useEffect(() => {
    fetchWebsites();
  }, []);

  return {
    // Data
    websites: store.websites,
    selectedWebsite: store.selectedWebsite,
    
    // UI States
    isLoading: store.isLoading,
    isError: store.isError,
    isCreating: store.isCreating,
    isUpdating: store.isUpdating,
    isDeleting: store.isDeleting,
    isVerifying: store.isVerifying,
    isRegenerating: store.isRegenerating,
    showVerificationDialog: store.showVerificationDialog,
    
    // Actions
    setSelectedWebsite: store.setSelectedWebsite,
    setShowVerificationDialog: store.setShowVerificationDialog,
    createWebsite,
    updateWebsite,
    deleteWebsite,
    verifyDomain,
    regenerateToken,
    refetch: fetchWebsites,
  };
}

// Hook to get a single website by ID
export function useWebsite(id: string) {
  const { websites } = useWebsites();
  
  const websiteQuery = useQuery({
    queryKey: ["website", id],
    queryFn: async () => {
      if (!id) return null;
      
      // First check if we already have the website data in cache
      const cachedWebsite = websites.find(website => website.id === id);
      if (cachedWebsite) return cachedWebsite;
      
      // If not cached, we could fetch it directly (in a real app) 
      // by implementing a 'getWebsite' action to fetch from the backend
      // For now, we'll just return null if not found
      return null;
    },
    enabled: !!id, // Only run if id is provided
  });

  return {
    data: websiteQuery.data,
    isLoading: websiteQuery.isLoading,
    isError: websiteQuery.isError,
  };
} 
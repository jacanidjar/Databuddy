"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useWebsitesStore } from '@/stores/use-websites-store';
import { toast } from 'sonner';
import { 
  createWebsite as createWebsiteAction, 
  deleteWebsite as deleteWebsiteAction, 
  getUserWebsites,
  updateWebsite as updateWebsiteAction,
} from "@/app/actions/websites";
import { useQuery } from '@tanstack/react-query';

export interface Website {
  id: string;
  name: string | null;
  domain: string;
  userId?: string | null;
  projectId?: string | null;
  domainId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  status?: string;
}

interface CreateWebsiteData {
  name: string;
  domain: string;
  domainId?: string;
}

interface UpdateWebsiteData {
  name?: string;
  domain?: string;
  domainId?: string | null;
}

export function useWebsites() {
  const store = useWebsitesStore();
  const storeRef = useRef(store);
  
  // Update the ref when store changes
  useEffect(() => {
    storeRef.current = store;
  }, [store]);
  
  const fetchWebsites = useCallback(async () => {
    const currentStore = storeRef.current;
    currentStore.setIsLoading(true);
    currentStore.setIsError(false);
    
    try {
      const result = await getUserWebsites();
      if (result.error) {
        toast.error(result.error);
        currentStore.setIsError(true);
        return;
      }
      currentStore.setWebsites(result.data || []);
    } catch (error) {
      console.error('Error fetching websites:', error);
      currentStore.setIsError(true);
    } finally {
      currentStore.setIsLoading(false);
    }
  }, []); // No dependencies needed

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

  // Fetch websites on mount
  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

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
    
    // Actions
    setSelectedWebsite: store.setSelectedWebsite,
    createWebsite,
    updateWebsite,
    deleteWebsite,
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
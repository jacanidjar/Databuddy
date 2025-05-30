"use client";

import { useEffect } from 'react';
import { toast } from 'sonner';
import { 
  createWebsite as createWebsiteAction, 
  deleteWebsite as deleteWebsiteAction, 
  getUserWebsites,
  updateWebsite as updateWebsiteAction,
  getWebsiteById
} from "@/app/actions/websites";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Website {
  id: string;
  name: string | null;
  // The domain can be either a string or an object depending on how it's returned from the API
  domain: string | { 
    id: string;
    name: string;
    verificationStatus: string;
    verificationToken: string | null;
    verifiedAt: string | null;
    userId: string | null;
    projectId: string | null;
    dnsRecords: unknown;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
  userId?: string | null;
  projectId?: string | null;
  domainId?: string | null;
  createdAt: string;
  updatedAt: string;
  status?: string;
  domainData?: {
    id: string;
    name: string;
    verificationStatus: string;
    verificationToken: string | null;
    verifiedAt: string | null;
    userId: string | null;
    projectId: string | null;
    dnsRecords: unknown;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  } | null;
}

export interface CreateWebsiteData {
  name: string;
  domainId: string;
  domain: string;
  subdomain?: string;
}

// Query keys
export const websiteKeys = {
  all: ['websites'] as const,
  lists: () => [...websiteKeys.all, 'list'] as const,
  list: (filters: string) => [...websiteKeys.lists(), { filters }] as const,
  details: () => [...websiteKeys.all, 'detail'] as const,
  detail: (id: string) => [...websiteKeys.details(), id] as const,
};

export function useWebsites() {
  const queryClient = useQueryClient();
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: websiteKeys.lists(),
    queryFn: async () => {
      try {
        const result = await getUserWebsites();
        if (result.error) throw new Error(result.error);
        return result.data || [];
      } catch (error) {
        console.error('Error fetching websites:', error);
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
  
  useEffect(() => {
    if (isError) {
      toast.error('Failed to fetch websites');
    }
  }, [isError]);

  const createMutation = useMutation({
    mutationFn: async (data: CreateWebsiteData) => {
      const result = await createWebsiteAction(data);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onMutate: () => {
    },
    onSuccess: () => {
      toast.success("Website created successfully");
      queryClient.invalidateQueries({ queryKey: websiteKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create website');
    },
    onSettled: () => {
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const result = await updateWebsiteAction(id, name);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onMutate: () => {
    },
    onSuccess: () => {
      toast.success("Website updated successfully");
      queryClient.invalidateQueries({ queryKey: websiteKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update website');
    },
    onSettled: () => {
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteWebsiteAction(id);
      if (result.error) throw new Error(result.error);
      // Pass id to onSuccess to use it for store update
      return { data: result.data, id }; 
    },
    onMutate: () => {
    },
    onSuccess: ({ id }) => { // Destructure id from the mutation result
      toast.success("Website deleted successfully");
      queryClient.invalidateQueries({ queryKey: websiteKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete website');
    },
    onSettled: () => {
    }
  });

  return {
    websites: data || [],
    isLoading,
    isError,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createWebsite: createMutation.mutate,
    updateWebsite: updateMutation.mutate,
    deleteWebsite: deleteMutation.mutate,
    refetch,
  };
}
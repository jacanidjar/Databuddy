"use client";

import { trpc } from "@/lib/trpc";
import type { Website } from "@databuddy/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys
export const websiteTransferKeys = {
  personal: ["websites", "personal"] as const,
  organization: (orgId: string) => ["websites", "organization", orgId] as const,
};

export function useWebsiteTransfer(organizationId: string) {
  const queryClient = useQueryClient();

  // Fetch personal websites (no organizationId)
  const { data: personalWebsites, isLoading: isLoadingPersonal } = useQuery({
    queryKey: websiteTransferKeys.personal,
    queryFn: async () => {
      const result = await trpc.websites.list.useQuery({});
      return result || [];
    },
  });

  // Fetch organization websites
  const { data: organizationWebsites, isLoading: isLoadingOrg } = useQuery({
    queryKey: websiteTransferKeys.organization(organizationId),
    queryFn: async () => {
      if (!organizationId) return [];
      const result = await trpc.websites.list.useQuery({ organizationId });
      return result || [];
    },
    enabled: !!organizationId,
  });

  const transferMutation = trpc.websites.transfer.useMutation({
    onSuccess: () => {
      toast.success("Website transferred successfully");
      queryClient.invalidateQueries({ queryKey: ["websites"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to transfer website");
    },
  });

  return {
    personalWebsites: personalWebsites || [],
    organizationWebsites: organizationWebsites || [],
    isLoading: isLoadingPersonal || isLoadingOrg,
    isTransferring: transferMutation.isPending,
    transferWebsite: transferMutation.mutate,
  };
}

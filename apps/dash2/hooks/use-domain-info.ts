"use client";

import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface DomainRankData {
  status_code: number;
  error: string;
  page_rank_integer: number;
  page_rank_decimal: number;
  rank: string | null;
  domain: string;
}

interface BatchDomainRankResponse {
  success: boolean;
  error?: string;
  data: Record<string, DomainRankData | null>;
}

const CACHE_TIME = 60 * 60 * 1000; // 1 hour

const queryOptions = {
  staleTime: CACHE_TIME,
  gcTime: CACHE_TIME + 5 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnMount: true,
  retry: 1,
} as const;

async function fetchDomainRanks(): Promise<BatchDomainRankResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/domain-info/batch/all`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch domain ranks');
  }
  
  return data;
}

export function useDomainRanks() {
  const query = useQuery({
    queryKey: ['domain-ranks'],
    queryFn: fetchDomainRanks,
    ...queryOptions
  });

  return {
    ranks: query.data?.data ?? {},
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
} 
'use client';

import { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export function Providers({ children }: PropsWithChildren) {
  return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
  );
} 
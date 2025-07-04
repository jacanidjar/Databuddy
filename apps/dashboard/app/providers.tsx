"use client";

import { useSession } from "@databuddy/auth/client";
import { QueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { createContext, useContext, useEffect, useState } from "react";
import type { session } from "@databuddy/db";
import type { ReactNode } from "react";
import { AutumnProvider } from "autumn-js/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
// import { TRPCProvider } from "@/lib/trpc-provider";

type Session = typeof session.$inferSelect;
// Default query client configuration
const defaultQueryClientOptions = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30_000),
    },
    mutations: {
      retry: false,
    },
  },
};

export const queryClient = new QueryClient(defaultQueryClientOptions);

// Create a SessionContext
type SessionContextType = {
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  isLoading: true,
  error: null,
});

// Custom hook to use the session context
export const useAuthSession = () => useContext(SessionContext);

// SessionProvider component
const SessionProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, isPending, error } = useSession();

  useEffect(() => {
    if (!(session || isPending)) {
      queryClient.clear();
    }
  }, [session, isPending]);

  return (
    <SessionContext.Provider
      value={{
        session: session as Session | null,
        isLoading: isPending,
        error: error as Error | null,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export default function Providers({ children }: { children: React.ReactNode }) {

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {/* <TRPCProvider> */}
      <SessionProvider>
        <AutumnProvider backendUrl={process.env.NEXT_PUBLIC_API_URL}>
          <NuqsAdapter>{children}</NuqsAdapter>
        </AutumnProvider>
      </SessionProvider>
      {/* </TRPCProvider> */}
    </ThemeProvider>
  );
}
